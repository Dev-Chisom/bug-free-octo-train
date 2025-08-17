import { NextRequest, NextResponse } from "next/server"
import { jwtDecode } from "jwt-decode"

interface JWTPayload {
  userId: string
  iat: number
  exp: number
}

interface UserProfile {
  data?: {
    creatorProfile?: {
      status: string
    }
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip middleware for static files and API routes
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.startsWith("/placeholder.svg")
  ) {
    return NextResponse.next()
  }

  const token = request.cookies.get("accessToken")?.value
  const userProfile = request.cookies.get("userProfile")?.value

  // Auth page logic
  if (pathname === "/auth") {
    if (token && userProfile) {
      // Authenticated user accessing auth page, redirect to home
      return NextResponse.redirect(new URL("/", request.url))
    }
    return NextResponse.next()
  }

  // Protected routes logic
  if (pathname.startsWith("/dashboard") || pathname.startsWith("/content") || pathname.startsWith("/apply")) {
    if (!token) {
      return NextResponse.redirect(new URL("/auth", request.url))
    }

    try {
      const decoded = jwtDecode<JWTPayload>(token)
      const currentTime = Math.floor(Date.now() / 1000)

      if (decoded.exp && decoded.exp < currentTime) {
        return NextResponse.redirect(new URL("/auth", request.url))
      }

      return NextResponse.next()
    } catch (error) {
      return NextResponse.redirect(new URL("/auth", request.url))
    }
  }

  // Creator routes logic
  if (pathname.startsWith("/creator")) {
    if (!token) {
      return NextResponse.redirect(new URL("/auth", request.url))
    }

    if (!userProfile) {
      return NextResponse.redirect(new URL("/apply", request.url))
    }

    try {
      const profile: UserProfile = JSON.parse(decodeURIComponent(userProfile))
      const creatorStatus = profile.data?.creatorProfile?.status

      if (creatorStatus !== "approved") {
        return NextResponse.redirect(new URL("/apply", request.url))
      }

      return NextResponse.next()
    } catch (error) {
      return NextResponse.redirect(new URL("/apply", request.url))
    }
  }

  // Home page logic
  if (pathname === "/") {
    if (!token) {
      return NextResponse.redirect(new URL("/auth", request.url))
    }

    try {
      const decoded = jwtDecode<JWTPayload>(token)
      const currentTime = Math.floor(Date.now() / 1000)

      if (decoded.exp && decoded.exp < currentTime) {
        return NextResponse.redirect(new URL("/auth", request.url))
      }

      return NextResponse.next()
    } catch (error) {
      return NextResponse.redirect(new URL("/auth", request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
}
