import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

export const runtime = 'nodejs'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: 'DB未設定' }, { status: 503 })
  }

  const prisma = new PrismaClient()

  try {
    const pin = await prisma.pin.findUnique({
      where: { id },
      include: {
        user: {
          select: { username: true, displayName: true, avatarUrl: true },
        },
        provenanceData: true,
      },
    })

    if (!pin) {
      return NextResponse.json({ error: 'ピンが見つかりません' }, { status: 404 })
    }

    return NextResponse.json({
      id: pin.id,
      title: pin.title,
      description: pin.description,
      image: pin.imageUrl,
      c2paStatus: pin.c2paStatus,
      createdAt: pin.createdAt,
      author: {
        username: pin.user.username,
        name: pin.user.displayName || pin.user.username,
        avatar: pin.user.avatarUrl,
      },
      provenanceData: pin.provenanceData
        ? {
            deviceInfo: pin.provenanceData.deviceInfo,
            softwareInfo: pin.provenanceData.softwareInfo,
            signerInfo: pin.provenanceData.signerInfo,
            verifiedAt: pin.provenanceData.verifiedAt,
          }
        : null,
    })
  } finally {
    await prisma.$disconnect()
  }
}
