'use client'

import { useEffect, useState } from 'react'
import { Header } from '@/components/layout/Header'
import { CategoryFilter } from '@/components/feed/CategoryFilter'
import { MasonryGrid } from '@/components/feed/MasonryGrid'
import { SkeletonGrid } from '@/components/feed/SkeletonCard'
import { UploadModal } from '@/components/upload/UploadModal'
import { useFeedStore } from '@/stores/feedStore'
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll'
import { createClient } from '@/lib/supabase/client'
import { Loader2 } from 'lucide-react'

const CATEGORIES = [
  'All',
  'Photography',
  'Digital Art',
  'Oil Painting',
  'Watercolor',
  'Sculpture',
  'Illustration',
]

export default function Home() {
  const { pins, isLoading, hasMore, activeCategory, setActiveCategory, fetchPins } = useFeedStore()
  const [isUploadOpen, setIsUploadOpen] = useState(false)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      setCurrentUserId(user?.id ?? null)
    })
  }, [])

  useEffect(() => {
    if (pins.length === 0) {
      fetchPins(true)
    }
  }, [pins.length, fetchPins])

  const { sentinelRef } = useInfiniteScroll({
    onLoadMore: () => fetchPins(),
    hasMore,
    isLoading,
  })

  const isInitialLoad = isLoading && pins.length === 0

  return (
    <main className="min-h-screen bg-background">
      <Header onUploadClick={() => setIsUploadOpen(true)} />

      {/* Category Filter */}
      <div className="sticky top-16 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 py-4 border-b border-border">
        <CategoryFilter
          categories={CATEGORIES}
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
        />
      </div>

      {/* Main Feed */}
      <div className="py-6">
        {isInitialLoad ? (
          <SkeletonGrid />
        ) : (
          <>
            <MasonryGrid pins={pins} currentUserId={currentUserId} />

            {/* Load More Sentinel */}
            <div ref={sentinelRef} className="h-4" />

            {/* Loading Spinner */}
            {isLoading && pins.length > 0 && (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            )}

            {/* End of Feed */}
            {!hasMore && pins.length > 0 && (
              <p className="text-center text-muted-foreground text-sm py-8">
                すべての作品を表示しました
              </p>
            )}
          </>
        )}
      </div>

      {/* C2PA Info Banner */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
        <div className="flex items-center gap-2 px-4 py-2 bg-foreground text-background rounded-full shadow-lg text-sm whitespace-nowrap">
          <span className="font-medium">C2PAで人間の創作を証明</span>
          <span className="text-background/70">•</span>
          <span className="text-background/70">Verified Humanバッジで真正性を確認</span>
        </div>
      </div>

      {/* Upload Modal */}
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onSuccess={() => fetchPins(true)}
      />
    </main>
  )
}
