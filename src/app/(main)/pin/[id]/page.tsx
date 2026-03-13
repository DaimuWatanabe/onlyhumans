import { notFound } from 'next/navigation'
import Image from 'next/image'
import { C2PABadge } from '@/components/pin/C2PABadge'
import { C2PAStatus } from '@/types/c2pa'

interface PinPageProps {
  params: Promise<{ id: string }>
}

// デモ用の詳細データ
async function getPinById(id: string) {
  // 実際の実装ではDBから取得
  const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/pins`, {
    cache: 'no-store',
  })
  if (!res.ok) return null

  const data = await res.json()
  return data.pins?.find((p: { id: string }) => p.id === id) ?? null
}

export default async function PinPage({ params }: PinPageProps) {
  const { id } = await params
  const pin = await getPinById(id)

  if (!pin) {
    notFound()
  }

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

              {/* Author */}
              <div className="flex items-center gap-3 mt-4">
                <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                  <span className="text-sm font-medium">
                    {pin.author.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="font-medium">{pin.author.name}</p>
                  <p className="text-sm text-muted-foreground">クリエイター</p>
                </div>
              </div>

              {/* C2PA Status */}
              <div className="mt-6 p-4 bg-secondary rounded-xl">
                <p className="text-sm font-medium mb-2">コンテンツ認証</p>
                <C2PABadge status={pin.c2paStatus as C2PAStatus} size="md" />
                {pin.c2paStatus === 'verified_human' && (
                  <p className="text-xs text-muted-foreground mt-2">
                    この作品はC2PA規格で人間が作成したことが証明されています。
                  </p>
                )}
                {pin.c2paStatus === 'no_data' && (
                  <p className="text-xs text-muted-foreground mt-2">
                    C2PA情報がありません。人間が作成した可能性はありますが、証明データがありません。
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
