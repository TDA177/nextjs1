import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { syncOverdueItems } from '@/lib/rules';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const coupleId = searchParams.get('coupleId') || 'couple-1';
    
    // Rule 4: Sync overdue status dynamically on fetch
    await syncOverdueItems(coupleId);

    const items = await prisma.plannerItem.findMany({
      where: { coupleId },
      include: {
        checklists: { orderBy: { sortOrder: 'asc' } },
        events: { orderBy: { eventStart: 'asc' } },
        comments: { orderBy: { createdAt: 'desc' } },
        attachments: { orderBy: { createdAt: 'desc' } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(items);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      title,
      description,
      type,
      priority = 'Medium',
      status = 'Planned',
      startDate,
      endDate,
      deadline,
      color = 'Hồng',
      createdBy = 'Anh',
      assignedTo = 'Both',
      isRepeat = false,
      repeatRule,
      checklists = [],
    } = body;

    if (!title || !type) {
      return NextResponse.json({ error: 'Tên và Loại mục là bắt buộc' }, { status: 400 });
    }

    const newItem = await prisma.plannerItem.create({
      data: {
        coupleId: 'couple-1',
        title,
        description,
        type,
        priority,
        status,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        deadline: deadline ? new Date(deadline) : null,
        color,
        createdBy,
        assignedTo,
        isRepeat,
        repeatRule,
        checklists: {
          create: checklists.map((item: { title: string }, index: number) => ({
            title: item.title,
            sortOrder: index + 1,
          })),
        },
      },
      include: {
        checklists: true,
        events: true,
        comments: true,
        attachments: true,
      },
    });

    return NextResponse.json(newItem);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
