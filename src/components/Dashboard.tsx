'use client';

import React from 'react';
import { CheckCircle2, Clock, AlertTriangle, ListTodo, Flame, Calendar, Award, Sparkles, Heart } from 'lucide-react';

interface DashboardProps {
  items: any[];
  onSelectItem: (item: any) => void;
}

export default function Dashboard({ items, onSelectItem }: DashboardProps) {
  const buckets = items.filter((i) => i.type === 'Bucket');
  const events = items.filter((i) => i.type === 'Event');
  const tasks = items.filter((i) => i.type === 'Task');
  const anniversaries = items.filter((i) => i.type === 'Anniversary');
  const birthdays = items.filter((i) => i.type === 'Birthday');

  const completedCount = items.filter((i) => i.status === 'Completed').length;
  const inProgressCount = items.filter((i) => i.status === 'In Progress').length;
  const overdueCount = items.filter((i) => i.status === 'Overdue').length;

  const totalItems = items.length;
  const completionPercentage = totalItems > 0 ? Math.round((completedCount / totalItems) * 100) : 0;

  const upcomingItems = items
    .filter((i) => i.deadline || i.startDate)
    .sort((a, b) => new Date(a.deadline || a.startDate).getTime() - new Date(b.deadline || b.startDate).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Hero Welcome Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-rose-500/20 via-purple-500/20 to-pink-500/10 border border-rose-500/30 p-8 glass-card">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 text-xs font-semibold mb-3 border border-rose-500/30">
              <Heart className="w-3.5 h-3.5 fill-rose-400" /> Couple Dashboard Overview
            </div>
            <h2 className="text-3xl font-extrabold text-white tracking-tight">
              Hành Trình Yêu Thương & Kế Hoạch Đôi ❤️
            </h2>
            <p className="text-slate-300 mt-2 max-w-xl text-sm leading-relaxed">
              Quản lý tất cả mục tiêu du lịch, sự kiện, việc cần làm và kỷ niệm đẹp của Anh & Em tại một nơi duy nhất.
            </p>
          </div>

          {/* Overall Progress Gauge */}
          <div className="flex items-center gap-4 bg-slate-900/60 p-4 rounded-2xl border border-slate-700/60">
            <div className="relative w-16 h-16 flex items-center justify-center">
              <svg className="w-16 h-16 transform -rotate-90">
                <circle cx="32" cy="32" r="26" stroke="currentColor" strokeWidth="5" className="text-slate-800" fill="transparent" />
                <circle
                  cx="32"
                  cy="32"
                  r="26"
                  stroke="currentColor"
                  strokeWidth="5"
                  className="text-rose-500 transition-all duration-1000 ease-out"
                  strokeDasharray={163.3}
                  strokeDashoffset={163.3 - (163.3 * completionPercentage) / 100}
                  strokeLinecap="round"
                  fill="transparent"
                />
              </svg>
              <span className="absolute font-bold text-sm text-rose-300">{completionPercentage}%</span>
            </div>
            <div>
              <div className="text-xs text-slate-400">Tiến độ tổng thể</div>
              <div className="text-lg font-bold text-white">{completedCount} / {totalItems} Hoàn thành</div>
            </div>
          </div>
        </div>
      </div>

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Bucket Stats */}
        <div className="glass-card rounded-2xl p-5 border border-slate-700/60 hover:border-rose-500/40 transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Tổng Bucket</span>
            <div className="p-2.5 rounded-xl bg-purple-500/20 text-purple-400 group-hover:scale-110 transition-transform">
              <Sparkles className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-white mt-3">{buckets.length}</div>
          <p className="text-xs text-slate-400 mt-2">Mục tiêu & điều muốn làm trong tương lai</p>
        </div>

        {/* Completed Stats */}
        <div className="glass-card rounded-2xl p-5 border border-slate-700/60 hover:border-emerald-500/40 transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Completed</span>
            <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 group-hover:scale-110 transition-transform">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-emerald-400 mt-3">{completedCount}</div>
          <p className="text-xs text-slate-400 mt-2">Kỷ niệm tuyệt vời đã hoàn thành</p>
        </div>

        {/* In Progress Stats */}
        <div className="glass-card rounded-2xl p-5 border border-slate-700/60 hover:border-amber-500/40 transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">In Progress</span>
            <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 group-hover:scale-110 transition-transform">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-amber-400 mt-3">{inProgressCount}</div>
          <p className="text-xs text-slate-400 mt-2">Đang tích cực chuẩn bị & thực hiện</p>
        </div>

        {/* Overdue Stats */}
        <div className="glass-card rounded-2xl p-5 border border-slate-700/60 hover:border-rose-500/40 transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Overdue</span>
            <div className="p-2.5 rounded-xl bg-rose-500/20 text-rose-400 group-hover:scale-110 transition-transform">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-rose-400 mt-3">{overdueCount}</div>
          <p className="text-xs text-slate-400 mt-2">Quá hạn cần cập nhật lại lịch</p>
        </div>
      </div>

      {/* Secondary Detailed Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Upcoming Deadlines & Events */}
        <div className="lg:col-span-2 glass-card rounded-3xl p-6 border border-slate-700/60">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-rose-400" />
            Lịch Sắp Đến Hạn & Sự Kiện Chi Tiết
          </h3>
          <div className="space-y-3">
            {upcomingItems.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">Chưa có kế hoạch sắp đến hạn!</p>
            ) : (
              upcomingItems.map((item) => {
                const dateVal = item.deadline || item.startDate;
                return (
                  <div
                    key={item.id}
                    onClick={() => onSelectItem(item)}
                    className="flex items-center justify-between p-4 rounded-2xl bg-slate-800/50 hover:bg-slate-700/60 transition-all cursor-pointer border border-slate-700/40 hover:border-rose-500/40"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-3 h-3 rounded-full ${
                          item.status === 'Completed'
                            ? 'bg-emerald-400'
                            : item.status === 'Overdue'
                            ? 'bg-rose-500 animate-pulse'
                            : 'bg-amber-400'
                        }`}
                      />
                      <div>
                        <div className="font-semibold text-slate-200 text-sm">{item.title}</div>
                        <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                          <span className="px-2 py-0.5 rounded bg-slate-700 text-rose-300 font-mono text-[10px]">
                            {item.type}
                          </span>
                          <span>{item.description || 'Không có mô tả'}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-semibold text-rose-300">
                        {dateVal ? new Date(dateVal).toLocaleDateString('vi-VN') : 'Chưa xếp ngày'}
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-700 text-slate-300 font-medium">
                        {item.status}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Item Category Breakdown */}
        <div className="glass-card rounded-3xl p-6 border border-slate-700/60 space-y-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Award className="w-5 h-5 text-purple-400" />
            Phân Loại Mục Kế Hoạch
          </h3>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/40">
              <span className="text-xs text-slate-300 flex items-center gap-2">✈️ Bucket List</span>
              <span className="font-bold text-white text-sm">{buckets.length}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/40">
              <span className="text-xs text-slate-300 flex items-center gap-2">🎬 Sự kiện (Events)</span>
              <span className="font-bold text-white text-sm">{events.length}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/40">
              <span className="text-xs text-slate-300 flex items-center gap-2">✅ Việc cần làm (Tasks)</span>
              <span className="font-bold text-white text-sm">{tasks.length}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/40">
              <span className="text-xs text-slate-300 flex items-center gap-2">❤️ Kỷ niệm (Anniversary)</span>
              <span className="font-bold text-white text-sm">{anniversaries.length}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/40">
              <span className="text-xs text-slate-300 flex items-center gap-2">🎂 Sinh nhật (Birthday)</span>
              <span className="font-bold text-white text-sm">{birthdays.length}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
