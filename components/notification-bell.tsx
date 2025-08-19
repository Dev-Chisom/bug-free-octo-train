"use client"

import { useState, useRef, useEffect } from "react"
import { Bell, BellOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import NotificationItem from "@/components/notification-item"

type NotificationType = "subscription" | "tip" | "message" | "post_like" | "post_comment" | "other"

interface Notification {
  id: number
  type: NotificationType
  content: string
  isRead: boolean
  createdAt: Date
  image?: string
}

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: 1,
      type: "subscription",
      content: "John Doe subscribed to your profile",
      isRead: false,
      createdAt: new Date(Date.now() - 30 * 60 * 1000),
      image: "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=200",
    },
    {
      id: 2,
      type: "tip",
      content: "You received a $10 tip from Jane Smith",
      isRead: false,
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      image: "https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=200",
    },
    {
      id: 3,
      type: "post_like",
      content: "Your post received 10 new likes",
      isRead: true,
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
      image: "",
    },
  ])

  const notificationRef = useRef<HTMLDivElement>(null)

  const unreadCount = notifications.filter((notification) => !notification.isRead).length

  const markAsRead = (id: number) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)))
  }

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
  }

  const showContent = () => {
    setIsOpen(!isOpen)
  }

  useEffect(() => {
    const closeDropdown = (e: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("click", closeDropdown)
    return () => document.removeEventListener("click", closeDropdown)
  }, [])

  return (
    <div ref={notificationRef} className="relative">
      <Button
        variant="ghost"
        size="sm"
        className="p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-accent relative"
        onClick={showContent}
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 block h-4 w-4 rounded-full bg-red-500 text-white text-xs flex items-center justify-center transform -translate-y-1/4 translate-x-1/4">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </Button>

      {isOpen && (
        <div className="origin-top-right absolute right-0 mt-2 w-80 rounded-md shadow-lg bg-popover ring-1 ring-border z-50">
          <div className="px-4 py-3 border-b border-border flex items-center justify-between">
            <h3 className="text-sm font-semibold text-popover-foreground">Notifications</h3>
            {notifications.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300"
                onClick={markAllAsRead}
              >
                Mark all as read
              </Button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="py-6 text-center">
                <BellOff className="mx-auto h-8 w-8 text-gray-400 dark:text-gray-500" />
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">No notifications</p>
              </div>
            ) : (
              <div>
                {notifications.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onRead={() => markAsRead(notification.id)}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="px-4 py-2 border-t border-gray-100 dark:border-gray-700 text-center">
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300"
              onClick={() => setIsOpen(false)}
            >
              View all
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
