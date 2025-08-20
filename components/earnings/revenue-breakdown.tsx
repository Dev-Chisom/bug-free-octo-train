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
  primary: "bg-primary",
  secondary: "bg-secondary",
  accent: "bg-accent",
  success: "bg-green-500",
  warning: "bg-yellow-500",
  error: "bg-destructive",
}

export function RevenueBreakdown({ title, items, type }: RevenueBreakdownProps) {
  const { t } = useTranslation()

  return (
    <div>
      <h3 className="text-sm font-medium text-muted-foreground mb-4">{title}</h3>

      <div className="space-y-4">
        {items.map((item) => {
          const colorClass = colorMap[item.color] || "bg-muted-foreground"

          return (
            <div key={item.name} className="flex items-center sm:flex-col md:flex-row">
              <div className="w-full bg-muted rounded-full h-2.5">
                <div
                  className={`h-2.5 rounded-full ${colorClass}`}
                  style={{ width: `${item.percentage}%` }}
                />
              </div>

              <div className="ml-4">
                <p className="text-sm font-medium text-foreground">
                  {t(item.name)}
                </p>
              </div>

              <p className="ml-4 text-sm font-medium text-foreground">
                ${item.amount.toFixed(2)}
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
} 