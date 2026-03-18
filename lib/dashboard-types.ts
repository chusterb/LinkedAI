export interface PostHistory {
  id: string
  user_id: string
  idea: string
  post: string
  tone: string
  rating: number | null
  created_at: string
}

export interface Collection {
  id: string
  name: string
}

export type ActiveTab = 'editor' | 'style' | 'history'

export const BORDER = 'rgba(255,255,255,0.07)'
export const MUTED = 'rgba(255,255,255,0.42)'
export const Y = '#EAB308'
export const FONT = 'Syne, sans-serif'
export const ITEMS_PER_PAGE = 10
