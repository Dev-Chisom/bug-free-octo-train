"use client"

import { useTranslation } from "react-i18next"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface Payout {
  amount: number
  date: Date
  subscriptionRevenue: number
  tips: number
  ppv: number
  platformFee: number
}

interface UpcomingPayoutProps {
  payout: Payout
  onRequestEarlyPayout?: () => void
}

export function UpcomingPayout({ payout, onRequestEarlyPayout }: UpcomingPayoutProps) {
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
      <CardHeader className="border-b border-gray-200 dark:border-gray-700 flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg font-medium text-gray-900 dark:text-gray-100">{t("upcomingPayout")}</CardTitle>
        <Link href="/creator/earnings" className="text-sm text-primary-600 hover:text-primary-500 font-medium">
          {t("analytics.view_earnings_details")}
        </Link>
      </CardHeader>
      <CardContent className="px-4 py-5 sm:p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">${payout.amount.toFixed(2)}</p>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {t("analytics.next_payout_on")} {formatDate(payout.date)}
            </p>
          </div>
          <Button className="mt-4 md:mt-0" onClick={onRequestEarlyPayout}>
            {t("analytics.request_early_payout")}
          </Button>
        </div>
        <div className="mt-6">
          <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">{t("analytics.payout_breakdown")}</h4>
          <dl className="mt-2 grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                {t("analytics.subscription_revenue")}
              </dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                ${payout.subscriptionRevenue.toFixed(2)}
              </dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">{t("analytics.tips")}</dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">${payout.tips.toFixed(2)}</dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">{t("analytics.pay_per_view")}</dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">${payout.ppv.toFixed(2)}</dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">{t("analytics.platform_fee")}</dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">-${payout.platformFee.toFixed(2)}</dd>
            </div>
          </dl>
        </div>
      </CardContent>
    </Card>
  )
}
