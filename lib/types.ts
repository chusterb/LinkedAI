// Shared TypeScript interfaces

export interface PostHistory {
  id: string
  user_id: string
  idea: string
  post: string
  tone: string
  rating: number | null
  created_at: string
}

export interface StyleProfile {
  who?: string
  audience?: string
  style?: string
  formality?: string
  topics?: string
  avoid?: string
  goal?: string
}
