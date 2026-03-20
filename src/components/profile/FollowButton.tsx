'use client'

import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { toggleFollow } from '@/app/actions/profile'

interface FollowButtonProps {
  targetUserId: string
  initialIsFollowing: boolean
}

export function FollowButton({ targetUserId, initialIsFollowing }: FollowButtonProps) {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing)
  const [loading, setLoading] = useState(false)

  async function handleClick() {
    setLoading(true)
    const prev = isFollowing
    setIsFollowing(!prev)
    const result = await toggleFollow(targetUserId)
    if (!result.success) {
      setIsFollowing(prev)
    }
    setLoading(false)
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={`px-6 py-2.5 rounded-full font-semibold text-sm transition-colors disabled:opacity-60 flex items-center gap-2 ${
        isFollowing
          ? 'border border-border hover:bg-secondary'
          : 'bg-primary text-primary-foreground hover:bg-primary/90'
      }`}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {isFollowing ? 'フォロー中' : 'フォローする'}
    </button>
  )
}
