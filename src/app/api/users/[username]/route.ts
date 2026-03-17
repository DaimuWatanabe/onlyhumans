import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

export const runtime = 'nodejs'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  const { username } = await params

  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: 'DB未設定' }, { status: 503 })
  }

  const prisma = new PrismaClient()

  try {
    const user = await prisma.user.findUnique({
      where: { username },
      include: {
        pins: {
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            title: true,
            imageUrl: true,
            c2paStatus: true,
            createdAt: true,
          },
        },
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'ユーザーが見つかりません' }, { status: 404 })
    }

    return NextResponse.json({
      id: user.id,
      username: user.username,
      displayName: user.displayName,
      bio: user.bio,
      avatarUrl: user.avatarUrl,
      pinCount: user.pins.length,
      pins: user.pins.map((pin) => ({
        id: pin.id,
        title: pin.title,
        image: pin.imageUrl,
        c2paStatus: pin.c2paStatus,
      })),
    })
  } finally {
    await prisma.$disconnect()
  }
}
