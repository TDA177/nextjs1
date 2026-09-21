import { differenceInCalendarDays, isAfter, isBefore, isEqual, startOfDay, addDays } from 'date-fns';

export interface HolidayItem {
  id: string;
  name: string;
  description: string;
  date: Date; // Ngày dương lịch cụ thể
  type: 'solar' | 'lunar' | 'love' | 'custom';
  lunarNote?: string;
  daysRemaining?: number;
}

// Bảng tra cứu các ngày lễ Âm Lịch quan trọng đã được quy đổi sang Dương Lịch
// Hỗ trợ từ 2024 đến 2028
const LUNAR_HOLIDAYS_MAP: Record<number, Array<{ name: string; description: string; lunarDate: string; month: number; day: number }>> = {
  2024: [
    { name: 'Tết Ông Công Ông Táo', description: '23 tháng Chạp', lunarDate: '23/12 Âm', month: 2, day: 2 },
    { name: 'Giao thừa Tết Giáp Thìn', description: '30 Tết', lunarDate: '30/12 Âm', month: 2, day: 9 },
    { name: 'Mùng 1 Tết Nguyên Đán (Giáp Thìn)', description: 'Tết Cổ Truyền', lunarDate: '01/01 Âm', month: 2, day: 10 },
    { name: 'Rằm tháng Giêng', description: 'Tết Nguyên Tiêu', lunarDate: '15/01 Âm', month: 2, day: 24 },
    { name: 'Giỗ Tổ Hùng Vương', description: '10/3 Âm lịch', lunarDate: '10/03 Âm', month: 4, day: 18 },
    { name: 'Tết Đoan Ngọ', description: '5/5 Âm lịch', lunarDate: '05/05 Âm', month: 6, day: 10 },
    { name: 'Lễ Vu Lan', description: 'Báo hiếu cha mẹ (15/7 Âm)', lunarDate: '15/07 Âm', month: 8, day: 18 },
    { name: 'Tết Trung Thu', description: 'Rằm tháng Tám (15/8 Âm)', lunarDate: '15/08 Âm', month: 9, day: 17 },
  ],
  2025: [
    { name: 'Tết Ông Công Ông Táo', description: '23 tháng Chạp', lunarDate: '23/12 Âm', month: 1, day: 22 },
    { name: 'Giao thừa Tết Ất Tỵ', description: '29 Tết', lunarDate: '29/12 Âm', month: 1, day: 28 },
    { name: 'Mùng 1 Tết Nguyên Đán (Ất Tỵ)', description: 'Tết Cổ Truyền', lunarDate: '01/01 Âm', month: 1, day: 29 },
    { name: 'Rằm tháng Giêng', description: 'Tết Nguyên Tiêu', lunarDate: '15/01 Âm', month: 2, day: 12 },
    { name: 'Giỗ Tổ Hùng Vương', description: '10/3 Âm lịch', lunarDate: '10/03 Âm', month: 4, day: 7 },
    { name: 'Tết Đoan Ngọ', description: '5/5 Âm lịch', lunarDate: '05/05 Âm', month: 5, day: 31 },
    { name: 'Lễ Vu Lan', description: 'Báo hiếu cha mẹ (15/7 Âm)', lunarDate: '15/07 Âm', month: 9, day: 6 },
    { name: 'Tết Trung Thu', description: 'Rằm tháng Tám (15/8 Âm)', lunarDate: '15/08 Âm', month: 10, day: 6 },
  ],
  2026: [
    { name: 'Tết Ông Công Ông Táo', description: '23 tháng Chạp', lunarDate: '23/12 Âm', month: 2, day: 10 },
    { name: 'Giao thừa Tết Bính Ngọ', description: '30 Tết', lunarDate: '30/12 Âm', month: 2, day: 16 },
    { name: 'Mùng 1 Tết Nguyên Đán (Bính Ngọ)', description: 'Tết Cổ Truyền', lunarDate: '01/01 Âm', month: 2, day: 17 },
    { name: 'Rằm tháng Giêng', description: 'Tết Nguyên Tiêu', lunarDate: '15/01 Âm', month: 3, day: 3 },
    { name: 'Giỗ Tổ Hùng Vương', description: '10/3 Âm lịch', lunarDate: '10/03 Âm', month: 4, day: 26 },
    { name: 'Tết Đoan Ngọ', description: '5/5 Âm lịch', lunarDate: '05/05 Âm', month: 6, day: 19 },
    { name: 'Lễ Vu Lan', description: 'Báo hiếu cha mẹ (15/7 Âm)', lunarDate: '15/07 Âm', month: 8, day: 26 },
    { name: 'Tết Trung Thu', description: 'Rằm tháng Tám (15/8 Âm)', lunarDate: '15/08 Âm', month: 9, day: 25 },
  ],
  2027: [
    { name: 'Tết Ông Công Ông Táo', description: '23 tháng Chạp', lunarDate: '23/12 Âm', month: 1, day: 30 },
    { name: 'Giao thừa Tết Đinh Mùi', description: '29 Tết', lunarDate: '29/12 Âm', month: 2, day: 5 },
    { name: 'Mùng 1 Tết Nguyên Đán (Đinh Mùi)', description: 'Tết Cổ Truyền', lunarDate: '01/01 Âm', month: 2, day: 6 },
    { name: 'Rằm tháng Giêng', description: 'Tết Nguyên Tiêu', lunarDate: '15/01 Âm', month: 2, day: 20 },
    { name: 'Giỗ Tổ Hùng Vương', description: '10/3 Âm lịch', lunarDate: '10/03 Âm', month: 4, day: 16 },
    { name: 'Tết Đoan Ngọ', description: '5/5 Âm lịch', lunarDate: '05/05 Âm', month: 6, day: 9 },
    { name: 'Lễ Vu Lan', description: 'Báo hiếu cha mẹ (15/7 Âm)', lunarDate: '15/07 Âm', month: 8, day: 16 },
    { name: 'Tết Trung Thu', description: 'Rằm tháng Tám (15/8 Âm)', lunarDate: '15/08 Âm', month: 9, day: 15 },
  ],
};

