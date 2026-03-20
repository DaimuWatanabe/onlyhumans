import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getImageById } from '@/app/actions/images'
import { C2PABadge } from '@/components/pin/C2PABadge'
import { PinActions } from '@/components/pin/PinActions'
import { CommentsSection } from '@/components/pin/CommentsSection'
import { C2PAStatus } from '@/types/c2pa'

interface PinPageProps {
  params: Promise<{ id: string }>
}

export default async function PinPage({ params }: PinPageProps) {
  const { id } = await params
  const result = await getImageById(id)

  if (!result.success) {
    notFound()
  }

  const image = result.data

  // ログイン中ユーザーのIDを取得（Server Componentで）
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const currentUserId = user?.id ?? null

  const deviceInfo = image.author as unknown as { make?: string; model?: string } | null
  const softwareInfo = null as { name?: string } | null
  const signerInfo = null as { name?: string; timestamp?: string } | null

  const authorName = image.author?.displayName || image.author?.username || 'Unknown'
  const authorUsername = image.author?.username || 'unknown'
  const authorAvatar = image.author?.avatarUrl ?? null

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* 画像 */}
          <div className="flex-1">
            <div className="relative rounded-2xl overflow-hidden">
              <Image
                src={image.imageUrl}
                alt={image.title}
                width={600}
                height={800}
                className="w-full h-auto object-cover"
                unoptimized
              />
              <div className="absolute top-4 left-4">
                <C2PABadge status={image.c2paStatus as C2PAStatus} size="md" />
              </div>
            </div>

            {/* コメント欄（画像の下） */}
            <CommentsSection imageId={id} currentUserId={currentUserId} />
          </div>

          {/* サイドバー */}
          <div className="md:w-72 shrink-0">
            <div className="sticky top-24">
              <h1 className="text-2xl font-semibold mb-2">{image.title}</h1>
              {image.description && (
                <p className="text-sm text-muted-foreground mb-4">{image.description}</p>
              )}

              {/* いいね・保存・シェアボタン */}
              <PinActions
                imageId={id}
                initialLikeCount={image.likeCount}
                initialIsLiked={image.isLiked ?? false}
                currentUserId={currentUserId}
              />

              {/* 投稿者 */}
              <Link
                href={`/profile/${authorUsername}`}
                className="flex items-center gap-3 mt-6 hover:opacity-80 transition-opacity"
              >
                <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                  {authorAvatar ? (
                    <Image
                      src={authorAvatar}
                      alt={authorName}
                      width={40}
                      height={40}
                      className="rounded-full object-cover"
                      unoptimized
                    />
                  ) : (
                    <span className="text-sm font-medium">
                      {authorName.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <div>
                  <p className="font-medium">{authorName}</p>
                  <p className="text-sm text-muted-foreground">@{authorUsername}</p>
                </div>
              </Link>

              {/* C2PA認証情報 */}
              <div className="mt-6 p-4 bg-secondary rounded-xl space-y-3">
                <p className="text-sm font-medium">コンテンツ認証</p>
                <C2PABadge status={image.c2paStatus as C2PAStatus} size="md" />

                {image.c2paStatus === 'verified_human' && (
                  <p className="text-xs text-muted-foreground">
                    この作品はC2PA規格で人間が作成したことが証明されています。
                  </p>
                )}
                {image.c2paStatus === 'no_data' && (
                  <p className="text-xs text-muted-foreground">
                    C2PA情報がありません。人間が作成した可能性はありますが、証明データがありません。
                  </p>
                )}

                {deviceInfo && (typeof deviceInfo === 'object') && ('make' in deviceInfo || 'model' in deviceInfo) && (
                  <div className="text-xs text-muted-foreground pt-2 border-t border-border">
                    <p className="font-medium text-foreground mb-1">撮影デバイス</p>
                    {deviceInfo.make && <p>メーカー: {deviceInfo.make}</p>}
                    {deviceInfo.model && <p>モデル: {deviceInfo.model}</p>}
                  </div>
                )}

                {softwareInfo?.name && (
                  <div className="text-xs text-muted-foreground pt-2 border-t border-border">
                    <p className="font-medium text-foreground mb-1">編集ソフト</p>
                    <p>{softwareInfo.name}</p>
                  </div>
                )}

                {signerInfo && (
                  <div className="text-xs text-muted-foreground pt-2 border-t border-border">
                    <p className="font-medium text-foreground mb-1">署名情報</p>
                    {signerInfo.name && <p>発行者: {signerInfo.name}</p>}
                    {signerInfo.timestamp && (
                      <p>日時: {new Date(signerInfo.timestamp).toLocaleDateString('ja-JP')}</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
