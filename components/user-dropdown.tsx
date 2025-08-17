"use client"

import { useState, useEffect, useMemo } from "react"
import { ChevronDown, LogOut, Sun, Moon } from "lucide-react"
import { useTheme } from "next-themes"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuthStore } from "@/lib/auth/auth-store"
import { useLogout } from "@/lib/api-hooks"

interface NavLink {
  name: string
  href: string
}

export default function UserDropdown() {
  const { user } = useAuthStore()
  const logoutMutation = useLogout()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  const userInitials = useMemo((): string => {
    const name = user?.data?.name || ""
    if (!name) {
      return "?"
    }

    const parts = name.split(" ")
    if (parts.length > 1) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
    }
    return name.substring(0, 2).toUpperCase()
  }, [user?.data?.name, user])

  const profileHref = useMemo((): string => {
    if (user && user.data?.name) {
      return `/@${encodeURIComponent(user.data?.name)}`
    }
    return "/@user"
  }, [user?.data?.name, user])

  const userLinks: NavLink[] = useMemo(
    () => [
      { name: "Profile", href: profileHref },
      { name: "Subscriptions", href: "/subscriptions" },
      { name: "Settings", href: "/settings" },
    ],
    [profileHref],
  )

  const creatorLinks: NavLink[] = useMemo(
    () => [
      { name: "Dashboard", href: "/creator/analytics" },
      { name: "Content", href: "/content" },
      { name: "Earnings", href: "/creator/earnings" },
    ],
    [],
  )

  const logout = () => {
    logoutMutation.mutate()
  }

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  if (!mounted) {
    return null // Avoid hydration mismatch
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex items-center space-x-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user?.data?.creatorProfile?.profilePicture || "/placeholder.svg"} alt={user?.name} />
            <AvatarFallback>{userInitials}</AvatarFallback>
          </Avatar>
          <span className="hidden md:block text-sm font-medium text-gray-900 dark:text-gray-100">
            {user?.name || "Account"}
          </span>
          <ChevronDown className="h-4 w-4 text-gray-500 dark:text-gray-400" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <div className="px-2 py-2 text-sm text-gray-900 dark:text-gray-100 border-b border-gray-100 dark:border-gray-700">
          <p className="font-medium">{user?.data?.name || "User"}</p>
          <p className="text-gray-500 dark:text-gray-400 truncate">{user?.data?.email || "user@example.com"}</p>
        </div>

        {userLinks.map((item) => (
          <DropdownMenuItem key={item.name} asChild>
            <Link href={item.href}>{item.name}</Link>
          </DropdownMenuItem>
        ))}

        <DropdownMenuItem onClick={toggleTheme}>
          {theme === "dark" ? <Sun className="mr-2 h-4 w-4" /> : <Moon className="mr-2 h-4 w-4" />}
          {theme === "dark" ? "Light Mode" : "Dark Mode"}
        </DropdownMenuItem>

        {Boolean(user?.creatorProfile) && (
          <>
            <DropdownMenuSeparator />
            {creatorLinks.map((item) => (
              <DropdownMenuItem key={item.name} asChild>
                <Link href={item.href}>{item.name}</Link>
              </DropdownMenuItem>
            ))}
          </>
        )}

        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={logout} disabled={logoutMutation.isPending}>
          <LogOut className="mr-2 h-4 w-4" />
          {logoutMutation.isPending ? "Logging out..." : "Logout"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
