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
      {item.divider && <hr className="my-4 border-border" />}
      <Link
        href={item.href}
        onClick={onClick}
        className={cn(
          "group flex items-center px-2.5 py-2 text-sm font-medium rounded-lg transition-all duration-150",
          isActive
            ? "bg-accent text-accent-foreground"
            : "text-muted-foreground hover:text-foreground hover:bg-accent/50",
        )}
      >
        <IconComponent
          className={cn(
            "mr-4 flex-shrink-0 h-6 w-6",
            isActive
              ? "text-accent-foreground"
              : "text-muted-foreground group-hover:text-foreground",
          )}
        />
        {item.name}
      </Link>
    </div>
  )
}
