"use client"

import { ImageIcon } from "lucide-react"

interface MediaGalleryHeaderProps {
  title: string
  onClose?: () => void
}

export default function MediaGalleryHeader({ title }: MediaGalleryHeaderProps) {
  return (
    <div className="px-4 py-2">
      <div className="relative flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center">
            <ImageIcon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base md:text-lg font-bold">{title}</h2>
            <p className="text-xs md:text-sm">Upload and manage your content</p>
          </div>
        </div>
      </div>
    </div>
  )
}
