import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { C2PABadge } from '@/components/pin/C2PABadge'
import { C2PAStatus } from '@/types/c2pa'

interface ProfilePageProps {
  params: Promise<{ username: string }>
}

interface ProfilePin {
  id: string
  title: string
  image: string
  c2paStatus: string
}

interface ProfileData {
  username: string
  displayName: string | null
  bio: string | null
  avatarUrl: string | null
  pinCount: number
  pins: ProfilePin[]
}

async function getProfile(username: string): Promise<ProfileData | null> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  if (!process.env.DATABASE_URL) {
    // デモフォールバック
    return {
      username,
      displayName: username.charAt(0).toUpperCase() + username.slice(1),
      bio: 'アーティスト・フォトグラファー',
      avatarUrl: null,
      pinCount: 0,
      pins: [],
    }
  }

  const res = await fetch(`${baseUrl}/api/users/${username}`, { cache: 'no-store' })
  if (res.status === 404) return null
  if (!res.ok) return null

  return res.json()
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { username } = await params
  const profile = await getProfile(username)

  if (!profile) {
    notFound()
  }

  const displayName = profile.displayName || username

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Profile Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="h-24 w-24 rounded-full bg-muted flex items-center justify-center mb-4">
            {profile.avatarUrl ? (
              <Image
                src={profile.avatarUrl}
                alt={displayName}
                width={96}
                height={96}
                className="rounded-full object-cover"
                unoptimized
              />
            ) : (
              <span className="text-3xl font-semibold text-muted-foreground">
                {displayName.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <h1 className="text-2xl font-semibold">{displayName}</h1>
          <p className="text-muted-foreground">@{profile.username}</p>
          {profile.bio && <p className="text-sm mt-2">{profile.bio}</p>}
          <p className="text-sm text-muted-foreground mt-2">{profile.pinCount} 投稿</p>
        </div>

        {/* Pins Grid */}
        {profile.pins.length === 0 ? (
          <p className="text-center text-muted-foreground py-12">まだ投稿がありません</p>
        ) : (
          <div className="columns-2 sm:columns-3 md:columns-4 gap-4">
            {profile.pins.map((pin) => (
              <Link key={pin.id} href={`/pin/${pin.id}`} className="block break-inside-avoid mb-4">
                <div className="relative rounded-2xl overflow-hidden group">
                  <Image
                    src={pin.image}
                    alt={pin.title}
                    width={400}
                    height={600}
                    className="w-full h-auto object-cover"
                    unoptimized
                  />
                  <div className="absolute top-2 left-2">
                    <C2PABadge status={pin.c2paStatus as C2PAStatus} size="sm" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
