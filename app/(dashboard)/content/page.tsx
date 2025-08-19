"use client"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Icons } from "@/components/ui/icons"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { useContent, useDeleteContent } from "@/lib/content/content-hooks"
import { useAuthStore } from "@/lib/auth/auth-store"
import { useTranslation } from "react-i18next"
import { toast } from "sonner"
import Link from "next/link"
import { useRouter } from 'next/navigation'

interface Content {
  id: string
  title: string
  body: string
  visibility: "public" | "private" | "premium"
  price?: number
  status: string
  createdAt: string
  updatedAt: string
  scheduledDate?: string
  mediaFiles?: string[]
}

export default function ContentManagementPage() {
  const { t } = useTranslation()
  const [isClient, setIsClient] = useState(false)
  const [search, setSearch] = useState("")
  const [visibilityFilter, setVisibilityFilter] = useState("all")
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [contentToDelete, setContentToDelete] = useState<Content | null>(null)
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)

  const { isAuthenticatedFn } = useAuthStore()
  const router = useRouter()

  const { data: content, isLoading: loading, error } = useContent()
  const deleteMutation = useDeleteContent()

  useEffect(() => {
    setIsClient(true)
  }, [])

  // Memoized computations - these must be called before any conditional returns
  const filteredContent = useMemo(() => {
    if (!content) return []

    let result = [...content]

    // Apply search filter
    if (search.trim()) {
      const searchTerm = search.toLowerCase().trim()
      result = result.filter(
        (item) =>
          item.title?.toLowerCase().includes(searchTerm) ||
          item.body?.toLowerCase().includes(searchTerm),
      )
    }

    // Apply visibility filter
    if (visibilityFilter !== "all") {
      result = result.filter((item) => item.visibility === visibilityFilter)
    }

    return result
  }, [content, search, visibilityFilter])

  const paginatedContent = useMemo(() => {
    const start = (page - 1) * limit
    const end = start + limit
    return filteredContent.slice(start, end)
    }, [filteredContent, page, limit])

  const pagination = useMemo(() => {
    const total = filteredContent.length
    const pages = Math.ceil(total / limit)
    return {
      total,
      pages,
      currentPage: page,
      perPage: limit,
    }
  }, [filteredContent.length, page, limit])

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

  const handleEdit = (content: Content) => {
    router.push(`/content/edit/${content.id}`)
  }

  const handleDelete = (content: Content) => {
    setContentToDelete(content)
    setShowDeleteModal(true)
  }

  const confirmDelete = async () => {
    if (!contentToDelete) return

    deleteMutation.mutate(contentToDelete.id, {
      onSuccess: () => {
        toast.success(t("notifications.contentDeleted"))
        setShowDeleteModal(false)
        setContentToDelete(null)
        // Reset to page 1 if current page becomes empty
        if (paginatedContent.length === 1 && page > 1) {
          setPage(1)
        }
      },
      onError: () => {
        toast.error(t("notifications.contentDeleteFailed"))
      },
    })
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      published: { color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200", label: "Published" },
      draft: { color: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200", label: "Draft" },
      scheduled: { color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200", label: "Scheduled" },
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    )
  }

  const getVisibilityIcon = (visibility: string) => {
    switch (visibility) {
      case "public":
        return <Icons.globe className="h-4 w-4" />
      case "subscribers":
        return <Icons.users className="h-4 w-4" />
      case "premium":
        return <Icons.dollarSign className="h-4 w-4" />
      default:
        return <Icons.globe className="h-4 w-4" />
    }
  }

  if (!isClient) {
    return (
      <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
          <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    )
  }

  if (!isAuthenticatedFn()) {
    return (
      <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Please log in to manage your content
          </h2>
          <Button onClick={() => (window.location.href = "/auth")}>Go to Login</Button>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
          <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-red-600 mb-4">
            {error.message || "Failed to load content"}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Please try again or contact support if the problem persists.
          </p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
      {/* Header Section */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 mb-6">
        <div className="flex-1 min-w-0">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground truncate">
            {t("content.management.title")}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">{t("content.management.description")}</p>
        </div>
        <div className="flex-shrink-0">
          <Link href="/content/new">
            <Button className="w-full sm:w-auto flex items-center justify-center">
              <Icons.plus className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">{t("content.management.createNew")}</span>
              <span className="sm:hidden">{t("content.management.createNew")}</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Filters Section */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder={t("content.search.placeholder") || "Search content..."}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full"
          />
        </div>
        <div className="w-full sm:w-48">
          <Select value={visibilityFilter} onValueChange={setVisibilityFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by visibility" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Visibility</SelectItem>
              <SelectItem value="public">Public</SelectItem>
              <SelectItem value="subscribers">Subscribers Only</SelectItem>
              <SelectItem value="premium">Pay-to-view</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Content Table Section */}
      <div className="mb-6">
        <Card>
          <CardContent className="p-0">
            {paginatedContent.length === 0 ? (
              <div className="text-center py-12">
                <Icons.fileText className="h-12 w-12 mx-auto text-muted-foreground" />
                <h3 className="mt-2 text-lg font-medium text-foreground">No content found</h3>
                <p className="mt-1 text-muted-foreground">
                  {search || visibilityFilter !== "all"
                    ? "Try adjusting your filters"
                    : "Get started by creating your first post"}
                </p>
                {!search && visibilityFilter === "all" && (
                  <Link href="/content/new">
                    <Button className="mt-4">Create New Content</Button>
                  </Link>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-border">
                  <thead className="bg-muted">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Content
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Visibility
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-card divide-y divide-border">
                    {paginatedContent.map((item) => (
                      <tr key={item.id} className="hover:bg-muted/50">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              {item.mediaFiles && item.mediaFiles.length > 0 ? (
                                <img
                                  className="h-10 w-10 rounded-lg object-cover"
                                  src="/placeholder.svg"
                                  alt={item.title}
                                />
                              ) : (
                                <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                                  <Icons.fileText className="h-5 w-5 text-muted-foreground" />
                                </div>
                              )}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-foreground truncate max-w-xs">
                                {item.title}
                              </div>
                              {item.body && (
                                <div className="text-sm text-muted-foreground truncate max-w-xs">
                                  {item.body}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {getVisibilityIcon(item.visibility)}
                            <span className="ml-2 text-sm text-foreground capitalize">
                              {item.visibility === "premium" ? `$${item.price}` : item.visibility}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(item.status)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                          {formatDate(item.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2">
                            <Button variant="ghost" size="sm" onClick={() => handleEdit(item)}>
                              <Icons.edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(item)}
                              className="text-destructive hover:text-destructive/80"
                            >
                              <Icons.trash className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Pagination Section */}
      {pagination.pages > 1 && (
        <div className="flex justify-center sm:justify-between items-center">
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1}>
              <Icons.chevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {page} of {pagination.pages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(Math.min(pagination.pages, page + 1))}
              disabled={page === pagination.pages}
            >
              Next
              <Icons.chevronRight className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground">Show:</span>
            <Select value={limit.toString()} onValueChange={(value) => setLimit(Number(value))}>
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Content</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              Are you sure you want to delete &quot;{contentToDelete?.title}&quot;? This action cannot be undone.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={deleteMutation.isPending}>
              {deleteMutation.isPending ? <Icons.spinner className="h-4 w-4 animate-spin mr-2" /> : null}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
