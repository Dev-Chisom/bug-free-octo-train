"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useAuthStore } from "../auth/auth-store"
import { createApiService } from "./../api.service"
import { useTranslation } from "react-i18next"
import { toast } from "sonner"

interface WalletBalance {
  balance: number
  currency: string
}

interface Transaction {
  id: string
  description: string
  amount: number
  type: "credit" | "debit"
  date: string
  status: "completed" | "pending" | "failed"
}

interface FundWalletRequest {
  amount: number
  paymentMethod: "paystack" | "bani"
  email: string
}

// Wallet query keys
export const walletKeys = {
  all: ["wallet"] as const,
  balance: ["wallet", "balance"] as const,
  transactions: ["wallet", "transactions"] as const,
  stats: ["wallet", "stats"] as const,
}

// Mock data
const mockWalletBalance: WalletBalance = {
  balance: 25000,
  currency: "NGN",
}

const mockTransactions: Transaction[] = [
  {
    id: "TXN-001",
    description: "Wallet Funding via Paystack",
    amount: 5000,
    type: "credit",
    date: new Date("2024-04-01").toISOString(),
    status: "completed",
  },
  {
    id: "TXN-002",
    description: "Subscription Payment",
    amount: 2000,
    type: "debit",
    date: new Date("2024-03-31").toISOString(),
    status: "completed",
  },
  {
    id: "TXN-003",
    description: "Creator Tip",
    amount: 1000,
    type: "debit",
    date: new Date("2024-03-30").toISOString(),
    status: "completed",
  },
  {
    id: "TXN-004",
    description: "Wallet Funding via Bani",
    amount: 10000,
    type: "credit",
    date: new Date("2024-03-29").toISOString(),
    status: "completed",
  },
  {
    id: "TXN-005",
    description: "Content Purchase",
    amount: 500,
    type: "debit",
    date: new Date("2024-03-28").toISOString(),
    status: "completed",
  },
  {
    id: "TXN-006",
    description: "Refund",
    amount: 1500,
    type: "credit",
    date: new Date("2024-03-27").toISOString(),
    status: "completed",
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
        const currentUser = useAuthStore.getState().user
        if (currentUser) {
          setAuth(newToken, refreshToken, currentUser)
        }
      }
    },
    () => {
      clearAuth()
    },
  )
}

// Get wallet balance (mocked)
export function useWalletBalance() {
  const { isAuthenticated } = useAuthStore()

  return useQuery({
    queryKey: walletKeys.balance,
    queryFn: async (): Promise<WalletBalance> => {
      await mockApiDelay(800) // Simulate API delay
      return mockWalletBalance
    },
    enabled: isAuthenticated && typeof window !== "undefined",
    staleTime: 5 * 60 * 1000,
    retry: false, // Don't retry for mock data
  })
}

// Get transaction history (mocked)
export function useTransactionHistory(params?: { page?: number; limit?: number }) {
  const { isAuthenticated } = useAuthStore()

  return useQuery({
    queryKey: [...walletKeys.transactions, params],
    queryFn: async (): Promise<Transaction[]> => {
      await mockApiDelay(600) // Simulate API delay

      // Simulate pagination if params provided
      if (params?.page && params?.limit) {
        const start = (params.page - 1) * params.limit
        const end = start + params.limit
        return mockTransactions.slice(start, end)
      }

      return mockTransactions
    },
    enabled: isAuthenticated && typeof window !== "undefined",
    staleTime: 2 * 60 * 1000,
    retry: false,
  })
}

