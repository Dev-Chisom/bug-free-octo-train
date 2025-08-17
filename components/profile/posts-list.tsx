"use client"

import { useTranslation } from "react-i18next"
import PostCard from "@/components/home/post-card"

interface SocialLink {
  platform: string
  icon: string
  handle: string
  url: string
}

interface UserStats {
  posts: number
  followers: number
}

interface UserProfile {
  displayName: string
  username: string
  profileImage: string | null
  coverImage: string | null
  bio: string
  stats: UserStats
  social: SocialLink[]
  joinedAt: Date
}

interface CommentUser {
  name: string
  avatar: string
}

interface PostComment {
  id: string
  user: CommentUser
  content: string
  createdAt: Date
}

interface UserPost {
  id: string
  content: string
  media: string | null
  video: string | null
  createdAt: Date
  likes: number
  isPremium: boolean
  comments: PostComment[]
}

interface PostsListProps {
  posts: UserPost[]
  user: UserProfile
  isSubscribed: boolean
  onSubscribe: () => void
  onTip: () => void
}

export function PostsList({ posts, user, isSubscribed, onSubscribe, onTip }: PostsListProps) {
  const { t } = useTranslation()

  if (posts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">No posts yet.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {posts.map((post) => (
        <PostCard
          key={post.id}
          post={{
            id: post.id,
            creator: {
              id: user.username, // Use username as id
              name: user.displayName || 'Unknown User',
              avatar: user.profileImage || '/placeholder.svg',
            },
            content: post.content,
            image: post.media || '', // Convert null to empty string
            createdAt: post.createdAt,
            likes: post.likes || 0,
            isPremium: post.isPremium || false,
            comments: post.comments.map((comment) => ({
              id: comment.id,
              user: {
                name: comment.user?.name || 'Anonymous',
                avatar: comment.user?.avatar || '/placeholder.svg',
              },
              content: comment.content,
              createdAt: comment.createdAt,
            })),
          }}
          isSubscribed={isSubscribed}
          onSubscribe={onSubscribe}
          onTip={onTip}
        />
      ))}
    </div>
  )
} 