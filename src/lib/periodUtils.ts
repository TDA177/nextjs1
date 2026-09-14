import {
  addDays,
  differenceInCalendarDays,
  startOfDay,
  format,
} from 'date-fns';
import { vi } from 'date-fns/locale';

export interface CycleCalculationResult {
  currentCycleDay: number;
  totalCycleDays: number;
  daysUntilNextPeriod: number;
  isPeriodStartToday: boolean;
  currentCycleStartDate: Date;
  nextPeriodStartDate: Date;
  countdownText: string;
  statusBadgeText: string;
  careTips: string[];
  foodTips: string[];
}

export const PERIOD_CARE_TIPS = [
  'Pha trà gừng ấm hoặc trà hoa cúc mật ong cho nàng.',
  'Chuẩn bị túi chườm ấm bụng và xoa lưng nhẹ nhàng nếu nàng mỏi.',
  'Chủ động mua món đồ ngọt nàng thích (sô cô la, bánh ngọt, trà sữa).',
  'Nhẹ nhàng, chiều chuộng và nhường nhịn nàng tối đa ❤️',
  'Hạn chế để nàng làm việc nặng hoặc uống đồ uống lạnh.',
];

export const PERIOD_FOOD_TIPS = [
  'Trà gừng ấm mật ong',
  'Sô cô la đen',
  'Canh gà hầm / canh ấm',
  'Chuối chín',
  'Nước ấm',
];

/**
 * Tính toán chu kỳ 28 ngày (hoặc tùy chỉnh) - Đếm ngày của nàng
 */
export function calculateCycleInfo(
  startDateInput: Date | string,
  cycleLength: number = 28,
  periodDuration?: number,
  targetDateInput: Date = new Date()
): CycleCalculationResult {
  const baseStart = startOfDay(new Date(startDateInput));
  const target = startOfDay(targetDateInput);

  const cycleLen = Math.max(20, Math.min(45, cycleLength || 28));

  // Tính khoảng cách ngày từ ngày bắt đầu cơ sở
  const diffDays = differenceInCalendarDays(target, baseStart);

  let cycleIndex: number;
  let currentCycleStart: Date;

  if (diffDays >= 0) {
    cycleIndex = Math.floor(diffDays / cycleLen);
    currentCycleStart = addDays(baseStart, cycleIndex * cycleLen);
  } else {
    cycleIndex = Math.floor(diffDays / cycleLen);
    currentCycleStart = addDays(baseStart, cycleIndex * cycleLen);
  }

  // Ngày hiện tại trong chu kỳ (1 .. cycleLen)
  const daysIntoCycle = differenceInCalendarDays(target, currentCycleStart); // 0 .. cycleLen - 1
  const currentCycleDay = daysIntoCycle + 1;

  // Ngày bắt đầu kỳ tiếp theo
  let nextPeriodStartDate: Date;
  let daysUntilNextPeriod: number;
  const isPeriodStartToday = daysIntoCycle === 0;

  if (isPeriodStartToday) {
    nextPeriodStartDate = target;
    daysUntilNextPeriod = 0;
  } else {
    nextPeriodStartDate = addDays(currentCycleStart, cycleLen);
    daysUntilNextPeriod = differenceInCalendarDays(nextPeriodStartDate, target);
  }

  // Tạo câu countdown text thân thiện
  let countdownText = '';
  let statusBadgeText = '';

  if (isPeriodStartToday) {
    countdownText = '🌸 Hôm nay là ngày của nàng!';
    statusBadgeText = '🌸 Hôm nay';
  } else if (daysUntilNextPeriod === 1) {
    countdownText = 'Còn 1 ngày nữa đến ngày của nàng (Ngày mai)';
    statusBadgeText = '🌸 Còn 1 ngày';
  } else if (daysUntilNextPeriod <= 3) {
    countdownText = `Còn ${daysUntilNextPeriod} ngày nữa đến ngày của nàng (Sắp tới)`;
    statusBadgeText = `🌸 Còn ${daysUntilNextPeriod} ngày`;
  } else {
    countdownText = `Còn ${daysUntilNextPeriod} ngày nữa đến ngày của nàng`;
    statusBadgeText = `🌸 Còn ${daysUntilNextPeriod} ngày`;
  }

  return {
    currentCycleDay,
    totalCycleDays: cycleLen,
    daysUntilNextPeriod,
    isPeriodStartToday,
    currentCycleStartDate: currentCycleStart,
    nextPeriodStartDate: isPeriodStartToday ? addDays(currentCycleStart, cycleLen) : nextPeriodStartDate,
    countdownText,
    statusBadgeText,
    careTips: PERIOD_CARE_TIPS,
    foodTips: PERIOD_FOOD_TIPS,
  };
}

export interface DayCycleMarker {
  type: 'period';
  label: string;
}

/**
 * Lấy đánh dấu ngày của nàng (dùng cho Calendar)
 * Chỉ hiển thị đúng ngày bắt đầu của chu kỳ, không hiển thị các ngày phụ hay rụng trứng.
 */
export function getCycleDayMarker(
  targetDate: Date,
  startDateInput: Date | string,
  cycleLength: number = 28,
  periodDuration?: number
): DayCycleMarker | null {
  const baseStart = startOfDay(new Date(startDateInput));
  const target = startOfDay(targetDate);
  const cycleLen = Math.max(20, Math.min(45, cycleLength || 28));

  const diffDays = differenceInCalendarDays(target, baseStart);
  const normalizedIndex = ((diffDays % cycleLen) + cycleLen) % cycleLen;

  // CHỈ trả về marker khi đúng ngày bắt đầu (normalizedIndex === 0)
  if (normalizedIndex === 0) {
    return {
      type: 'period',
      label: 'Ngày của nàng 🌸',
    };
  }

  return null;
}
