"use client"

import { useState, useEffect } from "react"
import { useTranslation } from "react-i18next"
import { EarningsStats } from "@/components/earnings/earnings-stats"
import { EarningsChart } from "@/components/earnings/earnings-chart"
import { RevenueBreakdown } from "@/components/earnings/revenue-breakdown"
import { TransactionsTable } from "@/components/earnings/transactions-table"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface StatCard {
  name: string
  key: string
  value: string
  icon: string
  color: string
  trend: number
}

interface RevenueItem {
  name: string
  key: string
  amount: number
  percentage: number
  color: string
}

interface Customer {
  name: string
  email: string
  avatar: string
}

interface Transaction {
  id: string
  date: Date
  type: "subscription" | "tip" | "ppv"
  customer: Customer
  amount: number
  status: "completed" | "pending" | "failed"
}

export default function CreatorEarningsPage() {
  const { t } = useTranslation()
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  const [chartPeriod, setChartPeriod] = useState<string>("30d")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // All hooks must be called before any conditional returns
  const [stats] = useState<StatCard[]>([
    {
      name: "earnings.stats.totalEarnings",
      key: "totalEarnings",
      value: "$12,847",
      icon: "lucide:dollar-sign",
      color: "primary",
      trend: 12,
    },
    {
      name: "earnings.stats.subscriptionRevenue",
      key: "subscriptionRevenue",
      value: "$9,458",
      icon: "lucide:users",
      color: "success",
      trend: 8,
    },
    {
      name: "earnings.stats.tipsReceived",
      key: "tipsReceived",
      value: "$2,389",
      icon: "lucide:heart",
      color: "secondary",
      trend: 24,
    },
    {
      name: "earnings.stats.ppvRevenue",
      key: "ppvRevenue",
      value: "$1,000",
      icon: "lucide:lock",
      color: "accent",
      trend: 15,
    },
  ])

  const [revenueByType] = useState<RevenueItem[]>([
    {
      name: "earnings.revenue.types.subscriptions",
      key: "subscriptions",
      amount: 9458,
      percentage: 73,
      color: "primary",
    },
    {
      name: "earnings.revenue.types.tips",
      key: "tips",
      amount: 2389,
      percentage: 19,
      color: "secondary",
    },
    {
      name: "earnings.revenue.types.ppv",
      key: "ppv",
      amount: 1000,
      percentage: 8,
      color: "accent",
    },
  ])

  const [revenueBySubscription] = useState<RevenueItem[]>([
    {
      name: "earnings.revenue.subscriptionTypes.monthly",
      key: "monthly",
      amount: 5675,
      percentage: 60,
      color: "primary",
    },
    {
      name: "earnings.revenue.subscriptionTypes.yearly",
      key: "yearly",
      amount: 3783,
      percentage: 40,
      color: "secondary",
    },
  ])

  const [transactions] = useState<Transaction[]>([
    {
      id: "1",
      date: new Date(Date.now() - 2 * 60 * 60 * 1000),
      type: "subscription",
      customer: {
        name: "John Doe",
        email: "john@example.com",
        avatar: "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=200",
      },
      amount: 9.99,
      status: "completed",
    },
    {
      id: "2",
      date: new Date(Date.now() - 5 * 60 * 60 * 1000),
      type: "tip",
      customer: {
        name: "Jane Smith",
        email: "jane@example.com",
        avatar: "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=200",
      },
      amount: 20.0,
      status: "completed",
    },
    {
      id: "3",
      date: new Date(Date.now() - 24 * 60 * 60 * 1000),
      type: "ppv",
      customer: {
        name: "Mike Johnson",
        email: "mike@example.com",
        avatar: "https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=200",
      },
      amount: 4.99,
      status: "completed",
    },
  ])

  // Periods object for chart
  const periods = {
    "7d": t("earnings.overview.periods.7d"),
    "30d": t("earnings.overview.periods.30d"),
    "90d": t("earnings.overview.periods.90d"),
    "1y": t("earnings.overview.periods.1y"),
  }

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

  const totalTransactions = transactions.length
  const totalPages = Math.ceil(totalTransactions / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = Math.min(startIndex + itemsPerPage, totalTransactions)

  const displayedPages = () => {
    const pages: number[] = []
    const maxPages = 5

    if (totalPages <= maxPages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      let start = Math.max(1, currentPage - 2)
      const end = Math.min(totalPages, start + maxPages - 1)

      if (end - start < maxPages - 1) {
        start = Math.max(1, end - maxPages + 1)
      }

      for (let i = start; i <= end; i++) {
        pages.push(i)
      }
    }

    return pages
  }

  const formatDate = (date: Date): string => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const handleDownloadCsv = () => {
    // Implement CSV download functionality

  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          {t("earnings.title")}
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {t("earnings.description")}
        </p>
      </div>

      {/* Stats cards */}
      <div className="mb-8">
        <EarningsStats stats={stats} />
      </div>

      {/* Earnings chart */}
      <div className="bg-white dark:bg-gray-900 shadow-sm rounded-lg mb-8">
        <div className="p-6">
          <div className="sm:flex sm:items-center sm:justify-between mb-6">
            <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
              {t("earnings.overview.title")}
            </h2>

            <div className="mt-3 sm:mt-0">
              <Select value={chartPeriod} onValueChange={setChartPeriod}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(periods).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <EarningsChart period={chartPeriod} />
        </div>
      </div>

      {/* Revenue breakdown */}
      <div className="bg-white dark:bg-gray-900 shadow-sm rounded-lg mb-8">
        <div className="p-6">
          <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-6">
            {t("earnings.revenue.title")}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <RevenueBreakdown
              title={t("earnings.revenue.byType")}
              items={revenueByType}
              type="revenue"
            />
            <RevenueBreakdown
              title={t("earnings.revenue.bySubscription")}
              items={revenueBySubscription}
              type="subscription"
            />
          </div>
        </div>
      </div>

      {/* Recent transactions */}
      <div className="bg-white dark:bg-gray-900 shadow-sm rounded-lg">
        <div className="p-6">
          <div className="sm:flex sm:items-center sm:justify-between mb-6">
            <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
              {t("earnings.transactions.title")}
            </h2>

            <div className="mt-3 sm:mt-0">
              <Button variant="outline" onClick={handleDownloadCsv}>
                {t("earnings.transactions.downloadCsv")}
              </Button>
            </div>
          </div>

          <TransactionsTable
            transactions={transactions.slice(startIndex, endIndex)}
            formatDate={formatDate}
          />

          {/* Pagination */}
          <div className="mt-6 flex items-center justify-between">
            <div className="flex-1 flex justify-between sm:hidden">
              <Button
                variant="outline"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
              >
                {t("earnings.transactions.pagination.previous")}
              </Button>
              <Button
                variant="outline"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
              >
                {t("earnings.transactions.pagination.next")}
              </Button>
            </div>

            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {t("earnings.transactions.pagination.showing")} <span className="font-medium">{startIndex + 1}</span>
                  {t("earnings.transactions.pagination.to")}
                  <span className="font-medium">{endIndex}</span>
                  {t("earnings.transactions.pagination.of")}
                  <span className="font-medium">{totalTransactions}</span>
                  {t("earnings.transactions.pagination.results")}
                </p>
              </div>

              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <Button
                    variant="outline"
                    size="icon"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(currentPage - 1)}
                    className="rounded-l-md"
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </Button>
                  {displayedPages().map((page) => (
                    <Button
                      key={page}
                      variant={page === currentPage ? "default" : "outline"}
                      onClick={() => setCurrentPage(page)}
                      className="rounded-none"
                    >
                      {page}
                    </Button>
                  ))}
                  <Button
                    variant="outline"
                    size="icon"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(currentPage + 1)}
                    className="rounded-r-md"
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Button>
                </nav>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 