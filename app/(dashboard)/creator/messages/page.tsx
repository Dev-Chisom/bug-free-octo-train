"use client"

import { useState, useEffect, useRef } from "react"
import { useTranslation } from "react-i18next"
import { ChatList } from "@/components/messages/chat-list"
import { ChatWindow } from "@/components/messages/chat-window"
import { MediaPreviewModal } from "@/components/messages/media-preview-modal"

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

export default function CreatorMessagesPage() {
  const { t } = useTranslation()
  const [isClient, setIsClient] = useState(false)

  // All hooks must be called before any conditional returns
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [mediaPreview, setMediaPreview] = useState<MediaPreview[]>([])
  const [showChatMenu, setShowChatMenu] = useState(false)
  const [showReactionPicker, setShowReactionPicker] = useState<string | null>(null)
  const [replyingTo, setReplyingTo] = useState<{
    messageId: string
    senderName: string
    content: string
  } | null>(null)
  const [isRecording, setIsRecording] = useState(false)
  const [recordingDuration, setRecordingDuration] = useState(0)
  const [recordingInterval, setRecordingInterval] = useState<NodeJS.Timeout | null>(null)
  const [newMessage, setNewMessage] = useState("")
  const [mediaModal, setMediaModal] = useState({
    isOpen: false,
    mediaItems: [] as Media[],
    currentIndex: 0,
  })

  const audioRefs = useRef<Record<string, HTMLAudioElement>>({})
  const currentUser = { id: "currentUser", name: "You" }

  // Quick reactions
  const quickReactions = ["👍", "❤️", "😂", "😮", "😢"]

  // Mock data
  const [recentChats] = useState([
    {
      id: "1",
      user: {
        id: "user1",
        name: "Jane Smith",
        avatar: "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=200",
        isOnline: true,
      },
    },
    {
      id: "2",
      user: {
        id: "user2",
        name: "Mike Johnson",
        avatar: "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=200",
        isOnline: false,
      },
    },
    {
      id: "3",
      user: {
        id: "user3",
        name: "Sarah Wilson",
        avatar: "https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=200",
        isOnline: true,
      },
    },
  ])

  const [chats] = useState<Chat[]>([
    {
      id: "1",
      user: {
        id: "user1",
        name: "Jane Smith",
        avatar: "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=200",
        isOnline: true,
      },
      lastMessage: {
        content: "Thank you for subscribing! 🎉",
        timestamp: new Date(Date.now() - 7 * 60 * 1000),
        type: "text",
        isSelf: false,
        isRead: false,
        isDelivered: true,
      },
      unreadCount: 2,
      isTyping: false,
      messages: [
        {
          id: "1",
          content: "Your latest post was amazing!",
          timestamp: new Date(Date.now() - 27 * 60 * 1000),
          isSelf: true,
          isRead: true,
          isDelivered: true,
          type: "text",
          reactions: [],
        },
        {
          id: "2",
          content: "",
          timestamp: new Date(Date.now() - 4 * 60 * 1000),
          isSelf: true,
          isRead: true,
          isDelivered: true,
          type: "voice",
          voiceDuration: "0:00",
          voiceProgress: 0,
          isPlaying: false,
          reactions: [],
        },
        {
          id: "3",
          content: "Thank you for subscribing! 🎉",
          timestamp: new Date(Date.now() - 7 * 60 * 1000),
          isSelf: false,
          isRead: false,
          isDelivered: true,
          type: "image",
          media: {
            type: "image",
            url: "https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
          },
          reactions: [
            { emoji: "❤️", count: 2, users: ["user1", "currentUser"] },
            { emoji: "👍", count: 1, users: ["user2"] },
          ],
        },
        {
          id: "4",
          content: "",
          timestamp: new Date(Date.now() - 3 * 60 * 1000),
          isSelf: true,
          isRead: false,
          isDelivered: true,
          type: "video",
          media: {
            type: "video",
            url: "https://player.vimeo.com/external/394678700.sd.mp4?s=353646b8d6a0da48b40f6a3fe0e8f09797c1f5dd&profile_id=165&oauth2_token_id=57447761",
          },
          reactions: [],
        },
        {
          id: "5",
          content: "😊😊",
          timestamp: new Date(Date.now() - 1 * 60 * 1000),
          isSelf: true,
          isRead: false,
          isDelivered: true,
          type: "text",
          reactions: [],
        },
      ],
    },
    {
      id: "2",
      user: {
        id: "user2",
        name: "Mike Johnson",
        avatar: "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=200",
        isOnline: false,
        lastSeen: new Date(Date.now() - 2 * 60 * 60 * 1000),
      },
      lastMessage: {
        content: "Voice message",
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        type: "voice",
        isSelf: false,
        isRead: true,
        isDelivered: true,
      },
      unreadCount: 0,
      isTyping: false,
      messages: [
        {
          id: "1",
          content: "",
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
          isSelf: false,
          isRead: true,
          isDelivered: true,
          type: "voice",
          voiceDuration: "0:15",
          voiceProgress: 0,
          isPlaying: false,
          reactions: [],
        },
      ],
    },
  ])

  useEffect(() => {
    setIsClient(true)
  }, [])

  // Handle URL parameters for direct messaging from subscribers
  useEffect(() => {
    if (isClient) {
      const urlParams = new URLSearchParams(window.location.search)
      const targetUser = urlParams.get('user')
      const targetUserId = urlParams.get('userId')
      
      if (targetUser && targetUserId) {
        // Find or create a chat with the target user
        const targetChat = chats.find(chat => chat.user.id === targetUserId)
        if (targetChat) {
          setSelectedChat(targetChat)
        } else {
          // Create a new chat if it doesn't exist
          const newChat: Chat = {
            id: targetUserId,
            user: {
              id: targetUserId,
              name: targetUser,
              avatar: `/placeholder.svg`,
              isOnline: false,
            },
            lastMessage: {
              content: "",
              timestamp: new Date(),
              type: "text",
              isSelf: false,
              isRead: true,
              isDelivered: true,
            },
            unreadCount: 0,
            isTyping: false,
            messages: [],
          }
          setSelectedChat(newChat)
        }
        
        // Clear the URL parameters
        const newUrl = window.location.pathname
        window.history.replaceState({}, '', newUrl)
      }
    }
  }, [isClient, chats])

  const filteredChats = chats.filter((chat) => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      chat.user.name.toLowerCase().includes(query) ||
      chat.lastMessage.content.toLowerCase().includes(query)
    )
  })

  const canSendMessage = !!newMessage.trim() || mediaPreview.length > 0

  const formatTime = (date: Date): string => {
    const now = new Date()
    const d = new Date(date)
    const diff = now.getTime() - d.getTime()
    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (minutes < 1) return t("messages.now")
    if (minutes < 60) return `${minutes}m`
    if (hours < 24) return `${hours}h`
    if (days < 7) return `${days}d`
    return d.toLocaleDateString()
  }

  const formatMessageContent = (content: string): string => {
    const urlRegex = /(https?:\/\/[^\s]+)/g
    content = content.replace(urlRegex, '<a href="$1" target="_blank" class="text-blue-500 underline">$1</a>')
    return content.replace(/\n/g, "<br>")
  }

  const getLastMessagePreview = (lastMessage: { type: string; content: string }): string => {
    if (lastMessage.type === "voice") return t("messages.voiceMessage")
    if (lastMessage.type === "image") return t("messages.photo")
    if (lastMessage.type === "video") return t("messages.video")
    return lastMessage.content
  }

  const selectChat = (chat: Chat) => {
    const found = chats.find((c) => c.id === chat.id)
    if (found) {
      setSelectedChat(found)
      found.unreadCount = 0
      found.messages.forEach((message) => {
        if (!message.isSelf) message.isRead = true
      })
    }
  }

  const handleTyping = () => {
    // Handle typing indicator
  }

  const handleMediaUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    files.forEach((file) => {
      if (file.type.startsWith("image/")) {
        const preview = URL.createObjectURL(file)
        setMediaPreview((prev) => [...prev, { file, type: "image", preview }])
      } else if (file.type.startsWith("video/")) {
        const preview = URL.createObjectURL(file)
        setMediaPreview((prev) => [...prev, { file, type: "video", preview }])
      }
    })
    event.target.value = ""
  }

  const removeMedia = (index: number) => {
    const media = mediaPreview[index]
    if (media?.preview) URL.revokeObjectURL(media.preview)
    setMediaPreview((prev) => prev.filter((_, i) => i !== index))
  }

  const startVoiceRecording = () => {
    if (isRecording) return
    setIsRecording(true)
    setRecordingDuration(0)
    const interval = setInterval(() => {
      setRecordingDuration((prev) => prev + 1)
    }, 1000)
    setRecordingInterval(interval)
  }

  const stopVoiceRecording = () => {
    if (!isRecording) return
    setIsRecording(false)
    if (recordingInterval) {
      clearInterval(recordingInterval)
      setRecordingInterval(null)
    }

    setMediaPreview((prev) => [
      ...prev,
      {
        type: "voice",
        duration: `0:${recordingDuration.toString().padStart(2, "0")}`,
      },
    ])
  }

  const toggleVoicePlayback = (message: Message) => {
    const audio = audioRefs.current[message.id]
    if (!audio) return

    if (message.isPlaying) {
      audio.pause()
      message.isPlaying = false
    } else {
      audio.play()
      message.isPlaying = true
    }
  }

  const updateVoiceDuration = (message: Message) => {
    const audio = audioRefs.current[message.id]
    if (audio && audio.duration) {
      const minutes = Math.floor(audio.duration / 60)
      const seconds = Math.floor(audio.duration % 60)
      message.voiceDuration = `${minutes}:${seconds.toString().padStart(2, "0")}`
    }
  }

  const updateVoiceProgress = (message: Message) => {
    const audio = audioRefs.current[message.id]
    if (audio && audio.duration) {
      message.voiceProgress = (audio.currentTime / audio.duration) * 100
    }
  }

  const onVoiceEnded = (message: Message) => {
    message.isPlaying = false
    message.voiceProgress = 0
  }

  const addReaction = (message: Message, emoji: string) => {
    if (!message.reactions) message.reactions = []
    const existingReaction = message.reactions.find((r) => r.emoji === emoji)

    if (existingReaction) {
      if (existingReaction.users.includes("currentUser")) {
        existingReaction.users = existingReaction.users.filter((u) => u !== "currentUser")
        existingReaction.count--
        if (existingReaction.count === 0) {
          message.reactions = message.reactions.filter((r) => r.emoji !== emoji)
        }
      } else {
        existingReaction.users.push("currentUser")
        existingReaction.count++
      }
    } else {
      message.reactions.push({ emoji, count: 1, users: ["currentUser"] })
    }
    setShowReactionPicker(null)
  }

  const toggleReaction = (message: Message, emoji: string) => {
    addReaction(message, emoji)
  }

  const replyToMessage = (message: Message) => {
    setReplyingTo({
      messageId: message.id,
      senderName: message.isSelf ? "You" : selectedChat?.user.name || "",
      content: message.content || "Media message",
    })
  }

  const cancelReply = () => {
    setReplyingTo(null)
  }

  const editMessage = (message: Message) => {
    const newContent = prompt("Edit message:", message.content)
    if (newContent !== null && newContent !== message.content) {
      message.content = newContent
      message.isEdited = true
    }
  }

  const deleteMessage = (message: Message) => {
    if (confirm("Delete this message?")) {
      const index = selectedChat?.messages.findIndex((m) => m.id === message.id)
      if (index !== -1 && index !== undefined && selectedChat) {
        selectedChat.messages.splice(index, 1)
      }
    }
  }

  const clearChat = () => {
    if (selectedChat && confirm("Clear all messages?")) {
      selectedChat.messages = []
      setShowChatMenu(false)
    }
  }

  const blockUser = () => {
    if (confirm("Block this user?")) {
      setShowChatMenu(false)
    }
  }

  const openMediaPreview = (media: Media, msgId: string) => {
    const allMedia = selectedChat?.messages
      .filter((msg) => msg.media)
      .map((msg) => ({ ...msg.media!, _msgId: msg.id })) || []
    const index = allMedia.findIndex((m) => m.url === media.url && m._msgId === msgId)

    setMediaModal({
      isOpen: true,
      mediaItems: allMedia,
      currentIndex: Math.max(0, index),
    })
  }

  const closeMediaPreview = () => {
    setMediaModal({ isOpen: false, mediaItems: [], currentIndex: 0 })
  }

  const updateMediaIndex = (index: number) => {
    setMediaModal((prev) => ({ ...prev, currentIndex: index }))
  }

  const handleNewComment = (comment: string) => {
    // Optionally handle new comment from media preview modal
  }

  const sendMessage = () => {
    if (!canSendMessage || !selectedChat) return

    const mediaUrls = mediaPreview.map((media) => ({
      type: media.type,
      url: media.preview || "",
      duration: media.duration,
    }))

    const message: Message = {
      id: `msg-${Date.now()}`,
      content: newMessage,
      timestamp: new Date(),
      isSelf: true,
      isRead: false,
      isDelivered: true,
      type: mediaUrls.length > 0 ? mediaUrls[0].type : "text",
      replyTo: replyingTo || undefined,
      reactions: [],
    }

    if (mediaUrls.length > 0) {
      message.media = mediaUrls[0]
      if (message.type === "voice") {
        message.voiceDuration = mediaUrls[0].duration
        message.voiceProgress = 0
        message.isPlaying = false
      }
    }

    selectedChat.messages.push(message)
    selectedChat.lastMessage = {
      content: newMessage || getLastMessagePreview({ type: message.type, content: "" }),
      timestamp: new Date(),
      type: message.type,
      isSelf: true,
      isRead: false,
      isDelivered: true,
    }

    // Clear inputs
    setNewMessage("")
    mediaPreview.forEach((media) => {
      if (media.preview) URL.revokeObjectURL(media.preview)
    })
    setMediaPreview([])
    setReplyingTo(null)
  }

  // Show loading skeleton while client-side hydration completes
  if (!isClient) {
    return (
      <div className="container mx-auto max-w-6xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-foreground">Messages</h2>
        </div>
        <div className="animate-pulse">
          <div className="grid grid-cols-1 lg:grid-cols-4 h-[800px] bg-card rounded-lg shadow-sm border border-border">
            <div className="lg:col-span-1 border-r border-border p-4">
              <div className="h-8 bg-muted rounded mb-4"></div>
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-muted rounded-full"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-muted rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="lg:col-span-3 bg-muted"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-6xl">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-foreground">Messages</h2>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-4 flex-1 h-[800px] bg-card rounded-lg shadow-sm border border-border">
        {/* Chat List */}
        <ChatList
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          recentChats={recentChats}
          filteredChats={filteredChats}
          selectedChat={selectedChat}
          onSelectChat={selectChat}
          formatTime={formatTime}
          getLastMessagePreview={getLastMessagePreview}
        />

        {/* Chat Window */}
        <ChatWindow
          selectedChat={selectedChat}
          setSelectedChat={setSelectedChat}
          newMessage={newMessage}
          setNewMessage={setNewMessage}
          mediaPreview={mediaPreview}
          setMediaPreview={setMediaPreview}
          showChatMenu={showChatMenu}
          setShowChatMenu={setShowChatMenu}
          showReactionPicker={showReactionPicker}
          setShowReactionPicker={setShowReactionPicker}
          replyingTo={replyingTo}
          setReplyingTo={setReplyingTo}
          isRecording={isRecording}
          setIsRecording={setIsRecording}
          recordingDuration={recordingDuration}
          setRecordingDuration={setRecordingDuration}
          recordingInterval={recordingInterval}
          setRecordingInterval={setRecordingInterval}
          canSendMessage={canSendMessage}
          quickReactions={quickReactions}
          audioRefs={audioRefs}
          formatTime={formatTime}
          formatMessageContent={formatMessageContent}
          handleTyping={handleTyping}
          handleMediaUpload={handleMediaUpload}
          removeMedia={removeMedia}
          startVoiceRecording={startVoiceRecording}
          stopVoiceRecording={stopVoiceRecording}
          toggleVoicePlayback={toggleVoicePlayback}
          updateVoiceDuration={updateVoiceDuration}
          updateVoiceProgress={updateVoiceProgress}
          onVoiceEnded={onVoiceEnded}
          addReaction={addReaction}
          toggleReaction={toggleReaction}
          replyToMessage={replyToMessage}
          cancelReply={cancelReply}
          editMessage={editMessage}
          deleteMessage={deleteMessage}
          clearChat={clearChat}
          blockUser={blockUser}
          openMediaPreview={openMediaPreview}
          sendMessage={sendMessage}
        />
      </div>

      {/* Media Preview Modal */}
      <MediaPreviewModal
        isOpen={mediaModal.isOpen}
        mediaItems={mediaModal.mediaItems}
        currentIndex={mediaModal.currentIndex}
        messages={[]}
        currentUser={currentUser}
        onClose={closeMediaPreview}
        onUpdateCurrentIndex={updateMediaIndex}
        onSendMessage={handleNewComment}
      />
    </div>
  )
} 