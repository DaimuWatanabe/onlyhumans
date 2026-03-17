'use server'

import { createClient } from '@/lib/supabase/server'
import type { ActionResult, Profile } from '@/lib/types'

// ===== プロフィール更新 =====
export async function updateProfile(params: {
  displayName?: string
  bio?: string
  websiteUrl?: string
  avatarUrl?: string
}): Promise<ActionResult<Profile>> {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { success: false, error: 'ログインが必要です' }
  }

  const updateData: Record<string, string | null | undefined> = {}
  if (params.displayName !== undefined) updateData.display_name = params.displayName
  if (params.bio !== undefined) updateData.bio = params.bio
  if (params.websiteUrl !== undefined) updateData.website_url = params.websiteUrl
  if (params.avatarUrl !== undefined) updateData.avatar_url = params.avatarUrl

  const { data, error } = await supabase
    .from('profiles')
    .update(updateData)
    .eq('id', user.id)
    .select()
    .single()

  if (error) {
    return { success: false, error: error.message }
  }

  return {
    success: true,
    data: {
      id: data.id,
      username: data.username,
      displayName: data.display_name,
      avatarUrl: data.avatar_url,
      bio: data.bio,
      websiteUrl: data.website_url,
      isVerified: data.is_verified,
      followerCount: data.follower_count,
      followingCount: data.following_count,
      imageCount: data.image_count,
      createdAt: data.created_at,
    },
  }
}

// ===== フォロー/アンフォローのトグル =====
export async function toggleFollow(
  targetUserId: string
): Promise<ActionResult<{ following: boolean }>> {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { success: false, error: 'ログインが必要です' }
  }

  if (user.id === targetUserId) {
    return { success: false, error: '自分自身はフォローできません' }
  }

  // 既にフォロー中か確認
  const { data: existing } = await supabase
    .from('follows')
    .select('id')
    .eq('follower_id', user.id)
    .eq('following_id', targetUserId)
    .single()

  if (existing) {
    // アンフォロー
    const { error } = await supabase.from('follows').delete().eq('id', existing.id)
    if (error) return { success: false, error: error.message }
    return { success: true, data: { following: false } }
  } else {
    // フォロー
    const { error } = await supabase
      .from('follows')
      .insert({ follower_id: user.id, following_id: targetUserId })
    if (error) return { success: false, error: error.message }
    return { success: true, data: { following: true } }
  }
}

// ===== ユーザー名でプロフィール取得 =====
export async function getProfileByUsername(
  username: string
): Promise<ActionResult<Profile & { isFollowing: boolean }>> {
  const supabase = await createClient()

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', username)
    .single()

  if (error || !profile) {
    return { success: false, error: 'ユーザーが見つかりません' }
  }

  // 現在のユーザーがフォロー中か確認
  const {
    data: { user },
  } = await supabase.auth.getUser()

  let isFollowing = false
  if (user && user.id !== profile.id) {
    const { data: follow } = await supabase
      .from('follows')
      .select('id')
      .eq('follower_id', user.id)
      .eq('following_id', profile.id)
      .single()
    isFollowing = !!follow
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
      isFollowing,
    },
  }
}
