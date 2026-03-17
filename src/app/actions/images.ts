'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import type { ActionResult, Image, ImageCard, CreateImageInput, PaginatedResult } from '@/lib/types'

// ===== 画像作成 =====
// upload/route.ts から呼び出す。Service Role で書き込む。
export async function createImage(
  input: CreateImageInput
): Promise<ActionResult<{ imageId: string }>> {
  try {
    const admin = createAdminClient()

    const { data, error } = await admin
      .from('images')
      .insert({
        user_id: input.userId,
        legacy_pin_id: input.legacyPinId ?? null,
        title: input.title,
        description: input.description ?? null,
        image_url: input.imageUrl,
        storage_path: input.storagePath ?? null,
        width: input.width ?? null,
        height: input.height ?? null,
        file_size: input.fileSize ?? null,
        mime_type: input.mimeType ?? null,
        c2pa_status: input.c2paStatus,
        manifest_json: input.manifestJson ?? null,
        signer_info: input.signerInfo ?? null,
        device_info: input.deviceInfo ?? null,
        software_info: input.softwareInfo ?? null,
        is_ai_flagged: input.isAiFlagged ?? false,
      })
      .select('id')
      .single()

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, data: { imageId: data.id } }
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : '不明なエラー' }
  }
}

// ===== 画像一覧取得（フィード用）=====
export async function getImages(params?: {
  cursor?: string
  limit?: number
  c2paStatus?: string
}): Promise<ActionResult<PaginatedResult<ImageCard>>> {
  const supabase = await createClient()
  const limit = params?.limit ?? 20

  let query = supabase
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
    .order('created_at', { ascending: false })
    .limit(limit + 1) // 次ページあるか確認用に1件多く取得

  if (params?.c2paStatus) {
    query = query.eq('c2pa_status', params.c2paStatus)
  }

  if (params?.cursor) {
    query = query.lt('created_at', params.cursor)
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

// ===== 画像詳細取得 =====
export async function getImageById(imageId: string): Promise<ActionResult<Image>> {
  const supabase = await createClient()

  const { data: img, error } = await supabase
    .from('images')
    .select(`
      *,
      profiles!images_user_id_fkey (
        id,
        username,
        display_name,
        avatar_url
      )
    `)
    .eq('id', imageId)
    .single()

  if (error || !img) {
    return { success: false, error: '画像が見つかりません' }
  }

  // 閲覧者がいいね済みか確認
  const {
    data: { user },
  } = await supabase.auth.getUser()

  let isLiked = false
  if (user) {
    const { data: reaction } = await supabase
      .from('reactions')
      .select('id')
      .eq('image_id', imageId)
      .eq('user_id', user.id)
      .single()
    isLiked = !!reaction
  }

  const profile = Array.isArray(img.profiles) ? img.profiles[0] : img.profiles

  return {
    success: true,
    data: {
      id: img.id,
      userId: img.user_id,
      legacyPinId: img.legacy_pin_id,
      title: img.title,
      description: img.description,
      imageUrl: img.image_url,
      width: img.width,
      height: img.height,
      c2paStatus: img.c2pa_status,
      isAiFlagged: img.is_ai_flagged,
      viewCount: img.view_count,
      likeCount: img.like_count,
      commentCount: img.comment_count,
      saveCount: img.save_count,
      isPublic: img.is_public,
      createdAt: img.created_at,
      author: profile
        ? {
            id: profile.id,
            username: profile.username,
            displayName: profile.display_name,
            avatarUrl: profile.avatar_url,
          }
        : undefined,
      isLiked,
    },
  }
}
