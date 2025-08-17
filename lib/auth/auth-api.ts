import { api } from "./../api.service"
import type { AuthResponse, User } from "./../api-types"

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  email: string
  password: string
  username: string
  displayName?: string
}

export const authApi = {
  // OAuth flow - get redirect URL for provider
  getOAuthUrl: (provider: "google" | "x") => api.post(`/auth/${provider}`),

  // Traditional auth
  login: (credentials: LoginCredentials) => api.post<AuthResponse>("/auth/login", credentials),
  register: (data: RegisterData) => api.post<AuthResponse>("/auth/register", data),

  // Profile management
  getProfile: () => {
    return api.get<User>("/auth/profile")
  },
  updateProfile: (data: Partial<User>) => api.put<User>("/auth/profile", data),

  // Token management
  refreshToken: (refreshToken: string) =>
    api.post<{ accessToken: string; refreshToken?: string }>("/auth/refresh-token", { refreshToken }),
  logout: () => api.patch("/auth/logout"),

  // Password management
  changePassword: (currentPassword: string, newPassword: string) =>
    api.post("/auth/change-password", { currentPassword, newPassword }),
  requestPasswordReset: (email: string) => api.post("/auth/forgot-password", { email }),
  resetPassword: (token: string, newPassword: string) => api.post("/auth/reset-password", { token, newPassword }),
}
