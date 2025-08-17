"use client"

import { useTranslation } from "react-i18next"

interface EarningsChartProps {
  period: string
}

export function EarningsChart({ period }: EarningsChartProps) {
  const { t } = useTranslation()

  return (
    <div className="h-72 bg-gray-50 dark:bg-gray-800 rounded-lg flex items-center justify-center">
      <p className="text-gray-500 dark:text-gray-400">
        {t("earnings.overview.chartPlaceholder")}
      </p>
    </div>
  )
} 