'use client'

import { useState, useEffect } from 'react'
import { X, Plus, Loader2 } from 'lucide-react'
import { getProfileBoards, createBoard, addImageToBoard } from '@/app/actions/boards'
import type { Board } from '@/lib/types'

interface SaveToBoardModalProps {
  imageId: string
  userId: string
  onClose: () => void
}

export function SaveToBoardModal({ imageId, userId, onClose }: SaveToBoardModalProps) {
  const [boards, setBoards] = useState<Board[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)
  const [savedBoards, setSavedBoards] = useState<Set<string>>(new Set())
  const [showNewBoard, setShowNewBoard] = useState(false)
  const [newBoardName, setNewBoardName] = useState('')
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getProfileBoards(userId).then((result) => {
      if (result.success) setBoards(result.data)
      setLoading(false)
    })
  }, [userId])

  async function handleSave(boardId: string) {
    setSaving(boardId)
    setError(null)
    const result = await addImageToBoard(boardId, imageId)
    if (result.success) {
      setSavedBoards((prev) => new Set(prev).add(boardId))
    } else {
      // 既に追加済みの場合も保存済みとして扱う
      if (result.error.includes('すでに')) {
        setSavedBoards((prev) => new Set(prev).add(boardId))
      } else {
        setError(result.error)
      }
    }
    setSaving(null)
  }

  async function handleCreateBoard() {
    if (!newBoardName.trim()) return
    setCreating(true)
    setError(null)
    const result = await createBoard({ name: newBoardName.trim() })
    if (result.success) {
      const newBoard = result.data
      setBoards((prev) => [newBoard, ...prev])
      setNewBoardName('')
      setShowNewBoard(false)
      // 作成と同時に保存
      handleSave(newBoard.id)
    } else {
      setError(result.error)
    }
    setCreating(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/50">
      <div className="bg-background rounded-2xl shadow-xl w-full max-w-sm mx-4 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">ボードに保存</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-secondary transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <p className="text-sm text-destructive mb-3">{error}</p>
        )}

        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {boards.map((board) => (
              <button
                key={board.id}
                onClick={() => handleSave(board.id)}
                disabled={saving === board.id || savedBoards.has(board.id)}
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl hover:bg-secondary transition-colors disabled:opacity-60"
              >
                <div className="text-left">
                  <p className="font-medium text-sm">{board.name}</p>
                  <p className="text-xs text-muted-foreground">{board.imageCount}枚</p>
                </div>
                {saving === board.id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : savedBoards.has(board.id) ? (
                  <span className="text-xs font-medium text-primary">保存済み</span>
                ) : null}
              </button>
            ))}

            {boards.length === 0 && !showNewBoard && (
              <p className="text-sm text-muted-foreground text-center py-4">
                ボードがありません
              </p>
            )}
          </div>
        )}

        {showNewBoard ? (
          <div className="mt-4 space-y-2">
            <input
              type="text"
              value={newBoardName}
              onChange={(e) => setNewBoardName(e.target.value)}
              placeholder="ボード名を入力"
              className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              autoFocus
              onKeyDown={(e) => { if (e.key === 'Enter') handleCreateBoard() }}
            />
            <div className="flex gap-2">
              <button
                onClick={() => { setShowNewBoard(false); setNewBoardName('') }}
                className="flex-1 px-3 py-2 text-sm rounded-lg border border-border hover:bg-secondary transition-colors"
              >
                キャンセル
              </button>
              <button
                onClick={handleCreateBoard}
                disabled={creating || !newBoardName.trim()}
                className="flex-1 px-3 py-2 text-sm rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-60 flex items-center justify-center gap-1"
              >
                {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : '作成して保存'}
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowNewBoard(true)}
            className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-dashed border-border hover:bg-secondary transition-colors text-sm"
          >
            <Plus className="h-4 w-4" />
            新しいボードを作成
          </button>
        )}
      </div>
    </div>
  )
}
