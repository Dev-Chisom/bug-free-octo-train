"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { useTranslation } from "react-i18next"
import { ProfileHeader } from "@/components/profile/profile-header"
import { ProfileSidebar } from "@/components/profile/profile-sidebar"
import { CreatePost } from "@/components/profile/create-post"
import { PostsList } from "@/components/profile/posts-list"

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

export default function UserProfilePage() {
  const { t } = useTranslation()
  const params = useParams()
  const username = params.username as string
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  // Mock data - in real app, this would come from API
  const [user] = useState<UserProfile>({
    displayName: 'John Doe',
    username: username || 'johndoe',
    profileImage: null,
    coverImage: null,
    bio: 'Digital creator and content enthusiast',
    stats: {
      posts: 42,
      followers: 1234,
    },
    social: [
      {
        platform: 'twitter',
        icon: 'twitter',
        handle: '@johndoe',
        url: 'https://twitter.com/johndoe',
      },
      {
        platform: 'instagram',
        icon: 'instagram',
        handle: '@johndoe',
        url: 'https://instagram.com/johndoe',
      },
    ],
    joinedAt: new Date('2023-01-01'),
  })

  const [posts] = useState<UserPost[]>([
    {
      id: '1',
      content: 'Just posted a new video! Check it out!',
      media: 'https://picsum.photos/800/450',
      video: null,
      createdAt: new Date(),
      likes: 42,
      isPremium: false,
      comments: [
        {
          id: '1',
          user: {
            name: 'Jane Smith',
            avatar: 'https://i.pravatar.cc/150?img=1',
          },
          content: 'Great content!',
          createdAt: new Date(),
        },
      ],
    },
    {
      id: '2',
      content: 'Premium content coming soon!',
      media: 'https://picsum.photos/800/451',
      video: null,
      createdAt: new Date(Date.now() - 86400000),
      likes: 15,
      isPremium: true,
      comments: [],
    },
  ])

  const [isFollowing, setIsFollowing] = useState(false)
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [newPost, setNewPost] = useState("")

  // Mock current user - in real app, this would come from auth store
  const currentUser = { username: 'currentuser' }
  const isCurrentUser = currentUser.username === username

  const handleFollow = () => {
    setIsFollowing(!isFollowing)
  }

  const handleCreatePost = () => {
    if (!newPost.trim()) return
    // In real app, this would create a post via API
    setNewPost("")
  }

  const handleSubscribe = () => {
    setIsSubscribed(true)
  }

  const handleTip = () => {
    // Implement tip logic
  }

  if (!isClient) {
    return (
      <div className="min-h-screen max-w-6xl mx-auto bg-gray-50 dark:bg-gray-800">
        <div className="animate-pulse">
          <div className="h-64 bg-gray-200"></div>
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex items-end space-x-5 -mt-24">
              <div className="h-32 w-32 bg-gray-200 rounded-full"></div>
              <div className="flex-1">
                <div className="h-8 bg-gray-200 rounded w-48 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-32"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen max-w-6xl mx-auto bg-gray-50 dark:bg-gray-800">
      <ProfileHeader user={user} isCurrentUser={isCurrentUser} isFollowing={isFollowing} onFollow={handleFollow} />
      
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <ProfileSidebar user={user} isCurrentUser={isCurrentUser} isFollowing={isFollowing} onFollow={handleFollow} />
          </div>

          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Create post */}
            {isCurrentUser && (
              <CreatePost 
                user={user}
                newPost={newPost}
                onNewPostChange={setNewPost}
                onCreatePost={handleCreatePost}
              />
            )}

            {/* Posts */}
            <PostsList 
              posts={posts}
              user={user}
              isSubscribed={isSubscribed}
              onSubscribe={handleSubscribe}
              onTip={handleTip}
            />
          </div>
        </div>
      </div>
    </div>
  )
} 