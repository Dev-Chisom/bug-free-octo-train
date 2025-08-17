"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import type React from "react"

import { cn } from "@/lib/utils"

interface NavigationItem {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  divider?: boolean
}

interface SidebarNavigationItemProps {
  item: NavigationItem
  onClick?: () => void
}

export default function SidebarNavigationItem({ item, onClick }: SidebarNavigationItemProps) {
  const pathname = usePathname()

  const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href)

  // Use the icon component directly
  const IconComponent = item.icon

  return (
    <div className="mb-2">
      {item.divider && <hr className="my-4 border-gray-200 dark:border-gray-700" />}
      <Link
        href={item.href}
        onClick={onClick}
        className={cn(
          "group flex items-center px-2.5 py-2 text-sm font-medium rounded-lg transition-all duration-150",
          isActive
            ? "bg-primary-50 text-primary-700 dark:bg-primary-900 dark:text-primary-200"
            : "text-gray-700 hover:text-primary-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:text-primary-200 dark:hover:bg-gray-800",
        )}
      >
        <IconComponent
          className={cn(
            "mr-4 flex-shrink-0 h-6 w-6",
            isActive
              ? "text-primary-600 dark:text-primary-300"
              : "text-gray-500 group-hover:text-primary-600 dark:text-gray-400 dark:group-hover:text-primary-300",
          )}
        />
        {item.name}
      </Link>
    </div>
  )
}
