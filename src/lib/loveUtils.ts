import { differenceInDays, differenceInMonths, differenceInYears, addDays, addYears } from 'date-fns';

export interface Milestone {
  targetDays: number;
  label: string;
  targetDate: Date;
  daysLeft: number;
  isReached: boolean;
}

export interface LoveStats {
  totalDays: number;
  years: number;
  months: number;
  days: number;
  nextMilestone: Milestone | null;
  milestones: Milestone[];
  progressToNext: number; // 0 to 100
}

interface MilestoneDef {
  years?: number;
  days?: number;
  label: string;
}

const COMMON_MILESTONES: MilestoneDef[] = [
  { days: 100, label: '100 Ngày Yêu' },
  { days: 200, label: '200 Ngày Yêu' },
  { days: 300, label: '300 Ngày Yêu' },
  { years: 1, label: '1 Năm Kỷ Niệm (365 Ngày)' },
  { days: 500, label: '500 Ngày Yêu' },
  { years: 2, label: '2 Năm Kỷ Niệm (730 Ngày)' },
  { days: 1000, label: '1.000 Ngày Bên Nhau' },
  { years: 3, label: '3 Năm Kỷ Niệm (1.095 Ngày)' },
  { days: 1500, label: '1.500 Ngày Yêu' },
  { years: 5, label: '5 Năm Bền Chặt (1.825 Ngày)' },
  { days: 2500, label: '2.500 Ngày Yêu' },
  { years: 10, label: '10 Năm Đậm Sâu (3.650 Ngày)' },
];

function parseDateOnly(dateInput: string | Date): Date {
  if (dateInput instanceof Date) {
    return new Date(dateInput.getFullYear(), dateInput.getMonth(), dateInput.getDate());
  }
  if (typeof dateInput === 'string') {
    const match = dateInput.split('T')[0].match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (match) {
      return new Date(parseInt(match[1], 10), parseInt(match[2], 10) - 1, parseInt(match[3], 10));
    }
  }
  const d = new Date(dateInput);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export function calculateLoveStats(startDateStr: string | Date): LoveStats {
  const start = parseDateOnly(startDateStr);

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  // Số ngày yêu (tính từ ngày 1)
  const diffMs = today.getTime() - start.getTime();
  const totalDays = Math.max(1, Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1);

  // Tính năm, tháng, ngày tương đối
  const years = differenceInYears(today, start);
  const startPlusYears = addYears(start, years);

  const months = differenceInMonths(today, startPlusYears);
  const startPlusMonths = new Date(startPlusYears);
  startPlusMonths.setMonth(startPlusMonths.getMonth() + months);

  const days = differenceInDays(today, startPlusMonths);

  // Tính milestones
  let prevMilestoneDays = 0;
  let nextMilestone: Milestone | null = null;

  const milestones: Milestone[] = COMMON_MILESTONES.map((m) => {
    let targetDate: Date;
    let targetDays: number;

    if (m.years) {
      // Mốc năm kỷ niệm (Anniversary) luôn rơi vào đúng ngày đó ở năm sau
      targetDate = addYears(start, m.years);
      targetDays = differenceInDays(targetDate, start) + 1;
    } else {
      // Mốc theo số ngày yêu (ngày thứ N)
      targetDays = m.days!;
      targetDate = addDays(start, m.days! - 1);
    }

    const daysLeft = Math.ceil((targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    const isReached = daysLeft <= 0;

    const ms: Milestone = {
      targetDays,
      label: m.label,
      targetDate,
      daysLeft: Math.max(0, daysLeft),
      isReached,
    };

    if (isReached) {
      prevMilestoneDays = targetDays;
    } else if (!nextMilestone) {
      nextMilestone = ms;
    }

    return ms;
  });

  // Nếu đã vượt qua tất cả milestones mặc định
  if (!nextMilestone) {
    const nextTarget = Math.ceil(totalDays / 500) * 500;
    const targetDate = addDays(start, nextTarget - 1);
    const daysLeft = Math.ceil((targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    nextMilestone = {
      targetDays: nextTarget,
      label: `${nextTarget} Ngày Yêu`,
      targetDate,
      daysLeft: Math.max(0, daysLeft),
      isReached: false,
    };
  }

  // Tính progress bar đến next milestone (0 - 100%)
  const span = nextMilestone.targetDays - prevMilestoneDays;
  const currentInSpan = totalDays - prevMilestoneDays;
  const progressToNext = span > 0 ? Math.min(100, Math.max(0, Math.round((currentInSpan / span) * 100))) : 100;

  return {
    totalDays,
    years,
    months,
    days,
    nextMilestone,
    milestones,
    progressToNext,
  };
}