// Fund wallet mutation (mocked)
export function useFundWallet() {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: async (data: FundWalletRequest) => {
      await mockApiDelay(1500) // Simulate API delay

      // Simulate success response
      return {
        success: true,
        transactionId: `TXN-${Date.now()}`,
        amount: data.amount,
        message: "Wallet funded successfully",
      }
    },
    onSuccess: (response, variables) => {
      // Update mock balance
      mockWalletBalance.balance += variables.amount

      // Add new transaction to mock data
      const newTransaction: Transaction = {
        id: response.transactionId,
        description: `Wallet Funding via ${variables.paymentMethod === "paystack" ? "Paystack" : "Bani"}`,
        amount: variables.amount,
        type: "credit",
        date: new Date().toISOString(),
        status: "completed",
      }
      mockTransactions.unshift(newTransaction)

      // Invalidate queries to trigger refetch
      queryClient.invalidateQueries({ queryKey: walletKeys.all })
      toast.success(t("wallet.fundedSuccessfully"))
    },
    onError: (error: any) => {
      const message = error?.message || t("wallet.fundingFailed")
      toast.error(message)
      console.error("Fund wallet error:", error)
    },
  })
}

// Initialize Paystack payment (mocked)
export function usePaystackPayment() {
  const { t } = useTranslation()

  return useMutation({
    mutationFn: async (data: { amount: number; email: string; callback_url?: string }) => {
      await mockApiDelay(1000)

      // Simulate Paystack response
      return {
        authorization_url: `https://checkout.paystack.com/mock-payment?amount=${data.amount}&email=${data.email}`,
        access_code: "mock_access_code",
        reference: `paystack_${Date.now()}`,
      }
    },
    onSuccess: (data) => {
      // For demo purposes, just show success message instead of redirecting
      toast.success("Redirecting to Paystack... (Demo mode)")

      // In real implementation, uncomment this:
      // if (data.authorization_url) {
      //   window.location.href = data.authorization_url
      // }
    },
    onError: (error: any) => {
      const message = error?.message || t("wallet.paystackFailed")
      toast.error(message)
      console.error("Paystack payment error:", error)
    },
  })
}

// Initialize Bani payment (mocked)
export function useBaniPayment() {
  const { t } = useTranslation()

  return useMutation({
    mutationFn: async (data: {
      amount: number
      email: string
      firstName: string
      lastName: string
      phoneNumber: string
    }) => {
      await mockApiDelay(1200)

      // Simulate Bani response
      return {
        payment_url: `https://bani.africa/pay/mock-payment?amount=${data.amount}&email=${data.email}`,
        payment_reference: `bani_${Date.now()}`,
        status: "pending",
      }
    },
    onSuccess: (data) => {
      // For demo purposes, just show success message instead of redirecting
      toast.success("Redirecting to Bani... (Demo mode)")

      // In real implementation, uncomment this:
      // if (data.payment_url) {
      //   window.location.href = data.payment_url
      // }
    },
    onError: (error: any) => {
      const message = error?.message || t("wallet.baniFailed")
      toast.error(message)
      console.error("Bani payment error:", error)
    },
  })
}

// Verify payment (mocked)
export function useVerifyPayment() {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: async (data: { reference: string; provider: "paystack" | "bani" }) => {
      await mockApiDelay(800)

      // Simulate verification response
      return {
        status: "success",
        amount: 5000, // Mock amount
        reference: data.reference,
        provider: data.provider,
        verified: true,
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: walletKeys.all })
      toast.success(t("wallet.paymentVerified"))
    },
    onError: (error: any) => {
      const message = error?.message || t("wallet.verificationFailed")
      toast.error(message)
      console.error("Payment verification error:", error)
    },
  })
}

// Get wallet statistics (mocked)
export function useWalletStats() {
  const { isAuthenticated } = useAuthStore()

  return useQuery({
    queryKey: walletKeys.stats,
    queryFn: async () => {
      await mockApiDelay(1000)

      return {
        totalSpent: 15000,
        totalFunded: 40000,
        transactionCount: mockTransactions.length,
        monthlySpending: [
          { month: "Jan", amount: 5000 },
          { month: "Feb", amount: 3000 },
          { month: "Mar", amount: 7000 },
          { month: "Apr", amount: 2000 },
        ],
      }
    },
    enabled: isAuthenticated && typeof window !== "undefined",
    staleTime: 10 * 60 * 1000,
  })
}
