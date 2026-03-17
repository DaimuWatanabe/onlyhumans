'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ShieldCheck, Loader2 } from 'lucide-react'
import Link from 'next/link'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    if (password.length < 8) {
      setError('パスワードは8文字以上にしてください')
      setIsLoading(false)
      return
    }

    try {
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { username },
        },
      })

      if (authError) {
        setError(authError.message)
        return
      }

      // Prisma users テーブルにレコードを作成
      if (authData.user) {
        await fetch('/api/auth/create-user', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: authData.user.id,
            email,
            username,
            displayName: username,
          }),
        })
      }

      setSuccess(true)
    } catch {
      setError('登録に失敗しました。もう一度お試しください。')
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <ShieldCheck className="h-16 w-16 text-emerald-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">確認メールを送りました！</h2>
          <p className="text-muted-foreground text-sm mb-4">
            {email} に確認メールを送りました。
            <br />
            メール内のリンクをクリックして登録を完了してください。
          </p>
          <Link href="/login">
            <Button variant="outline" className="rounded-full">
              ログインページへ
            </Button>
          </Link>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        className="w-full max-w-sm"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <ShieldCheck className="h-8 w-8 text-emerald-500" />
            <span className="text-2xl font-semibold">Only Human</span>
          </div>
          <p className="text-muted-foreground text-sm">人間の創造性だけが集まる場所</p>
        </div>

        {/* Form */}
        <div className="bg-card rounded-2xl p-6 border border-border shadow-sm">
          <h1 className="text-xl font-semibold mb-6">新規登録</h1>

          {error && (
            <p className="text-destructive text-sm mb-4 p-3 bg-destructive/10 rounded-lg">
              {error}
            </p>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="username">ユーザー名</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                placeholder="your_username"
                required
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="email">メールアドレス</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="password">パスワード（8文字以上）</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={8}
                className="mt-1"
              />
            </div>

            <Button type="submit" className="w-full rounded-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  登録中...
                </>
              ) : (
                '無料で登録する'
              )}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            アカウントをお持ちの方は{' '}
            <Link href="/login" className="text-foreground font-medium hover:underline">
              ログイン
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
