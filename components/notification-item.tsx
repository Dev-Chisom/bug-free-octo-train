"use client"

import { UserPlus, DollarSign, MessageCircle, Heart, MessageSquare, Bell } from "lucide-react"
import { cn } from "@/lib/utils"
import Image from "next/image"

type NotificationType = "subscription" | "tip" | "message" | "post_like" | "post_comment" | "other"

interface Notification {
  id: number
  type: NotificationType
  content: string
  image?: string
  isRead: boolean
  createdAt: Date | string
  link?: string
}

interface NotificationItemProps {
  notification: Notification
  onRead: () => void
}

export default function NotificationItem({ notification, onRead }: NotificationItemProps) {
  const getIcon = (type: NotificationType) => {
    switch (type) {
      case "subscription":
        return UserPlus
      case "tip":
        return DollarSign
      case "message":
        return MessageCircle
      case "post_like":
        return Heart
      case "post_comment":
        return MessageSquare
      default:
        return Bell
    }
  }

  const formatTime = (date: Date | string): string => {
    const now = new Date()
    const diff = now.getTime() - new Date(date).getTime()

    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (minutes < 60) {
      return `${minutes} minutes ago`
    } else if (hours < 24) {
      return `${hours} hours ago`
    } else if (days < 7) {
      return `${days} days ago`
    } else {
      return new Date(date).toLocaleDateString()
    }
  }

  const handleClick = () => {
    if (!notification.isRead) {
      onRead()
    }
  }

  const IconComponent = getIcon(notification.type)

  return (
    <div
      className={cn(
        "px-4 py-3 hover:bg-accent flex items-start space-x-3 cursor-pointer",
        !notification.isRead && "bg-accent",
      )}
      onClick={handleClick}
    >
      <div className="h-10 w-10 flex-shrink-0 rounded-full overflow-hidden">
        {notification.image ? (
          <Image
            src={notification.image || "/placeholder.svg"}
            alt="User"
            width={40}
            height={40}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center bg-muted text-muted-foreground">
            <IconComponent className="h-5 w-5" />
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className={cn("text-sm text-popover-foreground", !notification.isRead && "font-semibold")}>
          {notification.content}
        </p>

        <p className="text-xs text-muted-foreground mt-1">{formatTime(notification.createdAt)}</p>
      </div>

      {!notification.isRead && (
        <div className="flex-shrink-0">
          <div className="h-2 w-2 rounded-full bg-primary-500 dark:bg-primary-400" />
        </div>
      )}
    </div>
  )
}
