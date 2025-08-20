"use client"

import type React from "react"

import { useMemo } from "react"
import { useTranslation } from "react-i18next"
import { X, Home, MessageCircle, ImageIcon, BarChart, Users, DollarSign, UserPlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuthStore } from "@/lib/auth/auth-store"
import SidebarNavigationItem from "@/components/sidebar-navigation-item"
import Image from "next/image"

interface NavigationItem {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  divider?: boolean
}

interface CreatorSidebarProps {
  isMobileOpen: boolean
  onClose: () => void
}

export default function CreatorSidebar({ isMobileOpen, onClose }: CreatorSidebarProps) {
  const { t } = useTranslation("navigation")
  const { user, isAuthenticated, isHydrated } = useAuthStore()

  const navigationItems = useMemo(() => {
    const creatorStatus = user?.data?.creatorProfile?.status
    const isApprovedCreator = creatorStatus === "approved"

    // Base navigation items for all users
    const baseItems: NavigationItem[] = [
      {
        name: t("nav.home") || "Home",
        href: "/",
        icon: Home,
      },
      {
        name: t("nav.content") || "Content",
        href: "/content",
        icon: ImageIcon,
      },
    ]

    // Creator-specific navigation items
    const creatorItems: NavigationItem[] = isApprovedCreator
      ? [
          {
            name: t("nav.analytics") || "Analytics",
            href: "/creator/analytics",
            icon: BarChart,
          },
          {
            name: t("nav.earnings") || "Earnings",
            href: "/creator/earnings",
            icon: DollarSign,
          },
          {
            name: t("nav.subscribers") || "Subscribers",
            href: "/creator/subscribers",
            icon: Users,
          },
          {
            name: t("nav.messages") || "Messages",
            href: "/creator/messages",
            icon: MessageCircle,
          },
        ]
      : []

    // "Become Creator" navigation item for non-creators
    const becomeCreatorItem: NavigationItem[] = !isApprovedCreator
      ? [
          {
            name: t("nav.becomeCreator") || "Become Creator",
            href: "/apply",
            icon: UserPlus,
            divider: true,
          },
        ]
      : []

    const finalItems = [...baseItems, ...creatorItems, ...becomeCreatorItem]

    return finalItems
  }, [user?.data?.creatorProfile?.status, t])

  // Show loading state while auth store is hydrating
  if (!isHydrated) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div>
      {/* Mobile Sidebar */}
      {isMobileOpen && (
        <div className="fixed inset-0 lg:hidden z-[400]" role="dialog" aria-modal="true">
          <div className="fixed inset-0 bg-black/50" onClick={onClose} />

          <div className="fixed inset-y-0 left-0 flex max-w-xs w-full bg-card shadow-lg">
            <div className="flex flex-col w-full">
              <div className="px-4 py-6 bg-primary sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Image src="/logo-white.svg" alt="Logo" width={38} height={38} className="h-8 w-auto mb-2" />
                    <span className="text-xl font-bold text-primary-foreground">{t("nav.creatorStudio")}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-primary-foreground hover:text-primary-foreground/80"
                    onClick={onClose}
                  >
                    <span className="sr-only">{t("common.close")}</span>
                    <X className="h-6 w-6" />
                  </Button>
                </div>
              </div>

              <div className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
                {navigationItems.map((item) => (
                  <SidebarNavigationItem key={item.name} item={item} onClick={onClose} />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <div className="sticky bottom-0 top-0 hidden lg:flex lg:flex-shrink-0 bg-card border-r h-screen">
        <div className="flex flex-col w-64">
          <div className="flex flex-col h-0 flex-1">
            <div className="px-4 py-6 bg-primary flex items-center">
              <div className="flex items-center space-x-2">
                <Image src="/logo-white.svg" alt="Logo" width={38} height={38} />
                <span className="text-xl font-bold text-primary-foreground">{t("nav.creatorStudio")}</span>
              </div>
            </div>

            <div className="flex-1 flex flex-col overflow-y-auto">
              <nav className="flex-1 px-2 py-4 space-y-1">
                {navigationItems.map((item) => (
                  <SidebarNavigationItem key={item.name} item={item} />
                ))}
              </nav>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
