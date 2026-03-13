import { C2PAStatus } from './c2pa'

export interface PinAuthor {
  id: string
  username: string
  displayName: string | null
  avatarUrl: string | null
}

export interface Pin {
  id: string
  userId: string
  title: string
  description: string | null
  imageUrl: string
  width: number | null
  height: number | null
  c2paStatus: C2PAStatus
  createdAt: string
  author?: PinAuthor
}

export interface PinCardData {
  id: string
  image: string
  title: string
  c2paStatus: C2PAStatus
  author: {
    name: string
    avatar: string | null
  }
}
