"use client"

import type React from "react"
import { AuthGuard } from "@/lib/auth/auth-guard"
import { useAuthStore } from "@/lib/auth/auth-store"
import { Badge } from "@/components/ui/badge"
import { User, Crown } from "lucide-react"

export default function CreatorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user } = useAuthStore()
  const creatorProfile = user?.data?.creatorProfile

  return (
    <AuthGuard requiresAuth={true} requiresCreator={true}>
      <div className="creator-specific-layout">
        {/* Creator Header */}
        {/* <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
          <div className="max-w-6xl mx-auto px-6 py-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="bg-white/20 rounded-full p-3">
                  <Crown className="h-8 w-8" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold">Creator Dashboard</h1>
                  <p className="text-purple-100">
                    Welcome back, {creatorProfile?.displayName || user?.data?.name || "Creator"}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Badge variant="secondary" className="bg-green-500/20 text-green-100 border-green-400">
                  <User className="h-4 w-4 mr-1" />
                  {creatorProfile?.status || "Active"}
                </Badge>
              </div>
            </div>
          </div>
        </div> */}

        {/* Content Area */}
        <div className="min-h-screen">
          <div className="max-w-6xl mx-auto">{children}</div>
        </div>
      </div>
    </AuthGuard>
  )
}
