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
    <AuthGuard requireAuth={true} requireCreator={true}>
      <div className="creator-specific-layout">
        <div className="min-h-screen">
          <div className="max-w-6xl mx-auto">{children}</div>
        </div>
      </div>
    </AuthGuard>
  )
}
