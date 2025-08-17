"use client"

import { useTranslation } from "react-i18next"

interface RevenueItem {
  name: string
  key: string
  amount: number
  percentage: number
  color: string
}

interface RevenueBreakdownProps {
  title: string
  items: RevenueItem[]
  type: "revenue" | "subscription"
}

const colorMap: Record<string, string> = {
  primary: "bg-primary-500",
  secondary: "bg-secondary-500",
  accent: "bg-accent-500",
  success: "bg-success-500",
  warning: "bg-warning-500",
  error: "bg-error-500",
}

export function RevenueBreakdown({ title, items, type }: RevenueBreakdownProps) {
  const { t } = useTranslation()

  return (
    <div>
      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-4">{title}</h3>

      <div className="space-y-4">
        {items.map((item) => {
          const colorClass = colorMap[item.color] || "bg-gray-500"

          return (
            <div key={item.name} className="flex items-center sm:flex-col md:flex-row">
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                <div
                  className={`h-2.5 rounded-full ${colorClass}`}
                  style={{ width: `${item.percentage}%` }}
                />
              </div>

              <div className="ml-4">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {t(item.name)}
                </p>
              </div>

              <p className="ml-4 text-sm font-medium text-gray-900 dark:text-gray-100">
                ${item.amount.toFixed(2)}
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
} 