import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { calculateCycleInfo } from '@/lib/periodUtils';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

/**
 * Tự động kiểm tra và tạo thông báo nếu sắp đến ngày đến tháng
 */
async function checkAndCreatePeriodNotification(setting: any, cycleInfo: any) {
  try {
    const reminderDays = setting.reminderDaysBefore ?? 3;
    const { daysUntilNextPeriod, isPeriodStartToday, nextPeriodStartDate } = cycleInfo;
    const formattedNextDate = format(new Date(nextPeriodStartDate), 'dd/MM/yyyy');

    let title = '';
    let message = '';

    if (isPeriodStartToday) {
      title = `🩸 Hôm nay là ngày đến tháng của ${setting.partnerName || 'Em'}`;
      message = `Hôm nay là ngày bắt đầu kỳ mới. Đừng quên mua đồ ngọt, pha trà gừng và chuẩn bị túi sưởi cho người yêu nhé! ❤️`;
    } else if (daysUntilNextPeriod > 0 && daysUntilNextPeriod <= reminderDays) {
      title = `⚠️ Còn ${daysUntilNextPeriod} ngày nữa đến ngày đến tháng của ${setting.partnerName || 'Em'}`;
      message = `Dự kiến ngày ${formattedNextDate} là ngày đến tháng. Bạn trai hãy chuẩn bị sẵn tâm lý kiên nhẫn, đồ ăn ngon và quà ngọt nhé! 🌸`;
    }

    if (title && message) {
      // Kiểm tra xem hôm nay đã có thông báo tương tự chưa để tránh spam
      const existing = await prisma.notification.findFirst({
        where: {
          coupleId: setting.coupleId,
          type: 'PeriodReminder',
          title: title,
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
      });

      if (!existing) {
        await prisma.notification.create({
          data: {
            coupleId: setting.coupleId,
            userId: 'all',
            type: 'PeriodReminder',
            title,
            message,
            isRead: false,
          },
        });
      }
    }
  } catch (error) {
    console.error('Error generating period notification:', error);
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const coupleId = searchParams.get('coupleId') || 'couple-1';

    const setting = await prisma.periodSetting.findUnique({
      where: { coupleId },
    });

    if (!setting) {
      return NextResponse.json({ setting: null, cycleInfo: null });
    }

    const cycleInfo = calculateCycleInfo(
      setting.startDate,
      setting.cycleLength,
      setting.periodDuration,
      new Date()
    );

    // Tự động kiểm tra và tạo thông báo nếu đến hạn
    await checkAndCreatePeriodNotification(setting, cycleInfo);

    return NextResponse.json({ setting, cycleInfo });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      coupleId = 'couple-1',
      startDate,
      cycleLength = 28,
      reminderDaysBefore = 3,
      partnerName = 'Em',
      notes = '',
    } = body;

    if (!startDate) {
      return NextResponse.json({ error: 'Ngày bắt đầu kỳ kinh là bắt buộc' }, { status: 400 });
    }

    const parsedStartDate = new Date(startDate);
    const parsedCycleLength = parseInt(cycleLength, 10) || 28;
    const parsedReminderDays = parseInt(reminderDaysBefore, 10) || 3;

    const setting = await prisma.periodSetting.upsert({
      where: { coupleId },
      create: {
        coupleId,
        startDate: parsedStartDate,
        cycleLength: parsedCycleLength,
        reminderDaysBefore: parsedReminderDays,
        partnerName,
        notes,
      },
      update: {
        startDate: parsedStartDate,
        cycleLength: parsedCycleLength,
        reminderDaysBefore: parsedReminderDays,
        partnerName,
        notes,
      },
    });

    const cycleInfo = calculateCycleInfo(
      setting.startDate,
      setting.cycleLength,
      setting.periodDuration,
      new Date()
    );

    await checkAndCreatePeriodNotification(setting, cycleInfo);

    return NextResponse.json({ setting, cycleInfo });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const coupleId = searchParams.get('coupleId') || 'couple-1';

    await prisma.periodSetting.deleteMany({
      where: { coupleId },
    });

    return NextResponse.json({ success: true, message: 'Đã xóa cấu hình chu kỳ' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
