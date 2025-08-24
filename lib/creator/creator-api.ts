import { api } from "./../api.service"
import type {
  Creator,
  CreatorPreferences,
  CreatorApplication,
  MediaFilesResponse,
  MediaUploadRequest,
  MediaUploadResponse,
  PaginationMeta,
  MediaFile,
} from "./../api-types"

export const creatorApi = {
  getCreators: (params?: { page?: number; limit?: number; search?: string }) =>
    api.get<{ creators: Creator[]; pagination: PaginationMeta }>("/creators", { params }),

  getCreator: (id: string) => api.get<Creator>(`/creators/${id}`),

  updateCreator: (id: string, data: Partial<Creator>) => api.put<Creator>(`/creators/${id}`, data),

  deleteCreator: (id: string) => api.delete(`/creators/${id}`),

  createCreator: ( data: Partial<Creator>) => api.post('/creators', data),

  // Creator preferences
  getCreatorPreferences: (creatorId?: string) => {
    const endpoint = "/preferences/pricing-models"
    return api.get<CreatorPreferences>(endpoint)
  },

  // http://localhost:3000/preferences/pricing-models
  updateCreatorPreferences: (data: Partial<CreatorPreferences>) =>
    api.put<CreatorPreferences>("/creator-preferences", data),

  // Creator application
  submitApplication: (data: CreatorApplication) => api.post<Creator>("/apply", data),

  getApplication: (id: string) => api.get<CreatorApplication>(`/applications/${id}`),

  // Creator media
  getCreatorMedia: (creatorId: string, params?: { page?: number; limit?: number; type?: string }) =>
    api.get<MediaFilesResponse>(`/creators/${creatorId}/media`, { params }),

  // Media files (for MediaGallery component)
  getMediaFiles: (params?: {
    page?: number;
    limit?: number;
    type?: 'image' | 'video';
    status?: 'active' | 'inactive';
    uploadStatus?: 'pending' | 'uploaded' | 'failed';
    search?: string;
  }) => api.get<MediaFilesResponse>("/media-files", { params }),

  uploadMediaFile: (payload: { files: Array<{ uuid: string; fileName: string; fileType: string; size: number; coverName?: string }> }) =>
    api.post<MediaUploadResponse[]>("/media-files", payload),

  uploadMedia: (data: MediaUploadRequest) => api.post<MediaUploadResponse>("/media-files", data),

  updateMedia: (id: string, data: Partial<MediaFile>) => api.put<MediaFile>(`/media/${id}`, data),

  deleteMedia: (id: string) => api.delete(`/media/${id}`),

  // Creator stats
  getCreatorStats: (creatorId: string) =>
    api.get<{
      followers: number
      following: number
      posts: number
      engagement: number
      revenue: number
    }>(`/creators/${creatorId}/stats`),
}
