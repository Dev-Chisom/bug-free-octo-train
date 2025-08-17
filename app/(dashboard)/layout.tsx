"use client"

import type React from "react"
import { AuthGuard } from "@/lib/auth/auth-guard"
import DashboardLayoutComponent from "@/components/dashboard-layout"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    // AuthGuard protects the entire dashboard section
    <AuthGuard requiresAuth={true}>
      <DashboardLayoutComponent>{children}</DashboardLayoutComponent>
    </AuthGuard>
  )
}
