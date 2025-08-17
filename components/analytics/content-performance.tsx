"use client"

import { useTranslation } from "react-i18next"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Eye, Heart, MessageCircle } from "lucide-react"
import Link from "next/link"

interface ContentPost {
  id: string
  title: string
  thumbnail: string
  likes: number
  comments: number
  views: number
  date: Date
}

interface ContentPerformanceProps {
  posts: ContentPost[]
}

export function ContentPerformance({ posts }: ContentPerformanceProps) {
  const { t } = useTranslation()

  const formatDate = (date: Date): string => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M'
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K'
    }
    return num.toString()
  }

  return (
    <Card className="bg-gray-50 dark:bg-gray-900">
      <CardHeader className="border-b border-gray-200 dark:border-gray-700">
        <CardTitle className="text-lg font-medium text-gray-900 dark:text-gray-100">
          {t("contentPerformance")}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
          {posts.map((post) => (
            <li key={post.id} className="px-3 py-4 sm:px-6">
              <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
                {/* Thumbnail and Title Row */}
                <div className="flex items-center space-x-3 sm:space-x-4 flex-1 min-w-0">
                  <div className="flex-shrink-0 h-12 w-12 sm:h-16 sm:w-16">
                    <img
                      src={post.thumbnail || "/placeholder.svg"}
                      alt={post.title}
                      className="h-12 w-12 sm:h-16 sm:w-16 object-cover rounded-lg"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate pr-2">
                      {post.title}
                    </p>
                    {/* Date on mobile - positioned under title */}
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 sm:hidden">
                      {formatDate(post.date)}
                    </p>
                  </div>
                </div>
                
                {/* Metrics Row */}
                <div className="flex items-center justify-between sm:justify-start sm:space-x-4 pl-15 sm:pl-0">
                  <div className="flex items-center space-x-3 sm:space-x-4 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center">
                      <Eye className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                      <span className="hidden xs:inline">{formatNumber(post.views)}</span>
                      <span className="xs:hidden">{formatNumber(post.views)}</span>
                      <span className="hidden sm:inline ml-1">{t("views")}</span>
                    </div>
                    <div className="flex items-center">
                      <Heart className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                      <span>{formatNumber(post.likes)}</span>
                      <span className="hidden sm:inline ml-1">{t("likes")}</span>
                    </div>
                    <div className="flex items-center">
                      <MessageCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                      <span>{formatNumber(post.comments)}</span>
                      <span className="hidden sm:inline ml-1">{t("comments")}</span>
                    </div>
                  </div>
                  
                  {/* Date on desktop */}
                  <div className="hidden sm:block text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
                    {formatDate(post.date)}
                  </div>
                </div>
              </div>
            </li>
          ))}
          {posts.length === 0 && (
            <li className="px-4 py-6 text-center text-gray-500 dark:text-gray-400">
              {t("analytics.no_content_yet")}
            </li>
          )}
        </ul>
        <div className="border-t border-gray-200 dark:border-gray-700 px-3 py-4 sm:px-6">
          <Link 
            href="/content" 
            className="text-sm font-medium text-primary-600 hover:text-primary-500 inline-flex items-center"
          >
            {t("analytics.view_all_content")} 
            <span aria-hidden="true" className="ml-1">&rarr;</span>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}