import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const cursor = searchParams.get('cursor')
  const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50)

  const admin = createAdminClient()

  let query = admin
    .from('images')
    .select(`
      id,
      image_url,
      title,
      c2pa_status,
      created_at,
      profiles!images_user_id_fkey (
        username,
        display_name,
        avatar_url
      )
    `)
    .eq('is_public', true)
    .order('created_at', { ascending: false })
    .limit(limit + 1)

  if (cursor) {
    query = query.lt('created_at', cursor)
  }

  const { data, error } = await query

  if (error) {
    console.error('フィード取得エラー:', error)
    return NextResponse.json({ pins: [], nextCursor: null }, { status: 500 })
  }

  const hasMore = data.length > limit
  const slice = hasMore ? data.slice(0, limit) : data
  const nextCursor = hasMore ? slice[slice.length - 1].created_at : null

  return NextResponse.json({
    pins: slice.map((img) => {
      const profile = Array.isArray(img.profiles) ? img.profiles[0] : img.profiles
      return {
        id: img.id,
        image: img.image_url,
        title: img.title,
        c2paStatus: img.c2pa_status,
        author: {
          name: profile?.display_name || profile?.username || 'Unknown',
          avatar: profile?.avatar_url ?? null,
        },
      }
    }),
    nextCursor,
  })
}
