"use client"

import type React from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import { ThemeProvider } from "next-themes"
import { I18nProvider } from "@/components/i18n-provider"

// Create a stable QueryClient instance
function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60 * 10, // 10 minutes
        retry: (failureCount, error) => {
          if (error instanceof Error && error.message.includes("401")) {
            return false // Don't retry auth errors
          }
          return failureCount < 3
        },
        // Don't throw errors globally - let components handle them
        throwOnError: false,
      },
      mutations: {
        retry: 1,
        // Don't throw errors globally - let components handle them
        throwOnError: false,
      },
    },
  })
}

let browserQueryClient: QueryClient | undefined = undefined

function getQueryClient() {
  if (typeof window === "undefined") {
    return makeQueryClient()
  } else {
    if (!browserQueryClient) browserQueryClient = makeQueryClient()
    return browserQueryClient
  }
}

export default function Providers({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient()

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider 
        attribute="class" 
        defaultTheme="system" 
        enableSystem 
        disableTransitionOnChange
        storageKey="whispers-theme"
      >
        <I18nProvider>
          {children}
          <ReactQueryDevtools initialIsOpen={false} />
        </I18nProvider>
      </ThemeProvider>
    </QueryClientProvider>
  )
}
