import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { checkChecklistCompletionStatus } from '@/lib/rules';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { plannerItemId, title } = body;

    if (!plannerItemId || !title) {
      return NextResponse.json({ error: 'Thông tin checklist không hợp lệ' }, { status: 400 });
    }

    const count = await prisma.plannerChecklist.count({ where: { plannerItemId } });

    const newItem = await prisma.plannerChecklist.create({
      data: {
        plannerItemId,
        title,
        isCompleted: false,
        sortOrder: count + 1,
      },
    });

    const status = await checkChecklistCompletionStatus(plannerItemId);

    return NextResponse.json({ item: newItem, completionStatus: status });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, isCompleted, title } = body;

    const checklistItem = await prisma.plannerChecklist.update({
      where: { id },
      data: {
        ...(isCompleted !== undefined && { isCompleted }),
        ...(title && { title }),
      },
    });

    // Rule 7 check: check if all checklist items are now completed
    const completionStatus = await checkChecklistCompletionStatus(checklistItem.plannerItemId);

    return NextResponse.json({
      item: checklistItem,
      completionStatus,
      // Flag to prompt user if 100% completed
      shouldPromptBucketCompleted: completionStatus.allCompleted,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Thiếu ID checklist' }, { status: 400 });

    const deleted = await prisma.plannerChecklist.delete({ where: { id } });
    const completionStatus = await checkChecklistCompletionStatus(deleted.plannerItemId);

    return NextResponse.json({ success: true, completionStatus });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
