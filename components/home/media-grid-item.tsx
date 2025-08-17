"use client"

import { useState, useEffect } from "react"
import { Play, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { ApiVideoPlayer } from "@/components/ui/api-video-player"

interface MediaFile {
  id: string
  name: string
  type: "image" | "video"
  url: string
  thumbnailUrl?: string
  size?: number
  duration?: number
}

interface MediaGridItemProps {
  media: MediaFile
  selected: boolean
  onToggleSelect: () => void
}

export default function MediaGridItem({ media, selected, onToggleSelect }: MediaGridItemProps) {
  const [isClient, setIsClient] = useState(false)

  // Prevent hydration issues
  useEffect(() => {
    setIsClient(true)
  }, [])

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const formatFileSize = (bytes: number): string => {
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  return (
    <div
      className={cn(
        "relative aspect-[4/3] rounded-xl overflow-hidden cursor-pointer group transition-all duration-200 hover:scale-105",
        selected ? "ring-4 ring-primary-500 shadow-lg shadow-primary-500/25" : "hover:shadow-xl hover:shadow-black/10",
      )}
      onClick={onToggleSelect}
    >
      {/* Media Content */}
      <div className="w-full h-full bg-gray-100 dark:bg-gray-800">
        {media?.type === "image" ? (
          <img
            src={media?.thumbnailUrl || media?.url}
            alt={media?.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="relative w-full h-full">
            {/* Check if this is an api.video video for viewing */}
            {isClient && media?.apiVideoId ? (
              <ApiVideoPlayer
                videoId={media.apiVideoId}
                autoplay={false}
                muted={true}
                controls={false}
                loop={false}
                preload="metadata"
                poster={media.coverUrl || media.thumbnailUrl}
                width="100%"
                height="100%"
                className="w-full h-full object-cover"
              />
            ) : (
              <video src={media?.url} className="w-full h-full object-cover" muted preload="metadata" />
            )}
            
            {/* Video Overlay with coverUrl fallback */}
            <div
              className={cn(
                "absolute inset-0 flex items-center justify-center",
                media?.coverUrl || media?.thumbnailUrl ? "bg-cover bg-center" : "bg-black/20",
              )}
              style={media?.coverUrl || media?.thumbnailUrl ? { backgroundImage: `url('${media.coverUrl || media.thumbnailUrl}')` } : undefined}
            >
              <div className="bg-white/90 rounded-full p-3 group-hover:scale-110 transition-transform">
                <Play className="w-6 h-6 text-gray-800" />
              </div>
            </div>
            {/* Duration Badge */}
            {media?.duration && (
              <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full">
                {formatDuration(media.duration)}
              </div>
            )}
          </div>
        )}
      </div>

      {selected && (
        <div className="absolute top-3 left-3 bg-primary-500 text-white rounded-full p-2 shadow-lg">
          <Check className="w-4 h-4" />
        </div>
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="absolute bottom-3 left-3 right-3">
          <p className="text-white text-xs sm:text-sm font-medium truncate">{media?.name}</p>
          {media?.size && <p className="text-white/80 text-[10px] sm:text-xs">{formatFileSize(media.size)}</p>}
        </div>
      </div>
    </div>
  )
}
