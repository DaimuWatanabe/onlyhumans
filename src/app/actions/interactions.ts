'use server'

import { createClient } from '@/lib/supabase/server'
import type { ActionResult, Comment } from '@/lib/types'
import type { ReactionType } from '@/lib/supabase/database.types'

// ===== リアクションのトグル（いいね追加/取り消し）=====
export async function toggleReaction(
  imageId: string,
  type: ReactionType = 'like'
): Promise<ActionResult<{ liked: boolean }>> {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { success: false, error: 'ログインが必要です' }
  }

  // 既存リアクションを確認
  const { data: existing } = await supabase
    .from('reactions')
    .select('id')
    .eq('image_id', imageId)
    .eq('user_id', user.id)
    .single()

  if (existing) {
    // 既にリアクション済みなら削除
    const { error } = await supabase.from('reactions').delete().eq('id', existing.id)
    if (error) return { success: false, error: error.message }
    return { success: true, data: { liked: false } }
  } else {
    // 新規追加
    const { error } = await supabase
      .from('reactions')
      .insert({ image_id: imageId, user_id: user.id, type })
    if (error) return { success: false, error: error.message }
    return { success: true, data: { liked: true } }
  }
}

// ===== コメント追加 =====
export async function addComment(
  imageId: string,
  content: string,
  parentId?: string
): Promise<ActionResult<Comment>> {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { success: false, error: 'ログインが必要です' }
  }

  const trimmed = content.trim()
  if (!trimmed || trimmed.length > 500) {
    return { success: false, error: 'コメントは1〜500文字で入力してください' }
  }

  const { data, error } = await supabase
    .from('comments')
    .insert({
      image_id: imageId,
      user_id: user.id,
      content: trimmed,
      parent_id: parentId ?? null,
    })
    .select(`
      *,
      profiles!comments_user_id_fkey (
        id, username, display_name, avatar_url
      )
    `)
    .single()

  if (error) {
    return { success: false, error: error.message }
  }

  const profile = Array.isArray(data.profiles) ? data.profiles[0] : data.profiles

  return {
    success: true,
    data: {
      id: data.id,
      imageId: data.image_id,
      userId: data.user_id,
      parentId: data.parent_id,
      content: data.content,
      likeCount: data.like_count,
      createdAt: data.created_at,
      author: profile
        ? {
            id: profile.id,
            username: profile.username,
            displayName: profile.display_name,
            avatarUrl: profile.avatar_url,
          }
        : undefined,
    },
  }
}

// ===== コメント削除 =====
export async function deleteComment(commentId: string): Promise<ActionResult> {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { success: false, error: 'ログインが必要です' }
  }

  const { error } = await supabase
    .from('comments')
    .delete()
    .eq('id', commentId)
    .eq('user_id', user.id) // RLSも保護しているが念のため

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true, data: undefined }
}

// ===== コメント一覧取得 =====
export async function getComments(
  imageId: string,
  limit = 20,
  cursor?: string
): Promise<ActionResult<{ comments: Comment[]; nextCursor: string | null }>> {
  const supabase = await createClient()

  let query = supabase
    .from('comments')
    .select(`
      *,
      profiles!comments_user_id_fkey (
        id, username, display_name, avatar_url
      )
    `)
    .eq('image_id', imageId)
    .is('parent_id', null) // トップレベルのコメントのみ
    .order('created_at', { ascending: true })
    .limit(limit + 1)

  if (cursor) {
    query = query.gt('created_at', cursor)
  }

  const { data, error } = await query

  if (error) {
    return { success: false, error: error.message }
  }

  const hasMore = data.length > limit
  const items = hasMore ? data.slice(0, limit) : data
  const nextCursor = hasMore ? items[items.length - 1].created_at : null

  return {
    success: true,
    data: {
      comments: items.map((c) => {
        const profile = Array.isArray(c.profiles) ? c.profiles[0] : c.profiles
        return {
          id: c.id,
          imageId: c.image_id,
          userId: c.user_id,
          parentId: c.parent_id,
          content: c.content,
          likeCount: c.like_count,
          createdAt: c.created_at,
          author: profile
            ? {
                id: profile.id,
                username: profile.username,
                displayName: profile.display_name,
                avatarUrl: profile.avatar_url,
              }
            : undefined,
        }
      }),
      nextCursor,
    },
  }
}

// ===== 閲覧記録 =====
export async function recordView(imageId: string): Promise<ActionResult> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  await supabase.from('view_history').insert({
    image_id: imageId,
    user_id: user?.id ?? null,
  })

  // view_count を +1 する（失敗してもエラー扱いにしない）
  await supabase.rpc('increment_view_count' as never, { p_image_id: imageId }).maybeSingle()

  return { success: true, data: undefined }
}
