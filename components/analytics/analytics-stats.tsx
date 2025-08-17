"use client"

import type React from "react"

import { useTranslation } from "react-i18next"
import { Card, CardContent } from "@/components/ui/card"
import { TrendingUp, TrendingDown } from "lucide-react"

interface StatCard {
  name: string
  value: string
  icon: string
  color: string
  trend: number
}

interface AnalyticsStatsProps {
  stats: StatCard[]
}

export function AnalyticsStats({ stats }: AnalyticsStatsProps) {
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
      "lucide:eye": ({ className }: { className?: string }) => (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
          />
        </svg>
      ),
      "lucide:file-text": ({ className }: { className?: string }) => (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
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
      secondary: {
        bg: "bg-purple-100 dark:bg-purple-900/20",
        text: "text-purple-600 dark:text-purple-400",
      },
      accent: {
        bg: "bg-orange-100 dark:bg-orange-900/20",
        text: "text-orange-600 dark:text-orange-400",
      },
    }

    return colorMap[color]?.[type] || colorMap.primary[type]
  }

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat, index) => {
        const IconComponent = getIconComponent(stat.icon)
        const bgColorClass = getColorClasses(stat.color, "bg")
        const textColorClass = getColorClasses(stat.color, "text")

        return (
          <Card key={index} className="bg-gray-50 dark:bg-gray-900">
            <CardContent className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <div className={`${bgColorClass} rounded-md p-3`}>
                  {IconComponent && <IconComponent className={`h-6 w-6 ${textColorClass}`} />}
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">{t(stat.name)}</dt>
                    <dd>
                      <div className="text-lg font-medium text-gray-900 dark:text-gray-100">{stat.value}</div>
                    </dd>
                  </dl>
                </div>
              </div>
              <div className="mt-4">
                <div className="flex items-center text-sm">
                  {stat.trend > 0 ? (
                    <TrendingUp className="flex-shrink-0 mr-1.5 h-5 w-5 text-green-500" />
                  ) : (
                    <TrendingDown className="flex-shrink-0 mr-1.5 h-5 w-5 text-red-500" />
                  )}
                  <div
                    className={stat.trend > 0 ? "text-green-700 dark:text-green-400" : "text-red-700 dark:text-red-400"}
                  >
                    {Math.abs(stat.trend)}%
                  </div>
                  <div className="ml-1 text-gray-500 dark:text-gray-400">{t("analytics.from_last_month")}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
