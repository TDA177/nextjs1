import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const coupleId = searchParams.get('coupleId') || 'couple-1';

    let profile = await prisma.coupleProfile.findUnique({
      where: { coupleId },
    });

    // Nếu chưa có, tạo profile mặc định
    if (!profile) {
      // Mặc định lùi lại 365 ngày để có trải nghiệm hiển thị đẹp ngay lập tức
      const defaultStartDate = new Date();
      defaultStartDate.setDate(defaultStartDate.getDate() - 365);

      profile = await prisma.coupleProfile.create({
        data: {
          coupleId,
          startDate: defaultStartDate,
          partner1Name: 'Anh',
          partner1Avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
          partner2Name: 'Em',
          partner2Avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
          loveQuote: 'Cùng nhau già đi là điều lãng mạn nhất thế gian ❤️',
        },
      });
    }

    return NextResponse.json(profile);
  } catch (error: any) {
    console.error('Error fetching couple profile:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      coupleId = 'couple-1',
      startDate,
      partner1Name,
      partner1Avatar,
      partner2Name,
      partner2Avatar,
      loveQuote,
    } = body;

    const parsedStartDate = startDate ? new Date(startDate) : new Date();

    const profile = await prisma.coupleProfile.upsert({
      where: { coupleId },
      create: {
        coupleId,
        startDate: parsedStartDate,
        partner1Name: partner1Name || 'Anh',
        partner1Avatar: partner1Avatar || null,
        partner2Name: partner2Name || 'Em',
        partner2Avatar: partner2Avatar || null,
        loveQuote: loveQuote || 'Cùng nhau già đi là điều lãng mạn nhất thế gian ❤️',
      },
      update: {
        startDate: parsedStartDate,
        partner1Name: partner1Name !== undefined ? partner1Name : undefined,
        partner1Avatar: partner1Avatar !== undefined ? partner1Avatar : undefined,
        partner2Name: partner2Name !== undefined ? partner2Name : undefined,
        partner2Avatar: partner2Avatar !== undefined ? partner2Avatar : undefined,
        loveQuote: loveQuote !== undefined ? loveQuote : undefined,
      },
    });

    return NextResponse.json(profile);
  } catch (error: any) {
    console.error('Error updating couple profile:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
