import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { plannerItemId, userId, userName, content } = body;

    if (!plannerItemId || !content) {
      return NextResponse.json({ error: 'Nội dung bình luận không thể trống' }, { status: 400 });
    }

    const comment = await prisma.plannerComment.create({
      data: {
        plannerItemId,
        userId: userId || 'user_anh',
        userName: userName || 'Anh',
        content,
      },
    });

    return NextResponse.json(comment);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
