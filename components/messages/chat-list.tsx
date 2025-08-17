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
    <div className="lg:col-span-1 border-r border-gray-200 dark:border-gray-700">
      {/* Chat List Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search conversations..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Recently Active - Horizontal Scroll */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-sm font-normal text-gray-500 dark:text-gray-400 mb-3">Recently Active</h3>
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
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 border-2 border-white dark:border-gray-900 rounded-full"></div>
                )}
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400 max-w-[60px] truncate">
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
            className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer border-b border-gray-100 dark:border-gray-700 ${
              selectedChat?.id === chat.id ? "bg-blue-50 dark:bg-blue-900/20" : ""
            }`}
          >
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={chat.user.avatar} alt={chat.user.name} />
                  <AvatarFallback>{chat.user.name.split(" ").map((n) => n[0]).join("")}</AvatarFallback>
                </Avatar>
                {chat.user.isOnline && (
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 border-2 border-white dark:border-gray-900 rounded-full"></div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-xs text-gray-900 dark:text-white truncate">{chat.user.name}</h3>
                  <span className="text-xs text-gray-500 dark:text-gray-400">{formatTime(chat.lastMessage.timestamp)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1">
                    {chat.lastMessage.type === "voice" && <Mic className="w-3 h-3 text-gray-400" />}
                    {chat.lastMessage.type === "image" && <Image className="w-3 h-3 text-gray-400" />}
                    {chat.lastMessage.type === "video" && <Video className="w-3 h-3 text-gray-400" />}
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {getLastMessagePreview(chat.lastMessage)}
                    </p>
                  </div>
                  <div className="flex items-center space-x-1">
                    {chat.lastMessage.isSelf && chat.lastMessage.isDelivered && (
                      <>
                        {chat.lastMessage.isRead ? (
                          <CheckCheck className="w-3 h-3 text-blue-500" />
                        ) : (
                          <Check className="w-3 h-3 text-gray-400" />
                        )}
                      </>
                    )}
                    {chat.unreadCount > 0 && (
                      <div className="bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full min-w-[20px] text-center">
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