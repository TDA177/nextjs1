import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { plannerItemId, name, url, fileType = 'file' } = body;

    if (!plannerItemId || !name || !url) {
      return NextResponse.json({ error: 'Tên tệp và URL không hợp lệ' }, { status: 400 });
    }

    const attachment = await prisma.plannerAttachment.create({
      data: {
        plannerItemId,
        name,
        url,
        fileType,
      },
    });

    return NextResponse.json(attachment);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Thiếu ID tệp đính kèm' }, { status: 400 });

    await prisma.plannerAttachment.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
