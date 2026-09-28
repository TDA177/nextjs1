import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const coupleId = searchParams.get('coupleId') || 'couple-1';
    const plannerItemId = searchParams.get('plannerItemId');

    const where: any = { coupleId };
    if (plannerItemId) {
      where.plannerItemId = plannerItemId;
    }

    const memories = await prisma.coupleMemory.findMany({
      where,
      include: {
        plannerItem: {
          select: {
            id: true,
            title: true,
            type: true,
            color: true,
            status: true,
          },
        },
      },
      orderBy: {
        date: 'desc',
      },
    });

    return NextResponse.json(memories);
  } catch (error: any) {
    console.error('Error fetching memories:', error);
    return NextResponse.json({ error: error.message || 'Lỗi khi tải kỷ niệm' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      coupleId = 'couple-1',
      plannerItemId,
      title,
      date,
      photos = [],
      emotion,
      note,
      location,
      authorName = 'Anh',
    } = body;

    if (!title || !title.trim()) {
      return NextResponse.json({ error: 'Tiêu đề kỷ niệm không được để trống' }, { status: 400 });
    }

    const memory = await prisma.coupleMemory.create({
      data: {
        coupleId,
        plannerItemId: plannerItemId || null,
        title: title.trim(),
        date: date ? new Date(date) : new Date(),
        photos: Array.isArray(photos) ? photos : [],
        emotion: emotion || null,
        note: note ? note.trim() : null,
        location: location ? location.trim() : null,
        authorName: authorName || 'Anh',
      },
      include: {
        plannerItem: {
          select: {
            id: true,
            title: true,
            type: true,
            color: true,
            status: true,
          },
        },
      },
    });

    return NextResponse.json(memory, { status: 201 });
  } catch (error: any) {
    console.error('Error creating memory:', error);
    return NextResponse.json({ error: error.message || 'Lỗi khi lưu kỷ niệm' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, title, date, photos, emotion, note, location, authorName } = body;

    if (!id) {
      return NextResponse.json({ error: 'Thiếu ID kỷ niệm' }, { status: 400 });
    }

    const dataToUpdate: any = {};
    if (title !== undefined) dataToUpdate.title = title.trim();
    if (date !== undefined) dataToUpdate.date = new Date(date);
    if (photos !== undefined) dataToUpdate.photos = Array.isArray(photos) ? photos : [];
    if (emotion !== undefined) dataToUpdate.emotion = emotion;
    if (note !== undefined) dataToUpdate.note = note ? note.trim() : null;
    if (location !== undefined) dataToUpdate.location = location ? location.trim() : null;
    if (authorName !== undefined) dataToUpdate.authorName = authorName;

    const updated = await prisma.coupleMemory.update({
      where: { id },
      data: dataToUpdate,
      include: {
        plannerItem: {
          select: {
            id: true,
            title: true,
            type: true,
            color: true,
            status: true,
          },
        },
      },
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error('Error updating memory:', error);
    return NextResponse.json({ error: error.message || 'Lỗi khi cập nhật kỷ niệm' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Thiếu ID kỷ niệm' }, { status: 400 });
    }

    await prisma.coupleMemory.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting memory:', error);
    return NextResponse.json({ error: error.message || 'Lỗi khi xóa kỷ niệm' }, { status: 500 });
  }
}
