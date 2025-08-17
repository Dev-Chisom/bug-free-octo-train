"use client"

import { useTranslation } from "react-i18next"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Link from "next/link"

interface Subscription {
  id: string
  userName: string
  userAvatar: string
  plan: string
  amount: string
  date: Date
}

interface RecentSubscriptionsProps {
  subscriptions: Subscription[]
}

export function RecentSubscriptions({ subscriptions }: RecentSubscriptionsProps) {
  const { t } = useTranslation()

  const formatDate = (date: Date): string => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  return (
    <Card className="bg-gray-50 dark:bg-gray-900">
      <CardHeader className="border-b border-gray-200 dark:border-gray-700">
        <CardTitle className="text-lg font-medium text-gray-900 dark:text-gray-100">
          {t("recentSubscriptions")}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
          {subscriptions.map((subscription) => (
            <li key={subscription.id} className="px-4 py-4 sm:px-6">
              <div className="flex items-center space-x-4">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={subscription.userAvatar || "/placeholder.svg"} alt={subscription.userName} />
                  <AvatarFallback>{subscription.userName.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                    {subscription.userName}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {subscription.plan} plan · ${subscription.amount}
                  </p>
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">{formatDate(subscription.date)}</div>
              </div>
            </li>
          ))}
          {subscriptions.length === 0 && (
            <li className="px-4 py-6 text-center text-gray-500 dark:text-gray-400">
              {t("analytics.no_recent_subscriptions")}
            </li>
          )}
        </ul>
        <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-4 sm:px-6">
          <Link href="/creator/subscribers" className="text-sm font-medium text-primary-600 hover:text-primary-500">
            {t("analytics.view_all_subscribers")} <span aria-hidden="true"> &rarr;</span>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
