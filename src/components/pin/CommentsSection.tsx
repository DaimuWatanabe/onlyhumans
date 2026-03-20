'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Loader2, Trash2, Send } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { getComments, addComment, deleteComment } from '@/app/actions/interactions'
import type { Comment } from '@/lib/types'

interface CommentsSectionProps {
  imageId: string
  currentUserId: string | null
}

export function CommentsSection({ imageId, currentUserId }: CommentsSectionProps) {
  const router = useRouter()
  const [comments, setComments] = useState<Comment[]>([])
  const [nextCursor, setNextCursor] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [text, setText] = useState('')
  const [posting, setPosting] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    getComments(imageId).then((result) => {
      if (result.success) {
        setComments(result.data.comments)
        setNextCursor(result.data.nextCursor)
      }
      setLoading(false)
    })
  }, [imageId])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!text.trim()) return
    if (!currentUserId) {
      router.push('/auth/login')
      return
    }
    setPosting(true)
    const result = await addComment(imageId, text)
    if (result.success) {
      setComments((prev) => [...prev, result.data])
      setText('')
    }
    setPosting(false)
  }

  async function handleDelete(commentId: string) {
    setDeletingId(commentId)
    const result = await deleteComment(commentId)
    if (result.success) {
      setComments((prev) => prev.filter((c) => c.id !== commentId))
    }
    setDeletingId(null)
  }

  async function handleLoadMore() {
    if (!nextCursor) return
    setLoadingMore(true)
    const result = await getComments(imageId, 20, nextCursor)
    if (result.success) {
      setComments((prev) => [...prev, ...result.data.comments])
      setNextCursor(result.data.nextCursor)
    }
    setLoadingMore(false)
  }

  return (
    <div className="mt-6">
      <h2 className="text-base font-semibold mb-4">
        コメント{comments.length > 0 && <span className="text-muted-foreground font-normal ml-2 text-sm">({comments.length}件)</span>}
      </h2>

      {/* コメント投稿フォーム */}
      <form onSubmit={handleSubmit} className="flex gap-2 mb-6">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={currentUserId ? 'コメントを追加...' : 'ログインしてコメントする'}
          maxLength={500}
          className="flex-1 px-3 py-2 text-sm border border-border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-primary"
          onClick={() => { if (!currentUserId) router.push('/auth/login') }}
          readOnly={!currentUserId}
        />
        <button
          type="submit"
          disabled={posting || !text.trim() || !currentUserId}
          className="px-4 py-2 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-60 flex items-center gap-1"
        >
          {posting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </button>
      </form>

      {/* コメント一覧 */}
      {loading ? (
        <div className="flex justify-center py-6">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : comments.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-6">
          まだコメントがありません
        </p>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div key={comment.id} className="flex gap-3">
              {/* アバター */}
              <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center overflow-hidden shrink-0">
                {comment.author?.avatarUrl ? (
                  <Image
                    src={comment.author.avatarUrl}
                    alt={comment.author.displayName || comment.author.username}
                    width={32}
                    height={32}
                    className="rounded-full object-cover"
                    unoptimized
                  />
                ) : (
                  <span className="text-xs font-medium text-muted-foreground">
                    {(comment.author?.displayName || comment.author?.username || '?').charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              {/* コメント本文 */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-sm font-medium">
                      {comment.author?.displayName || comment.author?.username || '不明'}
                    </span>
                    <p className="text-sm text-foreground mt-0.5 break-words">{comment.content}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(comment.createdAt).toLocaleDateString('ja-JP')}
                    </p>
                  </div>
                  {/* 自分のコメントは削除可能 */}
                  {currentUserId === comment.userId && (
                    <button
                      onClick={() => handleDelete(comment.id)}
                      disabled={deletingId === comment.id}
                      className="p-1 rounded hover:bg-secondary transition-colors shrink-0"
                      aria-label="削除"
                    >
                      {deletingId === comment.id ? (
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                      ) : (
                        <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive transition-colors" />
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}

          {nextCursor && (
            <button
              onClick={handleLoadMore}
              disabled={loadingMore}
              className="w-full py-2 text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center gap-2"
            >
              {loadingMore ? <Loader2 className="h-4 w-4 animate-spin" /> : 'もっと見る'}
            </button>
          )}
        </div>
      )}
    </div>
  )
}
