import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { prisma } from '@/lib/db';
import { getUpcomingHolidays, formatFriendlyDate, calculateDaysUntil } from '@/lib/holidayUtils';
import { calculateLoveStats } from '@/lib/loveUtils';
import { calculateCycleInfo } from '@/lib/periodUtils';
import { startOfDay, addDays } from 'date-fns';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, history = [], customApiKey } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Nội dung tin nhắn không hợp lệ' }, { status: 400 });
    }

    const apiKey = customApiKey || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        {
          error: 'Chưa cấu hình GEMINI_API_KEY',
          needApiKey: true,
          message:
            'Chưa tìm thấy Gemini API Key! Bạn có thể lấy API Key miễn phí tại https://aistudio.google.com rồi điền vào mục Cài đặt API Key nhé.',
        },
        { status: 400 }
      );
    }

    // 1. Chuẩn bị ngữ cảnh thời gian thực
    const now = new Date();
    const friendlyToday = formatFriendlyDate(now);
    const upcomingHolidays = getUpcomingHolidays(now, 8);

    // 2. Thu thập dữ liệu từ Database (Couple Profile, Events, Period)
    let coupleContext = '';
    try {
      const [profile, upcomingItems, periodSetting] = await Promise.all([
        prisma.coupleProfile.findFirst({ where: { coupleId: 'couple-1' } }),
        prisma.plannerItem.findMany({
          where: {
            coupleId: 'couple-1',
            status: { not: 'Cancelled' },
            startDate: {
              gte: startOfDay(now),
              lte: addDays(startOfDay(now), 45),
            },
          },
          orderBy: { startDate: 'asc' },
          take: 10,
        }),
        prisma.periodSetting.findFirst({ where: { coupleId: 'couple-1' } }),
      ]);

      // Context Tình yêu
      if (profile) {
        const stats = calculateLoveStats(profile.startDate);
        coupleContext += `\n- Tên cặp đôi: ${profile.partner1Name} và ${profile.partner2Name}`;
        coupleContext += `\n- Ngày bắt đầu yêu: ${formatFriendlyDate(new Date(profile.startDate))}`;
        coupleContext += `\n- Số ngày đã yêu nhau: ${stats.totalDays} ngày (${stats.years} năm ${stats.months} tháng ${stats.days} ngày)`;
        if (stats.nextMilestone) {
          coupleContext += `\n- Cột mốc tình yêu tiếp theo: ${stats.nextMilestone.label} (còn ${stats.nextMilestone.daysLeft} ngày nữa, vào ngày ${formatFriendlyDate(stats.nextMilestone.targetDate)})`;
        }
      }

      // Context Sự kiện / Lịch hẹn đã tạo trong App
      if (upcomingItems && upcomingItems.length > 0) {
        coupleContext += `\n- Các kế hoạch/lịch hẹn sắp tới của 2 bạn:`;
        for (const item of upcomingItems) {
          const daysLeft = item.startDate ? calculateDaysUntil(item.startDate, now) : 0;
          const dateStr = item.startDate ? formatFriendlyDate(new Date(item.startDate)) : 'Chưa định ngày';
          coupleContext += `\n  + "${item.title}" [Loại: ${item.type}]: Diễn ra vào ${dateStr} (còn ${daysLeft} ngày nữa)`;
        }
      } else {
        coupleContext += `\n- Các kế hoạch sắp tới của 2 bạn: Hiện chưa có lịch hẹn mới nào trong 45 ngày tới.`;
      }

      // Context Chu kỳ kinh nguyệt
      if (periodSetting) {
        const cycleInfo = calculateCycleInfo(
          periodSetting.startDate,
          periodSetting.cycleLength,
          periodSetting.periodDuration,
          now
        );
        coupleContext += `\n- Chu kỳ của bạn gái (${periodSetting.partnerName}):`;
        coupleContext += `\n  + Dự kiến kỳ kinh tiếp theo: ${formatFriendlyDate(cycleInfo.nextPeriodStartDate)} (còn ${cycleInfo.daysUntilNextPeriod} ngày nữa)`;
        coupleContext += `\n  + Tình trạng hôm nay: Ngày thứ ${cycleInfo.currentCycleDay}/${cycleInfo.totalCycleDays} của chu kỳ (${cycleInfo.statusBadgeText})`;
      }
    } catch (dbErr) {
      console.warn('Lỗi đọc database context (tiếp tục với dữ liệu lịch):', dbErr);
    }

    // 3. Chuỗi danh sách ngày lễ đã tính toán số ngày chính xác
    const holidaysSummary = upcomingHolidays
      .map(
        (h) =>
          `  + ${h.name} (${h.lunarNote ? h.lunarNote + ' - ' : ''}${formatFriendlyDate(h.date)}): Còn ${h.daysRemaining} ngày nữa`
      )
      .join('\n');

    // 4. Định hình System Instruction
    const systemInstruction = `
Bạn là "Haha" - Trợ lý AI thông minh, ngọt ngào và chu đáo dành cho các cặp đôi trong ứng dụng Couple Planner.
Nhiệm vụ của bạn là giải đáp các câu hỏi về thời gian, ngày lễ Việt Nam, đếm ngược sự kiện và hỗ trợ nhắc lịch cho 2 bạn.

=== THÔNG TIN THỜI GIAN THỰC TẾ HÔM NAY ===
- Hôm nay là: ${friendlyToday} (Múi giờ Việt Nam GMT+7).
- Danh sách ngày lễ sắp tới và số ngày còn lại (ĐÃ TÍNH TOÁN CHÍNH XÁC BẰNG CODE):
${holidaysSummary}

=== DỮ LIỆU CẶP ĐÔI TRONG ỨNG DỤNG ===
${coupleContext || 'Chưa có thông tin cặp đôi cụ thể.'}

=== NGUYÊN TẮC TRẢ LỜI ===
1. LUÔN trả lời dựa trên thông tin thời gian thực tế và các số ngày đã tính toán ở trên. KHÔNG TỰ BỊA HOẶC TÍNH NHẦM SỐ NGÀY.
2. Nếu người dùng hỏi "Sắp tới là ngày gì?", hãy liệt kê từ 2 - 4 ngày lễ hoặc lịch hẹn gần nhất kèm số ngày đếm ngược.
3. Nếu người dùng hỏi số ngày đến một dịp lễ/sự kiện nào đó (ví dụ: Tết, 20/10, Valentine, Noel...), hãy trả lời rõ ràng số ngày còn lại, ngày diễn ra và kèm một lời chúc hoặc gợi ý chuẩn bị quà/hẹn hò dễ thương.
4. Giọng điệu: Thân thiện, ngọt ngào, tinh tế, tích cực, dùng emoji vừa phải (❤️, 📅, 🌸, ✨, 🎁).
5. Trả lời bằng tiếng Việt gãy gọn, dễ đọc, xuống dòng hợp lý.
`;

    // 5. Khởi tạo Gemini Model với các model đã kiểm tra hoạt động ổn định
    const genAI = new GoogleGenerativeAI(apiKey);
    const candidateModels = [
      'gemini-flash-latest',
      'gemini-3.5-flash-lite',
      'gemini-3.1-flash-lite',
      'gemini-flash-lite-latest',
    ];

    // 6. Xây dựng nội dung lịch sử chat
    const formattedContents: any[] = [];
    for (const h of history) {
      if (h.role === 'user' || h.role === 'model') {
        formattedContents.push({
          role: h.role,
          parts: [{ text: h.text }],
        });
      }
    }
    // Thêm tin nhắn hiện tại
    formattedContents.push({
      role: 'user',
      parts: [{ text: message }],
    });

    let reply = '';
    let lastError: any = null;

    for (const modelName of candidateModels) {
      try {
        const model = genAI.getGenerativeModel({
          model: modelName,
          systemInstruction,
        });

        const result = await model.generateContent({
          contents: formattedContents,
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 800,
          },
        });

        const response = await result.response;
        reply = response.text();
        if (reply) break;
      } catch (err: any) {
        console.warn(`Thử model ${modelName} thất bại, đang chuyển sang model tiếp theo:`, err?.message);
        lastError = err;
      }
    }

    if (!reply && lastError) {
      throw lastError;
    }

    return NextResponse.json({
      reply,
      today: friendlyToday,
      upcomingHolidays: upcomingHolidays.slice(0, 3),
    });
  } catch (error: any) {
    console.error('Lỗi Gemini API:', error);
    let message = 'Đã có lỗi xảy ra khi kết nối tới AI. Vui lòng thử lại sau!';
    if (error?.status === 400 || error?.message?.includes('API key')) {
      message = 'Gemini API Key không hợp lệ. Vui lòng kiểm tra lại API Key của bạn!';
    } else if (error?.status === 429) {
      message = 'Bạn đã dùng hết hạn mức Gemini miễn phí trong phút này. Vui lòng chờ 1 phút rồi thử lại nhé!';
    }
    return NextResponse.json({ error: message, detail: error?.message }, { status: 500 });
  }
}
