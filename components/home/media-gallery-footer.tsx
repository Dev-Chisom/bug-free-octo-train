"use client"

import { CheckCircle, Loader2, ArrowRight } from 'lucide-react'
import { Button } from "@/components/ui/button"

interface MediaGalleryFooterProps {
  canProceed: boolean
  isUploading: boolean
  onNext: () => void
}

export default function MediaGalleryFooter({ canProceed, isUploading, onNext }: MediaGalleryFooterProps) {
  return (
    <div className="border-t border-border bg-muted px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Progress/Status */}
        <div className="flex items-center space-x-3">
          {isUploading ? (
            <div className="flex items-center space-x-2 text-xs md:text-sm text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Uploading...</span>
            </div>
          ) : canProceed ? (
            <div className="flex items-center space-x-2 text-xs md:text-sm text-green-600 dark:text-green-400">
              <CheckCircle className="w-4 h-4" />
              <span>Ready to proceed</span>
            </div>
          ) : null}
        </div>

        {/* Action Button */}
        <Button
          disabled={!canProceed || isUploading}
          className={`px-8 py-3 rounded-xl font-medium transition-all duration-200 transform text-sm md:text-base ${
            canProceed && !isUploading
              ? "bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 hover:scale-105 shadow-lg hover:shadow-xl text-white"
              : "bg-muted text-muted-foreground cursor-not-allowed"
          }`}
          onClick={onNext}
        >
          {isUploading ? (
            <span className="flex items-center space-x-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Processing...</span>
            </span>
          ) : (
            <span className="flex items-center space-x-2">
              <span>Continue</span>
              <ArrowRight className="w-4 h-4" />
            </span>
          )}
        </Button>
      </div>
    </div>
  )
}
