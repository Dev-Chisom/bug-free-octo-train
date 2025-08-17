"use client"

import type { ComponentType } from "react"
import { AuthGuard } from "./auth-guard"

interface WithAuthOptions {
  requiresAuth?: boolean
  requiresCreator?: boolean
  redirectTo?: string
}

export function withAuth<P extends object>(Component: ComponentType<P>, options: WithAuthOptions = {}) {
  const { requiresAuth = true, requiresCreator = false, redirectTo = "/auth" } = options

  return function AuthenticatedComponent(props: P) {
    return (
      <AuthGuard requiresAuth={requiresAuth} requiresCreator={requiresCreator} redirectTo={redirectTo}>
        <Component {...props} />
      </AuthGuard>
    )
  }
}

// Convenience HOCs for common patterns
export function withCreatorAuth<P extends object>(Component: ComponentType<P>) {
  return withAuth(Component, { requiresAuth: true, requiresCreator: true })
}

export function withBasicAuth<P extends object>(Component: ComponentType<P>) {
  return withAuth(Component, { requiresAuth: true, requiresCreator: false })
}
