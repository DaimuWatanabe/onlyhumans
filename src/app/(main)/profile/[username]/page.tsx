import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getProfileByUsername } from '@/app/actions/profile'
import { getImages } from '@/app/actions/images'
import { C2PABadge } from '@/components/pin/C2PABadge'
import { C2PAStatus } from '@/types/c2pa'
import { FollowButton } from '@/components/profile/FollowButton'

interface ProfilePageProps {
  params: Promise<{ username: string }>
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { username } = await params

  const profileResult = await getProfileByUsername(username)
  if (!profileResult.success) {
    notFound()
  }

  const profile = profileResult.data

  // 現在ログイン中のユーザーID取得
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const currentUserId = user?.id ?? null
  const isOwnProfile = currentUserId === profile.id

  // ユーザーの投稿画像取得
  const imagesResult = await getImages({ userId: profile.id, limit: 50 })
  const images = imagesResult.success ? imagesResult.data.items : []

  const displayName = profile.displayName || profile.username

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* プロフィールヘッダー */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="h-24 w-24 rounded-full bg-muted flex items-center justify-center mb-4 overflow-hidden">
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
          {profile.bio && <p className="text-sm mt-2 max-w-sm">{profile.bio}</p>}

          {/* フォロワー数・フォロー数・投稿数 */}
          <div className="flex items-center gap-6 mt-4 text-sm">
            <div className="text-center">
              <p className="font-semibold">{profile.imageCount}</p>
              <p className="text-muted-foreground">投稿</p>
            </div>
            <div className="text-center">
              <p className="font-semibold">{profile.followerCount}</p>
              <p className="text-muted-foreground">フォロワー</p>
            </div>
            <div className="text-center">
              <p className="font-semibold">{profile.followingCount}</p>
              <p className="text-muted-foreground">フォロー中</p>
            </div>
          </div>

          {/* フォローボタン（自分以外に表示） */}
          {!isOwnProfile && currentUserId && (
            <div className="mt-4">
              <FollowButton
                targetUserId={profile.id}
                initialIsFollowing={profile.isFollowing}
              />
            </div>
          )}
        </div>

        {/* 投稿グリッド */}
        {images.length === 0 ? (
          <p className="text-center text-muted-foreground py-12">まだ投稿がありません</p>
        ) : (
          <div className="columns-2 sm:columns-3 md:columns-4 gap-4">
            {images.map((img) => (
              <Link key={img.id} href={`/pin/${img.id}`} className="block break-inside-avoid mb-4">
                <div className="relative rounded-2xl overflow-hidden group">
                  <Image
                    src={img.imageUrl}
                    alt={img.title}
                    width={400}
                    height={600}
                    className="w-full h-auto object-cover"
                    unoptimized
                  />
                  <div className="absolute top-2 left-2">
                    <C2PABadge status={img.c2paStatus as C2PAStatus} size="sm" />
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
