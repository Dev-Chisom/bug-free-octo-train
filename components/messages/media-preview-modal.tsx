"use client"

import { useState } from "react"
import { X, ChevronLeft, ChevronRight, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface Media {
  type: "image" | "video" | "voice"
  url: string
  duration?: string
}

interface Message {
  id: string
  content: string
  timestamp: Date
  isSelf: boolean
  isRead: boolean
  isDelivered: boolean
  type: "text" | "voice" | "image" | "video"
  media?: Media
  voiceDuration?: string
  voiceProgress?: number
  isPlaying?: boolean
  isEdited?: boolean
  reactions?: Array<{
    emoji: string
    count: number
    users: string[]
  }>
  replyTo?: {
    messageId: string
    senderName: string
    content: string
  }
}

interface MediaPreviewModalProps {
  isOpen: boolean
  mediaItems: Media[]
  currentIndex: number
  messages: Message[]
  currentUser: { id: string; name: string }
  onClose: () => void
  onUpdateCurrentIndex: (index: number) => void
  onSendMessage: (message: string) => void
}

export function MediaPreviewModal({
  isOpen,
  mediaItems,
  currentIndex,
  messages,
  currentUser,
  onClose,
  onUpdateCurrentIndex,
  onSendMessage,
}: MediaPreviewModalProps) {
  const [comment, setComment] = useState("")

  if (!isOpen || mediaItems.length === 0) return null

  const currentMedia = mediaItems[currentIndex]

  const handlePrevious = () => {
    if (currentIndex > 0) {
      onUpdateCurrentIndex(currentIndex - 1)
    }
  }

  const handleNext = () => {
    if (currentIndex < mediaItems.length - 1) {
      onUpdateCurrentIndex(currentIndex + 1)
    }
  }

  const handleSendComment = () => {
    if (comment.trim()) {
      onSendMessage(comment)
      setComment("")
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Media Preview</span>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="flex h-full">
          {/* Media Display */}
          <div className="flex-1 relative bg-black rounded-lg overflow-hidden">
            {currentMedia.type === "image" && (
              <img
                src={currentMedia.url}
                alt="Media preview"
                className="w-full h-full object-contain"
              />
            )}
            {currentMedia.type === "video" && (
              <video
                src={currentMedia.url}
                controls
                className="w-full h-full object-contain"
              />
            )}
            {currentMedia.type === "voice" && (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center text-white">
                  <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mb-4">
                    <svg className="w-8 h-8 text-primary-foreground" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2a3 3 0 013 3v6a3 3 0 01-6 0V5a3 3 0 013-3z" />
                      <path d="M19 10v2a7 7 0 01-14 0v-2" />
                      <line x1="12" y1="19" x2="12" y2="23" />
                      <line x1="8" y1="23" x2="16" y2="23" />
                    </svg>
                  </div>
                  <p className="text-lg font-medium">Voice Message</p>
                  <p className="text-sm text-muted-foreground">{currentMedia.duration}</p>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            {mediaItems.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white hover:bg-black/70"
                  onClick={handlePrevious}
                  disabled={currentIndex === 0}
                >
                  <ChevronLeft className="w-6 h-6" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white hover:bg-black/70"
                  onClick={handleNext}
                  disabled={currentIndex === mediaItems.length - 1}
                >
                  <ChevronRight className="w-6 h-6" />
                </Button>
              </>
            )}

            {/* Counter */}
            <div className="absolute top-4 left-4 bg-black/50 text-white px-2 py-1 rounded text-sm">
              {currentIndex + 1} / {mediaItems.length}
            </div>
          </div>

          {/* Comments Section */}
          <div className="w-80 border-l border-border flex flex-col">
            <div className="p-4 border-b border-border">
              <h3 className="font-medium text-foreground">Comments</h3>
            </div>

            {/* Comments List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 ? (
                <p className="text-muted-foreground text-center">No comments yet</p>
              ) : (
                messages.map((message) => (
                  <div key={message.id} className="flex space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-medium">
                        {message.isSelf ? "You" : message.content.charAt(0).toUpperCase()}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-foreground">
                          {message.isSelf ? "You" : "User"}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(message.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-sm text-foreground mt-1">{message.content}</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Comment Input */}
            <div className="p-4 border-t border-border">
              <div className="flex space-x-2">
                <input
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Add a comment..."
                  className="flex-1 px-3 py-2 border border-border rounded-lg bg-card text-foreground focus:ring-1 focus:ring-primary focus:border-transparent"
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      handleSendComment()
                    }
                  }}
                />
                <Button
                  onClick={handleSendComment}
                  disabled={!comment.trim()}
                  size="sm"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 