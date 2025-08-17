"use client"

import { useState, useEffect } from "react"
import { useTranslation } from "react-i18next"
import { useRouter } from "next/navigation"
import { SubscribersStats } from "@/components/subscribers/subscribers-stats"
import { SubscribersTable } from "@/components/subscribers/subscribers-table"
import { SubscribersFilters } from "@/components/subscribers/subscribers-filters"
import { BlockSubscriberModal } from "@/components/subscribers/block-subscriber-modal"
import { toast } from "sonner"

interface Subscriber {
  id: string
  name: string
  email: string
  avatar: string
  plan: "monthly" | "yearly"
  status: "active" | "expired" | "cancelled"
  totalRevenue: number
  joinedAt: string
}

interface Stats {
  name: string
  key: string
  value: number
  trend: number
  icon: string
  color: string
}

interface Filters {
  search: string
  plan: string
  status: string
}

export default function CreatorSubscribersPage() {
  const { t } = useTranslation()
  const router = useRouter()
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  // All hooks must be called before any conditional returns
  const [stats] = useState<Stats[]>([
    {
      name: "subscribers.stats.totalSubscribers",
      key: "totalSubscribers",
      value: 1234,
      trend: 12,
      icon: "lucide:users",
      color: "primary",
    },
    {
      name: "subscribers.stats.activeSubscribers",
      key: "activeSubscribers",
      value: 890,
      trend: 8,
      icon: "lucide:user-check",
      color: "success",
    },
    {
      name: "subscribers.stats.monthlyRevenue",
      key: "monthlyRevenue",
      value: 8900,
      trend: 15,
      icon: "lucide:dollar-sign",
      color: "warning",
    },
    {
      name: "subscribers.stats.churnRate",
      key: "churnRate",
      value: 2.4,
      trend: -0.5,
      icon: "lucide:trending-down",
      color: "error",
    },
  ])

  const [filters, setFilters] = useState<Filters>({
    search: "",
    plan: "all",
    status: "all",
  })

  const [currentPage, setCurrentPage] = useState(1)
  const [showBlockModal, setShowBlockModal] = useState(false)
  const [subscriberToBlock, setSubscriberToBlock] = useState<Subscriber | null>(null)
  const [blockLoading, setBlockLoading] = useState(false)
  const [loadingMessage, setLoadingMessage] = useState(false)

  const [subscribers] = useState<Subscriber[]>([
    {
      id: "1",
      name: "John Doe",
      email: "john@example.com",
      avatar: "https://i.pravatar.cc/150?u=john@example.com",
      plan: "monthly",
      status: "active",
      totalRevenue: 99.99,
      joinedAt: "2024-01-01",
    },
    {
      id: "2",
      name: "Jane Smith",
      email: "jane@example.com",
      avatar: "https://i.pravatar.cc/150?u=jane@example.com",
      plan: "yearly",
      status: "active",
      totalRevenue: 999.99,
      joinedAt: "2024-02-01",
    },
    {
      id: "3",
      name: "Mike Johnson",
      email: "mike@example.com",
      avatar: "https://i.pravatar.cc/150?u=mike@example.com",
      plan: "monthly",
      status: "cancelled",
      totalRevenue: 49.99,
      joinedAt: "2024-03-01",
    },
  ])

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

  const filteredSubscribers = subscribers.filter((s: Subscriber) => {
    const matchesSearch =
      s.name.toLowerCase().includes(filters.search.toLowerCase()) ||
      s.email.toLowerCase().includes(filters.search.toLowerCase())
    const matchesPlan = filters.plan === "all" || s.plan === filters.plan
    const matchesStatus = filters.status === "all" || s.status === filters.status
    return matchesSearch && matchesPlan && matchesStatus
  })

  const totalSubscribers = filteredSubscribers.length
  const itemsPerPage = 10
  const totalPages = Math.ceil(totalSubscribers / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = Math.min(startIndex + itemsPerPage, totalSubscribers)

  const displayedPages = () => {
    const pages = []
    const maxPages = 5
    const halfMax = Math.floor(maxPages / 2)

    let start = Math.max(1, currentPage - halfMax)
    let end = Math.min(totalPages, start + maxPages - 1)

    if (end - start + 1 < maxPages) {
      start = Math.max(1, end - maxPages + 1)
    }

    for (let i = start; i <= end; i++) {
      pages.push(i)
    }

    return pages
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString()
  }

  const messageSubscriber = (subscriber: Subscriber) => {
    setLoadingMessage(true)
    try {
      // Navigate to messages page with subscriber info
      const messagesUrl = `/creator/messages?user=${encodeURIComponent(subscriber.name)}&userId=${subscriber.id}`
      router.push(messagesUrl)
    } catch (error) {
      toast.error(`Failed to open message with ${subscriber.name}`)
    } finally {
      setLoadingMessage(false)
    }
  }

  const confirmBlock = (subscriber: Subscriber) => {
    setSubscriberToBlock(subscriber)
    setShowBlockModal(true)
  }

  const blockSubscriber = async () => {
    if (!subscriberToBlock) return

    setBlockLoading(true)
    try {
      // Replace with your actual API call to block a subscriber
      await new Promise((resolve) => setTimeout(resolve, 1000))
      
      // Update the subscriber status in the local state
      const index = subscribers.findIndex((s) => s.id === subscriberToBlock.id)
      if (index !== -1) {
        subscribers[index].status = "cancelled"
      }

      setShowBlockModal(false)
      setSubscriberToBlock(null)
      toast.success("Subscriber blocked successfully")
    } catch (error) {
      toast.error("Failed to block subscriber")
    } finally {
      setBlockLoading(false)
    }
  }

  // Show loading skeleton while client-side hydration completes
  if (!isClient) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {t("subscribers.title")}
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {t("subscribers.manage")}
          </p>
        </div>
        <div className="animate-pulse">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white dark:bg-gray-900 rounded-lg p-5">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          {t("subscribers.title")}
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {t("subscribers.manage")}
        </p>
      </div>

      {/* Stats cards */}
      <div className="mb-6">
        <SubscribersStats stats={stats} />
      </div>

      {/* Subscribers list */}
      <div className="bg-white dark:bg-gray-900 shadow-sm rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          {/* Filters */}
          <div className="mb-6">
            <SubscribersFilters filters={filters} onFiltersChange={setFilters} />
          </div>

          {/* Table */}
          <SubscribersTable
            subscribers={filteredSubscribers.slice(startIndex, endIndex)}
            onMessage={messageSubscriber}
            onBlock={confirmBlock}
            loadingMessage={loadingMessage}
            blockLoading={blockLoading}
          />

          {/* Pagination */}
          <div className="mt-6 flex items-center justify-between">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                className="btn-outline"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
              >
                {t("subscribers.pagination.previous")}
              </button>
              <button
                className="btn-outline"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
              >
                {t("subscribers.pagination.next")}
              </button>
            </div>

            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {t("subscribers.pagination.showing")} <span className="font-medium">{startIndex + 1}</span>
                  {t("subscribers.pagination.to")}
                  <span className="font-medium">{endIndex}</span>
                  {t("subscribers.pagination.of")}
                  <span className="font-medium">{totalSubscribers}</span>
                  {t("subscribers.pagination.results")}
                </p>
              </div>

              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white dark:bg-gray-900 text-sm font-medium text-gray-500 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(currentPage - 1)}
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  {displayedPages().map((page) => (
                    <button
                      key={page}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        page === currentPage
                          ? "z-10 bg-primary-50 border-primary-500 text-primary-600"
                          : "border-gray-300 bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
                      }`}
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white dark:bg-gray-900 text-sm font-medium text-gray-500 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(currentPage + 1)}
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </nav>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Block confirmation modal */}
      <BlockSubscriberModal
        open={showBlockModal}
        onOpenChange={setShowBlockModal}
        subscriber={subscriberToBlock}
        onConfirm={blockSubscriber}
        loading={blockLoading}
      />
    </div>
  )
} 