import { create } from "zustand"
import { persist } from "zustand/middleware"
import { jwtDecode } from "jwt-decode"

interface CreatorProfile {
  displayName: string
  username: string
  bio: string
  status: string
  socialMedia?: Array<{
    platform: string
    url: string
    _id: string
    createdAt: string
    updatedAt: string
  }>
  legal?: {
    termsOfService: boolean
    legallyAnAdult: boolean
  }
  _id: string
  createdAt: string
  updatedAt: string
}

interface UserData {
  _id: string
  email: string
  name: string
  provider: string
  providerId: string
  status: string
  createdAt: string
  updatedAt: string
  __v: number
  refreshToken: string
  creatorProfile?: CreatorProfile
  referralCode?: string
}

interface User {
  success: boolean
  data: UserData
  message: string
}

interface AuthState {
  user: User | null
  accessToken: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  isHydrated: boolean
}

interface AuthActions {
  setAuth: (accessToken: string, refreshToken: string, user: User) => void
  setUser: (user: User) => void
  logout: () => void
  clearAuth: () => void
  setHydrated: () => void
  syncWithCookies: () => void
  isAuthenticatedFn: () => boolean
  getSubscriptions: () => string[]
  setCookie: (name: string, value: string, days?: number) => void
  getCookie: (name: string) => string | null
  deleteCookie: (name: string) => void
}

type AuthStore = AuthState & AuthActions

interface JWTPayload {
  userId: string
  iat: number
  exp: number
}

// Improved cookie utilities with better error handling
const setCookie = (name: string, value: string, days = 30) => {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return false
  }

  try {
    const expires = new Date()
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000)
    // Use a simpler cookie format
    const cookieString = `${name}=${encodeURIComponent(value)}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`

    document.cookie = cookieString

    // Immediate verification
    const verification = document.cookie.includes(`${name}=`)

    return verification
  } catch (error) {
    return false
  }
}

const getCookie = (name: string): string | null => {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return null
  }

  try {
    const nameEQ = name + "="
    const ca = document.cookie.split(";")

    for (let i = 0; i < ca.length; i++) {
      let c = ca[i]
      while (c.charAt(0) === " ") c = c.substring(1, c.length)
      if (c.indexOf(nameEQ) === 0) {
        const value = decodeURIComponent(c.substring(nameEQ.length, c.length))
        return value
      }
    }

    return null
  } catch (error) {
    return null
  }
}

const deleteCookie = (name: string) => {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return
  }

  try {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Lax`
  } catch (error) {
    // Silent fail
  }
}

const isTokenValid = (token: string | null): boolean => {
  if (!token) {
    return false
  }

  try {
    const decoded = jwtDecode<JWTPayload>(token)
    const currentTime = Math.floor(Date.now() / 1000)
    const isValid = decoded && decoded.exp && decoded.exp > currentTime

    return isValid
  } catch (error) {
    return false
  }
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isHydrated: false,

      setAuth: (accessToken, refreshToken, user) => {
        // Validate token before setting
        if (!isTokenValid(accessToken)) {
          get().clearAuth()
          return
        }

        // User data must be provided - no more mock user creation
        if (!user) {
          get().clearAuth()
          return
        }

        let userData = user

        // Set in Zustand store first
        set({
          accessToken,
          refreshToken,
          user: userData,
          isAuthenticated: true,
        })

        // Set cookies with verification
        setCookie("accessToken", accessToken, 7)
        setCookie("refreshToken", refreshToken, 30)
        setCookie("userProfile", JSON.stringify(userData), 7)
      },

      setUser: (user: User) => {
        set({ user })
        setCookie("userProfile", JSON.stringify(user), 7)
      },

      logout: () => {
        // Delete cookies first
        deleteCookie("accessToken")
        deleteCookie("refreshToken")
        deleteCookie("userProfile")

        // Clear state
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        })
      },

      clearAuth: () => {
        // Delete cookies first
        deleteCookie("accessToken")
        deleteCookie("refreshToken")
        deleteCookie("userProfile")

        // Clear state
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        })
      },

      setHydrated: () => {
        set({ isHydrated: true })
      },

      syncWithCookies: () => {
        const accessToken = getCookie("accessToken")
        const refreshToken = getCookie("refreshToken")
        const userProfile = getCookie("userProfile")

        if (accessToken && refreshToken && userProfile) {
          const tokenIsValid = isTokenValid(accessToken)

          if (tokenIsValid) {
            try {
              const user = JSON.parse(decodeURIComponent(userProfile))
              
              set({
                accessToken,
                refreshToken,
                user,
                isAuthenticated: true,
              })
            } catch (error) {
              get().clearAuth()
            }
          } else {
            get().clearAuth()
          }
        } else {
          get().clearAuth()
        }
      },

      isAuthenticatedFn: () => {
        const state = get()
        const tokenValid = state.accessToken ? isTokenValid(state.accessToken) : false
        const isAuth = state.isAuthenticated && !!state.accessToken && !!state.user && tokenValid

        return isAuth
      },

      getSubscriptions: () => {
        // Return empty array - no mock data
        // This will be replaced with actual API call when subscriptions are implemented
        return []
      },

      setCookie,
      getCookie,
      deleteCookie,
    }),
    {
      name: "auth-storage",
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.setHydrated()
        }
      },
    },
  ),
)
