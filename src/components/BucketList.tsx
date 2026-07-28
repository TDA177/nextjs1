'use client';

import React, { useState } from 'react';
import { Sparkles, Calendar, CheckSquare, Clock, AlertTriangle, Plus, Filter, Heart, MessageSquare, Paperclip, ChevronRight, User } from 'lucide-react';

interface BucketListProps {
  items: any[];
  onSelectItem: (item: any) => void;
  onOpenCreate: () => void;
}

export default function BucketList({ items, onSelectItem, onOpenCreate }: BucketListProps) {
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredItems = items.filter((item) => {
    const matchesType = selectedType === 'ALL' || item.type === selectedType;
    const matchesStatus = selectedStatus === 'ALL' || item.status === selectedStatus;
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesType && matchesStatus && matchesSearch;
  });

  const getPriorityStyle = (priority: string) => {
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

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Bucket':
        return '✈️';
      case 'Event':
        return '🎬';
      case 'Task':
        return '✅';
      case 'Anniversary':
        return '❤️';
      case 'Birthday':
        return '🎂';
      default:
        return '🔔';
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Controls & Filter Bar */}
      <div className="glass-card rounded-3xl p-6 border border-slate-700/60 flex flex-col lg:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="w-full lg:w-72 relative">
          <input
            type="text"
            placeholder="Tìm kiếm mục tiêu, sự kiện..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-800/80 border border-slate-700/80 rounded-2xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:border-rose-500 transition-all"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
          {/* Type filters */}
          <div className="flex items-center bg-slate-800/80 p-1 rounded-2xl border border-slate-700/60 overflow-x-auto max-w-full">
            {['ALL', 'Bucket', 'Event', 'Task', 'Anniversary', 'Birthday'].map((t) => (
              <button
                key={t}
                onClick={() => setSelectedType(t)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedType === t
                    ? 'bg-rose-500 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {t === 'ALL' ? 'Tất cả loại' : t}
              </button>
            ))}
          </div>

          {/* Status filters */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-slate-800/80 border border-slate-700/80 rounded-2xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-rose-500"
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="Planned">Planned</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
            <option value="Overdue">Overdue</option>
          </select>
        </div>
      </div>

      {/* Grid of Items */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.length === 0 ? (
          <div className="col-span-full glass-card rounded-3xl p-12 text-center border border-slate-700/60">
            <Sparkles className="w-12 h-12 text-slate-500 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-300">Không tìm thấy mục nào</h3>
            <p className="text-xs text-slate-500 mt-1">Thử thay đổi bộ lọc hoặc tạo thêm mục mới!</p>
            <button
              onClick={onOpenCreate}
              className="mt-4 px-4 py-2 rounded-xl bg-rose-500 text-white text-xs font-bold hover:bg-rose-600 transition-colors"
            >
              + Tạo mục mới ngay
            </button>
          </div>
        ) : (
          filteredItems.map((item) => {
            const checklists = item.checklists || [];
            const totalCheck = checklists.length;
            const doneCheck = checklists.filter((c: any) => c.isCompleted).length;
            const progressPct = totalCheck > 0 ? Math.round((doneCheck / totalCheck) * 100) : 0;

            const commentsCount = item.comments?.length || 0;
            const attachCount = item.attachments?.length || 0;
            const eventsCount = item.events?.length || 0;

            return (
              <div
                key={item.id}
                onClick={() => onSelectItem(item)}
                className="glass-card rounded-3xl p-6 border border-slate-700/60 hover:border-rose-500/40 transition-all cursor-pointer group flex flex-col justify-between hover:shadow-2xl hover:shadow-rose-500/10 transform hover:-translate-y-1"
              >
                <div>
                  {/* Top Metadata */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-2xl">{getTypeIcon(item.type)}</span>
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getPriorityStyle(item.priority)}`}>
                        {item.priority}
                      </span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          item.status === 'Completed'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : item.status === 'Overdue'
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse'
                            : 'bg-slate-700/60 text-slate-300'
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>
                  </div>

                  {/* Title & Description */}
                  <h3 className="font-bold text-lg text-white group-hover:text-rose-300 transition-colors line-clamp-1">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                    {item.description || 'Chưa có mô tả chi tiết'}
                  </p>

                  {/* Deadline or Date info (Rule 1 & 2) */}
                  {(item.deadline || item.startDate) && (
                    <div className="mt-3 flex items-center gap-2 text-xs text-rose-300 font-mono bg-rose-500/10 p-2 rounded-xl border border-rose-500/20 w-fit">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>
                        {item.deadline
                          ? `Deadline: ${new Date(item.deadline).toLocaleDateString('vi-VN')}`
                          : `Ngày: ${new Date(item.startDate).toLocaleDateString('vi-VN')}`}
                      </span>
                    </div>
                  )}

                  {/* Linked Events summary (Rule 5) */}
                  {eventsCount > 0 && (
                    <div className="mt-3 text-[11px] text-purple-300 bg-purple-500/10 p-2 rounded-xl border border-purple-500/20 flex items-center justify-between">
                      <span>🎬 Events liên kết:</span>
                      <span className="font-bold">{eventsCount} sự kiện</span>
                    </div>
                  )}

                  {/* Progress Bar for Checklist */}
                  {totalCheck > 0 && (
                    <div className="mt-4 space-y-1.5">
                      <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium">
                        <span className="flex items-center gap-1">
                          <CheckSquare className="w-3 h-3 text-rose-400" /> Progress Checklist
                        </span>
                        <span className="font-bold text-rose-300">
                          {doneCheck} / {totalCheck} ({progressPct}%)
                        </span>
                      </div>
                      <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden border border-slate-700/60">
                        <div
                          className="bg-gradient-to-r from-rose-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Card Footer Info */}
                <div className="mt-5 pt-4 border-t border-slate-700/60 flex items-center justify-between text-xs text-slate-400">
                  <div className="flex items-center gap-3">
                    {commentsCount > 0 && (
                      <span className="flex items-center gap-1 text-slate-300">
                        <MessageSquare className="w-3.5 h-3.5 text-rose-400" /> {commentsCount}
                      </span>
                    )}
                    {attachCount > 0 && (
                      <span className="flex items-center gap-1 text-slate-300">
                        <Paperclip className="w-3.5 h-3.5 text-purple-400" /> {attachCount}
                      </span>
                    )}
                    <span className="text-[10px] text-slate-500">Tạo bởi: {item.createdBy}</span>
                  </div>

                  <span className="text-rose-400 font-semibold group-hover:translate-x-1 transition-transform flex items-center gap-0.5">
                    Chi tiết <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
