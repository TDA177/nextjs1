'use client';

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Heart, Plus, Sparkles, MapPin, CheckCircle } from 'lucide-react';
import {
  format,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
} from 'date-fns';
import { vi } from 'date-fns/locale';

interface CoupleCalendarProps {
  items: any[];
  onSelectItem: (item: any) => void;
  onOpenCreateDate?: (date: Date) => void;
}

export default function CoupleCalendar({ items, onSelectItem, onOpenCreateDate }: CoupleCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);

  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const today = new Date();

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const days = eachDayOfInterval({ start: startDate, end: endDate });

  // Map items & sub-events to dates
  const getItemsForDay = (day: Date) => {
    const matchedItems: any[] = [];

    items.forEach((item) => {
      // Direct item date (startDate or deadline)
      const targetDate = item.startDate ? new Date(item.startDate) : item.deadline ? new Date(item.deadline) : null;

      if (targetDate && isSameDay(targetDate, day)) {
        matchedItems.push({
          ...item,
          calendarDisplayTitle: item.title,
          isSubEvent: false,
        });
      }

      // Check linked Sub-Events (Rule 5)
      if (item.events && item.events.length > 0) {
        item.events.forEach((ev: any) => {
          if (ev.eventStart && isSameDay(new Date(ev.eventStart), day)) {
            matchedItems.push({
              ...item,
              id: `${item.id}-sub-${ev.id}`,
              originalItem: item,
              calendarDisplayTitle: `📍 ${ev.title} (${item.title})`,
              eventDetail: ev,
              isSubEvent: true,
            });
          }
        });
      }
    });

    return matchedItems;
  };

  const getItemTypeIcon = (type: string, title: string) => {
    const lower = title.toLowerCase();
    if (type === 'Anniversary' || lower.includes('kỷ niệm') || lower.includes('yêu')) return '❤️';
    if (type === 'Birthday' || lower.includes('sinh nhật')) return '🎂';
    if (lower.includes('phim') || lower.includes('movie')) return '🎬';
    if (lower.includes('vé') || lower.includes('máy bay') || type === 'Bucket') return '✈️';
    if (type === 'Task') return '✅';
    if (type === 'Reminder') return '🔔';
    return '📌';
  };

  const getPriorityBadgeClass = (priority: string) => {
    switch (priority) {
      case 'Critical':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
      case 'High':
        return 'bg-pink-500/20 text-pink-300 border-pink-500/40';
      case 'Medium':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      default:
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
    }
  };

  const daySelectedItems = selectedDay ? getItemsForDay(selectedDay) : [];

  return (
    <div className="space-y-6">
      {/* Calendar Header Controls */}
      <div className="glass-card rounded-3xl p-6 border border-slate-700/60 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-rose-500 to-purple-600 rounded-2xl shadow-lg shadow-rose-500/20">
            <CalendarIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white capitalize">
              {format(currentMonth, 'MMMM yyyy', { locale: vi })}
            </h2>
            <p className="text-xs text-slate-400">Lịch đôi - Sự kiện & Bucket hiển thị tự động (Rule 2)</p>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrentMonth(new Date())}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-rose-300 border border-slate-700 transition-colors"
          >
            Hôm nay
          </button>
          <div className="flex items-center bg-slate-800/80 rounded-xl border border-slate-700/60 p-1">
            <button
              onClick={prevMonth}
              className="p-2 hover:bg-slate-700 rounded-lg text-slate-300 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={nextMonth}
              className="p-2 hover:bg-slate-700 rounded-lg text-slate-300 transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Grid Calendar */}
      <div className="glass-card rounded-3xl border border-slate-700/60 overflow-hidden shadow-2xl">
        {/* Days of Week Header */}
        <div className="grid grid-cols-7 border-b border-slate-700/60 bg-slate-800/50 text-center font-bold text-xs text-rose-300 py-3">
          <div>Thứ 2</div>
          <div>Thứ 3</div>
          <div>Thứ 4</div>
          <div>Thứ 5</div>
          <div>Thứ 6</div>
          <div>Thứ 7</div>
          <div>Chủ Nhật</div>
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 auto-rows-fr gap-px bg-slate-800/40">
          {days.map((day, idx) => {
            const dayItems = getItemsForDay(day);
            const isCurrMonth = isSameMonth(day, currentMonth);
            const isTodayDate = isToday(day);

            return (
              <div
                key={idx}
                onClick={() => setSelectedDay(day)}
                className={`min-h-[110px] sm:min-h-[130px] p-2 transition-all cursor-pointer flex flex-col justify-between group ${
                  !isCurrMonth ? 'bg-slate-900/40 text-slate-600' : 'bg-slate-900/80 text-slate-200 hover:bg-slate-800/60'
                } ${isTodayDate ? 'ring-2 ring-rose-500/80 z-10 bg-rose-950/20' : ''}`}
              >
                {/* Date header */}
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={`text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center ${
                      isTodayDate
                        ? 'bg-rose-500 text-white shadow-md shadow-rose-500/40'
                        : isCurrMonth
                        ? 'text-slate-300'
                        : 'text-slate-600'
                    }`}
                  >
                    {format(day, 'd')}
                  </span>
                  {dayItems.length > 0 && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                      {dayItems.length}
                    </span>
                  )}
                </div>

                {/* Items preview list */}
                <div className="space-y-1 overflow-hidden flex-1">
                  {dayItems.slice(0, 3).map((item, i) => {
                    const icon = getItemTypeIcon(item.type, item.calendarDisplayTitle);
                    return (
                      <div
                        key={i}
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectItem(item.originalItem || item);
                        }}
                        className={`text-[11px] p-1 rounded-lg border truncate font-medium flex items-center gap-1 transition-transform hover:scale-102 ${getPriorityBadgeClass(
                          item.priority
                        )}`}
                      >
                        <span>{icon}</span>
                        <span className="truncate">{item.calendarDisplayTitle}</span>
                      </div>
                    );
                  })}
                  {dayItems.length > 3 && (
                    <div className="text-[10px] text-slate-400 font-semibold text-center">
                      +{dayItems.length - 3} mục nữa...
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Day View Modal */}
      {selectedDay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fadeIn">
          <div className="glass-modal rounded-3xl w-full max-w-lg p-6 border border-rose-500/30 shadow-2xl relative space-y-4">
            <div className="flex items-center justify-between border-b border-slate-700/60 pb-3">
              <div>
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <CalendarIcon className="w-5 h-5 text-rose-400" />
                  {format(selectedDay, 'dd MMMM yyyy', { locale: vi })}
                </h3>
                <p className="text-xs text-slate-400">Danh sách tất cả kế hoạch trong ngày này</p>
              </div>
              <button
                onClick={() => setSelectedDay(null)}
                className="text-slate-400 hover:text-white p-2 rounded-xl bg-slate-800"
              >
                ✕
              </button>
            </div>

            <div className="max-h-96 overflow-y-auto space-y-3 pr-1">
              {daySelectedItems.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  <p className="text-sm">Chưa có sự kiện nào cho ngày này.</p>
                  {onOpenCreateDate && (
                    <button
                      onClick={() => {
                        const target = selectedDay;
                        setSelectedDay(null);
                        onOpenCreateDate(target);
                      }}
                      className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-500 text-white text-xs font-semibold hover:bg-rose-600 transition-colors"
                    >
                      <Plus className="w-4 h-4" /> Tạo kế hoạch mới cho ngày này
                    </button>
                  )}
                </div>
              ) : (
                daySelectedItems.map((item, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      setSelectedDay(null);
                      onSelectItem(item.originalItem || item);
                    }}
                    className="p-4 rounded-2xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 cursor-pointer transition-all flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{getItemTypeIcon(item.type, item.calendarDisplayTitle)}</span>
                      <div>
                        <div className="font-semibold text-slate-100 text-sm group-hover:text-rose-300 transition-colors">
                          {item.calendarDisplayTitle}
                        </div>
                        <div className="text-xs text-slate-400 flex items-center gap-2 mt-1">
                          <span className="px-2 py-0.5 rounded bg-slate-700 text-rose-300 font-mono text-[10px]">
                            {item.type}
                          </span>
                          <span>Trạng thái: {item.status}</span>
                        </div>
                      </div>
                    </div>
                    <span className="text-xs text-rose-400 font-semibold group-hover:translate-x-1 transition-transform">
                      Xem chi tiết →
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
