'use server'

import { createClient } from '@/lib/supabase/server'
import type { ActionResult, Board } from '@/lib/types'

// ===== ボード作成 =====
export async function createBoard(params: {
  name: string
  description?: string
  isPrivate?: boolean
}): Promise<ActionResult<Board>> {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { success: false, error: 'ログインが必要です' }
  }

  const { data, error } = await supabase
    .from('boards')
    .insert({
      user_id: user.id,
      name: params.name,
      description: params.description ?? null,
      is_private: params.isPrivate ?? false,
    })
    .select()
    .single()

  if (error) {
    return { success: false, error: error.message }
  }

  return {
    success: true,
    data: {
      id: data.id,
      userId: data.user_id,
      name: data.name,
      description: data.description,
      coverImageUrl: data.cover_image_url,
      isPrivate: data.is_private,
      imageCount: data.image_count,
      createdAt: data.created_at,
    },
  }
}

// ===== ボードに画像を追加 =====
export async function addImageToBoard(
  boardId: string,
  imageId: string
): Promise<ActionResult<{ id: string }>> {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { success: false, error: 'ログインが必要です' }
  }

  // ボードの所有者確認
  const { data: board } = await supabase
    .from('boards')
    .select('user_id')
    .eq('id', boardId)
    .single()

  if (!board || board.user_id !== user.id) {
    return { success: false, error: 'このボードを編集する権限がありません' }
  }

  const { data, error } = await supabase
    .from('board_images')
    .insert({ board_id: boardId, image_id: imageId })
    .select('id')
    .single()

  if (error) {
    // UNIQUE制約違反（既に追加済み）は正常として扱う
    if (error.code === '23505') {
      return { success: false, error: 'この画像はすでにボードに追加されています' }
    }
    return { success: false, error: error.message }
  }

  return { success: true, data: { id: data.id } }
}

// ===== ボードから画像を削除 =====
export async function removeImageFromBoard(
  boardId: string,
  imageId: string
): Promise<ActionResult> {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { success: false, error: 'ログインが必要です' }
  }

  const { error } = await supabase
    .from('board_images')
    .delete()
    .eq('board_id', boardId)
    .eq('image_id', imageId)

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true, data: undefined }
}

// ===== ユーザーのボード一覧取得 =====
export async function getProfileBoards(
  userId: string
): Promise<ActionResult<Board[]>> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const isOwner = user?.id === userId

  let query = supabase
    .from('boards')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  // 自分のボードでなければ非公開を除外
  if (!isOwner) {
    query = query.eq('is_private', false)
  }

  const { data, error } = await query

  if (error) {
    return { success: false, error: error.message }
  }

  return {
    success: true,
    data: data.map((b) => ({
      id: b.id,
      userId: b.user_id,
      name: b.name,
      description: b.description,
      coverImageUrl: b.cover_image_url,
      isPrivate: b.is_private,
      imageCount: b.image_count,
      createdAt: b.created_at,
    })),
  }
}
