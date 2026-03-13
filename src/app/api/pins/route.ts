import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

export const runtime = 'nodejs'

// サンプルデータ（Supabase未設定時のデモ用）
const DEMO_PINS = [
  {
    id: '1',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=600&fit=crop',
    title: 'Mountain Sunrise',
    c2paStatus: 'verified_human' as const,
    author: { name: 'Emma Chen', avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=80&h=80&fit=crop&crop=face' },
  },
  {
    id: '2',
    image: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=400&h=500&fit=crop',
    title: 'Abstract Expression',
    c2paStatus: 'no_data' as const,
    author: { name: 'Marcus Liu', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face' },
  },
  {
    id: '3',
    image: 'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=400&h=700&fit=crop',
    title: 'Venice Sunset',
    c2paStatus: 'verified_human' as const,
    author: { name: 'Sofia Romano', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&crop=face' },
  },
  {
    id: '4',
    image: 'https://images.unsplash.com/photo-1549490349-8643362247b5?w=400&h=550&fit=crop',
    title: 'Urban Portrait',
    c2paStatus: 'verified_human' as const,
    author: { name: 'James Wilson', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face' },
  },
  {
    id: '5',
    image: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=650&fit=crop',
    title: 'Botanical Study',
    c2paStatus: 'no_data' as const,
    author: { name: 'Yuki Tanaka', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80&h=80&fit=crop&crop=face' },
  },
  {
    id: '6',
    image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&h=400&fit=crop',
    title: 'Ocean Dreams',
    c2paStatus: 'verified_human' as const,
    author: { name: 'Alex Rivera', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop&crop=face' },
  },
  {
    id: '7',
    image: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=400&h=580&fit=crop',
    title: 'Color Theory',
    c2paStatus: 'no_data' as const,
    author: { name: 'Nina Patel', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop&crop=face' },
  },
  {
    id: '8',
    image: 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?w=400&h=620&fit=crop',
    title: 'Forest Light',
    c2paStatus: 'verified_human' as const,
    author: { name: 'Oliver Berg', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=80&h=80&fit=crop&crop=face' },
  },
  {
    id: '9',
    image: 'https://images.unsplash.com/photo-1561839561-b13bcfe95249?w=400&h=500&fit=crop',
    title: 'Classical Portrait',
    c2paStatus: 'no_data' as const,
    author: { name: 'Isabella Rossi', avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=80&h=80&fit=crop&crop=face' },
  },
  {
    id: '10',
    image: 'https://images.unsplash.com/photo-1507908708918-778587c9e563?w=400&h=680&fit=crop',
    title: 'City Lights',
    c2paStatus: 'verified_human' as const,
    author: { name: 'David Kim', avatar: 'https://images.unsplash.com/photo-1463453091185-61582044d556?w=80&h=80&fit=crop&crop=face' },
  },
  {
    id: '11',
    image: 'https://images.unsplash.com/photo-1482160549825-59d1b23cb208?w=400&h=520&fit=crop',
    title: 'Floral Arrangement',
    c2paStatus: 'verified_human' as const,
    author: { name: 'Marie Dupont', avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=80&h=80&fit=crop&crop=face' },
  },
  {
    id: '12',
    image: 'https://images.unsplash.com/photo-1547891654-e66ed7ebb968?w=400&h=600&fit=crop',
    title: 'Abstract Forms',
    c2paStatus: 'no_data' as const,
    author: { name: 'Hans Mueller', avatar: 'https://images.unsplash.com/photo-1504257432389-52343af06ae3?w=80&h=80&fit=crop&crop=face' },
  },
  {
    id: '13',
    image: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=400&h=550&fit=crop',
    title: 'Misty Valley',
    c2paStatus: 'verified_human' as const,
    author: { name: 'Sarah Brooks', avatar: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=80&h=80&fit=crop&crop=face' },
  },
  {
    id: '14',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=700&fit=crop',
    title: 'Character Design',
    c2paStatus: 'no_data' as const,
    author: { name: 'Kenji Yamamoto', avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=80&h=80&fit=crop&crop=face' },
  },
  {
    id: '15',
    image: 'https://images.unsplash.com/photo-1501472312651-726afe119ff1?w=400&h=480&fit=crop',
    title: 'Desert Bloom',
    c2paStatus: 'verified_human' as const,
    author: { name: 'Luna Martinez', avatar: 'https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=80&h=80&fit=crop&crop=face' },
  },
  {
    id: '16',
    image: 'https://images.unsplash.com/photo-1504392022767-a8fc0771f239?w=400&h=640&fit=crop',
    title: 'Geometric Dreams',
    c2paStatus: 'no_data' as const,
    author: { name: 'Pavel Novak', avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=80&h=80&fit=crop&crop=face' },
  },
  {
    id: '17',
    image: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=400&h=580&fit=crop',
    title: 'Starry Night',
    c2paStatus: 'verified_human' as const,
    author: { name: 'Anna Kowalski', avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=80&h=80&fit=crop&crop=face' },
  },
  {
    id: '18',
    image: 'https://images.unsplash.com/photo-1571115764595-644a1f56a55c?w=400&h=500&fit=crop',
    title: 'Still Life',
    c2paStatus: 'no_data' as const,
    author: { name: 'Thomas Grey', avatar: 'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=80&h=80&fit=crop&crop=face' },
  },
]

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const cursor = searchParams.get('cursor')
  const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50)

  // DATABASE_URL が設定されていればDBから取得、未設定ならデモデータを返す
  if (process.env.DATABASE_URL) {
    try {
      const prisma = new PrismaClient()

      const pins = await prisma.pin.findMany({
        take: limit + 1,
        ...(cursor && { cursor: { id: cursor }, skip: 1 }),
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { username: true, displayName: true, avatarUrl: true },
          },
        },
      })

      await prisma.$disconnect()

      const hasMore = pins.length > limit
      const data = hasMore ? pins.slice(0, limit) : pins
      const nextCursor = hasMore ? data[data.length - 1].id : null

      return NextResponse.json({
        pins: data.map((pin) => ({
          id: pin.id,
          image: pin.imageUrl,
          title: pin.title,
          c2paStatus: pin.c2paStatus,
          author: {
            name: pin.user.displayName || pin.user.username,
            avatar: pin.user.avatarUrl,
          },
        })),
        nextCursor,
      })
    } catch (error) {
      console.error('DB error, falling back to demo data:', error)
    }
  }

  // デモデータを返す
  const startIndex = cursor ? DEMO_PINS.findIndex((p) => p.id === cursor) + 1 : 0
  const slice = DEMO_PINS.slice(startIndex, startIndex + limit)
  const hasMore = startIndex + limit < DEMO_PINS.length

  return NextResponse.json({
    pins: slice,
    nextCursor: hasMore ? slice[slice.length - 1]?.id : null,
  })
}
