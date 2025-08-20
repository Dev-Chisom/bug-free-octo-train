"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight, Play, Pause } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ApiVideoPlayer } from "@/components/ui/api-video-player"

interface MediaItem {
  url: string
  type: "image" | "video"
  id?: string
  name?: string
  file?: File
  // api.video fields for viewing only
  apiVideoId?: string
  coverUrl?: string
}

interface MediaCarouselProps {
  mediaItems: MediaItem[]
  currentIndex: number
  isPlaying: boolean
  onUpdateCurrentIndex: (index: number) => void
  onPlay: () => void
  onPause: () => void
  onVideoLoaded?: (event: Event, index: number) => void
}

export default function MediaCarousel({
  mediaItems,
  currentIndex,
  isPlaying,
  onUpdateCurrentIndex,
  onPlay,
  onPause,
  onVideoLoaded,
}: MediaCarouselProps) {
  const [videoRef, setVideoRef] = useState<HTMLVideoElement | null>(null)
  const [isClient, setIsClient] = useState(false)

  // Prevent hydration issues
  useEffect(() => {
    setIsClient(true)
  }, [])

  const currentMedia = mediaItems[currentIndex]

  const goToPrevious = () => {
    if (currentIndex > 0) {
      onUpdateCurrentIndex(currentIndex - 1)
    }
  }

  const goToNext = () => {
    if (currentIndex < mediaItems.length - 1) {
      onUpdateCurrentIndex(currentIndex + 1)
    }
  }

  const togglePlayPause = () => {
    if (videoRef) {
      if (isPlaying) {
        videoRef.pause()
        onPause()
      } else {
        videoRef.play()
        onPlay()
      }
    }
  }

  const handleVideoLoaded = (event: React.SyntheticEvent<HTMLVideoElement>) => {
    if (onVideoLoaded) {
      onVideoLoaded(event.nativeEvent, currentIndex)
    }
  }

  if (!currentMedia) return null

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* Navigation Arrows */}
      {mediaItems.length > 1 && (
        <>
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 bg-black/20 dark:bg-white/20 hover:bg-black/40 dark:hover:bg-white/40 text-white dark:text-foreground rounded-full"
            onClick={goToPrevious}
            disabled={currentIndex === 0}
          >
            <ChevronLeft className="w-6 h-6" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 bg-black/20 dark:bg-white/20 hover:bg-black/40 dark:hover:bg-white/40 text-white dark:text-foreground rounded-full"
            onClick={goToNext}
            disabled={currentIndex === mediaItems.length - 1}
          >
            <ChevronRight className="w-6 h-6" />
          </Button>
        </>
      )}

      {/* Media Content */}
      <div className="w-full h-full flex items-center justify-center">
        {currentMedia.type === "image" ? (
          <img
            src={currentMedia.url || "/placeholder.svg"}
            alt={currentMedia.name || "Media"}
            className="max-w-full max-h-full object-contain"
          />
        ) : (
          <div className="relative">
            {/* Check if this is an api.video video for viewing */}
            {isClient && currentMedia?.apiVideoId ? (
              <ApiVideoPlayer
                videoId={currentMedia.apiVideoId}
                autoplay={false}
                muted={false}
                controls={true}
                loop={false}
                preload="metadata"
                width="100%"
                height="100%"
                className="max-w-full max-h-full object-contain"
                onLoad={() => {
                  if (onVideoLoaded) {
                    onVideoLoaded({} as Event, currentIndex)
                  }
                }}
                onPlay={onPlay}
                onPause={onPause}
              />
            ) : (
              <video
                ref={setVideoRef}
                src={currentMedia.url}
                className="max-w-full max-h-full object-contain"
                controls
                onLoadedData={handleVideoLoaded}
                onPlay={onPlay}
                onPause={onPause}
              />
            )}

            {/* Custom Play/Pause Button Overlay for regular videos */}
            {!currentMedia?.apiVideoId && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black/20 dark:bg-white/20 hover:bg-black/40 dark:hover:bg-white/40 text-white dark:text-foreground rounded-full w-16 h-16"
                onClick={togglePlayPause}
              >
                {isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8" />}
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Media Counter */}
      {mediaItems.length > 1 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 dark:bg-white/80 text-white dark:text-foreground px-3 py-1 rounded-full text-sm">
          {currentIndex + 1} / {mediaItems.length}
        </div>
      )}
    </div>
  )
}
