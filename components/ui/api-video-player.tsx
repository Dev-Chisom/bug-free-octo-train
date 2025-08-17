'use client'

import React, { useEffect, useRef, forwardRef, useImperativeHandle, useState } from 'react'
import { apiVideoService } from '@/lib/api-video/service'

// Types for the api.video player
export interface ApiVideoPlayerProps {
  videoId: string
  autoplay?: boolean
  muted?: boolean
  controls?: boolean
  loop?: boolean
  preload?: 'none' | 'metadata' | 'auto'
  poster?: string
  width?: string | number
  height?: string | number
  className?: string
  onLoad?: () => void
  onPlay?: () => void
  onPause?: () => void
  onEnded?: () => void
  onTimeUpdate?: (currentTime: number) => void
  onProgress?: (loaded: number, total: number) => void
  onError?: (error: any) => void
}

export interface ApiVideoPlayerRef {
  play: () => Promise<void>
  pause: () => void
  seek: (time: number) => void
  setVolume: (volume: number) => void
  getCurrentTime: () => number
  getDuration: () => number
  getVolume: () => number
}

// Declare the api-video-player web component
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'api-video-player': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          'video-id': string
          'autoplay'?: boolean
          'muted'?: boolean
          'controls'?: boolean
          'loop'?: boolean
          'preload'?: string
          'poster'?: string
          'width'?: string | number
          'height'?: string | number
        },
        HTMLElement
      >
    }
  }
}

export const ApiVideoPlayer = forwardRef<ApiVideoPlayerRef, ApiVideoPlayerProps>(
  (
    {
      videoId,
      autoplay = false,
      muted = true,
      controls = true,
      loop = false,
      preload = 'metadata',
      poster,
      width = '100%',
      height = '100%',
      className = '',
      onLoad,
      onPlay,
      onPause,
      onEnded,
      onTimeUpdate,
      onProgress,
      onError,
    },
    ref
  ) => {
    const playerRef = useRef<HTMLElement>(null)
    const eventListenersRef = useRef<Map<string, () => void>>(new Map())
    const [isClient, setIsClient] = useState(false)

    // Prevent hydration issues
    useEffect(() => {
      setIsClient(true)
    }, [])

    // Expose player methods through ref
    useImperativeHandle(ref, () => ({
      play: async () => {
        if (playerRef.current) {
          const player = playerRef.current as any
          if (player.play) {
            await player.play()
          }
        }
      },
      pause: () => {
        if (playerRef.current) {
          const player = playerRef.current as any
          if (player.pause) {
            player.pause()
          }
        }
      },
      seek: (time: number) => {
        if (playerRef.current) {
          const player = playerRef.current as any
          if (player.currentTime !== undefined) {
            player.currentTime = time
          }
        }
      },
      setVolume: (volume: number) => {
        if (playerRef.current) {
          const player = playerRef.current as any
          if (player.volume !== undefined) {
            player.volume = Math.max(0, Math.min(1, volume))
          }
        }
      },
      getCurrentTime: () => {
        if (playerRef.current) {
          const player = playerRef.current as any
          return player.currentTime || 0
        }
        return 0
      },
      getDuration: () => {
        if (playerRef.current) {
          const player = playerRef.current as any
          return player.duration || 0
        }
        return 0
      },
      getVolume: () => {
        if (playerRef.current) {
          const player = playerRef.current as any
          return player.volume || 0
        }
        return 0
      },
    }))

    // Set up event listeners
    useEffect(() => {
      const player = playerRef.current
      if (!player) return

      const events = [
        { name: 'load', handler: onLoad },
        { name: 'play', handler: onPlay },
        { name: 'pause', handler: onPause },
        { name: 'ended', handler: onEnded },
        { name: 'error', handler: onError },
      ]

      // Add event listeners
      events.forEach(({ name, handler }) => {
        if (handler) {
          const eventHandler = () => handler()
          player.addEventListener(name, eventHandler)
          eventListenersRef.current.set(name, eventHandler)
        }
      })

      // Add timeupdate listener
      if (onTimeUpdate) {
        const timeUpdateHandler = () => {
          const currentTime = (player as any).currentTime || 0
          onTimeUpdate(currentTime)
        }
        player.addEventListener('timeupdate', timeUpdateHandler)
        eventListenersRef.current.set('timeupdate', timeUpdateHandler)
      }

      // Add progress listener
      if (onProgress) {
        const progressHandler = () => {
          const video = player as any
          if (video.buffered && video.buffered.length > 0) {
            const loaded = video.buffered.end(video.buffered.length - 1)
            const total = video.duration || 0
            onProgress(loaded, total)
          }
        }
        player.addEventListener('progress', progressHandler)
        eventListenersRef.current.set('progress', progressHandler)
      }

      // Cleanup event listeners
      return () => {
        eventListenersRef.current.forEach((handler, eventName) => {
          player.removeEventListener(eventName, handler)
        })
        eventListenersRef.current.clear()
      }
    }, [onLoad, onPlay, onPause, onEnded, onTimeUpdate, onProgress, onError])

    // Get poster URL if not provided
    const posterUrl = poster || apiVideoService.getVideoPosterUrl(videoId)

    // Don't render on server-side to prevent hydration issues
    if (!isClient) {
      return (
        <div className={`api-video-player-container ${className}`} style={{ width, height }}>
          <div className="w-full h-full bg-gray-200 dark:bg-gray-700 animate-pulse rounded" />
        </div>
      )
    }

    return (
      <div className={`api-video-player-container ${className}`} style={{ width, height }}>
        <api-video-player
          ref={playerRef}
          video-id={videoId}
          autoplay={autoplay}
          muted={muted}
          controls={controls}
          loop={loop}
          preload={preload}
          poster={posterUrl}
          width={width}
          height={height}
        />
      </div>
    )
  }
)

ApiVideoPlayer.displayName = 'ApiVideoPlayer' 