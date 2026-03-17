'use server'

import { createClient } from '@/lib/supabase/server'
import type { ActionResult, Profile } from '@/lib/types'

// ===== サインアップ =====
// Supabase Auth でユーザーを作成する。
// profilesレコードは handle_new_user トリガーで自動生成される。
export async function signUp(
  email: string,
  password: string,
  username: string
): Promise<ActionResult<{ userId: string }>> {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { username },
    },
  })

  if (error) {
    return { success: false, error: error.message }
  }

  if (!data.user) {
    return { success: false, error: 'ユーザーの作成に失敗しました' }
  }

  return { success: true, data: { userId: data.user.id } }
}

// ===== サインイン =====
export async function signIn(
  email: string,
  password: string
): Promise<ActionResult<{ userId: string }>> {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true, data: { userId: data.user.id } }
}

// ===== サインアウト =====
export async function signOut(): Promise<ActionResult> {
  const supabase = await createClient()
  const { error } = await supabase.auth.signOut()

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true, data: undefined }
}

// ===== 現在ログイン中のプロフィール取得 =====
export async function getCurrentProfile(): Promise<ActionResult<Profile>> {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { success: false, error: '未ログインです' }
  }

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (error || !profile) {
    return { success: false, error: 'プロフィールが見つかりません' }
  }

  return {
    success: true,
    data: {
      id: profile.id,
      username: profile.username,
      displayName: profile.display_name,
      avatarUrl: profile.avatar_url,
      bio: profile.bio,
      websiteUrl: profile.website_url,
      isVerified: profile.is_verified,
      followerCount: profile.follower_count,
      followingCount: profile.following_count,
      imageCount: profile.image_count,
      createdAt: profile.created_at,
    },
  }
}
