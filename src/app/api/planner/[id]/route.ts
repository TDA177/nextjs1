import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { validateBucketDeletion } from '@/lib/rules';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const item = await prisma.plannerItem.findUnique({
      where: { id: params.id },
      include: {
        checklists: { orderBy: { sortOrder: 'asc' } },
        events: { orderBy: { eventStart: 'asc' } },
        comments: { orderBy: { createdAt: 'desc' } },
        attachments: { orderBy: { createdAt: 'desc' } },
      },
    });

    if (!item) {
      return NextResponse.json({ error: 'Không tìm thấy mục planner' }, { status: 404 });
    }

    return NextResponse.json(item);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    const {
      title,
      description,
      type,
      status,
      priority,
      startDate,
      endDate,
      deadline,
      color,
      assignedTo,
      isRepeat,
      repeatRule,
    } = body;

    const updated = await prisma.plannerItem.update({
      where: { id: params.id },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(type && { type }),
        ...(status && { status }),
        ...(priority && { priority }),
        startDate: startDate ? new Date(startDate) : startDate === null ? null : undefined,
        endDate: endDate ? new Date(endDate) : endDate === null ? null : undefined,
        deadline: deadline ? new Date(deadline) : deadline === null ? null : undefined,
        ...(color && { color }),
        ...(assignedTo && { assignedTo }),
        ...(isRepeat !== undefined && { isRepeat }),
        ...(repeatRule !== undefined && { repeatRule }),
      },
      include: {
        checklists: true,
        events: true,
        comments: true,
        attachments: true,
      },
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    // Rule 6: Validate Bucket Deletion if there are incomplete events
    const validation = await validateBucketDeletion(params.id);
    if (!validation.canDelete) {
      return NextResponse.json({ error: validation.message }, { status: 400 });
    }

    await prisma.plannerItem.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true, message: 'Đã xóa thành công' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
