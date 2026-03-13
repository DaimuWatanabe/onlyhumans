import { useEffect, useRef, useCallback } from 'react'

interface UseInfiniteScrollOptions {
  onLoadMore: () => void
  hasMore: boolean
  isLoading: boolean
  threshold?: number
}

export function useInfiniteScroll({
  onLoadMore,
  hasMore,
  isLoading,
  threshold = 300,
}: UseInfiniteScrollOptions) {
  const sentinelRef = useRef<HTMLDivElement>(null)

  const handleScroll = useCallback(() => {
    if (!sentinelRef.current || isLoading || !hasMore) return

    const rect = sentinelRef.current.getBoundingClientRect()
    if (rect.top <= window.innerHeight + threshold) {
      onLoadMore()
    }
  }, [onLoadMore, hasMore, isLoading, threshold])

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [handleScroll])

  return { sentinelRef }
}
