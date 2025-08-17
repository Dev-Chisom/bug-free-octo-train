'use client'

import React, { useRef, useState, useEffect } from 'react'
import { Play, Pause, Volume2, VolumeX, Maximize2, Loader2 } from 'lucide-react'
import { Button } from './button'
import { Slider } from './slider'
import { ApiVideoPlayer, type ApiVideoPlayerRef } from './api-video-player'

interface VideoPlayerProps {
  src: string
  poster?: string
  videoId?: string // For api.video videos
  className?: string
  autoplay?: boolean
  muted?: boolean
  controls?: boolean
  loop?: boolean
  width?: string | number
  height?: string | number
  onLoad?: () => void
  onPlay?: () => void
  onPause?: () => void
  onEnded?: () => void
  onTimeUpdate?: (currentTime: number) => void
  onProgress?: (loaded: number, total: number) => void
  onError?: (error: any) => void
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  src,
  poster,
  videoId,
  className = '',
  autoplay = false,
  muted = true,
  controls = true,
  loop = false,
  width = '100%',
  height = '100%',
  onLoad,
  onPlay,
  onPause,
  onEnded,
  onTimeUpdate,
  onProgress,
  onError,
}) => {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(muted)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [showControls, setShowControls] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const videoRef = useRef<HTMLVideoElement>(null)
  const apiVideoRef = useRef<ApiVideoPlayerRef>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const controlsTimeoutRef = useRef<NodeJS.Timeout>()

  // Check if this is an api.video video
  const isApiVideo = videoId || src.includes('api.video')

  // Handle play/pause
  const togglePlay = async () => {
    if (isApiVideo && apiVideoRef.current) {
      if (isPlaying) {
        apiVideoRef.current.pause()
      } else {
        await apiVideoRef.current.play()
      }
    } else if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        await videoRef.current.play()
      }
    }
  }

  // Handle mute/unmute
  const toggleMute = () => {
    if (isApiVideo && apiVideoRef.current) {
      const newVolume = isMuted ? volume : 0
      apiVideoRef.current.setVolume(newVolume)
      setIsMuted(!isMuted)
    } else if (videoRef.current) {
      videoRef.current.muted = !isMuted
      setIsMuted(!isMuted)
    }
  }

  // Handle volume change
  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0]
    setVolume(newVolume)
    setIsMuted(newVolume === 0)

    if (isApiVideo && apiVideoRef.current) {
      apiVideoRef.current.setVolume(newVolume)
    } else if (videoRef.current) {
      videoRef.current.volume = newVolume
    }
  }

  // Handle seek
  const handleSeek = (value: number[]) => {
    const newTime = (value[0] / 100) * duration
    setCurrentTime(newTime)

    if (isApiVideo && apiVideoRef.current) {
      apiVideoRef.current.seek(newTime)
    } else if (videoRef.current) {
      videoRef.current.currentTime = newTime
    }
  }

  // Handle fullscreen
  const toggleFullscreen = () => {
    if (containerRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen()
      } else {
        containerRef.current.requestFullscreen()
      }
    }
  }

  // Show/hide controls
  const showControlsTemporarily = () => {
    setShowControls(true)
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current)
    }
    controlsTimeoutRef.current = setTimeout(() => {
      setShowControls(false)
    }, 3000)
  }

  // Event handlers for regular video
  const handleVideoLoad = () => {
    setIsLoading(false)
    if (videoRef.current) {
      setDuration(videoRef.current.duration || 0)
    }
    onLoad?.()
  }

  const handleVideoPlay = () => {
    setIsPlaying(true)
    onPlay?.()
  }

  const handleVideoPause = () => {
    setIsPlaying(false)
    onPause?.()
  }

  const handleVideoTimeUpdate = () => {
    if (videoRef.current) {
      const time = videoRef.current.currentTime
      setCurrentTime(time)
      onTimeUpdate?.(time)
    }
  }

  const handleVideoProgress = () => {
    if (videoRef.current) {
      const video = videoRef.current
      if (video.buffered && video.buffered.length > 0) {
        const loaded = video.buffered.end(video.buffered.length - 1)
        const total = video.duration || 0
        onProgress?.(loaded, total)
      }
    }
  }

  const handleVideoError = (e: any) => {
    setIsLoading(false)
    setError('Failed to load video')
    onError?.(e)
  }

  // Event handlers for api.video
  const handleApiVideoLoad = () => {
    setIsLoading(false)
    onLoad?.()
  }

  const handleApiVideoPlay = () => {
    setIsPlaying(true)
    onPlay?.()
  }

  const handleApiVideoPause = () => {
    setIsPlaying(false)
    onPause?.()
  }

  const handleApiVideoTimeUpdate = (time: number) => {
    setCurrentTime(time)
    onTimeUpdate?.(time)
  }

  const handleApiVideoProgress = (loaded: number, total: number) => {
    onProgress?.(loaded, total)
  }

  const handleApiVideoError = (error: any) => {
    setIsLoading(false)
    setError('Failed to load video')
    onError?.(error)
  }

  // Update time from api.video player
  useEffect(() => {
    if (isApiVideo && apiVideoRef.current) {
      const interval = setInterval(() => {
        const time = apiVideoRef.current?.getCurrentTime() || 0
        setCurrentTime(time)
      }, 100)

      return () => clearInterval(interval)
    }
  }, [isApiVideo])

  // Cleanup timeout
  useEffect(() => {
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current)
      }
    }
  }, [])

  if (error) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 dark:bg-gray-800 ${className}`}>
        <div className="text-center">
          <p className="text-red-500 mb-2">{error}</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className={`relative group ${className}`}
      style={{ width, height }}
      onMouseMove={showControlsTemporarily}
      onMouseLeave={() => setShowControls(false)}
    >
      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
          <Loader2 className="w-8 h-8 animate-spin text-white" />
        </div>
      )}

      {/* Video element */}
      {isApiVideo ? (
        <ApiVideoPlayer
          ref={apiVideoRef}
          videoId={videoId || src.split('/').pop() || ''}
          autoplay={autoplay}
          muted={isMuted}
          controls={false}
          loop={loop}
          poster={poster}
          width={width}
          height={height}
          onLoad={handleApiVideoLoad}
          onPlay={handleApiVideoPlay}
          onPause={handleApiVideoPause}
          onTimeUpdate={handleApiVideoTimeUpdate}
          onProgress={handleApiVideoProgress}
          onError={handleApiVideoError}
        />
      ) : (
        <video
          ref={videoRef}
          src={src}
          poster={poster}
          autoPlay={autoplay}
          muted={isMuted}
          loop={loop}
          preload="metadata"
          className="w-full h-full object-cover"
          onLoadStart={() => setIsLoading(true)}
          onLoadedData={handleVideoLoad}
          onPlay={handleVideoPlay}
          onPause={handleVideoPause}
          onEnded={onEnded}
          onTimeUpdate={handleVideoTimeUpdate}
          onProgress={handleVideoProgress}
          onError={handleVideoError}
        />
      )}

      {/* Custom controls */}
      {controls && (
        <div
          className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 transition-opacity duration-300 ${
            showControls ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {/* Progress bar */}
          <div className="mb-4">
            <Slider
              value={[duration > 0 ? (currentTime / duration) * 100 : 0]}
              onValueChange={handleSeek}
              max={100}
              step={0.1}
              className="w-full"
            />
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={togglePlay}
                className="text-white hover:bg-white/20"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={toggleMute}
                className="text-white hover:bg-white/20"
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </Button>

              <div className="w-20">
                <Slider
                  value={[isMuted ? 0 : volume * 100]}
                  onValueChange={handleVolumeChange}
                  max={100}
                  className="w-full"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-white text-sm">
                {Math.floor(currentTime / 60)}:{(currentTime % 60).toFixed(0).padStart(2, '0')} /{' '}
                {Math.floor(duration / 60)}:{(duration % 60).toFixed(0).padStart(2, '0')}
              </span>

              <Button
                variant="ghost"
                size="sm"
                onClick={toggleFullscreen}
                className="text-white hover:bg-white/20"
              >
                <Maximize2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 