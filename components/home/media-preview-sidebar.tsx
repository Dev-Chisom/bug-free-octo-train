"use client"

import type React from "react"

import { useState } from "react"
import { Check, X, ImageIcon, Video } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface Message {
  text: string
  timestamp: Date
  user: {
    name: string
    avatar: string
  }
  isCurrentUser: boolean
}

interface MediaPreviewSidebarProps {
  currentMedia: any
  currentIndex: number
  enableVideoEdit: boolean
  showComments: boolean
  videoThumbnails: string[]
  selectedCoverIndex: number | null
  customCover: string | null
  isGeneratingThumbs: boolean
  messages: Message[]
  currentUser: {
    name: string
    avatar: string
  }
  title: string
  onSelectCover: (index: number) => void
  onClearCover: () => void
  onCustomCoverChange: (file: File) => void
  onSendMessage: (message: string) => void
}

export default function MediaPreviewSidebar({
  currentMedia,
  currentIndex,
  enableVideoEdit,
  showComments,
  videoThumbnails,
  selectedCoverIndex,
  customCover,
  isGeneratingThumbs,
  messages,
  currentUser,
  title,
  onSelectCover,
  onClearCover,
  onCustomCoverChange,
  onSendMessage,
}: MediaPreviewSidebarProps) {
  const [newComment, setNewComment] = useState("")

  const formatFileSize = (bytes: number): string => {
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const formatTimeAgo = (date: Date): string => {
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - new Date(date).getTime()) / 1000)

    if (diffInSeconds < 60) return `${diffInSeconds}s ago`
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
    return `${Math.floor(diffInSeconds / 86400)}d ago`
  }

  const handleCustomCoverChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      onCustomCoverChange(file)
    }
  }

  const sendComment = () => {
    if (newComment.trim()) {
      onSendMessage(newComment.trim())
      setNewComment("")
    }
  }

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault()
      sendComment()
    }
  }

  const handleThumbnailClick = (e: React.MouseEvent, index: number) => {
    e.stopPropagation() // Prevent event from bubbling up
    onSelectCover(index)
  }

  const handleClearCover = (e: React.MouseEvent) => {
    e.stopPropagation() // Prevent event from bubbling up
    onClearCover()
  }

  return (
    <div className="w-100 md:w-80 bg-white/95 dark:bg-card/95 backdrop-blur-sm border-l border-white/20 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center justify-between">
          <h3 className="text-sm md:text-base text-foreground dark:text-white">{title}</h3>
          {!showComments && <div className="text-sm text-muted-foreground dark:text-gray-400">{currentIndex + 1} of 1</div>}
        </div>
      </div>

      {/* Main Content Container */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          {/* File Information */}
          {!showComments && (
            <div className="p-4 border-b border-white/10">
              <h4 className="font-medium text-foreground dark:text-white mb-3 text-xs md:text-sm">File Information</h4>
              <div className="space-y-2 text-[11px] md:text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground dark:text-gray-400">Name:</span>
                  <span className="text-foreground dark:text-white font-medium truncate ml-2">{currentMedia?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground dark:text-gray-400">Type:</span>
                  <span className="text-foreground dark:text-white flex items-center space-x-1">
                    {currentMedia?.type === "image" ? <ImageIcon className="w-4 h-4" /> : <Video className="w-4 h-4" />}
                    <span>{currentMedia?.type}</span>
                  </span>
                </div>
                {currentMedia?.size && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground dark:text-gray-400">Size:</span>
                    <span className="text-foreground dark:text-white">{formatFileSize(currentMedia.size)}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Video Cover Selection */}
          {enableVideoEdit && currentMedia?.type === "video" && (
            <div className="p-4 border-b border-white/10">
              <h4 className="font-medium text-foreground dark:text-white mb-3">Cover Photo</h4>
              <p className="text-sm text-muted-foreground dark:text-gray-400 mb-3">
                Select a thumbnail to use as the cover photo
              </p>

              {/* Thumbnails Grid */}
              {!isGeneratingThumbs ? (
                <div className="grid grid-cols-3 gap-2 mb-3">
                  {videoThumbnails.map((thumb, i) => (
                    <button
                      key={i}
                      type="button"
                      className={`relative aspect-video rounded border-2 overflow-hidden transition-all duration-200 hover:scale-105 cursor-pointer ${
                        i === selectedCoverIndex && !customCover
                          ? "border-primary-500 ring-1 ring-primary-500/20"
                          : "border-border dark:border-border hover:border-primary-300"
                      }`}
                      onClick={(e) => handleThumbnailClick(e, i)}
                    >
                      <img
                        src={thumb || "/placeholder.svg"}
                        className="w-full h-full object-cover"
                        alt={`Thumbnail ${i + 1}`}
                      />
                      {i === selectedCoverIndex && !customCover && (
                        <div className="absolute top-1 right-1 bg-primary-500 text-white rounded-full p-1">
                          <Check className="w-3 h-3" />
                        </div>
                      )}
                    </button>
                  ))}

                  {/* Custom Cover Display */}
                  {customCover && (
                    <button
                      type="button"
                      className="relative aspect-video rounded border-2 border-primary-500 ring-1 ring-primary-500/20 overflow-hidden cursor-pointer"
                      onClick={handleClearCover}
                    >
                      <img
                        src={customCover || "/placeholder.svg"}
                        className="w-full h-full object-cover"
                        alt="Custom cover"
                      />
                      <div className="absolute top-1 right-1 bg-primary-500 text-white rounded-full p-1">
                        <Check className="w-3 h-3" />
                      </div>
                      <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                        <X className="w-4 h-4 text-white" />
                      </div>
                    </button>
                  )}
                </div>
              ) : (
                /* Loading State */
                <div className="grid grid-cols-3 gap-2 mb-3">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="aspect-video bg-muted animate-pulse rounded"></div>
                  ))}
                </div>
              )}

              {/* Cover Actions */}
              <div className="flex items-center justify-between">
                {selectedCoverIndex !== null || customCover ? (
                  <button
                    type="button"
                    className="text-sm text-muted-foreground hover:text-foreground dark:text-gray-400 dark:hover:text-gray-200 transition-colors cursor-pointer"
                    onClick={handleClearCover}
                  >
                    Clear cover
                  </button>
                ) : (
                  <div></div>
                )}

                <label className="text-sm text-primary-500 hover:text-primary-600 cursor-pointer transition-colors">
                  Upload custom
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={handleCustomCoverChange}
                  />
                </label>
              </div>
            </div>
          )}

          {/* Comments Section */}
          {showComments && (
            <div className="p-4 space-y-4">
              {messages.map((message, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <img
                    src={message.user.avatar || "/placeholder.svg"}
                    className="w-8 h-8 rounded-full flex-shrink-0 object-cover"
                    alt={message.user.name}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="bg-muted rounded-lg p-3">
                      <p className="font-medium text-sm text-foreground dark:text-white">{message.user.name}</p>
                      <p className="text-sm text-foreground dark:text-muted-foreground mt-1">{message.text}</p>
                    </div>
                    <div className="flex items-center mt-2 space-x-4 text-xs text-muted-foreground dark:text-gray-400">
                      <span>{formatTimeAgo(message.timestamp)}</span>
                      <button type="button" className="hover:text-foreground dark:hover:text-muted-foreground">
                        Reply
                      </button>
                      <button type="button" className="hover:text-foreground dark:hover:text-muted-foreground">
                        Like
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Fixed Comment Input (only shown when showComments is true) */}
        {showComments && (
          <div className="sticky bottom-4 md:bottom-0 p-4 border-t border-white/10 bg-white/95 dark:bg-card/95 backdrop-blur-sm">
            <div className="flex items-center space-x-3">
              <img
                src={currentUser.avatar || "/placeholder.svg"}
                className="w-8 h-8 rounded-full flex-shrink-0"
                alt={currentUser.name}
              />
              <Input
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Add a comment..."
                className="flex-1 bg-muted rounded-full py-2 px-4 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
              <Button
                className="text-primary-500 hover:text-primary-600 font-medium text-sm disabled:opacity-50 transition-colors"
                variant="ghost"
                disabled={!newComment.trim()}
                onClick={sendComment}
              >
                Post
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}