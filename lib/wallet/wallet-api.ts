import { createApiService } from "./../api.service"
import { useAuthStore } from "../auth/auth-store"

// Create API service instance with auth
function getApiService() {
  const { accessToken, refreshToken, setAuth, logout } = useAuthStore.getState()

  return createApiService(
    accessToken || undefined,
    refreshToken || undefined,
    (newToken) => {
      const currentUser = useAuthStore.getState().user
      if (currentUser && refreshToken) {
        setAuth(newToken, refreshToken, currentUser)
      }
    },
    () => {
      logout()
    },
  )
}

export const walletApi = {
  // Get wallet balance
  getBalance: async () => {
    const apiService = getApiService()
    return await apiService.get("/wallet/balance")
  },

  // Get transaction history
  getTransactions: async (params?: { page?: number; limit?: number }) => {
    const apiService = getApiService()
    return await apiService.get("/wallet/transactions", params)
  },

  // Fund wallet
  fundWallet: async (data: {
    amount: number
    paymentMethod: "paystack" | "bani"
    email: string
  }) => {
    const apiService = getApiService()
    return await apiService.post("/wallet/fund", data)
  },

  // Initialize Paystack payment
  initializePaystack: async (data: { amount: number; email: string; callback_url?: string }) => {
    const apiService = getApiService()
    return await apiService.post("/payments/paystack/initialize", data)
  },

  // Initialize Bani payment
  initializeBani: async (data: {
    amount: number
    email: string
    firstName: string
    lastName: string
    phoneNumber: string
  }) => {
    const apiService = getApiService()
    return await apiService.post("/payments/bani/initialize", data)
  },

  // Verify payment
  verifyPayment: async (reference: string, provider: "paystack" | "bani") => {
    const apiService = getApiService()
    return await apiService.post(`/payments/${provider}/verify`, { reference })
  },
}
