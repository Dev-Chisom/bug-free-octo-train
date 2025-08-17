"use client"

import { Video, X } from "lucide-react"

interface SelectedFile {
  id: string
  name: string
  size?: number
  type: string
  file?: File
  url?: string
}

interface SelectedFileItemProps {
  file: SelectedFile
  index: number
  onRemove: () => void
}

export default function SelectedFileItem({ file, onRemove }: SelectedFileItemProps) {
  const formatFileSize = (bytes: number): string => {
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  return (
    <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
      {/* File Preview */}
      <div className="flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-700">
        {file.type === "image" ? (
          <img src={file.url || "/placeholder.svg"} alt={file.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Video className="w-6 h-6 text-gray-500" />
          </div>
        )}
      </div>

      {/* File Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{file.name}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400">{file.size ? formatFileSize(file.size) : 'Unknown size'}</p>
      </div>

      {/* Remove Button */}
      <button
        type="button"
        className="flex-shrink-0 w-8 h-8 rounded-full bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 flex items-center justify-center transition-colors cursor-pointer"
        onClick={onRemove}
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}
