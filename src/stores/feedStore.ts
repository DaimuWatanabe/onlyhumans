import { create } from 'zustand'
import { PinCardData } from '@/types/pin'

interface FeedStore {
  pins: PinCardData[]
  nextCursor: string | null
  isLoading: boolean
  hasMore: boolean
  activeCategory: string

  setActiveCategory: (category: string) => void
  fetchPins: (reset?: boolean) => Promise<void>
}

export const useFeedStore = create<FeedStore>((set, get) => ({
  pins: [],
  nextCursor: null,
  isLoading: false,
  hasMore: true,
  activeCategory: 'All',

  setActiveCategory: (category) => {
    set({ activeCategory: category, pins: [], nextCursor: null, hasMore: true })
    get().fetchPins(true)
  },

  fetchPins: async (reset = false) => {
    const { isLoading, hasMore, nextCursor } = get()
    if (isLoading || (!reset && !hasMore)) return

    set({ isLoading: true })

    try {
      const params = new URLSearchParams({ limit: '20' })
      if (!reset && nextCursor) {
        params.set('cursor', nextCursor)
      }

      const response = await fetch(`/api/pins?${params}`)
      const data = await response.json()

      set((state) => ({
        pins: reset ? data.pins : [...state.pins, ...data.pins],
        nextCursor: data.nextCursor,
        hasMore: !!data.nextCursor,
        isLoading: false,
      }))
    } catch (error) {
      console.error('フィード取得エラー:', error)
      set({ isLoading: false })
    }
  },
}))
