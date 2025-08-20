"use client"

import { useRef, useEffect } from "react"
import { useTranslation } from "react-i18next"
import { ArrowLeft, MoreVertical, Send, Image, Mic, Play, Pause, Smile, Reply, Edit, Trash2, X } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface User {
  id: string
  name: string
  avatar: string
  isOnline: boolean
  lastSeen?: Date
}

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

interface Chat {
  id: string
  user: User
  lastMessage: {
    content: string
    timestamp: Date
    type: string
    isSelf: boolean
    isRead: boolean
    isDelivered: boolean
  }
  unreadCount: number
  isTyping: boolean
  messages: Message[]
}

interface MediaPreview {
  file?: File
  type: "image" | "video" | "voice"
  preview?: string
  duration?: string
}

interface ChatWindowProps {
  selectedChat: Chat | null
  setSelectedChat: (chat: Chat | null) => void
  newMessage: string
  setNewMessage: (message: string) => void
  mediaPreview: MediaPreview[]
  setMediaPreview: (media: MediaPreview[]) => void
  showChatMenu: boolean
  setShowChatMenu: (show: boolean) => void
  showReactionPicker: string | null
  setShowReactionPicker: (messageId: string | null) => void
  replyingTo: {
    messageId: string
    senderName: string
    content: string
  } | null
  setReplyingTo: (reply: {
    messageId: string
    senderName: string
    content: string
  } | null) => void
  isRecording: boolean
  setIsRecording: (recording: boolean) => void
  recordingDuration: number
  setRecordingDuration: (duration: number) => void
  recordingInterval: NodeJS.Timeout | null
  setRecordingInterval: (interval: NodeJS.Timeout | null) => void
  canSendMessage: boolean
  quickReactions: string[]
  audioRefs: React.MutableRefObject<Record<string, HTMLAudioElement>>
  formatTime: (date: Date) => string
  formatMessageContent: (content: string) => string
  handleTyping: () => void
  handleMediaUpload: (event: React.ChangeEvent<HTMLInputElement>) => void
  removeMedia: (index: number) => void
  startVoiceRecording: () => void
  stopVoiceRecording: () => void
  toggleVoicePlayback: (message: Message) => void
  updateVoiceDuration: (message: Message) => void
  updateVoiceProgress: (message: Message) => void
  onVoiceEnded: (message: Message) => void
  addReaction: (message: Message, emoji: string) => void
  toggleReaction: (message: Message, emoji: string) => void
  replyToMessage: (message: Message) => void
  cancelReply: () => void
  editMessage: (message: Message) => void
  deleteMessage: (message: Message) => void
  clearChat: () => void
  blockUser: () => void
  openMediaPreview: (media: Media, msgId: string) => void
  sendMessage: () => void
}

