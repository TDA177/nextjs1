import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const coupleId = searchParams.get('coupleId') || 'couple-1';
    const category = searchParams.get('category');

    const where: any = { coupleId };
    if (category) {
      where.category = category;
    }

    const items = await prisma.rouletteCustomItem.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(items);
  } catch (error: any) {
    console.error('Error fetching roulette items:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { coupleId = 'couple-1', category = 'food', title } = body;

    if (!title || !title.trim()) {
      return NextResponse.json({ error: 'Tiêu đề không được để trống' }, { status: 400 });
    }

    const item = await prisma.rouletteCustomItem.create({
      data: {
        coupleId,
        category,
        title: title.trim(),
      },
    });

    return NextResponse.json(item);
  } catch (error: any) {
    console.error('Error adding roulette item:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID không hợp lệ' }, { status: 400 });
    }

    await prisma.rouletteCustomItem.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting roulette item:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
