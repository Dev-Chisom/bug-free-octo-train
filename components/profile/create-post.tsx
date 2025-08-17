"use client"

import { useTranslation } from "react-i18next"
import { Image, Video, Link, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"

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

interface CreatePostProps {
  user: UserProfile
  newPost: string
  onNewPostChange: (value: string) => void
  onCreatePost: () => void
}

export function CreatePost({ user, newPost, onNewPostChange, onCreatePost }: CreatePostProps) {
  const { t } = useTranslation()

  const getUserInitials = (name: string): string => {
    if (!name) return '?'
    const parts = name.split(' ')
    if (parts.length > 1) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
    }
    return name.substring(0, 2).toUpperCase()
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex space-x-3">
          <div className="flex-shrink-0">
            <Avatar className="h-10 w-10">
              <AvatarImage src={user.profileImage || undefined} alt="Profile" />
              <AvatarFallback className="text-lg font-medium">
                {getUserInitials(user.displayName)}
              </AvatarFallback>
            </Avatar>
          </div>

          <div className="min-w-0 flex-1">
            <Textarea
              value={newPost}
              onChange={(e) => onNewPostChange(e.target.value)}
              rows={3}
              className="resize-none border-0 focus:ring-0 focus:border-0 shadow-none"
              placeholder="Share something with your followers..."
            />

            <div className="mt-3 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm" className="p-2 text-gray-400 hover:text-gray-500 dark:text-gray-200">
                  <Image className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="sm" className="p-2 text-gray-400 hover:text-gray-500 dark:text-gray-200">
                  <Video className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="sm" className="p-2 text-gray-400 hover:text-gray-500 dark:text-gray-200">
                  <Link className="h-5 w-5" />
                </Button>
              </div>
              <Button 
                onClick={onCreatePost} 
                disabled={!newPost.trim()}
                size="sm"
              >
                <Send className="h-4 w-4 mr-2" />
                Post
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 