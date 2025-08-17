import { createApiService } from "./../api.service"
import { useAuthStore } from "../auth/auth-store"

export interface ContentMetadata {
  tags: string[]
  categories: string[]
  likes: string[]
  views: number
  shares: number
}

export interface Content {
  _id: string
  title: string
  body: string
  mediaFiles: string[]
  creator: string
  status: string
  visibility: "public" | "private" | "premium"
  price: number
  metadata: ContentMetadata
  createdAt: string
  updatedAt: string
}

export interface ContentListResponse {
  posts: Content[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

export interface ContentListParams {
  page?: number
  limit?: number
  search?: string
  visibility?: "public" | "private" | "premium"
}

export interface CreateContentRequest {
  title: string
  body: string
  mediaFiles?: string[]
  visibility: "public" | "private" | "premium"
  price?: number
  scheduledDate?: string
  description?: string
  tags?: string[]
  categories?: string[]
  isDraft?: boolean
}

export interface UpdateContentRequest {
  title?: string
  body?: string
  mediaFiles?: string[]
  visibility?: "public" | "private" | "premium"
  price?: number
  scheduledDate?: string
  description?: string
  tags?: string[]
  categories?: string[]
  status?: string
}

// Create API service instance with auth
function getApiService() {
  const { accessToken, refreshToken, setAuth, clearAuth } = useAuthStore.getState()

  return createApiService(
    accessToken || undefined,
    refreshToken || undefined,
    (newToken) => {
      if (refreshToken) {
        const currentUser = useAuthStore.getState().user
        if (currentUser) {
          setAuth(newToken, refreshToken, currentUser)
        }
      }
    },
    () => {
      clearAuth()
    },
  )
}

export function createContentApi() {
  return {
    getAllPosts: (params?: Record<string, any>) => {
      const apiService = getApiService()
      return apiService.get<{ success: boolean; data: ContentListResponse; message: string }>("/posts", params)
    },

    getPostById: (id: string) => {
      const apiService = getApiService()
      return apiService.get<{ success: boolean; data: { post: Content }; message: string }>(`/posts/${id}`)
    },

    createPost: (data: CreateContentRequest) => {
      const apiService = getApiService()
      return apiService.post<{ success: boolean; data: { post: Content }; message: string }>("/posts", data)
    },

    updatePost: (id: string, data: UpdateContentRequest) => {
      const apiService = getApiService()
      return apiService.put<{ success: boolean; data: { post: Content }; message: string }>(`/posts/${id}`, data)
    },

    deletePost: (id: string) => {
      const apiService = getApiService()
      return apiService.delete<{ success: boolean; message: string }>(`/posts/${id}`)
    },

    // Additional methods using your existing API structure
    getContentStats: () => {
      const apiService = getApiService()
      return apiService.get<{ success: boolean; data: any; message: string }>("/posts/stats")
    },

    publishPost: (id: string) => {
      const apiService = getApiService()
      return apiService.post<{ success: boolean; data: { post: Content }; message: string }>(`/posts/${id}/publish`)
    },

    schedulePost: (id: string, scheduledDate: string) => {
      const apiService = getApiService()
      return apiService.post<{ success: boolean; data: { post: Content }; message: string }>(`/posts/${id}/schedule`, {
        scheduledDate,
      })
    },
  }
}
