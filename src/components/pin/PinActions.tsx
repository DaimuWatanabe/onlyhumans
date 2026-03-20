'use client'

import { useState } from 'react'
import { Heart, Bookmark, Share2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toggleReaction } from '@/app/actions/interactions'
import { SaveToBoardModal } from './SaveToBoardModal'

interface PinActionsProps {
  imageId: string
  initialLikeCount: number
  initialIsLiked: boolean
  currentUserId: string | null
}

export function PinActions({ imageId, initialLikeCount, initialIsLiked, currentUserId }: PinActionsProps) {
  const router = useRouter()
  const [isLiked, setIsLiked] = useState(initialIsLiked)
  const [likeCount, setLikeCount] = useState(initialLikeCount)
  const [likeLoading, setLikeLoading] = useState(false)
  const [showSaveModal, setShowSaveModal] = useState(false)

  async function handleLike() {
    if (!currentUserId) {
      router.push('/auth/login')
      return
    }
    setLikeLoading(true)
    const prev = isLiked
    // オプティミスティック更新（すぐに画面に反映）
    setIsLiked(!prev)
    setLikeCount((c) => c + (prev ? -1 : 1))

    const result = await toggleReaction(imageId)
    if (!result.success) {
      // 失敗したら元に戻す
      setIsLiked(prev)
      setLikeCount((c) => c + (prev ? 1 : -1))
    }
    setLikeLoading(false)
  }

  function handleSave() {
    if (!currentUserId) {
      router.push('/auth/login')
      return
    }
    setShowSaveModal(true)
  }

  async function handleShare() {
    if (navigator.share) {
      await navigator.share({ url: window.location.href })
    } else {
      await navigator.clipboard.writeText(window.location.href)
    }
  }

  return (
    <>
      <div className="flex items-center gap-3 mt-4">
        {/* いいねボタン */}
        <button
          onClick={handleLike}
          disabled={likeLoading}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-full border border-border hover:bg-secondary transition-colors disabled:opacity-60"
        >
          <Heart
            className={`h-5 w-5 transition-colors ${isLiked ? 'fill-red-500 text-red-500' : ''}`}
          />
          <span className="text-sm font-medium">{likeCount}</span>
        </button>

        {/* 保存ボタン */}
        <button
          onClick={handleSave}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <Bookmark className="h-5 w-5" />
          <span className="text-sm font-semibold">保存</span>
        </button>

        {/* シェアボタン */}
        <button
          onClick={handleShare}
          className="p-2.5 rounded-full border border-border hover:bg-secondary transition-colors"
          aria-label="シェア"
        >
          <Share2 className="h-5 w-5" />
        </button>
      </div>

      {showSaveModal && currentUserId && (
        <SaveToBoardModal
          imageId={imageId}
          userId={currentUserId}
          onClose={() => setShowSaveModal(false)}
        />
      )}
    </>
  )
}
