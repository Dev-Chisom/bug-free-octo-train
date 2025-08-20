"use client"

import type React from "react"
import { useTranslation } from "react-i18next"
import { Card, CardContent } from "@/components/ui/card"
import { TrendingUp, TrendingDown } from "lucide-react"

interface StatCard {
  name: string
  key: string
  value: number
  trend: number
  icon: string
  color: string
}

interface SubscribersStatsProps {
  stats: StatCard[]
}

export function SubscribersStats({ stats }: SubscribersStatsProps) {
  const { t } = useTranslation()

  const getIconComponent = (iconName: string) => {
    // Map icon names to actual components
    const iconMap: Record<string, React.ComponentType<any>> = {
      "lucide:users": ({ className }: { className?: string }) => (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
          />
        </svg>
      ),
      "lucide:user-check": ({ className }: { className?: string }) => (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      "lucide:dollar-sign": ({ className }: { className?: string }) => (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
          />
        </svg>
      ),
      "lucide:trending-down": ({ className }: { className?: string }) => (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"
          />
        </svg>
      ),
    }

    const IconComponent = iconMap[iconName]
    return IconComponent || null
  }

  const getColorClasses = (color: string, type: "bg" | "text") => {
    const colorMap: Record<string, Record<string, string>> = {
      primary: {
        bg: "bg-blue-100 dark:bg-blue-900/20",
        text: "text-blue-600 dark:text-blue-400",
      },
      success: {
        bg: "bg-green-100 dark:bg-green-900/20",
        text: "text-green-600 dark:text-green-400",
      },
      warning: {
        bg: "bg-yellow-100 dark:bg-yellow-900/20",
        text: "text-yellow-600 dark:text-yellow-400",
      },
      error: {
        bg: "bg-red-100 dark:bg-red-900/20",
        text: "text-red-600 dark:text-red-400",
      },
    }

    return colorMap[color]?.[type] || colorMap.primary[type]
  }

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => {
        const IconComponent = getIconComponent(stat.icon)
        const bgColorClass = getColorClasses(stat.color, "bg")
        const textColorClass = getColorClasses(stat.color, "text")

        return (
          <Card key={index} className="overflow-hidden shadow-sm rounded-lg">
            <CardContent className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className={`${bgColorClass} rounded-md p-3`}>
                    {IconComponent && <IconComponent className={`h-6 w-6 ${textColorClass}`} />}
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-muted-foreground truncate">
                      {t(stat.name)}
                    </dt>
                    <dd>
                      <div className="text-lg font-medium text-foreground">{stat.value}</div>
                    </dd>
                  </dl>
                </div>
              </div>
              <div className="mt-4">
                <div className="flex items-center text-sm">
                  {stat.trend >= 0 ? (
                    <TrendingUp className="flex-shrink-0 self-center h-5 w-5 text-green-500" />
                  ) : (
                    <TrendingDown className="flex-shrink-0 self-center h-5 w-5 text-red-500" />
                  )}
                  <span
                    className={
                      stat.trend >= 0 ? "text-green-700 dark:text-green-400" : "text-red-700 dark:text-red-400"
                    }
                  >
                    {Math.abs(stat.trend)}%
                  </span>
                  <span className="ml-2 text-muted-foreground">
                    {t("subscribers.stats.fromLastMonth")}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
} 