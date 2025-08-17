export interface Creator {
  id: string
  name: string
  avatar: string
}

export interface Post {
  id: string
  creator: Creator
  content: string
  image: string
  createdAt: Date
  likes: number
  isPremium: boolean
  comments: any[]
}

export interface SuggestionUser {
  id: string
  name: string
  username: string
  avatar: string
  banner?: string
  expired?: boolean
}
