import { apiVideoConfig, validateVideoFile } from './config'

// Types for api.video integration
export interface ApiVideoVideo {
  videoId: string
  title?: string
  description?: string
  tags?: string[]
  metadata?: Record<string, any>
  public?: boolean
  panoramic?: boolean
  mp4Support?: boolean
  playerId?: string
  hls?: string
  dash?: string
  thumbnail?: string
  poster?: string
  duration?: number
  createdAt?: string
  updatedAt?: string
}

export interface ApiVideoUploadResponse {
  videoId: string
  uploadUrl: string
  uploadToken: string
  expiresAt: string
}

export interface ApiVideoUploadProgress {
  videoId: string
  progress: number
  status: 'uploading' | 'processing' | 'ready' | 'failed'
  error?: string
}

// api.video service class
export class ApiVideoService {
  private apiKey: string
  private environment: string
  private baseUrl: string

  constructor() {
    this.apiKey = apiVideoConfig.apiKey
    this.environment = apiVideoConfig.environment
    this.baseUrl = this.environment === 'production' 
      ? 'https://ws.api.video' 
      : 'https://sandbox.api.video'
  }

  // Initialize video upload
  async createVideoUpload(videoData: {
    title?: string
    description?: string
    tags?: string[]
    metadata?: Record<string, any>
    public?: boolean
  }): Promise<ApiVideoUploadResponse> {
    const response = await fetch(`${this.baseUrl}/videos`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(videoData),
    })

    if (!response.ok) {
      throw new Error(`Failed to create video upload: ${response.statusText}`)
    }

    return response.json()
  }

  // Upload video file
  async uploadVideoFile(
    uploadUrl: string, 
    file: File, 
    onProgress?: (progress: number) => void
  ): Promise<void> {
    const validation = validateVideoFile(file)
    if (!validation.isValid) {
      throw new Error(validation.error)
    }

    const chunkSize = apiVideoConfig.upload.chunkSize
    const totalChunks = Math.ceil(file.size / chunkSize)
    let uploadedChunks = 0

    for (let start = 0; start < file.size; start += chunkSize) {
      const end = Math.min(start + chunkSize, file.size)
      const chunk = file.slice(start, end)

      const response = await fetch(uploadUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/octet-stream',
          'Content-Range': `bytes ${start}-${end - 1}/${file.size}`,
        },
        body: chunk,
      })

      if (!response.ok) {
        throw new Error(`Upload failed at chunk ${uploadedChunks + 1}: ${response.statusText}`)
      }

      uploadedChunks++
      if (onProgress) {
        onProgress((uploadedChunks / totalChunks) * 100)
      }
    }
  }

  // Get video details
  async getVideo(videoId: string): Promise<ApiVideoVideo> {
    const response = await fetch(`${this.baseUrl}/videos/${videoId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to get video: ${response.statusText}`)
    }

    return response.json()
  }

  // Get video status
  async getVideoStatus(videoId: string): Promise<{
    status: 'uploading' | 'processing' | 'ready' | 'failed'
    progress?: number
    error?: string
  }> {
    const video = await this.getVideo(videoId)
    
    // Check if video has HLS/DASH URLs (indicating it's ready)
    if (video.hls || video.dash) {
      return { status: 'ready' }
    }

    // Check if video has upload token (still uploading)
    if (video.uploadToken) {
      return { status: 'uploading' }
    }

    // Check if video is processing
    if (video.status === 'processing') {
      return { status: 'processing' }
    }

    return { status: 'failed', error: 'Video processing failed' }
  }

  // Delete video
  async deleteVideo(videoId: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/videos/${videoId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to delete video: ${response.statusText}`)
    }
  }

  // Get video player URL
  getVideoPlayerUrl(videoId: string): string {
    // Prevent server-side calls
    if (typeof window === 'undefined') {
      return ''
    }
    return `https://player.api.video/player/${videoId}`
  }

  // Get video thumbnail URL
  getVideoThumbnailUrl(videoId: string, time?: number): string {
    // Prevent server-side calls
    if (typeof window === 'undefined') {
      return ''
    }
    const timeParam = time ? `&time=${time}` : ''
    return `https://image.api.video/thumbnail/${videoId}?width=320&height=180${timeParam}`
  }

  // Get video poster URL
  getVideoPosterUrl(videoId: string): string {
    // Prevent server-side calls
    if (typeof window === 'undefined') {
      return ''
    }
    return `https://image.api.video/poster/${videoId}`
  }
}

// Create singleton instance (only on client side)
export const apiVideoService = typeof window !== 'undefined' ? new ApiVideoService() : {
  getVideoPosterUrl: () => '',
  getVideoPlayerUrl: () => '',
  getVideoThumbnailUrl: () => '',
} as ApiVideoService 