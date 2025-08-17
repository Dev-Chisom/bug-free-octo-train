"use client"

import React, { useEffect } from "react"
import { X, Plus, ImageOff, Upload, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface CustomPreviewModalProps {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
  showEdit?: boolean
  maxFiles?: number
  mediaItemsCount?: number
  isUploading?: boolean
  uploadProgress?: { completed: number; total: number }
  onAddMedia?: () => void
  onUpload?: () => void
}

export const CustomPreviewModal: React.FC<CustomPreviewModalProps> = ({
  isOpen,
  onClose,
  children,
  showEdit = false,
  maxFiles = 10,
  mediaItemsCount = 0,
  isUploading = false,
  uploadProgress = { completed: 0, total: 0 },
  onAddMedia,
  onUpload,
}) => {
  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener("keydown", handleEscape)
      // Prevent body scroll when modal is open
      document.body.style.overflow = "hidden"
    }

    return () => {
      document.removeEventListener("keydown", handleEscape)
      document.body.style.overflow = "unset"
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[999] bg-black/90 backdrop-blur-sm h-full">
      <div className="relative w-full h-full flex flex-col md:flex-row">
        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between p-4 bg-black/20 backdrop-blur-sm">
          {showEdit && mediaItemsCount < maxFiles ? (
            <button
              type="button"
              className="w-10 h-10 bg-gradient-to-r from-primary-600 to-primary-700 rounded-full flex items-center justify-center shadow-lg cursor-pointer hover:scale-105 transition-all duration-200"
              onClick={onAddMedia}
            >
              <Plus className="w-5 h-5 text-white" />
            </button>
          ) : showEdit && mediaItemsCount >= maxFiles ? (
            <div className="bg-amber-500/90 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-medium">
              Max {maxFiles} files
            </div>
          ) : (
            <div></div>
          )}

          <button
            type="button"
            className="w-10 h-10 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer"
            onClick={onClose}
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Desktop Close Button */}
        <button
          type="button"
          className="hidden md:block absolute top-2 right-6 z-50 w-12 h-12 bg-white/10 dark:bg-gray-900/10 hover:bg-white/20 dark:hover:bg-gray-900/20 backdrop-blur-sm rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 cursor-pointer"
          onClick={onClose}
        >
          <X className="w-6 h-6 text-gray-900 dark:text-white" />
        </button>

        {/* Desktop Add Media Button */}
        {showEdit && mediaItemsCount < maxFiles && (
          <button
            type="button"
            className="hidden md:block absolute top-6 left-6 z-50 w-12 h-12 bg-gradient-to-r from-primary-600 to-primary-700 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 shadow-lg cursor-pointer"
            onClick={onAddMedia}
          >
            <Plus className="w-6 h-6 text-white" />
          </button>
        )}

        {/* Desktop File Limit Warning */}
        {showEdit && mediaItemsCount >= maxFiles && (
          <div className="hidden md:block absolute top-6 left-6 z-50 bg-amber-500/90 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium">
            Maximum {maxFiles} files reached
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col md:flex-row min-h-0">
          {/* Media Display Area */}
          <div className="flex-1 relative flex items-center justify-center p-3 md:p-6 min-h-0">
            {children}
          </div>
        </div>

        {/* Bottom Controls */}
        <div className="absolute bottom-4 md:bottom-6 left-1/2 transform -translate-x-1/2 flex flex-col md:flex-row items-center space-y-3 md:space-y-0 md:space-x-6">
          {/* Upload Button */}
          {onUpload && (
            <Button
              disabled={mediaItemsCount === 0 || isUploading}
              className="bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed text-white font-medium py-2.5 px-6 md:py-3 md:px-8 rounded-full transition-all duration-200 hover:scale-105 shadow-lg text-sm md:text-base relative z-50"
              onClick={onUpload}
              style={{ pointerEvents: 'auto' }}
            >
              {isUploading ? (
                <span className="flex items-center space-x-2">
                  <Loader2 className="animate-spin w-4 h-4 md:w-5 md:h-5" />
                  <span className="hidden sm:inline">
                    Uploading {uploadProgress.completed}/{uploadProgress.total}...
                  </span>
                  <span className="sm:hidden">
                    {uploadProgress.completed}/{uploadProgress.total}
                  </span>
                </span>
              ) : (
                <span className="flex items-center space-x-2">
                  <Upload className="w-4 h-4 md:w-5 md:h-5" />
                  <span className="hidden sm:inline">Upload & Continue</span>
                  <span className="sm:hidden">Upload</span>
                </span>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
} 