// Instead of hardcoding routes, let's create a configuration system
export interface RouteConfig {
  path: string
  requiresAuth: boolean
  requiresCreator: boolean
  allowedRoles?: string[]
}

export const routeConfigs: RouteConfig[] = [
  // Auth routes (public)
  { path: "/auth", requiresAuth: false, requiresCreator: false },
  { path: "/about", requiresAuth: false, requiresCreator: false },
  { path: "/terms", requiresAuth: false, requiresCreator: false },

  // Protected routes - HOME/DASHBOARD REQUIRES AUTH
  { path: "/", requiresAuth: true, requiresCreator: false },
  { path: "/dashboard", requiresAuth: true, requiresCreator: false },
  { path: "/profile", requiresAuth: true, requiresCreator: false },
  { path: "/settings", requiresAuth: true, requiresCreator: false },
  { path: "/wallet", requiresAuth: true, requiresCreator: false },
  { path: "/subscriptions", requiresAuth: true, requiresCreator: false },
  { path: "/messages", requiresAuth: true, requiresCreator: false },
  { path: "/content", requiresAuth: true, requiresCreator: false },

  // Creator routes
  { path: "/creator", requiresAuth: true, requiresCreator: true },
  { path: "/creator/analytics", requiresAuth: true, requiresCreator: true },
  { path: "/creator/earnings", requiresAuth: true, requiresCreator: true },
  { path: "/creator/subscribers", requiresAuth: true, requiresCreator: true },

  // Application route
  { path: "/apply", requiresAuth: true, requiresCreator: false },
]

// Helper functions
export function getRouteConfig(pathname: string): RouteConfig | null {
  // Find the most specific matching route
  const matches = routeConfigs
    .filter((config) => pathname.startsWith(config.path))
    .sort((a, b) => b.path.length - a.path.length) // Longest match first

  return matches[0] || null
}

export function isPublicRoute(pathname: string): boolean {
  const config = getRouteConfig(pathname)
  return config ? !config.requiresAuth : false
}

export function requiresCreator(pathname: string): boolean {
  const config = getRouteConfig(pathname)
  return config ? config.requiresCreator : false
}

export function requiresAuth(pathname: string): boolean {
  const config = getRouteConfig(pathname)
  return config ? config.requiresAuth : false
}
