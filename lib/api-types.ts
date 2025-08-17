// Base API Response wrapper
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: string
  code?: string
}

// Pagination metadata
export interface PaginationMeta {
  page: number
  limit: number
  total: number
  pages: number
}

// User and Auth types
export interface User {
  _id: string
  createdAt: string
  updatedAt: string
  email: string
  name: string
  provider: string
  providerId: string
  refreshToken: string
  status: "active" | "suspended" | "pending"
  creatorProfile?: CreatorProfile
  referralCode?: string
}

export interface CreatorProfile {
  _id: string
  createdAt: string
  updatedAt: string
  displayName: string
  username: string
  bio: string
  profilePicture: string
  bannerImage: string
  location: string
  website: string
  followers: number
  following: number
  status: "requested" | "approved" | "rejected" | "suspended"
  socialMedia: SocialMedia[]
  legal: LegalInfo[]
  suspensionReason?: string
  suspendedAt?: string
}

export interface SocialMedia {
  platform: string
  username: string
  url: string
  verified: boolean
}

export interface LegalInfo {
  type: string
  accepted: boolean
  acceptedAt: string
  version: string
}

// Media types
export interface MediaFile {
  _id: string
  url: string
  type: "image" | "video" | "audio" | "document"
  ext: string
  size: number
  width?: number
  height?: number
  creator: string
  status: "active" | "deleted" | "processing"
  uploadStatus: "uploaded" | "processing" | "failed"
  uploadStartedAt: string
  uploadCompletedAt?: string
  coverUrl?: string
  createdAt: string
  updatedAt: string
}

export interface MediaFilesResponse {
  mediaFiles: MediaFile[]
  pagination: PaginationMeta
}

export interface MediaUploadRequest {
  files: {
    uuid: string
    filename: string
    fileType: string
    size: number
  }[]
}

export interface MediaUploadResponse {
  mediaField: string
  uploadUrl: string
  fileKey: string
}

// Creator types
export interface Creator extends User {
  creatorProfile: CreatorProfile
}

export interface CreatorPreferences {
  _id: string
  creator: string
  pricing: PricingTier[]
  categories: string[]
  availability: {
    timezone: string
    workingHours: {
      start: string
      end: string
    }
    workingDays: string[]
  }
  createdAt: string
  updatedAt: string
}

export interface PricingTier {
  name: string
  description: string
  price: number
  currency: string
  duration: number
  features: string[]
  isActive: boolean
}

// Application types
export interface CreatorApplication {
  personalInfo: {
    fullName: string
    email: string
    phone: string
    dateOfBirth: string
    nationality: string
    address: {
      street: string
      city: string
      state: string
      zipCode: string
      country: string
    }
  }
  creatorInfo: {
    displayName: string
    username: string
    bio: string
    categories: string[]
    experience: string
    portfolio: string[]
    socialMedia: {
      platform: string
      username: string
      followers: number
    }[]
  }
  preferences: {
    pricing: PricingTier[]
    availability: {
      timezone: string
      workingHours: {
        start: string
        end: string
      }
      workingDays: string[]
    }
  }
  legal: {
    termsAccepted: boolean
    privacyAccepted: boolean
    ageVerified: boolean
    backgroundCheck: boolean
  }
}

// Auth types
export interface AuthResponse {
  success: boolean
  data: {
    user: User
    accessToken: string
    refreshToken: string
  }
  message?: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  password: string
  name: string
  username?: string
}

// API Error class
export class ApiError extends Error {
  public status?: number
  public code?: string
  public details?: any

  constructor({
    message,
    status,
    code,
    details,
  }: {
    message: string
    status?: number
    code?: string
    details?: any
  }) {
    super(message)
    this.name = "ApiError"
    this.status = status
    this.code = code
    this.details = details
  }
}

// Request options
export interface RequestOptions extends Omit<RequestInit, "body"> {
  body?: any
}
