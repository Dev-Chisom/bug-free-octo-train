"use client"

import { useTranslation } from "react-i18next"
import { Calendar, UserPlus, UserMinus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

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

interface ProfileSidebarProps {
  user: UserProfile
  isCurrentUser: boolean
  isFollowing: boolean
  onFollow: () => void
}

export function ProfileSidebar({ user, isCurrentUser, isFollowing, onFollow }: ProfileSidebarProps) {
  const { t } = useTranslation()

  const formatDate = (date: Date | string | undefined): string => {
    if (!date) return ''
    return new Intl.DateTimeFormat('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(new Date(date))
  }

  const getSocialIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'twitter':
        return '🐦'
      case 'instagram':
        return '📷'
      case 'youtube':
        return '📺'
      case 'tiktok':
        return '🎵'
      default:
        return '🔗'
    }
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-6">
          {/* Bio */}
          <div>
            <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">About</h2>
            <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              {user.bio || 'No bio yet.'}
            </div>
          </div>

          {/* Stats */}
          <div className="border-t border-gray-200 pt-6">
            <dl className="grid grid-cols-2 gap-4">
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Posts</dt>
                <dd className="mt-1 text-xl font-semibold text-gray-900 dark:text-gray-100">
                  {user.stats?.posts || 0}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Subscribers</dt>
                <dd className="mt-1 text-xl font-semibold text-gray-900 dark:text-gray-100">
                  {user.stats?.followers || 0}
                </dd>
              </div>
            </dl>
          </div>

          {/* Social links */}
          {user.social && user.social.length > 0 && (
            <div className="border-t border-gray-200 pt-6">
              <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400">Social</h2>
              <div className="mt-4 space-y-3">
                {user.social.map((social) => (
                  <a
                    key={social.platform}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-gray-700 hover:text-primary-600 dark:text-gray-200 dark:hover:text-primary-400"
                  >
                    <span className="mr-2">{getSocialIcon(social.platform)}</span>
                    <span className="text-sm">{social.handle}</span>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Joined date */}
          <div className="border-t border-gray-200 pt-6">
            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
              <Calendar className="h-5 w-5 mr-2" />
              Joined {formatDate(user.joinedAt) || 'Unknown date'}
            </div>
          </div>

          {/* Follow button for mobile */}
          {!isCurrentUser && (
            <div className="border-t border-gray-200 pt-6">
              <Button onClick={onFollow} className="w-full">
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
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
} 