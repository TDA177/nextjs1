import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { plannerItemId, title, eventStart, eventEnd, isAllDay = false } = body;

    if (!plannerItemId || !title || !eventStart) {
      return NextResponse.json({ error: 'Thiếu thông tin sự kiện bắt buộc' }, { status: 400 });
    }

    const event = await prisma.plannerEvent.create({
      data: {
        plannerItemId,
        title,
        eventStart: new Date(eventStart),
        eventEnd: eventEnd ? new Date(eventEnd) : null,
        isAllDay,
      },
    });

    return NextResponse.json(event);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, isCompleted, title, eventStart, eventEnd } = body;

    const event = await prisma.plannerEvent.update({
      where: { id },
      data: {
        ...(isCompleted !== undefined && { isCompleted }),
        ...(title && { title }),
        ...(eventStart && { eventStart: new Date(eventStart) }),
        ...(eventEnd && { eventEnd: new Date(eventEnd) }),
      },
    });

    return NextResponse.json(event);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Thiếu ID event' }, { status: 400 });

    await prisma.plannerEvent.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
