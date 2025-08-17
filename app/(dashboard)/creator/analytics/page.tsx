"use client"

import { useState, useEffect } from "react"
import { useTranslation } from "react-i18next"
import { AnalyticsStats } from "@/components/analytics/analytics-stats"
import { ContentPerformance } from "@/components/analytics/content-performance"
import { RecentSubscriptions } from "@/components/analytics/recent-subscriptions"
import { UpcomingPayout } from "@/components/analytics/upcoming-payout"
import { toast } from "sonner"

interface StatCard {
  name: string
  value: string
  icon: string
  color: string
  trend: number
}

interface Subscription {
  id: string
  userName: string
  userAvatar: string
  plan: string
  amount: string
  date: Date
}

interface ContentPost {
  id: string
  title: string
  thumbnail: string
  likes: number
  comments: number
  views: number
  date: Date
}

interface Payout {
  amount: number
  date: Date
  subscriptionRevenue: number
  tips: number
  ppv: number
  platformFee: number
}

export default function CreatorAnalyticsPage() {
  const { t } = useTranslation()
  
  // All hooks must be called before any conditional returns
  const [isClient, setIsClient] = useState(false)
  const [stats] = useState<StatCard[]>([
    {
      name: "analytics.subscribers",
      value: "278",
      icon: "lucide:users",
      color: "primary",
      trend: 12,
    },
    {
      name: "analytics.revenue",
      value: "$1,458.90",
      icon: "lucide:dollar-sign",
      color: "success",
      trend: 8,
    },
    {
      name: "analytics.content-view",
      value: "4,239",
      icon: "lucide:eye",
      color: "secondary",
      trend: 24,
    },
    {
      name: "analytics.total-posts",
      value: "32",
      icon: "lucide:file-text",
      color: "accent",
      trend: -3,
    },
  ])

  const [subscriptions] = useState<Subscription[]>([
    {
      id: "1",
      userName: "Alex Johnson",
      userAvatar: "https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=200",
      plan: "Monthly",
      amount: "9.99",
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },
    {
      id: "2",
      userName: "Sarah Williams",
      userAvatar: "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=200",
      plan: "Yearly",
      amount: "99.99",
      date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    },
  ])

  const [recentPosts] = useState<ContentPost[]>([
    {
      id: "1",
      title: "Getting Started with Content Creation",
      thumbnail: "https://images.pexels.com/photos/3000001/pexels-photo-3000001.jpeg?auto=compress&cs=tinysrgb&w=800",
      likes: 245,
      comments: 32,
      views: 1234,
      date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    },
    {
      id: "2",
      title: "Tips for Better Engagement",
      thumbnail: "https://images.pexels.com/photos/3000002/pexels-photo-3000002.jpeg?auto=compress&cs=tinysrgb&w=800",
      likes: 189,
      comments: 24,
      views: 987,
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },
  ])

  const [nextPayout] = useState<Payout>({
    amount: 1245.67,
    date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    subscriptionRevenue: 987.45,
    tips: 156.78,
    ppv: 101.44,
    platformFee: 200.0,
  })

  // Fix hydration by ensuring client-side only rendering
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Don't render anything until client-side hydration is complete
  if (!isClient) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    )
  }

  const handleRequestEarlyPayout = () => {
    toast.success("Early payout request submitted!")
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{t("analytics.title")}</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{t("analytics.overview")}</p>
      </div>

      {/* Stats cards */}
      <div className="mb-8">
        <AnalyticsStats stats={stats} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 mb-8">
        {/* Recent subscriptions */}
        <RecentSubscriptions subscriptions={subscriptions} />

        {/* Recent content performance */}
        <ContentPerformance posts={recentPosts} />
      </div>

      {/* Upcoming payouts */}
      <UpcomingPayout payout={nextPayout} onRequestEarlyPayout={handleRequestEarlyPayout} />
    </div>
  )
}