// Các ngày lễ cố định theo Dương Lịch
const SOLAR_HOLIDAYS = [
  { month: 1, day: 1, name: 'Tết Dương Lịch', description: 'Năm mới chào đón điều mới' },
  { month: 2, day: 14, name: 'Lễ Tình Nhân (Valentine)', description: 'Ngày tôn vinh tình yêu đôi lứa' },
  { month: 3, day: 8, name: 'Quốc tế Phụ nữ', description: 'Ngày yêu thương và tri ân phái đẹp' },
  { month: 3, day: 14, name: 'Valentine Trắng', description: 'Ngày đáp lại tình cảm' },
  { month: 4, day: 30, name: 'Ngày Giải phóng miền Nam', description: 'Ngày Thống nhất non sông' },
  { month: 5, day: 1, name: 'Quốc tế Lao động', description: 'Ngày nghỉ lễ toàn dân' },
  { month: 6, day: 1, name: 'Quốc tế Thiếu nhi', description: 'Ngày dành cho các em nhỏ và em bé của bạn' },
  { month: 6, day: 28, name: 'Ngày Gia đình Việt Nam', description: 'Gắn kết mái ấm yêu thương' },
  { month: 9, day: 2, name: 'Quốc khánh Việt Nam', description: 'Tết Độc lập hào hùng của dân tộc' },
  { month: 10, day: 20, name: 'Ngày Phụ nữ Việt Nam', description: 'Tôn vinh và tặng quà cho nàng' },
  { month: 10, day: 31, name: 'Halloween', description: 'Lễ hội hóa trang & kẹo ngọt' },
  { month: 11, day: 20, name: 'Ngày Nhà giáo Việt Nam', description: 'Tri ân thầy cô giáo' },
  { month: 12, day: 24, name: 'Đêm Giáng Sinh (Christmas Eve)', description: 'Đêm Noel ấm áp bên người yêu' },
  { month: 12, day: 25, name: 'Lễ Giáng Sinh (Noel)', description: 'Ngày lễ Giáng Sinh' },
  { month: 12, day: 31, name: 'Đêm Giao Thừa Dương Lịch', description: 'Countdown đón chào năm mới' },
];

