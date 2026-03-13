import { notFound } from 'next/navigation'
import Image from 'next/image'

interface ProfilePageProps {
  params: Promise<{ username: string }>
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { username } = await params

  if (!username) {
    notFound()
  }

  // デモ用プロフィールデータ
  const profile = {
    username,
    displayName: username.charAt(0).toUpperCase() + username.slice(1),
    bio: 'アーティスト・フォトグラファー',
    avatarUrl: null,
    pinCount: 12,
  }

  const demoPins = [
    {
      id: 'p1',
      image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=600&fit=crop',
      title: 'Mountain Sunrise',
    },
    {
      id: 'p2',
      image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&h=400&fit=crop',
      title: 'Ocean Dreams',
    },
    {
      id: 'p3',
      image: 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?w=400&h=620&fit=crop',
      title: 'Forest Light',
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Profile Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="h-24 w-24 rounded-full bg-muted flex items-center justify-center mb-4">
            {profile.avatarUrl ? (
              <Image
                src={profile.avatarUrl}
                alt={profile.displayName}
                width={96}
                height={96}
                className="rounded-full object-cover"
                unoptimized
              />
            ) : (
              <span className="text-3xl font-semibold text-muted-foreground">
                {profile.displayName.charAt(0)}
              </span>
            )}
          </div>
          <h1 className="text-2xl font-semibold">{profile.displayName}</h1>
          <p className="text-muted-foreground">@{profile.username}</p>
          {profile.bio && <p className="text-sm mt-2">{profile.bio}</p>}
          <p className="text-sm text-muted-foreground mt-2">{profile.pinCount} 投稿</p>
        </div>

        {/* Pins Grid */}
        <div className="columns-2 sm:columns-3 md:columns-4 gap-4">
          {demoPins.map((pin) => (
            <div key={pin.id} className="break-inside-avoid mb-4 rounded-2xl overflow-hidden">
              <Image
                src={pin.image}
                alt={pin.title}
                width={400}
                height={600}
                className="w-full h-auto object-cover"
                unoptimized
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
