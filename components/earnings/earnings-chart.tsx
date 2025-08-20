"use client"

import { useTranslation } from "react-i18next"

interface EarningsChartProps {
  period: string
}

export function EarningsChart({ period }: EarningsChartProps) {
  const { t } = useTranslation()

  return (
    <div className="h-72 bg-muted rounded-lg flex items-center justify-center">
      <p className="text-muted-foreground">
        {t("earnings.overview.chartPlaceholder")}
      </p>
    </div>
  )
} 