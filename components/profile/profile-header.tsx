"use client"

import { useTranslation } from "react-i18next"
import { UserPlus, UserMinus, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Link from "next/link"

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

interface ProfileHeaderProps {
  user: UserProfile
  isCurrentUser: boolean
  isFollowing: boolean
  onFollow: () => void
}

export function ProfileHeader({ user, isCurrentUser, isFollowing, onFollow }: ProfileHeaderProps) {
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
    <>
      {/* Cover image */}
      <div className="h-64 bg-gray-200 relative">
        {user.coverImage && (
          <img 
            src={user.coverImage} 
            alt="Cover" 
            className="w-full h-full object-cover" 
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
      </div>

      {/* Profile header */}
      <div className="relative -mt-24 mb-8">
        <div className="max-w-7xl mx-auto">
          <div className="sm:flex sm:items-end sm:space-x-5 px-6">
            <div className="flex">
              <div className="relative h-32 w-32">
                <Avatar className="h-32 w-32 ring-4 ring-white">
                  <AvatarImage src={user.profileImage || undefined} alt="Profile" />
                  <AvatarFallback className="text-4xl font-medium">
                    {getUserInitials(user.displayName)}
                  </AvatarFallback>
                </Avatar>
              </div>
            </div>

            <div className="mt-6 sm:flex-1 sm:min-w-0 sm:flex sm:items-center sm:justify-end sm:space-x-6 sm:pb-1">
              <div className="sm:hidden md:block mt-6 min-w-0 flex-1">
                <h1 className="text-2xl font-bold text-gray-800 mt-2 dark:text-gray-100 truncate">
                  {user.displayName || 'Unknown User'}
                </h1>
                <p className="text-gray-500 dark:text-gray-400">@{user.username || 'unknown'}</p>
              </div>

              <div className="mt-6 flex flex-col justify-stretch space-y-3 sm:flex-row sm:space-y-0 sm:space-x-4">
                {!isCurrentUser ? (
                  <Button onClick={onFollow} className="btn-primary">
                    {isFollowing ? (
                      <>
                        <UserMinus className="h-5 w-5 mr-2" />
                        Unsubscribe
                      </>
                    ) : (
                      <>
                        <UserPlus className="h-5 w-5 mr-2" />
                        Subscribe
                      </>
                    )}
                  </Button>
                ) : (
                  <Button asChild variant="outline">
                    <Link href="/settings">
                      <Settings className="h-5 w-5 mr-2" />
                      Edit Profile
                    </Link>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
} 