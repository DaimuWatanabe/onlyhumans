import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Google OAuth 認証後のコールバックを処理するルート
// Supabase が認証コードをここに送り、セッションに変換する
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      return NextResponse.redirect(`${origin}/`)
    }
  }

  // 認証失敗時はログインページへ
  return NextResponse.redirect(`${origin}/login?error=auth_failed`)
}
