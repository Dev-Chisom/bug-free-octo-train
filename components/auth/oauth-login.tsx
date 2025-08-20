"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Icons } from "@/components/ui/icons"

interface OAuthButtonsProps {
  onError?: (error: string) => void
  redirectTo?: string
}

export function OAuthLogin({ onError, redirectTo = "/" }: OAuthButtonsProps) {
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null)

  const handleOAuthLogin = async (provider: "google" | "twitter") => {
    try {
      setLoadingProvider(provider)

      // Store redirect URL in session storage
      if (redirectTo && redirectTo !== "/") {
        sessionStorage.setItem("auth_redirect", redirectTo)
      }

      // Use environment variable for API URL or fallback to localhost for development
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"
      
      // Include callback URL so the external API knows where to redirect back to
      const callbackUrl = `${window.location.origin}/auth`
      const oauthUrl = `${apiBaseUrl}/auth/${provider}?callbackUrl=${encodeURIComponent(callbackUrl)}`

      window.location.href = oauthUrl
    } catch (error) {
      // OAuth error occurred
      const errorMessage = error instanceof Error ? error.message : `${provider} authentication failed`
      onError?.(errorMessage)
      setLoadingProvider(null)
    }
  }

  return (
    <div className="space-y-4">
      <Button
        variant="outline"
        className="w-full h-12 border-2 transition-all duration-200 shadow-sm hover:shadow-md"
        onClick={() => handleOAuthLogin("google")}
        disabled={!!loadingProvider}
      >
        {loadingProvider === "google" ? (
          <Icons.spinner className="mr-3 h-5 w-5 animate-spin" />
        ) : (
          <Icons.google className="mr-3 h-5 w-5" />
        )}
        <span className="font-medium">
          Continue with Google
        </span>
      </Button>

      <Button
        variant="outline"
        className="w-full h-12 border-2 transition-all duration-200 shadow-sm hover:shadow-md"
        onClick={() => handleOAuthLogin("twitter")}
        disabled={!!loadingProvider}
      >
        {loadingProvider === "twitter" ? (
          <Icons.spinner className="mr-3 h-5 w-5 animate-spin" />
        ) : (
          <Icons.twitter className="mr-3 h-5 w-5" />
        )}
        <span className="font-medium">
          Continue with Twitter
        </span>
      </Button>
    </div>
  )
}
