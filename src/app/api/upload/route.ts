import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient, Prisma } from '@prisma/client'
import { createClient } from '@supabase/supabase-js'
import { verifyC2PA } from '@/lib/c2pa/verify'

// Node.js Runtime を明示（c2pa-node はネイティブバインディングを使用）
export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const title = formData.get('title') as string | null
    const description = formData.get('description') as string | null

    if (!file) {
      return NextResponse.json({ error: 'ファイルが選択されていません' }, { status: 400 })
    }

    if (!title?.trim()) {
      return NextResponse.json({ error: 'タイトルを入力してください' }, { status: 400 })
    }

    // ファイルサイズチェック（20MB上限）
    if (file.size > 20 * 1024 * 1024) {
      return NextResponse.json({ error: 'ファイルサイズは20MB以下にしてください' }, { status: 400 })
    }

    // MIMEタイプチェック
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/tiff']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'JPG, PNG, WebP, TIFFのみ対応しています' },
        { status: 400 }
      )
    }

    // 画像をBufferに変換
    const arrayBuffer = await file.arrayBuffer()
    const imageBuffer = Buffer.from(arrayBuffer)

    // --- C2PA検証パイプライン ---
    const c2paResult = await verifyC2PA(imageBuffer)

    // AI生成コンテンツは拒否
    if (c2paResult.status === 'rejected_ai') {
      return NextResponse.json(
        {
          error: 'AI生成コンテンツは投稿できません',
          c2paStatus: 'rejected_ai',
          reason: c2paResult.reason,
        },
        { status: 403 }
      )
    }

    // Supabase Storage への保存（Supabase設定済みの場合のみ）
    let imageUrl = ''
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (supabaseUrl && supabaseKey) {
      const supabase = createClient(supabaseUrl, supabaseKey)

      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${file.type.split('/')[1]}`
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('pins')
        .upload(fileName, imageBuffer, {
          contentType: file.type,
          upsert: false,
        })

      if (uploadError) {
        return NextResponse.json({ error: 'ファイルの保存に失敗しました' }, { status: 500 })
      }

      const { data: urlData } = supabase.storage
        .from('pins')
        .getPublicUrl(uploadData.path)

      imageUrl = urlData.publicUrl
    } else {
      // Supabase未設定時はデモ用URLを返す
      imageUrl = `https://picsum.photos/seed/${Date.now()}/400/600`
    }

    // --- DB登録（Prisma使用）---
    // Supabase設定済みの場合のみ実際にDBに保存
    let pinId = `demo-${Date.now()}`

    if (process.env.DATABASE_URL) {
      const prisma = new PrismaClient()

      try {
        const pin = await prisma.pin.create({
          data: {
            // デモ用固定ユーザーID（実装時はセッションから取得）
            userId: 'demo-user',
            title: title.trim(),
            description: description?.trim() || null,
            imageUrl,
            c2paStatus: c2paResult.status,
            ...(c2paResult.status === 'verified_human' && {
              provenanceData: {
                create: {
                  manifestJson: c2paResult.manifestJson as Prisma.InputJsonValue,
                  signerInfo: (c2paResult.signerInfo ?? {}) as Prisma.InputJsonValue,
                  deviceInfo: (c2paResult.deviceInfo ?? {}) as Prisma.InputJsonValue,
                  softwareInfo: (c2paResult.softwareInfo ?? {}) as Prisma.InputJsonValue,
                  isAiFlagged: false,
                },
              },
            }),
          },
        })
        pinId = pin.id
      } finally {
        await prisma.$disconnect()
      }
    }

    return NextResponse.json({
      success: true,
      pinId,
      imageUrl,
      c2paStatus: c2paResult.status,
      message:
        c2paResult.status === 'verified_human'
          ? '人間が作成したことが確認されました'
          : 'アップロードが完了しました（C2PAデータなし）',
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'サーバーエラーが発生しました' }, { status: 500 })
  }
}
