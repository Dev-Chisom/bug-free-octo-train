"use client"

import { Skeleton } from "@/components/ui/skeleton"

export function BuildLoading() {
  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="space-y-6">
        <Skeleton className="h-8 w-1/4" />
        <Skeleton className="h-64 w-full" />
      </div>
    </div>
  )
}

export function BuildLoadingCompact() {
  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="space-y-4">
        <Skeleton className="h-6 w-1/3" />
        <Skeleton className="h-32 w-full" />
      </div>
    </div>
  )
} 