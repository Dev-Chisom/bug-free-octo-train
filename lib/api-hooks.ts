import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { authApi } from "./auth/auth-api"
import { useAuthStore } from "./auth/auth-store"
import { toast } from "sonner"
import { useCallback } from "react"
import type { LoginCredentials, RegisterData } from "./auth/auth-api"

// Auth query keys
export const authKeys = {
  profile: ["auth", "profile"] as const,
  user: ["auth", "user"] as const,
}

// Auth queries
export const useProfile = () => {
  const { isAuthenticated, accessToken } = useAuthStore()
  return useQuery({
    queryKey: ["profile"],
    queryFn: authApi.getProfile,
    enabled: isAuthenticated && !!accessToken,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false,
  })
}

// Auth mutations
export const useLogin = () => {
  const { setAuth } = useAuthStore()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (credentials: LoginCredentials) => authApi.login(credentials),
    onSuccess: (response) => {
      const { user, accessToken, refreshToken } = response.data
      const authUser = {
        success: true,
        data: {
          ...user,
          __v: 0
        },
        message: "Login successful"
      }
      setAuth(accessToken, refreshToken, authUser as any)
      
      // Set query data to prevent immediate refetch
      queryClient.setQueryData(authKeys.profile, user)
      
      toast.success("Successfully logged in!")
    },
    onError: (error: any) => {
      const message = error?.message || "Login failed"
      toast.error(message)
      console.error("Login error:", error)
    },
  })
}

export const useRegister = () => {
  const { setAuth } = useAuthStore()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: RegisterData) => authApi.register(data),
    onSuccess: (response) => {
      const { user, accessToken, refreshToken } = response.data
      const authUser = {
        success: true,
        data: {
          ...user,
          __v: 0
        },
        message: "Registration successful"
      }
      setAuth(accessToken, refreshToken, authUser as any)
      
      // Set query data to prevent immediate refetch
      queryClient.setQueryData(authKeys.profile, user)
      
      toast.success("Account created successfully!")
    },
    onError: (error: any) => {
      const message = error?.message || "Registration failed"
      toast.error(message)
      console.error("Register error:", error)
    },
  })
}

export const useLogout = () => {
  const { clearAuth } = useAuthStore()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      clearAuth()
      queryClient.clear()
      toast.success("Successfully logged out")
    },
    onError: (error: any) => {
      // Still clear auth even if logout fails
      clearAuth()
      queryClient.clear()
      console.error("Logout error:", error)
    },
  })
}

export const useUpdateProfile = () => {
  const { setUser } = useAuthStore()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: authApi.updateProfile,
    onSuccess: (updatedUser) => {
      // Update both store and query cache
      const authUser = {
        success: true,
        data: updatedUser,
        message: "Profile updated successfully"
      }
      setUser(authUser as any)
      queryClient.setQueryData(authKeys.profile, updatedUser)
      
      toast.success("Profile updated successfully!")
    },
    onError: (error: any) => {
      const message = error?.message || "Failed to update profile"
      toast.error(message)
      console.error("Update profile error:", error)
    },
  })
}

// OAuth helper
export const useOAuthRedirect = () => {
  return {
    redirectToOAuth: useCallback(async (provider: "google" | "x") => {
      try {
        const response = await authApi.getOAuthUrl(provider)
        window.location.href = response.url
      } catch (error) {
        console.error(`Failed to get ${provider} OAuth URL:`, error)
        throw error
      }
    }, []),
  }
}

// Custom hook to check auth status without causing re-renders
export const useAuthStatus = () => {
  const store = useAuthStore()
  
  return {
    isAuthenticated: store.isAuthenticated,
    user: store.user,
    loading: false, // Since we're not making API calls here
  }
}