"use client";

import type React from "react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "./auth-store";
import { getRouteConfig } from "../route-config";

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireCreator?: boolean;
  redirectTo?: string;
}

export function AuthGuard({ children, requireAuth = true, requireCreator = false }: AuthGuardProps) {
  const { isAuthenticated, user, isHydrated } = useAuthStore()
  const router = useRouter()
  const pathname = usePathname()
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    if (!isHydrated) return

    if (requireAuth && !isAuthenticated) {
      router.replace("/auth")
      return
    }

    if (isAuthenticated && pathname === "/auth") {
      router.replace("/")
      return
    }

    if (requireCreator) {
      if (!user?.data?.creatorProfile) {
        router.replace("/apply")
        return
      }

      const currentProfile = user.data.creatorProfile
      const isApprovedCreator = currentProfile.status === "approved"

      if (!isApprovedCreator) {
        router.replace("/apply")
        return
      }
    }

    setIsChecking(false)
  }, [isHydrated, isAuthenticated, user, requireAuth, requireCreator, router, pathname])

  if (!isHydrated || isChecking) {
    return <div>Loading...</div>
  }

  return <>{children}</>
}
