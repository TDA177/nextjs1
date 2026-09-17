import { differenceInDays, differenceInMonths, differenceInYears, addDays, isPast, isToday } from 'date-fns';

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

const COMMON_MILESTONES = [
  { days: 100, label: '100 Ngày Yêu' },
  { days: 200, label: '200 Ngày Yêu' },
  { days: 300, label: '300 Ngày Yêu' },
  { days: 365, label: '1 Năm Kỷ Niệm (365 Ngày)' },
  { days: 500, label: '500 Ngày Yêu' },
  { days: 730, label: '2 Năm Kỷ Niệm (730 Ngày)' },
  { days: 1000, label: '1.000 Ngày Bên Nhau' },
  { days: 1095, label: '3 Năm Kỷ Niệm (1.095 Ngày)' },
  { days: 1500, label: '1.500 Ngày Yêu' },
  { days: 1825, label: '5 Năm Bền Chặt (1.825 Ngày)' },
  { days: 2500, label: '2.500 Ngày Yêu' },
  { days: 3650, label: '10 Năm Đậm Sâu (3.650 Ngày)' },
];

export function calculateLoveStats(startDateStr: string | Date): LoveStats {
  const start = new Date(startDateStr);
  start.setHours(0, 0, 0, 0);

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  // Số ngày yêu (tính từ ngày 1)
  const diffMs = today.getTime() - start.getTime();
  const totalDays = Math.max(1, Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1);

  // Tính năm, tháng, ngày tương đối
  const years = differenceInYears(today, start);
  const startPlusYears = new Date(start);
  startPlusYears.setFullYear(startPlusYears.getFullYear() + years);

  const months = differenceInMonths(today, startPlusYears);
  const startPlusMonths = new Date(startPlusYears);
  startPlusMonths.setMonth(startPlusMonths.getMonth() + months);

  const days = differenceInDays(today, startPlusMonths);

  // Tính milestones
  let prevMilestoneDays = 0;
  let nextMilestone: Milestone | null = null;

  const milestones: Milestone[] = COMMON_MILESTONES.map((m) => {
    const targetDate = addDays(start, m.days - 1);
    const daysLeft = Math.ceil((targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    const isReached = daysLeft <= 0;

    const ms: Milestone = {
      targetDays: m.days,
      label: m.label,
      targetDate,
      daysLeft: Math.max(0, daysLeft),
      isReached,
    };

    if (isReached) {
      prevMilestoneDays = m.days;
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
  const progressToNext = Math.min(100, Math.max(0, Math.round((currentInSpan / span) * 100)));

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
