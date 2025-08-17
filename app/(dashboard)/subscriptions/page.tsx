"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Icons } from "@/components/ui/icons"
import { Skeleton } from "@/components/ui/skeleton"
import { useSubscriptions, useCancelSubscription } from "@/lib/subscription/subscription-hooks"
import { useAuthStore } from "@/lib/auth/auth-store"
import { useTranslation } from "react-i18next"
import { toast } from "sonner"
import Link from "next/link"
import { useClientHydration } from "@/lib/hooks/use-client-hydration"
import { BuildLoading } from "@/components/ui/build-loading"

export default function SubscriptionsPage() {
  const { t } = useTranslation()
  const { isAuthenticatedFn } = useAuthStore()
  const isClient = useClientHydration()
  const { data: subscriptions, isLoading: loading, error } = useSubscriptions()
  const cancelMutation = useCancelSubscription()

  // Don't render anything until client-side hydration is complete
  if (!isClient) {
    return <BuildLoading />
  }

  // Check authentication only after client hydration
  if (!isAuthenticatedFn()) {
    return (
      <div className="container mx-auto max-w-6xl p-6">
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Please log in to view your subscriptions
          </h2>
          <Button onClick={() => (window.location.href = "/auth")}>Go to Login</Button>
        </div>
      </div>
    )
  }

  const activeSubscriptions = subscriptions?.filter((sub) => sub.isActive) || []
  const expiredSubscriptions = subscriptions?.filter((sub) => !sub.isActive) || []

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const handleCancelSubscription = async (id: string) => {
    cancelMutation.mutate(id, {
      onSuccess: () => {
        toast.success(t("subscriptions.cancelSuccess"))
      },
      onError: () => {
        toast.error(t("subscriptions.cancelError"))
      },
    })
  }

  if (loading) {
    return (
      <div className="container mx-auto max-w-6xl p-6">
        <div className="space-y-6">
          <Skeleton className="h-8 w-1/4" />

          <div className="space-y-4">
            <Skeleton className="h-6 w-1/5" />

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="bg-white dark:bg-gray-900">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <Skeleton className="h-16 w-16 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-5 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                      </div>
                    </div>

                    <div className="mt-4 space-y-3">
                      {[...Array(4)].map((_, j) => (
                        <div key={j} className="flex justify-between">
                          <Skeleton className="h-4 w-1/3" />
                          <Skeleton className="h-4 w-1/4" />
                        </div>
                      ))}
                    </div>

                    <div className="mt-6 flex space-x-3">
                      <Skeleton className="h-10 flex-1" />
                      <Skeleton className="h-10 w-20" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto max-w-6xl p-6">
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-red-600 mb-4">Failed to load subscriptions</h2>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-6xl p-6">
      <div>
        <h1 className="text-2xl font-bold mb-6">{t("subscriptions.title")}</h1>

        {/* Active subscriptions */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4">{t("subscriptions.activeSubscriptions")}</h2>
          {activeSubscriptions.length === 0 ? (
            <Card className="bg-white dark:bg-gray-900 rounded-lg shadow-sm">
              <CardContent className="p-8 text-center">
                <Icons.user className="h-12 w-12 mx-auto text-gray-400" />
                <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-gray-100">
                  {t("subscriptions.noActiveSubscriptions.title")}
                </h3>
                <p className="mt-1 text-gray-500 dark:text-gray-200">
                  {t("subscriptions.noActiveSubscriptions.description")}
                </p>
                <Link href="/explore">
                  <Button className="mt-4">{t("subscriptions.noActiveSubscriptions.cta")}</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {activeSubscriptions.map((subscription) => (
                <Card key={subscription.id} className="bg-white dark:bg-gray-900 rounded-lg shadow-sm overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <div className="h-16 w-16 rounded-full overflow-hidden">
                        <img
                          src={subscription.creator.profileImage || "/placeholder.png"}
                          alt={subscription.creator.displayName}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center">
                          <h3 className="text-lg font-semibold truncate">{subscription.creator.displayName}</h3>
                          {subscription.creator.isVerified && <Icons.check className="ml-1 h-4 w-4 text-primary-500" />}
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-200">@{subscription.creator.username}</p>
                      </div>
                    </div>

                    <div className="mt-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500 dark:text-gray-200">{t("subscriptions.plan")}</span>
                        <span className="font-medium">
                          {subscription.plan === "monthly" ? t("common.monthly") : t("common.yearly")}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500 dark:text-gray-200">{t("subscriptions.price")}</span>
                        <span className="font-medium">
                          ${subscription.price}/{subscription.plan === "monthly" ? t("common.month") : t("common.year")}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500 dark:text-gray-200">{t("subscriptions.nextBillingDate")}</span>
                        <span className="font-medium">{formatDate(subscription.endDate)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500 dark:text-gray-200">{t("subscriptions.autoRenew")}</span>
                        <span
                          className={
                            subscription.autoRenew
                              ? "text-green-600 dark:text-green-400"
                              : "text-red-600 dark:text-red-400"
                          }
                        >
                          {subscription.autoRenew ? t("subscriptions.enabled") : t("subscriptions.disabled")}
                        </span>
                      </div>
                    </div>

                    <div className="mt-6 flex space-x-3">
                      <Link href={`/creators/${subscription.creator.username}`} className="flex-1">
                        <Button variant="outline" className="w-full bg-transparent">
                          {t("subscriptions.viewProfile")}
                        </Button>
                      </Link>
                      {subscription.autoRenew && (
                        <Button
                          variant="outline"
                          className="text-red-600 hover:bg-red-50 hover:border-red-600 dark:text-red-400 dark:hover:bg-red-900/20 bg-transparent"
                          onClick={() => handleCancelSubscription(subscription.id)}
                          disabled={cancelMutation.isPending}
                        >
                          {cancelMutation.isPending ? (
                            <Icons.spinner className="h-4 w-4 animate-spin" />
                          ) : (
                            t("subscriptions.cancel")
                          )}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Expired subscriptions */}
        {expiredSubscriptions.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold mb-4">{t("subscriptions.expiredSubscriptions")}</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {expiredSubscriptions.map((subscription) => (
                <Card
                  key={subscription.id}
                  className="bg-white dark:bg-gray-900 rounded-lg shadow-sm overflow-hidden opacity-75"
                >
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <div className="h-16 w-16 rounded-full overflow-hidden">
                        <img
                          src={subscription.creator.profileImage || "/placeholder.png"}
                          alt={subscription.creator.displayName}
                          className="h-full w-full object-cover grayscale"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center">
                          <h3 className="text-lg font-semibold truncate">{subscription.creator.displayName}</h3>
                          {subscription.creator.isVerified && <Icons.check className="ml-1 h-4 w-4 text-primary-500" />}
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-200">@{subscription.creator.username}</p>
                      </div>
                    </div>

                    <div className="mt-4">
                      <p className="text-sm text-gray-500 dark:text-gray-200">
                        {t("subscriptions.expiredOn")} {formatDate(subscription.endDate)}
                      </p>
                    </div>

                    <div className="mt-6">
                      <Link href={`/creators/${subscription.creator.username}`}>
                        <Button className="w-full">{t("subscriptions.renewSubscription")}</Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
