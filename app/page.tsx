"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/lib/auth/auth-store"
import { BuildLoading } from "@/components/ui/build-loading"
import { useClientHydration } from "@/lib/hooks/use-client-hydration"

export default function HomePage() {
  const router = useRouter()
  const { isAuthenticated, user } = useAuthStore()
  const isClient = useClientHydration()

  useEffect(() => {
    if (!isClient) return

    // If user is authenticated, redirect to their dashboard
    if (isAuthenticated && user?.username) {
      router.push(`/dashboard/${user.username}`)
    } else if (isAuthenticated) {
      // If authenticated but no username, go to main dashboard
      router.push("/dashboard")
    } else {
      // If not authenticated, go to auth page
      router.push("/auth")
    }
  }, [isAuthenticated, user, router, isClient])

  // Show loading state until client-side hydration is complete
  if (!isClient) {
    return <BuildLoading />
  }

  // Show loading while redirecting
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <div className="text-center">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Welcome to Whispers
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Your premium content creator platform
          </p>
        </div>
        <BuildLoading />
        <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
          Redirecting you to the right place...
        </p>
      </div>
    </div>
  )
}
