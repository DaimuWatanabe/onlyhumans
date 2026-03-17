import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { C2PABadge } from '@/components/pin/C2PABadge'
import { C2PAStatus } from '@/types/c2pa'

interface PinPageProps {
  params: Promise<{ id: string }>
}

interface PinData {
  id: string
  title: string
  description: string | null
  image: string
  c2paStatus: string
  createdAt: string
  author: {
    username: string
    name: string
    avatar: string | null
  }
  provenanceData: {
    deviceInfo: Record<string, unknown> | null
    softwareInfo: Record<string, unknown> | null
    signerInfo: Record<string, unknown> | null
    verifiedAt: string
  } | null
}

async function getPin(id: string): Promise<PinData | null> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  if (!process.env.DATABASE_URL) {
    // デモフォールバック: 既存のpins APIから検索
    const res = await fetch(`${baseUrl}/api/pins`, { cache: 'no-store' })
    if (!res.ok) return null
    const data = await res.json()
    const pin = data.pins?.find((p: { id: string }) => p.id === id)
    if (!pin) return null
    return {
      ...pin,
      description: null,
      createdAt: new Date().toISOString(),
      author: { username: pin.author?.name?.toLowerCase().replace(' ', '_') || 'unknown', name: pin.author?.name || 'Unknown', avatar: pin.author?.avatar || null },
      provenanceData: null,
    }
  }

  const res = await fetch(`${baseUrl}/api/pins/${id}`, { cache: 'no-store' })
  if (res.status === 404) return null
  if (!res.ok) return null

  return res.json()
}

export default async function PinPage({ params }: PinPageProps) {
  const { id } = await params
  const pin = await getPin(id)

  if (!pin) {
    notFound()
  }

  const deviceInfo = pin.provenanceData?.deviceInfo as { make?: string; model?: string } | null
  const softwareInfo = pin.provenanceData?.softwareInfo as { name?: string } | null
  const signerInfo = pin.provenanceData?.signerInfo as { name?: string; timestamp?: string } | null

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Image */}
          <div className="flex-1">
            <div className="relative rounded-2xl overflow-hidden">
              <Image
                src={pin.image}
                alt={pin.title}
                width={600}
                height={800}
                className="w-full h-auto object-cover"
                unoptimized
              />
              <div className="absolute top-4 left-4">
                <C2PABadge status={pin.c2paStatus as C2PAStatus} size="md" />
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="md:w-72 shrink-0">
            <div className="sticky top-24">
              <h1 className="text-2xl font-semibold mb-2">{pin.title}</h1>
              {pin.description && (
                <p className="text-sm text-muted-foreground mb-4">{pin.description}</p>
              )}

              {/* Author */}
              <Link href={`/profile/${pin.author.username}`} className="flex items-center gap-3 mt-4 hover:opacity-80 transition-opacity">
                <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                  {pin.author.avatar ? (
                    <Image
                      src={pin.author.avatar}
                      alt={pin.author.name}
                      width={40}
                      height={40}
                      className="rounded-full object-cover"
                      unoptimized
                    />
                  ) : (
                    <span className="text-sm font-medium">
                      {pin.author.name.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <div>
                  <p className="font-medium">{pin.author.name}</p>
                  <p className="text-sm text-muted-foreground">@{pin.author.username}</p>
                </div>
              </Link>

              {/* C2PA Status */}
              <div className="mt-6 p-4 bg-secondary rounded-xl space-y-3">
                <p className="text-sm font-medium">コンテンツ認証</p>
                <C2PABadge status={pin.c2paStatus as C2PAStatus} size="md" />

                {pin.c2paStatus === 'verified_human' && (
                  <p className="text-xs text-muted-foreground">
                    この作品はC2PA規格で人間が作成したことが証明されています。
                  </p>
                )}
                {pin.c2paStatus === 'no_data' && (
                  <p className="text-xs text-muted-foreground">
                    C2PA情報がありません。人間が作成した可能性はありますが、証明データがありません。
                  </p>
                )}

                {/* デバイス・署名情報 */}
                {deviceInfo && (deviceInfo.make || deviceInfo.model) && (
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
