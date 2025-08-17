"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useAuthStore } from "../auth/auth-store"
import { createApiService } from "../api.service"
import { useTranslation } from "react-i18next"
import { toast } from "sonner"

interface Creator {
  displayName: string
  username: string
  profileImage: string
  isVerified: boolean
}

interface Subscription {
  id: string
  isActive: boolean
  plan: "monthly" | "yearly"
  price: number
  endDate: string
  autoRenew: boolean
  creator: Creator
}

// Subscription query keys
export const subscriptionKeys = {
  all: ["subscriptions"] as const,
  user: ["subscriptions", "user"] as const,
  creator: (creatorId: string) => ["subscriptions", "creator", creatorId] as const,
}

// Mock data
const mockSubscriptions: Subscription[] = [
  {
    id: "1",
    isActive: true,
    plan: "monthly",
    price: 9.99,
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    autoRenew: true,
    creator: {
      displayName: "Alice Smith",
      username: "alicesmith",
      profileImage: "https://randomuser.me/api/portraits/women/1.jpg",
      isVerified: true,
    },
  },
  {
    id: "2",
    isActive: true,
    plan: "yearly",
    price: 99.99,
    endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    autoRenew: false,
    creator: {
      displayName: "Bob Johnson",
      username: "bobjohnson",
      profileImage: "https://randomuser.me/api/portraits/men/2.jpg",
      isVerified: false,
    },
  },
  {
    id: "3",
    isActive: true,
    plan: "monthly",
    price: 9.99,
    endDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
    autoRenew: true,
    creator: {
      displayName: "Carol Lee",
      username: "carollee",
      profileImage: "https://randomuser.me/api/portraits/women/3.jpg",
      isVerified: true,
    },
  },
  {
    id: "4",
    isActive: false,
    plan: "monthly",
    price: 9.99,
    endDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    autoRenew: false,
    creator: {
      displayName: "David Kim",
      username: "davidkim",
      profileImage: "https://randomuser.me/api/portraits/men/4.jpg",
      isVerified: false,
    },
  },
  {
    id: "5",
    isActive: false,
    plan: "yearly",
    price: 99.99,
    endDate: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString(),
    autoRenew: false,
    creator: {
      displayName: "Eva Green",
      username: "evagreen",
      profileImage: "https://randomuser.me/api/portraits/women/5.jpg",
      isVerified: true,
    },
  },
]

// Mock API delay function
const mockApiDelay = (ms = 1000) => new Promise((resolve) => setTimeout(resolve, ms))

// Create API service instance with auth
function getApiService() {
  const { accessToken, refreshToken, setAuth, clearAuth } = useAuthStore.getState()

  return createApiService(
    accessToken || undefined,
    refreshToken || undefined,
    (newToken) => {
      if (refreshToken) {
        setAuth(newToken, refreshToken)
      }
    },
    () => {
      clearAuth()
    },
  )
}

// Get user subscriptions (mocked)
export function useSubscriptions() {
  const { isAuthenticated } = useAuthStore()

  return useQuery({
    queryKey: subscriptionKeys.user,
    queryFn: async (): Promise<Subscription[]> => {
      await mockApiDelay(800) // Simulate API delay
      return mockSubscriptions
    },
    enabled: isAuthenticated && typeof window !== "undefined",
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false, // Don't retry for mock data
  })
}

// Cancel subscription mutation (mocked)
export function useCancelSubscription() {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: async (subscriptionId: string) => {
      await mockApiDelay(1000) // Simulate API delay

      // Find and update the subscription in mock data
      const subscription = mockSubscriptions.find((sub) => sub.id === subscriptionId)
      if (subscription) {
        subscription.autoRenew = false
      }

      return {
        success: true,
        subscriptionId,
        message: "Subscription cancelled successfully",
      }
    },
    onSuccess: (response, subscriptionId) => {
      // Invalidate queries to trigger refetch
      queryClient.invalidateQueries({ queryKey: subscriptionKeys.all })
      toast.success(t("subscriptions.cancelSuccess"))
    },
    onError: (error: any) => {
      const message = error?.message || t("subscriptions.cancelError")
      toast.error(message)
      console.error("Cancel subscription error:", error)
    },
  })
}

// Subscribe to creator mutation (mocked)
export function useSubscribeToCreator() {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: async (data: { creatorId: string; plan: "monthly" | "yearly" }) => {
      await mockApiDelay(1500)

      // Simulate subscription creation
      const newSubscription: Subscription = {
        id: `sub_${Date.now()}`,
        isActive: true,
        plan: data.plan,
        price: data.plan === "monthly" ? 9.99 : 99.99,
        endDate: new Date(Date.now() + (data.plan === "monthly" ? 30 : 365) * 24 * 60 * 60 * 1000).toISOString(),
        autoRenew: true,
        creator: {
          displayName: "New Creator",
          username: "newcreator",
          profileImage: "https://randomuser.me/api/portraits/women/10.jpg",
          isVerified: false,
        },
      }

      mockSubscriptions.push(newSubscription)

      return {
        success: true,
        subscription: newSubscription,
        message: "Successfully subscribed to creator",
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: subscriptionKeys.all })
      toast.success(t("subscriptions.subscribeSuccess"))
    },
    onError: (error: any) => {
      const message = error?.message || t("subscriptions.subscribeError")
      toast.error(message)
      console.error("Subscribe error:", error)
    },
  })
}

// Renew subscription mutation (mocked)
export function useRenewSubscription() {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: async (subscriptionId: string) => {
      await mockApiDelay(1200)

      // Find and update the subscription in mock data
      const subscription = mockSubscriptions.find((sub) => sub.id === subscriptionId)
      if (subscription) {
        subscription.isActive = true
        subscription.autoRenew = true
        subscription.endDate = new Date(
          Date.now() + (subscription.plan === "monthly" ? 30 : 365) * 24 * 60 * 60 * 1000,
        ).toISOString()
      }

      return {
        success: true,
        subscriptionId,
        message: "Subscription renewed successfully",
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: subscriptionKeys.all })
      toast.success(t("subscriptions.renewSuccess"))
    },
    onError: (error: any) => {
      const message = error?.message || t("subscriptions.renewError")
      toast.error(message)
      console.error("Renew subscription error:", error)
    },
  })
}

// Get subscription statistics (mocked)
export function useSubscriptionStats() {
  const { isAuthenticated } = useAuthStore()

  return useQuery({
    queryKey: ["subscriptions", "stats"],
    queryFn: async () => {
      await mockApiDelay(1000)

      const activeCount = mockSubscriptions.filter((sub) => sub.isActive).length
      const totalSpent = mockSubscriptions.reduce((total, sub) => total + sub.price, 0)

      return {
        activeSubscriptions: activeCount,
        totalSubscriptions: mockSubscriptions.length,
        monthlySpending: mockSubscriptions
          .filter((sub) => sub.isActive && sub.plan === "monthly")
          .reduce((total, sub) => total + sub.price, 0),
        yearlySpending: mockSubscriptions
          .filter((sub) => sub.isActive && sub.plan === "yearly")
          .reduce((total, sub) => total + sub.price, 0),
        totalSpent,
      }
    },
    enabled: isAuthenticated && typeof window !== "undefined",
    staleTime: 10 * 60 * 1000, // 10 minutes
  })
}
