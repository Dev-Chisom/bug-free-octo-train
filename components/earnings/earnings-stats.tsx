"use client"

import { useTranslation } from "react-i18next"
import { TrendingUp, TrendingDown } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

interface StatCard {
  name: string
  key: string
  value: string
  icon: string
  color: string
  trend: number
}

interface EarningsStatsProps {
  stats: StatCard[]
}

const iconMap: Record<string, React.ComponentType<any>> = {
  "lucide:dollar-sign": () => (
    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
    </svg>
  ),
  "lucide:users": () => (
    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
    </svg>
  ),
  "lucide:heart": () => (
    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
  ),
  "lucide:lock": () => (
    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
  ),
}

const colorMap: Record<string, string> = {
  primary: "text-primary-600",
  success: "text-success-600",
  secondary: "text-secondary-600",
  accent: "text-accent-600",
  warning: "text-warning-600",
  error: "text-error-600",
}

export function EarningsStats({ stats }: EarningsStatsProps) {
  const { t } = useTranslation()

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => {
        const IconComponent = iconMap[stat.icon]
        const colorClass = colorMap[stat.color] || "text-gray-600"

        return (
          <Card key={stat.name} className="overflow-hidden">
            <CardContent className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  {IconComponent && <IconComponent className={`h-6 w-6 ${colorClass}`} aria-hidden="true" />}
                </div>

                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                      {t(stat.name)}
                    </dt>
                    <dd>
                      <div className="text-lg font-medium text-gray-900 dark:text-gray-100">{stat.value}</div>
                    </dd>
                  </dl>
                </div>
              </div>

              <div className="mt-4">
                <div className="flex items-center text-sm">
                  {stat.trend >= 0 ? (
                    <TrendingUp className="flex-shrink-0 self-center h-5 w-5 text-success-500" aria-hidden="true" />
                  ) : (
                    <TrendingDown className="flex-shrink-0 self-center h-5 w-5 text-error-500" aria-hidden="true" />
                  )}
                  <span
                    className={
                      stat.trend >= 0
                        ? "text-success-700 dark:text-success-400"
                        : "text-error-700 dark:text-error-400"
                    }
                  >
                    {Math.abs(stat.trend)}%
                  </span>
                  <span className="ml-2 text-gray-500 dark:text-gray-400">
                    {t("earnings.stats.fromLastMonth")}
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