"use client"

import type React from "react"
import { useEffect } from "react"
import { useAuthStore } from "./auth-store"
import { useQuery } from "@tanstack/react-query"
import { authApi } from "./auth-api"

interface AuthProviderProps {
  children: React.ReactNode
}

export const useProfile = () => {
  const { isAuthenticatedFn, accessToken } = useAuthStore()

  return useQuery({
    queryKey: ["profile"],
    queryFn: () => {
      return authApi.getProfile()
    },
    enabled: isAuthenticatedFn() && !!accessToken,
    staleTime: 5 * 60 * 1000,
    retry: (failureCount, error: any) => {
      // Don't retry on 401 errors
      if (error?.status === 401) {
        return false
      }
      return failureCount < 2
    },
  })
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { setUser, clearAuth, isAuthenticatedFn, user } = useAuthStore()
  const profileQuery = useQuery({
    queryKey: ["profile"],
    queryFn: () => {
      return authApi.getProfile()
    },
    enabled: isAuthenticatedFn() && !!user && (!user?.data?.email || !user?.data?.name),
    staleTime: 5 * 60 * 1000,
    retry: (failureCount, error: any) => {
      // Don't retry on 401 errors
      if (error?.status === 401) {
        return false
      }
      return failureCount < 2
    },
  })

  useEffect(() => {
    if (profileQuery.isSuccess && profileQuery.data) {
      const authUser = {
        success: true,
        data: profileQuery.data,
        message: "Profile loaded successfully"
      }
      setUser(authUser as any)
    }

    if (profileQuery.isError) {
      // Only clear auth if it's a real auth error, not a network error
      const error = profileQuery.error as any
      if (error?.status === 401 || error?.status === 403) {
        clearAuth()
      }
    }
  }, [profileQuery.isSuccess, profileQuery.isError, profileQuery.data, profileQuery.error, setUser, clearAuth])

  return <>{children}</>
}
