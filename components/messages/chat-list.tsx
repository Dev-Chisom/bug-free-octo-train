"use client"

import { Search, Mic, Image, Video, Check, CheckCheck } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface User {
  id: string
  name: string
  avatar: string
  isOnline: boolean
  lastSeen?: Date
}

interface Message {
  id: string
  content: string
  timestamp: Date
  isSelf: boolean
  isRead: boolean
  isDelivered: boolean
  type: "text" | "voice" | "image" | "video"
  media?: {
    type: "image" | "video" | "voice"
    url: string
    duration?: string
  }
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

interface ChatListProps {
  searchQuery: string
  setSearchQuery: (query: string) => void
  recentChats: Array<{
    id: string
    user: User
  }>
  filteredChats: Chat[]
  selectedChat: Chat | null
  onSelectChat: (chat: Chat) => void
  formatTime: (date: Date) => string
  getLastMessagePreview: (lastMessage: { type: string; content: string }) => string
}

export function ChatList({
  searchQuery,
  setSearchQuery,
  recentChats,
  filteredChats,
  selectedChat,
  onSelectChat,
  formatTime,
  getLastMessagePreview,
}: ChatListProps) {
  return (
    <div className="lg:col-span-1 border-r border-border">
      {/* Chat List Header */}
      <div className="p-4 border-b border-border">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search conversations..."
            className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-card text-foreground focus:ring-1 focus:ring-primary focus:border-transparent"
          />
        </div>
      </div>

      {/* Recently Active - Horizontal Scroll */}
      <div className="p-4 border-b border-border">
        <h3 className="text-sm font-normal text-muted-foreground mb-3">Recently Active</h3>
        <div className="flex space-x-3 overflow-x-auto pb-2" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
          {recentChats.map((chat) => (
            <div
              key={chat.id}
              onClick={() => {
                const fullChat = filteredChats.find((c) => c.id === chat.id)
                if (fullChat) onSelectChat(fullChat)
              }}
              className="flex-shrink-0 flex flex-col items-center space-y-1 cursor-pointer hover:opacity-80"
            >
              <div className="relative">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={chat.user.avatar} alt={chat.user.name} />
                  <AvatarFallback>{chat.user.name.split(" ").map((n) => n[0]).join("")}</AvatarFallback>
                </Avatar>
                {chat.user.isOnline && (
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 border-2 border-card rounded-full"></div>
                )}
              </div>
              <span className="text-xs text-muted-foreground max-w-[60px] truncate">
                {chat.user.name.split(" ")[0]}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        {filteredChats.map((chat) => (
          <div
            key={chat.id}
            onClick={() => onSelectChat(chat)}
            className={`p-4 hover:bg-muted cursor-pointer border-b border-border ${
              selectedChat?.id === chat.id ? "bg-primary/10" : ""
            }`}
          >
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={chat.user.avatar} alt={chat.user.name} />
                  <AvatarFallback>{chat.user.name.split(" ").map((n) => n[0]).join("")}</AvatarFallback>
                </Avatar>
                {chat.user.isOnline && (
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 border-2 border-card rounded-full"></div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-xs text-foreground truncate">{chat.user.name}</h3>
                  <span className="text-xs text-muted-foreground">{formatTime(chat.lastMessage.timestamp)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1">
                    {chat.lastMessage.type === "voice" && <Mic className="w-3 h-3 text-muted-foreground" />}
                    {chat.lastMessage.type === "image" && <Image className="w-3 h-3 text-muted-foreground" />}
                    {chat.lastMessage.type === "video" && <Video className="w-3 h-3 text-muted-foreground" />}
                    <p className="text-xs text-muted-foreground truncate">
                      {getLastMessagePreview(chat.lastMessage)}
                    </p>
                  </div>
                  <div className="flex items-center space-x-1">
                    {chat.lastMessage.isSelf && chat.lastMessage.isDelivered && (
                      <>
                        {chat.lastMessage.isRead ? (
                          <CheckCheck className="w-3 h-3 text-primary" />
                        ) : (
                          <Check className="w-3 h-3 text-muted-foreground" />
                        )}
                      </>
                    )}
                    {chat.unreadCount > 0 && (
                      <div className="bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full min-w-[20px] text-center">
                        {chat.unreadCount > 99 ? "99+" : chat.unreadCount}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
} 