/**
 * Lấy danh sách ngày lễ cho một năm cụ thể
 */
export function getHolidaysForYear(year: number): HolidayItem[] {
  const holidays: HolidayItem[] = [];

  // 1. Thêm ngày lễ dương lịch
  for (const item of SOLAR_HOLIDAYS) {
    holidays.push({
      id: `solar-${year}-${item.month}-${item.day}`,
      name: item.name,
      description: item.description,
      date: new Date(year, item.month - 1, item.day),
      type: 'solar',
    });
  }

  // 2. Thêm ngày lễ âm lịch đã tra cứu
  const lunarList = LUNAR_HOLIDAYS_MAP[year] || [];
  for (const item of lunarList) {
    holidays.push({
      id: `lunar-${year}-${item.month}-${item.day}`,
      name: item.name,
      description: item.description,
      date: new Date(year, item.month - 1, item.day),
      type: 'lunar',
      lunarNote: item.lunarDate,
    });
  }

  return holidays;
}

/**
 * Lấy các ngày lễ sắp tới tính từ ngày hiện tại
 */
export function getUpcomingHolidays(fromDate: Date = new Date(), limit: number = 6): HolidayItem[] {
  const today = toVietnamStartOfDay(fromDate);
  const currentYear = today.getFullYear();

  // Lấy ngày lễ năm nay và năm kế tiếp (để cover các ngày đầu năm sau như Tết Dương/Tết Nguyên Đán)
  const allHolidays = [
    ...getHolidaysForYear(currentYear),
    ...getHolidaysForYear(currentYear + 1),
  ];

  const upcoming = allHolidays
    .filter((h) => {
      const hDate = toVietnamStartOfDay(h.date);
      return !isBefore(hDate, today);
    })
    .map((h) => {
      const hDate = toVietnamStartOfDay(h.date);
      const daysRemaining = differenceInCalendarDays(hDate, today);
      return {
        ...h,
        daysRemaining,
      };
    })
    .sort((a, b) => a.daysRemaining! - b.daysRemaining!);

  return upcoming.slice(0, limit);
}

/**
 * Trích xuất ngày, tháng, năm theo múi giờ Việt Nam (UTC+7 / Asia/Ho_Chi_Minh)
 */
export function getVietnamDateParts(dateInput: Date | string | number) {
  const d = new Date(dateInput);
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Ho_Chi_Minh',
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hour12: false,
  });
  const parts = formatter.formatToParts(d);
  const map: Record<string, string> = {};
  for (const p of parts) {
    if (p.type !== 'literal') map[p.type] = p.value;
  }
  return {
    year: parseInt(map.year, 10),
    month: parseInt(map.month, 10), // 1-12
    day: parseInt(map.day, 10),
    hour: parseInt(map.hour, 10),
    minute: parseInt(map.minute, 10),
    second: parseInt(map.second, 10),
  };
}

/**
 * Đưa bất kỳ thời điểm nào về 00:00:00 theo lịch ngày của Việt Nam
 */
export function toVietnamStartOfDay(dateInput: Date | string | number): Date {
  const p = getVietnamDateParts(dateInput);
  return new Date(p.year, p.month - 1, p.day, 0, 0, 0, 0);
}

/**
 * Tính số ngày còn lại đến một sự kiện hoặc ngày lễ cụ thể (Chuẩn xác theo múi giờ Việt Nam)
 */
export function calculateDaysUntil(targetDate: Date | string, fromDate: Date = new Date()): number {
  const start = toVietnamStartOfDay(fromDate);
  const target = toVietnamStartOfDay(targetDate);
  return differenceInCalendarDays(target, start);
}

/**
 * Định dạng ngày theo kiểu Việt Nam thân thiện chuẩn xác theo múi giờ Asia/Ho_Chi_Minh
 */
export function formatFriendlyDate(dateInput: Date | string | number): string {
  const d = new Date(dateInput);
  const formatter = new Intl.DateTimeFormat('vi-VN', {
    timeZone: 'Asia/Ho_Chi_Minh',
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
  return formatter.format(d).replace(', ', ', ngày ');
}

