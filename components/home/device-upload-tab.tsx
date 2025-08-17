"use client"

import type React from "react"
import { useRef, useState } from "react"
import { UploadCloud, FolderOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import SelectedFileItem from "./selected-file-item"

interface MediaItem {
  id: string
  name: string
  size?: number
  type: string
  file?: File
  url?: string
  tempId?: string
}

interface DeviceUploadTabProps {
  selectedFiles: MediaItem[]
  maxFiles: number
  onFilesSelected: (files: File[]) => void
  onRemoveFile: (index: number) => void
}

export default function DeviceUploadTab({
  selectedFiles,
  maxFiles,
  onFilesSelected,
  onRemoveFile,
}: DeviceUploadTabProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)

  const onFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files && files.length > 0) {
      onFilesSelected(Array.from(files))
      if (fileInputRef.current) {
        fileInputRef.current.value = "" // Clear input
      }
    }
  }

  const onDrop = (event: React.DragEvent) => {
    event.preventDefault()
    setIsDragging(false)
    const files = event.dataTransfer?.files
    if (files && files.length > 0) {
      onFilesSelected(Array.from(files))
    }
  }

  const onDragOver = (event: React.DragEvent) => {
    event.preventDefault()
    setIsDragging(true)
  }

  const onDragLeave = (event: React.DragEvent) => {
    event.preventDefault()
    setIsDragging(false)
  }

  const clearAllFiles = () => {
    // Emit remove for each file in reverse order to avoid index issues
    for (let i = selectedFiles.length - 1; i >= 0; i--) {
      onRemoveFile(i)
    }
  }

  return (
    <div className="h-full flex flex-col p-4">
      {/* Upload Area */}
      <div className="flex-1 flex flex-col">
        {/* Drag & Drop Zone */}
        <div
          className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-200 ${
            isDragging
              ? "border-pink-500 bg-pink-50 dark:bg-pink-900/20"
              : "border-gray-300 dark:border-gray-600 hover:border-pink-400 hover:bg-gray-50 dark:hover:bg-gray-800"
          }`}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            multiple
            className="hidden"
            onChange={onFileSelect}
          />

          <div className="space-y-4">
            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-primary-600 to-primary-700 rounded-full flex items-center justify-center">
              <UploadCloud className="w-10 h-10 text-white" />
            </div>

            <div>
              <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-2">Drop your files here</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">or click to browse from your device</p>

              <Button
                type="button"
                className="inline-flex items-center space-x-2 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-medium px-6 py-3 rounded-xl transition-all duration-200 transform hover:scale-105"
                onClick={() => fileInputRef.current?.click()}
              >
                <FolderOpen className="w-5 h-5" />
                <span>Choose Files</span>
              </Button>
            </div>

            <div className="text-sm text-gray-500 dark:text-gray-400">
              <p>Maximum {maxFiles} files • Images and videos supported</p>
              <p>Up to 100MB per file</p>
            </div>
          </div>
        </div>

        {/* Selected Files List */}
        {selectedFiles.length > 0 && (
          <div className="mt-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-base font-semibold text-gray-900 dark:text-white">
                Selected Files ({selectedFiles.length}/{maxFiles})
              </h4>
              <button
                type="button"
                className="text-sm text-gray-500 hover:text-red-500 transition-colors cursor-pointer"
                onClick={clearAllFiles}
              >
                Clear All
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-64 overflow-y-auto">
              {selectedFiles.map((file, index) => (
                <SelectedFileItem key={file.id} file={file} index={index} onRemove={() => onRemoveFile(index)} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
