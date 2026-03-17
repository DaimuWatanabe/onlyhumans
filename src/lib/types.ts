// アプリ共通型定義
// Server Actions の戻り値や UI コンポーネントで使う型をまとめる

import type { C2paStatus, ReactionType } from './supabase/database.types'

// ===== 共通: ActionResult =====
// 全 Server Actions の戻り値型。成功か失敗かを明確に区別する。
export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string }

// ===== Profile =====
export interface Profile {
  id: string
  username: string
  displayName: string | null
  avatarUrl: string | null
  bio: string | null
  websiteUrl: string | null
  isVerified: boolean
  followerCount: number
  followingCount: number
  imageCount: number
  createdAt: string
}

// ===== Image =====
export interface Image {
  id: string
  userId: string
  legacyPinId: string | null
  title: string
  description: string | null
  imageUrl: string
  width: number | null
  height: number | null
  c2paStatus: C2paStatus
  isAiFlagged: boolean
  viewCount: number
  likeCount: number
  commentCount: number
  saveCount: number
  isPublic: boolean
  createdAt: string
  // 結合データ（取得時に含まれる場合がある）
  author?: Pick<Profile, 'id' | 'username' | 'displayName' | 'avatarUrl'>
  isLiked?: boolean
}

// フィード表示用の軽量型
export interface ImageCard {
  id: string
  imageUrl: string
  title: string
  c2paStatus: C2paStatus
  likeCount: number
  author: {
    username: string
    displayName: string | null
    avatarUrl: string | null
  }
}

// ===== Board =====
export interface Board {
  id: string
  userId: string
  name: string
  description: string | null
  coverImageUrl: string | null
  isPrivate: boolean
  imageCount: number
  createdAt: string
}

// ===== Comment =====
export interface Comment {
  id: string
  imageId: string
  userId: string
  parentId: string | null
  content: string
  likeCount: number
  createdAt: string
  author?: Pick<Profile, 'id' | 'username' | 'displayName' | 'avatarUrl'>
}

// ===== Reaction =====
export interface Reaction {
  id: string
  imageId: string
  userId: string
  type: ReactionType
  createdAt: string
}

// ===== 画像作成時の入力型 =====
export interface CreateImageInput {
  userId: string
  title: string
  description?: string
  imageUrl: string
  storagePath?: string
  width?: number
  height?: number
  fileSize?: number
  mimeType?: string
  c2paStatus: C2paStatus
  manifestJson?: Record<string, unknown>
  signerInfo?: Record<string, unknown>
  deviceInfo?: Record<string, unknown>
  softwareInfo?: Record<string, unknown>
  isAiFlagged?: boolean
  legacyPinId?: string
}

// ===== ページネーション =====
export interface PaginatedResult<T> {
  items: T[]
  nextCursor: string | null
  hasMore: boolean
}
