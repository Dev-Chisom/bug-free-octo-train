"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuthStore } from "@/lib/auth/auth-store"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Icons } from "@/components/ui/icons"
import { OAuthLogin } from "@/components/auth/oauth-login"
import { toast } from "sonner"

export default function AuthPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { setAuth, isAuthenticatedFn, isHydrated, getCookie } = useAuthStore()
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleOAuthCallback = async (accessToken: string, refreshToken: string) => {
    try {
      setIsProcessing(true)
      setError(null)

      // Fetch real user profile from the API using the access token
      const userResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/auth/profile`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      })

      if (!userResponse.ok) {
        throw new Error(`Failed to fetch user profile: ${userResponse.status}`)
      }

      const userData = await userResponse.json()

      // Call setAuth with tokens AND real user data from API
      setAuth(accessToken, refreshToken, userData)

      // Clean URL parameters
      window.history.replaceState({}, document.title, "/auth")

      toast.success("Successfully authenticated!")

      // Check auth status multiple times
      const checkAuthStatus = () => {
        const isAuth = isAuthenticatedFn()
        const accessCookie = getCookie("accessToken")
        const refreshCookie = getCookie("refreshToken")

        return isAuth
      }

      // Check immediately
      setTimeout(() => {
        checkAuthStatus()
      }, 100)

      // Check again at 500ms
      setTimeout(() => {
        checkAuthStatus()
      }, 500)

      // Final check and redirect at 1000ms
      setTimeout(() => {
        const isAuth = checkAuthStatus()

        if (isAuth) {
          const redirectTo = sessionStorage.getItem("auth_redirect") || "/"
          sessionStorage.removeItem("auth_redirect")
          router.replace(redirectTo)
        } else {
          setError("Authentication failed - please try again")
        }

        setIsProcessing(false)
      }, 1000)
    } catch (error) {
      // OAuth callback error occurred
      setError(error instanceof Error ? error.message : "Authentication failed")
      setIsProcessing(false)
    }
  }

  // Handle OAuth callback
  useEffect(() => {
    if (!isHydrated) {
      return
    }

    const accessToken = searchParams.get("accessToken")
    const refreshToken = searchParams.get("refreshToken")
    const error = searchParams.get("error")
    const errorDescription = searchParams.get("error_description")

    if (error) {
      const errorMessage = errorDescription || error || "Authentication failed"
      setError(errorMessage)
      toast.error(errorMessage)
      window.history.replaceState({}, document.title, "/auth")
      return
    }

    if (accessToken && refreshToken) {
      handleOAuthCallback(accessToken, refreshToken)
    } else {
    }
  }, [searchParams, isHydrated])

  // Redirect if already authenticated (but don't interfere during processing)
  useEffect(() => {
    if (isHydrated && isAuthenticatedFn() && !isProcessing) {
      const redirectTo = sessionStorage.getItem("auth_redirect") || "/"
      sessionStorage.removeItem("auth_redirect")
      router.replace(redirectTo)
    }
  }, [isHydrated, isAuthenticatedFn, isProcessing, router])

  const handleRetry = () => {
    setError(null)
    window.history.replaceState({}, document.title, "/auth")
  }

  // Show loading while hydrating
  if (!isHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background to-muted/20">
        <Card className="w-full max-w-md shadow-xl">
          <CardContent className="flex flex-col items-center justify-center p-12">
            <div className="relative mb-6">
              <div className="h-16 w-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
              <div className="absolute inset-0 h-16 w-16 rounded-full border-4 border-transparent border-t-primary/40 animate-ping" />
            </div>
            <h2 className="text-xl font-semibold mb-2 text-foreground">Initializing...</h2>
            <p className="text-sm text-muted-foreground text-center">Setting up your authentication experience</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (isProcessing) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background to-muted/20">
        <Card className="w-full max-w-md shadow-xl">
          <CardContent className="flex flex-col items-center justify-center p-12">
            <div className="relative mb-6">
              <div className="h-16 w-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
              <div className="absolute inset-0 h-16 w-16 rounded-full border-4 border-transparent border-t-primary/40 animate-ping" />
            </div>
            <h2 className="text-xl font-semibold mb-2 text-foreground">Completing authentication...</h2>
            <p className="text-sm text-muted-foreground text-center">Please wait while we set up your account</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background to-muted/20">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center pb-6">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 dark:bg-primary/20">
            <Icons.user className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Welcome to Whispers
          </CardTitle>
          <CardDescription className="text-base text-muted-foreground mt-2">
            Sign in or create your account to get started
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive" className="border-destructive/50 bg-destructive/10">
              <Icons.alertCircle className="h-4 w-4" />
              <AlertDescription className="flex items-center justify-between">
                <span>{error}</span>
                <Button variant="ghost" size="sm" onClick={handleRetry} className="ml-2 h-auto p-1 hover:bg-destructive/20">
                  <Icons.refresh className="h-3 w-3" />
                </Button>
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            <OAuthLogin />
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border/50" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Quick & Secure</span>
              </div>
            </div>
          </div>

          <div className="text-center text-sm text-muted-foreground leading-relaxed">
            By continuing, you agree to our{" "}
            <a href="/terms" className="underline hover:text-primary transition-colors font-medium">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="/privacy" className="underline hover:text-primary transition-colors font-medium">
              Privacy Policy
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
