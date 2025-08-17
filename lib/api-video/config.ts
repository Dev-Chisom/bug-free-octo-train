// api.video configuration
export const apiVideoConfig = {
  // Environment variables for api.video
  apiKey: process.env.NEXT_PUBLIC_API_VIDEO_API_KEY || '',
  environment: process.env.NEXT_PUBLIC_API_VIDEO_ENVIRONMENT || 'sandbox', // 'sandbox' | 'production'
  
  // Player configuration
  player: {
    autoplay: false,
    muted: true,
    controls: true,
    loop: false,
    preload: 'metadata',
    poster: '',
    width: '100%',
    height: '100%',
  },
  
  // Upload configuration
  upload: {
    maxFileSize: 100 * 1024 * 1024, // 100MB
    allowedTypes: ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'],
    chunkSize: 5 * 1024 * 1024, // 5MB chunks
  },
  
  // Video processing settings
  processing: {
    generateThumbnails: true,
    generatePoster: true,
    quality: 'medium', // 'low' | 'medium' | 'high'
  }
}

// Helper function to get api.video client
export const getApiVideoClient = () => {
  if (!apiVideoConfig.apiKey) {
    throw new Error('API Video API key is required. Please set NEXT_PUBLIC_API_VIDEO_API_KEY environment variable.')
  }
  
  return {
    apiKey: apiVideoConfig.apiKey,
    environment: apiVideoConfig.environment,
  }
}

// Helper function to validate video file
export const validateVideoFile = (file: File): { isValid: boolean; error?: string } => {
  const maxSize = apiVideoConfig.upload.maxFileSize
  const allowedTypes = apiVideoConfig.upload.allowedTypes
  
  if (file.size > maxSize) {
    return { 
      isValid: false, 
      error: `File size exceeds ${Math.round(maxSize / (1024 * 1024))}MB limit` 
    }
  }
  
  if (!allowedTypes.includes(file.type)) {
    return { 
      isValid: false, 
      error: `File type ${file.type} is not supported. Supported types: ${allowedTypes.join(', ')}` 
    }
  }
  
  return { isValid: true }
} 