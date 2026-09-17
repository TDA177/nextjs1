'use client';

import React, { useState, useEffect } from 'react';
import { Heart, Calendar, Sparkles, Clock, ChevronRight, Edit3, Compass, Flame } from 'lucide-react';
import { calculateLoveStats, LoveStats } from '@/lib/loveUtils';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

interface LoveCounterCardProps {
  profile: {
    startDate: string | Date;
    partner1Name?: string;
    partner1Avatar?: string;
    partner2Name?: string;
    partner2Avatar?: string;
    loveQuote?: string;
  } | null;
  onOpenLoveModal: () => void;
  onOpenRouletteModal: () => void;
}

export default function LoveCounterCard({
  profile,
  onOpenLoveModal,
  onOpenRouletteModal,
}: LoveCounterCardProps) {
  const [stats, setStats] = useState<LoveStats | null>(null);
  const [timeDetails, setTimeDetails] = useState({ hours: 0, minutes: 0, seconds: 0 });

  const startDate = profile?.startDate ? new Date(profile.startDate) : new Date();
  const partner1Name = profile?.partner1Name || 'Anh';
  const partner2Name = profile?.partner2Name || 'Em';
  const partner1Avatar = profile?.partner1Avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80';
  const partner2Avatar = profile?.partner2Avatar || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80';
  const quote = profile?.loveQuote || 'Cùng nhau già đi là điều lãng mạn nhất thế gian ❤️';

  useEffect(() => {
    setStats(calculateLoveStats(startDate));

    const updateTimer = () => {
      const now = new Date();
      setTimeDetails({
        hours: now.getHours(),
        minutes: now.getMinutes(),
        seconds: now.getSeconds(),
      });
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [profile?.startDate]);

  if (!stats) return null;

  const formattedStartDate = format(startDate, 'dd MMMM yyyy', { locale: vi });

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-rose-950/70 via-slate-900/90 to-purple-950/70 border border-rose-500/30 p-6 sm:p-8 shadow-2xl backdrop-blur-xl group">
      {/* Decorative ambient background glows */}
      <div className="absolute -top-24 -right-24 w-72 h-72 bg-rose-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-purple-500/15 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
        {/* Left Side: Avatars & Days Count */}
        <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left w-full lg:w-auto">
          {/* Couple Avatars with Connected Pulsing Heart */}
          <div className="relative flex items-center justify-center">
            {/* Partner 1 Avatar */}
            <div className="relative">
              <img
                src={partner1Avatar}
                alt={partner1Name}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover ring-4 ring-rose-500/50 shadow-lg shadow-rose-500/20"
              />
              <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-slate-900/90 text-rose-300 text-[10px] font-semibold border border-rose-500/30 whitespace-nowrap">
                {partner1Name}
              </span>
            </div>

            {/* Heart Link */}
            <div className="relative -mx-2 z-10 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-tr from-rose-500 to-pink-500 flex items-center justify-center shadow-lg shadow-rose-500/40 animate-pulse">
              <Heart className="w-5 h-5 text-white fill-white" />
            </div>

            {/* Partner 2 Avatar */}
            <div className="relative">
              <img
                src={partner2Avatar}
                alt={partner2Name}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover ring-4 ring-pink-500/50 shadow-lg shadow-pink-500/20"
              />
              <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-slate-900/90 text-pink-300 text-[10px] font-semibold border border-pink-500/30 whitespace-nowrap">
                {partner2Name}
              </span>
            </div>
          </div>

          {/* Days Number & Title */}
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 text-xs font-semibold mb-2 border border-rose-500/30">
              <Sparkles className="w-3.5 h-3.5 text-rose-300" />
              <span>Đã yêu nhau từ {formattedStartDate}</span>
            </div>

            <div className="flex items-baseline justify-center sm:justify-start gap-2">
              <span className="text-4xl sm:text-5xl lg:text-6xl font-black bg-gradient-to-r from-rose-400 via-pink-300 to-purple-300 bg-clip-text text-transparent tracking-tight">
                {stats.totalDays}
              </span>
              <span className="text-xl sm:text-2xl font-bold text-rose-200">NGÀY</span>
            </div>

            {/* Breakdown detail (Năm / Tháng / Ngày) */}
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              Tương đương{' '}
              <span className="font-semibold text-rose-300">
                {stats.years > 0 && `${stats.years} năm `}
                {stats.months > 0 && `${stats.months} tháng `}
                {stats.days} ngày
              </span>{' '}
              bên nhau đong đầy hạnh phúc
            </p>
          </div>
        </div>

        {/* Right Side: Next Milestone Progress & Quick Actions */}
        <div className="w-full lg:w-96 flex flex-col gap-4 bg-slate-900/70 p-4 sm:p-5 rounded-2xl border border-slate-700/60 shadow-inner">
          {/* Milestone progress */}
          {stats.nextMilestone && (
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-slate-300 font-medium flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-amber-400" />
                  Mốc tiếp theo: <b className="text-rose-300">{stats.nextMilestone.label}</b>
                </span>
                <span className="font-bold text-rose-400">
                  {stats.nextMilestone.daysLeft === 0 ? 'Hôm nay!' : `Còn ${stats.nextMilestone.daysLeft} ngày`}
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden border border-slate-700/50">
                <div
                  className="h-full bg-gradient-to-r from-rose-500 via-pink-500 to-purple-500 rounded-full transition-all duration-700 shadow-sm"
                  style={{ width: `${stats.progressToNext}%` }}
                />
              </div>
            </div>
          )}

          {/* Love Quote */}
          <div className="italic text-xs text-rose-200/90 bg-rose-500/10 p-2.5 rounded-xl border border-rose-500/20 text-center flex items-center justify-center gap-2">
            <span>“{quote}”</span>
          </div>

          {/* Buttons: Setting Love Days & Open Decision Wheel */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              onClick={onOpenLoveModal}
              className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 text-xs font-semibold transition-all hover:scale-102 active:scale-98"
            >
              <Edit3 className="w-3.5 h-3.5 text-rose-400" />
              <span>Chỉnh ngày yêu</span>
            </button>

            <button
              onClick={onOpenRouletteModal}
              className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-purple-600 hover:from-rose-600 hover:to-purple-700 text-white text-xs font-semibold shadow-md shadow-rose-500/20 transition-all hover:scale-102 active:scale-98"
            >
              <Compass className="w-3.5 h-3.5 animate-spin text-rose-200" style={{ animationDuration: '6s' }} />
              <span>Vòng quay hẹn hò</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
