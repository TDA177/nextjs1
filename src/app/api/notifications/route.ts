import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'user_anh';

    const notifications = await prisma.notification.findMany({
      where: {
        OR: [{ userId }, { userId: 'all' }],
      },
      orderBy: { createdAt: 'desc' },
      include: {
        plannerItem: {
          select: { id: true, title: true, type: true, status: true, color: true }
        }
      }
    });

    return NextResponse.json(notifications);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, isRead } = body;

    if (id === 'all') {
      await prisma.notification.updateMany({
        data: { isRead: true }
      });
      return NextResponse.json({ success: true });
    }

    const updated = await prisma.notification.update({
      where: { id },
      data: { isRead },
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
