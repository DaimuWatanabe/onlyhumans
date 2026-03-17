'use server'

import { createClient } from '@/lib/supabase/server'
import type { ActionResult, ImageCard, PaginatedResult } from '@/lib/types'

// ===== 画像テキスト検索 =====
export async function searchImages(
  query: string,
  limit = 20,
  cursor?: string
): Promise<ActionResult<PaginatedResult<ImageCard>>> {
  const supabase = await createClient()

  const trimmed = query.trim()
  if (!trimmed) {
    return { success: false, error: '検索ワードを入力してください' }
  }

  let dbQuery = supabase
    .from('images')
    .select(`
      id,
      image_url,
      title,
      c2pa_status,
      like_count,
      created_at,
      profiles!images_user_id_fkey (
        username,
        display_name,
        avatar_url
      )
    `)
    .eq('is_public', true)
    .or(`title.ilike.%${trimmed}%,description.ilike.%${trimmed}%`)
    .order('created_at', { ascending: false })
    .limit(limit + 1)

  if (cursor) {
    dbQuery = dbQuery.lt('created_at', cursor)
  }

  const { data, error } = await dbQuery

  if (error) {
    return { success: false, error: error.message }
  }

  const hasMore = data.length > limit
  const items = hasMore ? data.slice(0, limit) : data
  const nextCursor = hasMore ? items[items.length - 1].created_at : null

  return {
    success: true,
    data: {
      items: items.map((img) => {
        const profile = Array.isArray(img.profiles) ? img.profiles[0] : img.profiles
        return {
          id: img.id,
          imageUrl: img.image_url,
          title: img.title,
          c2paStatus: img.c2pa_status,
          likeCount: img.like_count,
          author: {
            username: profile?.username ?? 'unknown',
            displayName: profile?.display_name ?? null,
            avatarUrl: profile?.avatar_url ?? null,
          },
        }
      }),
      nextCursor,
      hasMore,
    },
  }
}

// ===== タグで画像を検索 =====
export async function searchByTag(
  tagName: string,
  limit = 20,
  cursor?: string
): Promise<ActionResult<PaginatedResult<ImageCard>>> {
  const supabase = await createClient()

  // タグIDを取得
  const { data: tag, error: tagError } = await supabase
    .from('tags')
    .select('id')
    .eq('name', tagName.toLowerCase())
    .single()

  if (tagError || !tag) {
    return { success: false, error: `タグ「${tagName}」が見つかりません` }
  }

  let dbQuery = supabase
    .from('images')
    .select(`
      id,
      image_url,
      title,
      c2pa_status,
      like_count,
      created_at,
      profiles!images_user_id_fkey (
        username,
        display_name,
        avatar_url
      ),
      image_tags!inner (
        tag_id
      )
    `)
    .eq('is_public', true)
    .eq('image_tags.tag_id', tag.id)
    .order('created_at', { ascending: false })
    .limit(limit + 1)

  if (cursor) {
    dbQuery = dbQuery.lt('created_at', cursor)
  }

  const { data, error } = await dbQuery

  if (error) {
    return { success: false, error: error.message }
  }

  const hasMore = data.length > limit
  const items = hasMore ? data.slice(0, limit) : data
  const nextCursor = hasMore ? items[items.length - 1].created_at : null

  return {
    success: true,
    data: {
      items: items.map((img) => {
        const profile = Array.isArray(img.profiles) ? img.profiles[0] : img.profiles
        return {
          id: img.id,
          imageUrl: img.image_url,
          title: img.title,
          c2paStatus: img.c2pa_status,
          likeCount: img.like_count,
          author: {
            username: profile?.username ?? 'unknown',
            displayName: profile?.display_name ?? null,
            avatarUrl: profile?.avatar_url ?? null,
          },
        }
      }),
      nextCursor,
      hasMore,
    },
  }
}

// ===== 検索履歴を保存 =====
export async function saveSearchHistory(
  query: string,
  resultCount?: number
): Promise<ActionResult> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // 未ログインは保存しない（エラーにはしない）
  if (!user) return { success: true, data: undefined }

  await supabase.from('search_history').insert({
    user_id: user.id,
    query: query.trim(),
    result_count: resultCount ?? null,
  })

  return { success: true, data: undefined }
}

// ===== 検索履歴取得 =====
export async function getSearchHistory(
  limit = 10
): Promise<ActionResult<{ id: string; query: string; searchedAt: string }[]>> {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { success: false, error: 'ログインが必要です' }
  }

  const { data, error } = await supabase
    .from('search_history')
    .select('id, query, searched_at')
    .eq('user_id', user.id)
    .order('searched_at', { ascending: false })
    .limit(limit)

  if (error) {
    return { success: false, error: error.message }
  }

  return {
    success: true,
    data: data.map((h) => ({
      id: h.id,
      query: h.query,
      searchedAt: h.searched_at,
    })),
  }
}
