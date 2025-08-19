"use client"

import type React from "react"

import { useState } from "react"
import { useTranslation } from "react-i18next"
import Image from "next/image"
import Link from "next/link"
import { Heart, MessageCircle, Send, Coins, Bookmark, MoreVertical } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { Post } from "@/types/dashboard"
import { cn } from "@/lib/utils"
import MediaPreviewModal from "./media-preview-modal"

interface PostCardProps {
  post: Post
  isSubscribed: boolean
  onSubscribe: (creatorId: string) => void
  onTip: (post: Post) => void
  onAddComment?: (postId: string, comment: string) => void
}

interface MediaItem {
  url: string
  type: "image" | "video"
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

export default function PostCard({ post, isSubscribed, onSubscribe, onTip, onAddComment }: PostCardProps) {
  const { t } = useTranslation()
  const [isLiked, setIsLiked] = useState(false)
  const [likesCount, setLikesCount] = useState(post.likes)
  const [showModal, setShowModal] = useState(false)
  const [quickComment, setQuickComment] = useState("")
  const [localComments, setLocalComments] = useState<string[]>([])
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0)

  // Mock current user - replace with actual user data
  const currentUser = {
    name: "YourUsername",
    avatar: "https://randomuser.me/api/portraits/men/1.jpg",
  }

  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat("en-US").format(num)
  }

  const formatTimeAgo = (date: Date): string => {
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - new Date(date).getTime()) / 1000)

    if (diffInSeconds < 60) {
      return t("secondsAgo", { count: diffInSeconds }) || `${diffInSeconds}s ago`
    }
    if (diffInSeconds < 3600) {
      return t("minutesAgo", { count: Math.floor(diffInSeconds / 60) }) || `${Math.floor(diffInSeconds / 60)}m ago`
    }
    if (diffInSeconds < 86400) {
      return t("hoursAgo", { count: Math.floor(diffInSeconds / 3600) }) || `${Math.floor(diffInSeconds / 3600)}h ago`
    }
    return t("daysAgo", { count: Math.floor(diffInSeconds / 86400) }) || `${Math.floor(diffInSeconds / 86400)}d ago`
  }

  const handleLike = () => {
    if (post.isPremium && !isSubscribed) {
      onSubscribe(post.creator.id)
      return
    }
    setIsLiked(!isLiked)
    setLikesCount((prev) => (isLiked ? prev - 1 : prev + 1))
  }

  const handleComment = () => {
    if (post.isPremium && !isSubscribed) {
      onSubscribe(post.creator.id)
      return
    }
    openModal(0, true)
  }

  const handleShare = () => {
    if (post.isPremium && !isSubscribed) {
      onSubscribe(post.creator.id)
      return
    }
    // Implement share functionality
  }

  const handleTip = () => {
    if (post.isPremium && !isSubscribed) {
      onSubscribe(post.creator.id)
      return
    }
    onTip(post)
  }

  const handleBookmark = () => {
    if (post.isPremium && !isSubscribed) {
      onSubscribe(post.creator.id)
      return
    }
    // Implement bookmark functionality
  }

  const openModal = (index = 0, withComments = false) => {
    if (post.isPremium && !isSubscribed) {
      onSubscribe(post.creator.id)
      return
    }
    setCurrentMediaIndex(index)
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
  }

  const addComment = () => {
    if (!quickComment.trim()) return

    setLocalComments((prev) => [...prev, quickComment])
    onAddComment?.(post.id, quickComment)
    setQuickComment("")
  }

  const handleNewComment = (comment: string) => {
    setLocalComments((prev) => [...prev, comment])
    onAddComment?.(post.id, comment)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      addComment()
    }
  }

  // Format media items for the modal
  const mediaItemsForModal: MediaItem[] = [
    {
      url: post.image || "",
      type: "image",
    },
  ]

  // Combine post comments and local comments for modal
  const allCommentsForModal: Message[] = [
    // Caption as first message
    {
      text: post.content,
      timestamp: post.createdAt,
      user: {
        name: post.creator.name,
        avatar: post.creator.avatar,
      },
      isCurrentUser: false,
    },
    // Post comments
    ...post.comments.map((comment: any) => ({
      text: comment.content,
      timestamp: comment.createdAt,
      user: {
        name: comment.user.name,
        avatar: comment.user.avatar,
      },
      isCurrentUser: false,
    })),
    // Local comments
    ...localComments.map((comment) => ({
      text: comment,
      timestamp: new Date(),
      user: {
        name: currentUser.name,
        avatar: currentUser.avatar,
      },
      isCurrentUser: true,
    })),
  ]

  return (
    <>
      <div className="bg-card rounded-xl shadow-md border border-border mb-8 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center">
            <Link href="/@user" className="flex-shrink-0">
              <Image
                src={post.creator.avatar || "/placeholder.svg"}
                alt={post.creator.name}
                width={32}
                height={32}
                className="w-8 h-8 rounded-full object-cover border border-border"
              />
            </Link>

            <div className="ml-3">
              <Link href="/@user">
                <h3 className="font-semibold text-sm text-foreground hover:underline">
                  {post.creator.name}
                </h3>
              </Link>
              <p className="text-xs text-muted-foreground">
                {(post as any).location || t("unknownLocation") || "Unknown location"}
              </p>
            </div>
          </div>

          <button className="text-muted-foreground">
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>

        {/* Media Content */}
        <div className="relative aspect-video w-full bg-muted overflow-hidden">
          {post.isPremium && !isSubscribed ? (
            <>
              <div className="absolute inset-0 z-10 flex flex-col justify-center items-center bg-background/70">
                <Button
                  onClick={() => onSubscribe(post.creator.id)}
                  className="max-w-md rounded-full bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-semibold py-4 px-6 text-lg transition-all"
                >
                  {t("subscribe") || "Subscribe"}
                </Button>
              </div>

              <div className="absolute inset-0 w-full h-full filter blur-sm pointer-events-none select-none">
                <Image src={post.image || "/placeholder.svg"} alt="Post content" fill className="object-cover" />
              </div>
            </>
          ) : (
            <div className="absolute inset-0 w-full h-full cursor-pointer" onClick={() => openModal(0)}>
              <Image src={post.image || "/placeholder.svg"} alt="Post content" fill className="object-cover" />
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-4">
              <button
                disabled={post.isPremium && !isSubscribed}
                className={cn(
                  post.isPremium && !isSubscribed ? "opacity-50 cursor-not-allowed" : "",
                  "text-foreground",
                )}
                onClick={handleLike}
                title={isLiked ? t("home.unlike") || "Unlike" : t("home.like") || "Like"}
              >
                <Heart className={cn("w-6 h-6", isLiked && "fill-red-500 text-red-500")} />
              </button>

              <button
                disabled={post.isPremium && !isSubscribed}
                className={cn(
                  post.isPremium && !isSubscribed ? "opacity-50 cursor-not-allowed" : "",
                  "text-foreground",
                )}
                onClick={handleComment}
                title={t("home.comment") || "Comment"}
              >
                <MessageCircle className="w-6 h-6" />
              </button>

              <button
                disabled={post.isPremium && !isSubscribed}
                className={cn(
                  post.isPremium && !isSubscribed ? "opacity-50 cursor-not-allowed" : "",
                  "text-foreground",
                )}
                onClick={handleShare}
                title={t("home.share") || "Share"}
              >
                <Send className="w-6 h-6" />
              </button>

              <button
                disabled={post.isPremium && !isSubscribed}
                className={cn(
                  post.isPremium && !isSubscribed ? "opacity-50 cursor-not-allowed" : "",
                  "text-foreground",
                )}
                onClick={handleTip}
                title={t("home.tipCreator") || "Tip Creator"}
              >
                <Coins className="w-6 h-6" />
              </button>
            </div>

            <button
              disabled={post.isPremium && !isSubscribed}
              className={cn(
                post.isPremium && !isSubscribed ? "opacity-50 cursor-not-allowed" : "",
                "text-foreground",
              )}
              onClick={handleBookmark}
              title={t("home.save") || "Save"}
            >
              <Bookmark className="w-6 h-6" />
            </button>
          </div>

          <p className="text-sm font-semibold text-foreground mb-1">
            {formatNumber(likesCount)} {t("likes") || "likes"}
          </p>

          <p className="text-sm text-foreground mb-1">
            <span className="font-semibold">{post.creator.name}</span> {post.content}
          </p>

          {(post.comments.length > 0 || localComments.length > 0) && !(post.isPremium && !isSubscribed) && (
            <button className="text-sm text-muted-foreground mb-1" onClick={() => openModal(0, true)}>
              {t("viewAllComments", { count: post.comments.length + localComments.length }) ||
                `View all ${post.comments.length + localComments.length} comments`}
            </button>
          )}

          {!(post.isPremium && !isSubscribed) && (
            <div>
              {localComments.map((comment, index) => (
                <div key={`local-${index}`} className="mb-1">
                                  <p className="text-sm text-foreground">
                  <span className="font-semibold">{currentUser.name}</span> {comment}
                </p>
                </div>
              ))}
            </div>
          )}

          <p className="text-xs text-muted-foreground uppercase mt-2">{formatTimeAgo(post.createdAt)}</p>
        </div>

        {/* Comment Input */}
        {!(post.isPremium && !isSubscribed) && (
          <div className="px-4 py-3 border-t border-border flex items-center">
            <Input
              value={quickComment}
              onChange={(e) => setQuickComment(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={t("addAComment") || "Add a comment..."}
              className="flex-1 bg-transparent border-none text-sm text-foreground placeholder-muted-foreground focus:ring-0 p-0"
            />
            <button
              className="text-primary-600 dark:text-primary-400 font-semibold text-sm disabled:opacity-50 ml-2"
              disabled={!quickComment.trim()}
              onClick={addComment}
            >
              {t("post") || "Post"}
            </button>
          </div>
        )}
      </div>

      {/* Media Preview Modal */}
      <MediaPreviewModal
        isOpen={showModal}
        mediaItems={mediaItemsForModal}
        title="Comments"
        currentIndex={currentMediaIndex}
        showSidebar={true}
        messages={allCommentsForModal}
        currentUser={currentUser}
        onClose={closeModal}
        onUpdateCurrentIndex={setCurrentMediaIndex}
        onSendMessage={handleNewComment}
      />
    </>
  )
}
