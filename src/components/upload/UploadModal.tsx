'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, X, ShieldCheck, AlertCircle, Loader2, Image as ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { C2PAStatus } from '@/types/c2pa'

interface UploadModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

type UploadState =
  | { phase: 'idle' }
  | { phase: 'selected'; file: File; preview: string }
  | { phase: 'verifying' }
  | { phase: 'verified'; c2paStatus: C2PAStatus; file: File; preview: string }
  | { phase: 'rejected'; reason: string }
  | { phase: 'uploading' }
  | { phase: 'done' }
  | { phase: 'error'; message: string }

export function UploadModal({ isOpen, onClose, onSuccess }: UploadModalProps) {
  const [state, setState] = useState<UploadState>({ phase: 'idle' })
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')

  const handleFileSelect = useCallback(async (file: File) => {
    const preview = URL.createObjectURL(file)
    setState({ phase: 'selected', file, preview })
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      const file = e.dataTransfer.files[0]
      if (file && file.type.startsWith('image/')) {
        handleFileSelect(file)
      }
    },
    [handleFileSelect]
  )

  const handleVerifyAndUpload = async () => {
    if (state.phase !== 'selected' && state.phase !== 'verified') return
    if (!title.trim()) return

    const file = state.phase === 'selected' ? state.file : state.file

    setState({ phase: 'verifying' })

    const formData = new FormData()
    formData.append('file', file)
    formData.append('title', title)
    formData.append('description', description)

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      if (!response.ok) {
        if (result.c2paStatus === 'rejected_ai') {
          setState({ phase: 'rejected', reason: result.reason || 'AI生成コンテンツが検出されました' })
        } else {
          setState({ phase: 'error', message: result.error || 'アップロードに失敗しました' })
        }
        return
      }

      setState({ phase: 'done' })
      onSuccess?.()
      setTimeout(() => {
        onClose()
        setState({ phase: 'idle' })
        setTitle('')
        setDescription('')
      }, 2000)
    } catch {
      setState({ phase: 'error', message: 'ネットワークエラーが発生しました' })
    }
  }

  const handleClose = () => {
    if (state.phase === 'uploading' || state.phase === 'verifying') return
    onClose()
    setState({ phase: 'idle' })
    setTitle('')
    setDescription('')
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-foreground/50 backdrop-blur-sm"
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            className="relative w-full max-w-lg bg-background rounded-2xl shadow-2xl p-6 z-10"
            initial={{ scale: 0.95, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 20 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">作品を投稿</h2>
              <button
                onClick={handleClose}
                className="p-2 rounded-full hover:bg-secondary transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            {(state.phase === 'idle' || state.phase === 'selected') && (
              <div className="space-y-4">
                {/* Drop Zone */}
                <div
                  className="border-2 border-dashed border-border rounded-xl p-8 text-center cursor-pointer hover:border-primary/50 hover:bg-secondary/30 transition-all"
                  onDrop={handleDrop}
                  onDragOver={(e) => e.preventDefault()}
                  onClick={() => document.getElementById('file-input')?.click()}
                >
                  {state.phase === 'selected' ? (
                    <div className="flex flex-col items-center gap-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={state.preview}
                        alt="プレビュー"
                        className="max-h-48 rounded-lg object-contain"
                      />
                      <p className="text-sm text-muted-foreground">{state.file.name}</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-3 text-muted-foreground">
                      <ImageIcon className="h-12 w-12" />
                      <p className="font-medium">ここに画像をドロップ</p>
                      <p className="text-sm">または クリックして選択</p>
                      <p className="text-xs">JPG, PNG, WebP, TIFF対応</p>
                    </div>
                  )}
                </div>
                <input
                  id="file-input"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleFileSelect(file)
                  }}
                />

                {/* Title & Description */}
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="title">タイトル *</Label>
                    <Input
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="作品のタイトル"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">説明（任意）</Label>
                    <Input
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="作品について..."
                      className="mt-1"
                    />
                  </div>
                </div>

                <Button
                  onClick={handleVerifyAndUpload}
                  disabled={state.phase === 'idle' || !title.trim()}
                  className="w-full rounded-full"
                >
                  C2PA検証して投稿
                </Button>
              </div>
            )}

            {/* Verifying */}
            {state.phase === 'verifying' && (
              <div className="flex flex-col items-center gap-4 py-8">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <p className="font-medium">C2PA検証中...</p>
                <p className="text-sm text-muted-foreground text-center">
                  画像に人間が作成したという証明データが含まれているか確認しています
                </p>
              </div>
            )}

            {/* Rejected */}
            {state.phase === 'rejected' && (
              <div className="flex flex-col items-center gap-4 py-8">
                <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center">
                  <AlertCircle className="h-8 w-8 text-red-500" />
                </div>
                <p className="font-semibold text-red-600">AI生成コンテンツを検出</p>
                <p className="text-sm text-muted-foreground text-center">{state.reason}</p>
                <p className="text-xs text-muted-foreground text-center">
                  Only Humanは人間が作成したコンテンツのみを受け付けています。
                </p>
                <Button
                  variant="outline"
                  onClick={() => setState({ phase: 'idle' })}
                  className="rounded-full"
                >
                  別の画像を選ぶ
                </Button>
              </div>
            )}

            {/* Done */}
            {state.phase === 'done' && (
              <div className="flex flex-col items-center gap-4 py-8">
                <div className="h-16 w-16 rounded-full bg-emerald-100 flex items-center justify-center">
                  <ShieldCheck className="h-8 w-8 text-emerald-500" />
                </div>
                <p className="font-semibold text-emerald-600">投稿完了！</p>
                <p className="text-sm text-muted-foreground">作品がフィードに追加されました</p>
              </div>
            )}

            {/* Error */}
            {state.phase === 'error' && (
              <div className="flex flex-col items-center gap-4 py-8">
                <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center">
                  <AlertCircle className="h-8 w-8 text-red-500" />
                </div>
                <p className="font-semibold">エラーが発生しました</p>
                <p className="text-sm text-muted-foreground text-center">{state.message}</p>
                <Button
                  variant="outline"
                  onClick={() => setState({ phase: 'idle' })}
                  className="rounded-full"
                >
                  もう一度試す
                </Button>
              </div>
            )}

            {/* Uploading */}
            {state.phase === 'uploading' && (
              <div className="flex flex-col items-center gap-4 py-8">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <p className="font-medium">アップロード中...</p>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
