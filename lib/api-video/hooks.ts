"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { apiVideoService, type ApiVideoVideo, type ApiVideoUploadResponse } from "./service"

// Query keys for api.video
export const apiVideoKeys = {
  all: ["api-video"] as const,
  videos: () => [...apiVideoKeys.all, "videos"] as const,
  video: (id: string) => [...apiVideoKeys.videos(), id] as const,
  status: (id: string) => [...apiVideoKeys.video(id), "status"] as const,
}

// Get video details
export function useApiVideo(videoId: string) {
  return useQuery({
    queryKey: apiVideoKeys.video(videoId),
    queryFn: () => apiVideoService.getVideo(videoId),
    enabled: !!videoId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error: any) => {
      if (error?.status === 404) return false
      return failureCount < 2
    },
    throwOnError: false,
  })
}

// Get video status
export function useApiVideoStatus(videoId: string) {
  return useQuery({
    queryKey: apiVideoKeys.status(videoId),
    queryFn: () => apiVideoService.getVideoStatus(videoId),
    enabled: !!videoId,
    refetchInterval: (query) => {
      // Refetch every 2 seconds if video is still processing
      if (query.state.data?.status === 'uploading' || query.state.data?.status === 'processing') {
        return 2000
      }
      return false
    },
    staleTime: 0, // Always fetch fresh status
    retry: (failureCount, error: any) => {
      if (error?.status === 404) return false
      return failureCount < 3
    },
    throwOnError: false,
  })
}

// Create video upload mutation
export function useCreateVideoUpload() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (videoData: {
      title?: string
      description?: string
      tags?: string[]
      metadata?: Record<string, any>
      public?: boolean
    }) => {
      return apiVideoService.createVideoUpload(videoData)
    },
    onSuccess: (data) => {
      // Invalidate video queries
      queryClient.invalidateQueries({ queryKey: apiVideoKeys.videos() })
      queryClient.invalidateQueries({ queryKey: apiVideoKeys.video(data.videoId) })
    },
    onError: (error: any) => {
      console.error("Create video upload error:", error)
    },
  })
}

// Upload video file mutation
export function useUploadVideoFile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      uploadUrl,
      file,
      onProgress,
    }: {
      uploadUrl: string
      file: File
      onProgress?: (progress: number) => void
    }) => {
      return apiVideoService.uploadVideoFile(uploadUrl, file, onProgress)
    },
    onSuccess: (_, variables) => {
      // Invalidate video queries after successful upload
      queryClient.invalidateQueries({ queryKey: apiVideoKeys.videos() })
    },
    onError: (error: any) => {
      console.error("Upload video file error:", error)
    },
  })
}

// Delete video mutation
export function useDeleteVideo() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (videoId: string) => {
      return apiVideoService.deleteVideo(videoId)
    },
    onSuccess: (_, videoId) => {
      // Remove video from cache
      queryClient.removeQueries({ queryKey: apiVideoKeys.video(videoId) })
      queryClient.removeQueries({ queryKey: apiVideoKeys.status(videoId) })
      queryClient.invalidateQueries({ queryKey: apiVideoKeys.videos() })
    },
    onError: (error: any) => {
      console.error("Delete video error:", error)
    },
  })
}

// Combined video upload hook
export function useVideoUpload() {
  const createUpload = useCreateVideoUpload()
  const uploadFile = useUploadVideoFile()

  const uploadVideo = async (
    file: File,
    videoData: {
      title?: string
      description?: string
      tags?: string[]
      metadata?: Record<string, any>
      public?: boolean
    },
    onProgress?: (progress: number) => void
  ) => {
    // Step 1: Create video upload
    const uploadResponse = await createUpload.mutateAsync(videoData)

    // Step 2: Upload the file
    await uploadFile.mutateAsync({
      uploadUrl: uploadResponse.uploadUrl,
      file,
      onProgress,
    })

    return uploadResponse.videoId
  }

  return {
    uploadVideo,
    isCreating: createUpload.isPending,
    isUploading: uploadFile.isPending,
    error: createUpload.error || uploadFile.error,
  }
} 