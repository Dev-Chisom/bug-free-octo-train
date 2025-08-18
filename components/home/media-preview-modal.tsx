"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { useTranslation } from "react-i18next"
import { X, Plus, Upload, Loader2, ImageOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import MediaCarousel from "./media-carousel"
import MediaPreviewSidebar from "./media-preview-sidebar"

interface MediaItem {
  url: string
  type: "image" | "video"
  id?: string
  name?: string
  file?: File
}

interface Message {
  text: string
  timestamp: Date
  user: {
    name: string
    avatar: string
  }
  isCurrentUser: boolean
}

interface MediaPreviewModalProps {
  isOpen: boolean
  mediaItems: MediaItem[]
  currentIndex?: number
  showSidebar?: boolean
  messages?: Message[]
  currentUser?: {
    name: string
    avatar: string
  }
  enableVideoEdit?: boolean
  showEdit?: boolean
  showNextButton?: boolean
  maxFiles?: number
  isUploading?: boolean
  uploadProgress?: {
    completed: number
    total: number
  }
  title?: string
  onClose: () => void
  onUpdateCurrentIndex?: (index: number) => void
  onSendMessage?: (message: string) => void
  onUpdateCover?: (data: { index: number; cover: string | null }) => void
  onAddMedia?: (files: File[]) => void
  onNext?: (mediaData: any[]) => void
}

export default function MediaPreviewModal({
  isOpen,
  mediaItems = [],
  currentIndex = 0,
  showSidebar = false,
  messages = [],
  currentUser = { name: "", avatar: "" },
  enableVideoEdit = false,
  showEdit = false,
  showNextButton = false,
  maxFiles = 10,
  isUploading = false,
  uploadProgress = { completed: 0, total: 0 },
  title = "Media Preview",
  onClose,
  onUpdateCurrentIndex,
  onSendMessage,
  onUpdateCover,
  onAddMedia,
  onNext,
}: MediaPreviewModalProps) {
  const { t } = useTranslation()
  const [internalCurrentIndex, setInternalCurrentIndex] = useState(currentIndex)
  const [isVideoPlaying, setIsVideoPlaying] = useState(false)
  const addMediaInputRef = useRef<HTMLInputElement>(null)

  // Video editing state per video
  const [videoStates, setVideoStates] = useState<
    Map<
      number,
      {
        coverThumbnails: string[]
        selectedCoverIndex: number | null
        customCover: string | null
        trimStart: number
        trimEnd: number
        videoDuration: number
        isGeneratingThumbs: boolean
      }
    >
  >(new Map())

  const currentMedia = mediaItems[internalCurrentIndex] || {}

  // Update internal index when prop changes
  useEffect(() => {
    if (currentIndex !== internalCurrentIndex) {
      setInternalCurrentIndex(currentIndex)
    }
  }, [currentIndex])

  // Helper functions for video state
  const getVideoState = (index: number) => {
    if (!videoStates.has(index)) {
      const newState = {
        coverThumbnails: [],
        selectedCoverIndex: null,
        customCover: null,
        trimStart: 0,
        trimEnd: 10,
        videoDuration: 10,
        isGeneratingThumbs: false,
      }
      setVideoStates((prev) => new Map(prev).set(index, newState))
      return newState
    }
    return videoStates.get(index)!
  }

  const updateCurrentIndex = (newIndex: number) => {
    setInternalCurrentIndex(newIndex)
    onUpdateCurrentIndex?.(newIndex)
  }

  const goToSlide = (index: number) => {
    setInternalCurrentIndex(index)
    onUpdateCurrentIndex?.(index)
  }

  const onVideoPlay = () => {
    setIsVideoPlaying(true)
  }

  const onVideoPause = () => {
    setIsVideoPlaying(false)
  }

  const onVideoLoaded = (event: Event, index: number) => {
    const video = event.target as HTMLVideoElement
    if (!video) return

    const state = getVideoState(index)
    const newState = {
      ...state,
      videoDuration: video.duration,
      trimStart: 0,
      trimEnd: video.duration,
    }

    if (state.selectedCoverIndex === null && state.customCover === null) {
      newState.selectedCoverIndex = 0
    }

    setVideoStates((prev) => new Map(prev).set(index, newState))
    generateThumbnails(video, index)
  }

  const generateThumbnails = async (video: HTMLVideoElement, index: number) => {
    if (!video) return

    const state = getVideoState(index)
    setVideoStates((prev) => new Map(prev).set(index, { ...state, isGeneratingThumbs: true, coverThumbnails: [] }))

    try {
      const count = 6
      const interval = video.duration / count
      const canvas = document.createElement("canvas")

      const videoWidth = video.videoWidth || 640
      const videoHeight = video.videoHeight || 360
      canvas.width = videoWidth
      canvas.height = videoHeight

      const ctx = canvas.getContext("2d")
      if (!ctx) {
        // Could not get canvas context
        return
      }

      const thumbnails: string[] = []

      for (let i = 0; i < count; i++) {
        const time = i * interval
        video.currentTime = time

        await new Promise<void>((resolve) => {
          const onSeeked = () => {
            video.removeEventListener("seeked", onSeeked)

            ctx.clearRect(0, 0, canvas.width, canvas.height)
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

            const thumbnail = canvas.toDataURL("image/jpeg", 0.9)
            thumbnails.push(thumbnail)

            if (i === 0 && state.selectedCoverIndex === null && state.customCover === null) {
              onUpdateCover?.({ index, cover: thumbnail })
            }

            resolve()
          }

          video.addEventListener("seeked", onSeeked, { once: true })
        })
      }

      video.currentTime = 0

      setVideoStates((prev) =>
        new Map(prev).set(index, {
          ...getVideoState(index),
          coverThumbnails: thumbnails,
          isGeneratingThumbs: false,
          selectedCoverIndex: state.selectedCoverIndex === null ? 0 : state.selectedCoverIndex,
        }),
      )
    } catch (error) {
      // Error generating thumbnails
      setVideoStates((prev) => new Map(prev).set(index, { ...getVideoState(index), isGeneratingThumbs: false }))
    }
  }

  const selectCover = (coverIndex: number) => {
    const state = getVideoState(internalCurrentIndex)
    const newState = {
      ...state,
      selectedCoverIndex: coverIndex,
      customCover: null,
    }
    setVideoStates((prev) => new Map(prev).set(internalCurrentIndex, newState))

    const coverPhoto = state.coverThumbnails[coverIndex]
    onUpdateCover?.({ index: internalCurrentIndex, cover: coverPhoto })
  }

  const onCustomCoverChange = (file: File) => {
    const reader = new FileReader()
    reader.onload = () => {
      const state = getVideoState(internalCurrentIndex)
      const newState = {
        ...state,
        customCover: reader.result as string,
        selectedCoverIndex: null,
      }
      setVideoStates((prev) => new Map(prev).set(internalCurrentIndex, newState))
      onUpdateCover?.({ index: internalCurrentIndex, cover: newState.customCover })
    }
    reader.readAsDataURL(file)
  }

  const clearCover = () => {
    const state = getVideoState(internalCurrentIndex)

    if (state.coverThumbnails.length > 0 && state.selectedCoverIndex === 0 && !state.customCover) {
      return
    }

    const newState = {
      ...state,
      selectedCoverIndex: null,
      customCover: null,
    }
    setVideoStates((prev) => new Map(prev).set(internalCurrentIndex, newState))
    onUpdateCover?.({ index: internalCurrentIndex, cover: null })
  }

  const sendMessage = (message: string) => {
    onSendMessage?.(message)
  }

  const triggerAddMedia = (e: React.MouseEvent) => {
    e.stopPropagation() // Prevent event from bubbling up
    addMediaInputRef.current?.click()
  }

  const onAddMediaFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const remainingSlots = maxFiles - mediaItems.length
    if (remainingSlots <= 0) {
      return
    }

    const filesToAdd = Array.from(files).slice(0, remainingSlots)
    onAddMedia?.(filesToAdd)

    if (addMediaInputRef.current) {
      addMediaInputRef.current.value = ""
    }
  }

  const handleUpload = (e: React.MouseEvent) => {
    e.stopPropagation() // Prevent event from bubbling up
    if (mediaItems.length === 0) return

    const mediaData = mediaItems.map((media, index) => {
      const baseData = {
        id: media.id || `temp-${index}`,
        name: media.name || `media-${index}`,
        type: media.type,
        url: media.url,
        file: media.file,
      }

      if (baseData.type === "video") {
        const state = getVideoState(index)
        return {
          ...baseData,
          cover:
            state.customCover ||
            (state.selectedCoverIndex !== null ? state.coverThumbnails[state.selectedCoverIndex] : null),
          trimStart: state.trimStart,
          trimEnd: state.trimEnd,
        }
      }

      return baseData
    })

    onNext?.(mediaData)
  }

  const handleClose = (e?: React.MouseEvent) => {
    e?.stopPropagation()
    // Clean up blob URLs
    mediaItems.forEach((item) => {
      if (item.url?.startsWith("blob:")) {
        URL.revokeObjectURL(item.url)
      }
    })

    onClose()
  }

  // Only close on backdrop click, not on any click within the modal content
  const handleBackdropClick = (e: React.MouseEvent) => {
    // Only close if clicking the backdrop itself, not any child element
    if (e.target === e.currentTarget) {
      handleClose()
    }
  }

  const handleContentClick = (e: React.MouseEvent) => {
    // Stop propagation to prevent closing when clicking modal content
    e.stopPropagation()
  }

  if (!isOpen) return null

  return (
    <div 
      className="fixed inset-0 z-[999] bg-black/90 backdrop-blur-sm h-full"
      onClick={handleBackdropClick} // Only trigger on backdrop clicks
    >
      <div 
        className="relative w-full h-full flex flex-col md:flex-row"
        onClick={handleContentClick} // Stop propagation for content clicks
      >
        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between p-4 bg-black/20 backdrop-blur-sm">
          {showEdit && mediaItems.length < maxFiles ? (
            <button
              type="button"
              className="w-10 h-10 bg-gradient-to-r from-primary-600 to-primary-700 rounded-full flex items-center justify-center shadow-lg"
              onClick={triggerAddMedia}
            >
              <Plus className="w-5 h-5 text-white" />
            </button>
          ) : showEdit && mediaItems.length >= maxFiles ? (
            <div className="bg-amber-500/90 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-medium">
              Max {maxFiles} files
            </div>
          ) : (
            <div></div>
          )}

          <button
            type="button"
            className="w-10 h-10 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center transition-all duration-200"
            onClick={handleClose}
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Desktop Close Button */}
        <button
          type="button"
          className="hidden md:block absolute top-2 right-6 z-50 w-12 h-12 bg-white/10 dark:bg-gray-900/10 hover:bg-white/20 dark:hover:bg-gray-900/20 backdrop-blur-sm rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110"
          onClick={handleClose}
        >
          <X className="w-6 h-6 text-gray-900 dark:text-white" />
        </button>

        {/* Desktop Add Media Button */}
        {showEdit && mediaItems.length < maxFiles && (
          <button
            type="button"
            className="hidden md:block absolute top-6 left-6 z-50 w-12 h-12 bg-gradient-to-r from-primary-600 to-primary-700 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 shadow-lg"
            onClick={triggerAddMedia}
          >
            <Plus className="w-6 h-6 text-white" />
          </button>
        )}

        {/* Desktop File Limit Warning */}
        {showEdit && mediaItems.length >= maxFiles && (
          <div className="hidden md:block absolute top-6 left-6 z-50 bg-amber-500/90 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium">
            Maximum {maxFiles} files reached
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col md:flex-row min-h-0">
          {/* Media Display Area */}
          <div className="flex-1 relative flex items-center justify-center p-3 md:p-6 min-h-0">
            {mediaItems.length > 0 ? (
              <MediaCarousel
                mediaItems={mediaItems}
                currentIndex={internalCurrentIndex}
                isPlaying={isVideoPlaying}
                onUpdateCurrentIndex={updateCurrentIndex}
                onPlay={onVideoPlay}
                onPause={onVideoPause}
                onVideoLoaded={onVideoLoaded}
              />
            ) : (
              <div className="text-center text-white/60">
                <ImageOff className="w-16 md:w-20 h-16 md:h-20 mx-auto mb-4 opacity-50" />
                <h3 className="text-base md:text-xl font-medium mb-2">No media selected</h3>
                <p className="text-xs md:text-base">Add some files to get started</p>
              </div>
            )}
          </div>

          {/* Sidebar - Mobile: Bottom Sheet, Desktop: Right Sidebar */}
          {(showSidebar || (enableVideoEdit && currentMedia?.type === "video")) && (
            <div className="w-full md:w-80 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-t md:border-l md:border-t-0 border-white/20 flex flex-col max-h-[40vh] md:max-h-none">
              {/* Mobile Sidebar Handle */}
              <div className="md:hidden flex justify-center py-2 border-b border-white/10">
                <div className="w-12 h-1 bg-gray-400 rounded-full"></div>
              </div>

              <MediaPreviewSidebar
                currentMedia={currentMedia}
                currentIndex={internalCurrentIndex}
                enableVideoEdit={enableVideoEdit}
                showComments={showSidebar}
                videoThumbnails={getVideoState(internalCurrentIndex).coverThumbnails}
                selectedCoverIndex={getVideoState(internalCurrentIndex).selectedCoverIndex}
                customCover={getVideoState(internalCurrentIndex).customCover}
                isGeneratingThumbs={getVideoState(internalCurrentIndex).isGeneratingThumbs}
                title={title}
                messages={messages}
                currentUser={currentUser}
                onSelectCover={selectCover}
                onClearCover={clearCover}
                onCustomCoverChange={onCustomCoverChange}
                onSendMessage={sendMessage}
              />
            </div>
          )}
        </div>

        {/* Bottom Controls */}
        <div className="absolute bottom-4 md:bottom-6 left-1/2 transform -translate-x-1/2 flex flex-col md:flex-row items-center space-y-3 md:space-y-0 md:space-x-6">
          {/* Navigation Dots */}
          {mediaItems.length > 1 && (
            <div className="flex space-x-2">
              {mediaItems.map((_, index) => (
                <button
                  key={index}
                  type="button"
                  className={`w-2.5 h-2.5 md:w-3 md:h-3 rounded-full transition-all duration-200 ${
                    index === internalCurrentIndex ? "bg-white scale-125" : "bg-white/40 hover:bg-white/60"
                  }`}
                  onClick={(e) => {
                    e.stopPropagation()
                    goToSlide(index)
                  }}
                />
              ))}
            </div>
          )}

          {/* Upload Button */}
          {showNextButton && (
            <Button
              disabled={mediaItems.length === 0 || isUploading}
              className="bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed text-white font-medium py-2.5 px-6 md:py-3 md:px-8 rounded-full transition-all duration-200 hover:scale-105 shadow-lg text-sm md:text-base relative z-50"
              onClick={handleUpload}
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

        {/* Hidden File Input */}
        <input
          ref={addMediaInputRef}
          type="file"
          accept="image/*,video/*"
          multiple
          className="hidden"
          onChange={onAddMediaFiles}
        />
      </div>
    </div>
  )
}