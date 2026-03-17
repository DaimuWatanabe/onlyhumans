import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const { id, email, username, displayName } = await request.json()

    if (!id || !email || !username) {
      return NextResponse.json({ error: 'id, email, username は必須です' }, { status: 400 })
    }

    const prisma = new PrismaClient()

    try {
      const user = await prisma.user.upsert({
        where: { id },
        create: {
          id,
          email,
          username,
          displayName: displayName || username,
        },
        update: {},
      })

      return NextResponse.json({ success: true, userId: user.id })
    } finally {
      await prisma.$disconnect()
    }
  } catch (error) {
    console.error('create-user error:', error)
    return NextResponse.json({ error: 'ユーザー作成に失敗しました' }, { status: 500 })
  }
}