export function ChatWindow({
  selectedChat,
  setSelectedChat,
  newMessage,
  setNewMessage,
  mediaPreview,
  setMediaPreview,
  showChatMenu,
  setShowChatMenu,
  showReactionPicker,
  setShowReactionPicker,
  replyingTo,
  setReplyingTo,
  isRecording,
  setIsRecording,
  recordingDuration,
  setRecordingDuration,
  recordingInterval,
  setRecordingInterval,
  canSendMessage,
  quickReactions,
  audioRefs,
  formatTime,
  formatMessageContent,
  handleTyping,
  handleMediaUpload,
  removeMedia,
  startVoiceRecording,
  stopVoiceRecording,
  toggleVoicePlayback,
  updateVoiceDuration,
  updateVoiceProgress,
  onVoiceEnded,
  addReaction,
  toggleReaction,
  replyToMessage,
  cancelReply,
  editMessage,
  deleteMessage,
  clearChat,
  blockUser,
  openMediaPreview,
  sendMessage,
}: ChatWindowProps) {
  const { t } = useTranslation()
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const mediaInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight
    }
  }, [selectedChat?.messages])

  if (!selectedChat) {
    return (
      <div className="lg:col-span-3 flex-1 flex items-center justify-center bg-muted">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 text-muted-foreground">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M12 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h3 className="text-xl font-medium text-foreground mb-2">No chat selected</h3>
          <p className="text-muted-foreground">Choose a conversation to start messaging</p>
        </div>
      </div>
    )
  }

  return (
    <div className="lg:col-span-3 flex flex-col flex-1 overflow-x-hidden overflow-y-hidden">
      {/* Chat Header */}
      <div className="p-4 bg-muted border-b border-border flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center space-x-3">
          {/* Mobile back button */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden mr-2"
            onClick={() => setSelectedChat(null)}
          >
            <ArrowLeft className="w-6 h-6 text-muted-foreground" />
          </Button>
          <Avatar className="w-10 h-10">
            <AvatarImage src={selectedChat.user.avatar} alt={selectedChat.user.name} />
            <AvatarFallback>{selectedChat.user.name.split(" ").map((n) => n[0]).join("")}</AvatarFallback>
          </Avatar>
          <div>
            <h2 className="font-medium text-sm text-foreground">{selectedChat.user.name}</h2>
            <p className="text-xs text-muted-foreground">
              {selectedChat.isTyping ? (
                "Typing..."
              ) : selectedChat.user.isOnline ? (
                "Online"
              ) : (
                `Last seen ${formatTime(selectedChat.user.lastSeen || new Date())}`
              )}
            </p>
          </div>
        </div>

        <DropdownMenu open={showChatMenu} onOpenChange={setShowChatMenu}>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVertical className="w-5 h-5 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={clearChat}>Clear Chat</DropdownMenuItem>
            <DropdownMenuItem onClick={blockUser} className="text-red-600 dark:text-red-400">
              Block User
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Messages */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-x-hidden overflow-y-scroll p-4 space-y-4 bg-muted rounded-b-lg"
      >
        {selectedChat.messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.isSelf ? "justify-end" : "justify-start"}`}
          >
            <div className="max-w-[70%] group">
              {/* Reply indicator */}
              {message.replyTo && (
                <div className="mb-1 p-2 bg-muted rounded-t-lg border-l-4 border-primary">
                  <p className="text-xs text-muted-foreground">
                    Replying to {message.replyTo.senderName}
                  </p>
                  <p className="text-sm text-foreground truncate">{message.replyTo.content}</p>
                </div>
              )}

              <div
                className={`rounded-md px-4 py-2 relative ${
                  message.isSelf
                    ? "bg-primary text-primary-foreground"
                    : "bg-card text-card-foreground border border-border"
                } ${message.replyTo ? "rounded-t-none" : ""}`}
              >
                {/* Voice message */}
                {message.type === "voice" && (
                  <div className="flex items-center space-x-3 min-w-[200px]">
                    <audio
                      ref={(el) => {
                        if (el) audioRefs.current[message.id] = el
                      }}
                      src={message.media?.url}
                      preload="auto"
                      className="hidden"
                      onLoadedMetadata={() => updateVoiceDuration(message)}
                      onTimeUpdate={() => updateVoiceProgress(message)}
                      onEnded={() => onVoiceEnded(message)}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => toggleVoicePlayback(message)}
                      className={`flex-shrink-0 ${
                        message.isSelf ? "bg-white/20" : "bg-primary text-primary-foreground"
                      }`}
                    >
                      {message.isPlaying ? (
                        <Pause className="w-4 h-4" />
                      ) : (
                        <Play className="w-4 h-4" />
                      )}
                    </Button>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <div className="flex-1 h-2 bg-white/30 dark:bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-white dark:bg-primary transition-all duration-300"
                            style={{ width: `${message.voiceProgress || 0}%` }}
                          ></div>
                        </div>
                        <span className="text-xs opacity-70 min-w-[30px]">{message.voiceDuration || "0:00"}</span>
                      </div>
                      <div className="mt-1 flex space-x-0.5">
                        {Array.from({ length: 25 }).map((_, i) => (
                          <div
                            key={i}
                            className="w-0.5 bg-white/40 dark:bg-muted-foreground rounded-full"
                            style={{ height: `${Math.random() * 16 + 4}px` }}
                          ></div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Media preview */}
                {message.media && message.media.type === "image" && (
                  <div className="mb-2">
                    <img
                      src={message.media.url}
                      alt={message.content}
                      className="rounded-lg max-h-64 cursor-pointer"
                      onClick={() => openMediaPreview(message.media!, message.id)}
                    />
                  </div>
                )}
                {message.media && message.media.type === "video" && (
                  <div className="mb-2 relative">
                    <video
                      src={message.media.url}
                      className="rounded-lg max-h-64 w-full cursor-pointer"
                      onClick={() => openMediaPreview(message.media!, message.id)}
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="bg-black/50 rounded-full p-3">
                        <Play className="w-6 h-6 text-white" />
                      </div>
                    </div>
                  </div>
                )}

                {/* Text content */}
                {message.content && (
                  <div className="text-sm">
                    <span dangerouslySetInnerHTML={{ __html: formatMessageContent(message.content) }}></span>
                    {message.isEdited && <span className="text-xs opacity-60 ml-2">(edited)</span>}
                  </div>
                )}

                {/* Message reactions */}
                {message.reactions && message.reactions.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {message.reactions.map((reaction) => (
                      <Button
                        key={reaction.emoji}
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleReaction(message, reaction.emoji)}
                        className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs bg-white/20 hover:bg-white/30 transition-colors ${
                          reaction.users.includes("currentUser") ? "ring-1 ring-yellow-400" : ""
                        }`}
                      >
                        <span>{reaction.emoji}</span>
                        <span>{reaction.count}</span>
                      </Button>
                    ))}
                  </div>
                )}

                {/* Message footer */}
                <div className="flex items-center justify-end mt-1 space-x-1">
                  <span className="text-xs opacity-70">{formatTime(message.timestamp)}</span>
                  {message.isSelf && (
                    <>
                      {message.isRead ? (
                        <div className="w-3 h-3 text-primary">
                          <svg fill="currentColor" viewBox="0 0 24 24">
                            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                          </svg>
                        </div>
                      ) : (
                        <div className="w-3 h-3 opacity-70">
                          <svg fill="currentColor" viewBox="0 0 24 24">
                            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                          </svg>
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* Message actions */}
                <div className="absolute -right-12 top-0 opacity-0 group-hover:opacity-100 transition-opacity bg-card rounded-lg shadow-lg border border-border flex z-10">
                  <DropdownMenu open={showReactionPicker === message.id} onOpenChange={(open) => setShowReactionPicker(open ? message.id : null)}>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="p-1">
                        <Smile className="w-4 h-4 text-muted-foreground" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <div className="flex items-center space-x-2 p-2">
                        {quickReactions.map((emoji) => (
                          <Button
                            key={emoji}
                            variant="ghost"
                            size="sm"
                            onClick={() => addReaction(message, emoji)}
                            className="p-2 text-xl hover:scale-110 transition-transform"
                          >
                            {emoji}
                          </Button>
                        ))}
                      </div>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <Button variant="ghost" size="icon" className="p-1" onClick={() => replyToMessage(message)}>
                    <Reply className="w-4 h-4 text-muted-foreground" />
                  </Button>
                  {message.isSelf && (
                    <Button variant="ghost" size="icon" className="p-1" onClick={() => editMessage(message)}>
                      <Edit className="w-4 h-4 text-muted-foreground" />
                    </Button>
                  )}
                  <Button variant="ghost" size="icon" className="p-1 text-red-500" onClick={() => deleteMessage(message)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {selectedChat.isTyping && (
          <div className="flex items-center space-x-2 text-muted-foreground">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
              <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
              <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0.4s" }} />
            </div>
            <span className="text-sm">{selectedChat.user.name} is typing...</span>
          </div>
        )}
      </div>

      {/* Message Input */}
      <div className="p-4 bg-card border-t border-border sticky bottom-0">
        {/* Reply preview */}
        {replyingTo && (
          <div className="mb-3 p-3 bg-muted rounded-lg border-l-4 border-primary flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Replying to {replyingTo.senderName}</p>
              <p className="text-sm text-foreground truncate">{replyingTo.content}</p>
            </div>
            <Button variant="ghost" size="icon" onClick={cancelReply}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        )}

        {/* Media preview */}
        {mediaPreview.length > 0 && (
          <div className="mb-3 flex space-x-2 overflow-x-auto pb-2">
            {mediaPreview.map((media, index) => (
              <div key={index} className="relative flex-shrink-0">
                {media.type === "image" && media.preview && (
                  <img src={media.preview} className="h-20 w-20 object-cover rounded-lg" />
                )}
                {media.type === "video" && media.preview && (
                  <video src={media.preview} className="h-20 w-20 object-cover rounded-lg" />
                )}
                {media.type === "voice" && (
                  <div className="h-20 w-32 bg-primary/10 rounded-lg flex flex-col items-center justify-center">
                    <Mic className="w-6 h-6 mb-1 text-primary" />
                    <span className="text-xs text-primary">{media.duration}</span>
                  </div>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1 text-white hover:bg-red-600"
                  onClick={() => removeMedia(index)}
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            ))}
          </div>
        )}

        <form onSubmit={(e) => { e.preventDefault(); sendMessage(); }} className="flex items-end space-x-2">
          <div className="flex-1 relative">
            <input
              value={newMessage}
              onChange={(e) => { setNewMessage(e.target.value); handleTyping(); }}
              placeholder="Type a message..."
              className="w-full px-4 py-3 bg-muted text-foreground rounded-full border border-border focus:border-primary focus:outline-none pr-12"
            />
          </div>
          {/* Unified media button */}
          <div className="flex space-x-1">
            <input
              ref={mediaInputRef}
              type="file"
              accept="image/*,video/*"
              multiple
              className="hidden"
              onChange={handleMediaUpload}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => mediaInputRef.current?.click()}
            >
              <Image className="w-5 h-5" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onMouseDown={startVoiceRecording}
              onMouseUp={stopVoiceRecording}
              onMouseLeave={stopVoiceRecording}
              className={`transition-colors ${
                isRecording ? "bg-red-500 text-white animate-pulse" : ""
              }`}
            >
              <Mic className="w-5 h-5" />
            </Button>
          </div>
          <Button
            type="submit"
            disabled={!canSendMessage}
            className="px-6 py-3 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
          </Button>
        </form>

        {/* Recording indicator */}
        {isRecording && (
          <div className="mt-2 flex items-center justify-center space-x-2 text-destructive">
            <div className="w-3 h-3 bg-destructive rounded-full animate-pulse"></div>
            <span className="text-sm font-medium">Recording... Release to send</span>
            <span className="text-sm">{recordingDuration}s</span>
          </div>
        )}
      </div>
    </div>
  )
} 