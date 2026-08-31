'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Heart,
  Calendar,
  Sparkles,
  Settings,
  Bell,
  CheckCircle2,
  AlertCircle,
  Coffee,
  Trash2,
} from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { calculateCycleInfo, CycleCalculationResult } from '@/lib/periodUtils';

interface PeriodTrackerModalProps {
  initialSetting: any | null;
  onClose: () => void;
  onRefresh: () => void;
}

export default function PeriodTrackerModal({
  initialSetting,
  onClose,
  onRefresh,
}: PeriodTrackerModalProps) {
  const [activeView, setActiveView] = useState<'status' | 'settings'>('status');

  // Form states
  const [startDate, setStartDate] = useState(
    initialSetting?.startDate
      ? new Date(initialSetting.startDate).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0]
  );
  const [cycleLength, setCycleLength] = useState<number>(initialSetting?.cycleLength || 28);
  const [reminderDaysBefore, setReminderDaysBefore] = useState<number>(
    initialSetting?.reminderDaysBefore || 3
  );
  const [partnerName, setPartnerName] = useState(initialSetting?.partnerName || 'Em');
  const [notes, setNotes] = useState(initialSetting?.notes || '');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // If no initial setting, default to settings view
  useEffect(() => {
    if (!initialSetting) {
      setActiveView('settings');
    }
  }, [initialSetting]);

  // Preview cycle calculation dynamically
  const previewCycleInfo: CycleCalculationResult | null = startDate
    ? calculateCycleInfo(startDate, cycleLength, 1, new Date())
    : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate) {
      setError('Vui lòng chọn ngày bắt đầu đến tháng');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccessMsg(null);

      const res = await fetch('/api/period', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startDate,
          cycleLength: Number(cycleLength),
          reminderDaysBefore: Number(reminderDaysBefore),
          partnerName: partnerName.trim() || 'Em',
          notes: notes.trim(),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Lỗi khi lưu cài đặt');
      }

      setSuccessMsg('Đã cập nhật chu kỳ thành công! ❤️');
      setTimeout(() => {
        onRefresh();
        setActiveView('status');
      }, 700);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Bạn có chắc chắn muốn xóa theo dõi ngày đến tháng này không?')) return;
    try {
      setLoading(true);
      const res = await fetch('/api/period', { method: 'DELETE' });
      if (res.ok) {
        onRefresh();
        onClose();
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const cycleDay = previewCycleInfo?.currentCycleDay || 1;
  const totalDays = previewCycleInfo?.totalCycleDays || 28;
  const cycleProgressPct = Math.min(100, Math.round((cycleDay / totalDays) * 100));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
      <div className="glass-modal rounded-3xl w-full max-w-2xl border border-rose-500/40 shadow-2xl space-y-6 relative max-h-[92vh] overflow-y-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-700/60 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-rose-500 via-pink-500 to-purple-600 rounded-2xl text-white shadow-lg shadow-rose-500/25 animate-pulse">
              <Heart className="w-6 h-6 fill-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-black text-white">
                  Theo Dõi Ngày Đến Tháng Của {partnerName || 'Em'} 🌸
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  Chu kỳ {cycleLength} ngày
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Tự động lặp lại sau mỗi {cycleLength} ngày & thông báo đếm ngược
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {initialSetting && (
              <div className="flex items-center bg-slate-800 p-1 rounded-xl border border-slate-700">
                <button
                  type="button"
                  onClick={() => setActiveView('status')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    activeView === 'status'
                      ? 'bg-rose-500 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Tổng quan
                </button>
                <button
                  type="button"
                  onClick={() => setActiveView('settings')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                    activeView === 'settings'
                      ? 'bg-rose-500 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Settings className="w-3.5 h-3.5" /> Cài đặt
                </button>
              </div>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-200 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* View 1: Status & Care Tips */}
        {activeView === 'status' && previewCycleInfo && (
          <div className="space-y-6">
            {/* Primary Hero Card with Wheel/Gauge & Countdown */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-rose-950/40 via-purple-950/30 to-slate-900 border border-rose-500/30 p-6">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                {/* Circular Cycle Progress */}
                <div className="flex items-center gap-5">
                  <div className="relative w-24 h-24 flex items-center justify-center flex-shrink-0">
                    <svg className="w-24 h-24 transform -rotate-90">
                      <circle
                        cx="48"
                        cy="48"
                        r="40"
                        stroke="currentColor"
                        strokeWidth="7"
                        className="text-slate-800"
                        fill="transparent"
                      />
                      <circle
                        cx="48"
                        cy="48"
                        r="40"
                        stroke="currentColor"
                        strokeWidth="7"
                        className="text-rose-500 transition-all duration-1000 ease-out"
                        strokeDasharray={251.3}
                        strokeDashoffset={251.3 - (251.3 * cycleProgressPct) / 100}
                        strokeLinecap="round"
                        fill="transparent"
                      />
                    </svg>
                    <div className="absolute text-center">
                      <div className="text-xl font-black text-rose-300">{cycleDay}</div>
                      <div className="text-[10px] text-slate-400 uppercase font-bold">/ {totalDays} Ngày</div>
                    </div>
                  </div>

                  <div>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 text-xs font-bold mb-2 border border-rose-500/30">
                      <span>{previewCycleInfo.statusBadgeText}</span>
                    </div>
                    <h4 className="text-2xl font-black text-white leading-tight">
                      {previewCycleInfo.countdownText}
                    </h4>
                    <p className="text-xs text-slate-300 mt-1">
                      Kỳ tiếp theo dự kiến:{' '}
                      <span className="font-semibold text-rose-300">
                        {format(previewCycleInfo.nextPeriodStartDate, 'dd/MM/yyyy', { locale: vi })}
                      </span>{' '}
                      ({format(previewCycleInfo.nextPeriodStartDate, 'EEEE', { locale: vi })})
                    </p>
                  </div>
                </div>

                {/* Next Date Display Card */}
                <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-700/60 text-center min-w-[180px]">
                  <div className="text-3xl mb-1">🩸</div>
                  <div className="text-xs font-bold text-slate-200">Ngày Đến Tháng Kế Tiếp</div>
                  <div className="text-base font-black text-rose-400 mt-1">
                    {format(previewCycleInfo.nextPeriodStartDate, 'dd/MM/yyyy')}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Lặp lại mỗi {totalDays} ngày
                  </div>
                </div>
              </div>
            </div>

            {/* Key Milestones Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between">
                <div>
                  <div className="text-slate-400 flex items-center gap-1.5 mb-1">
                    <span>🩸</span> Ngày bắt đầu kỳ gần nhất
                  </div>
                  <div className="font-bold text-white text-base">
                    {format(new Date(previewCycleInfo.currentCycleStartDate), 'dd/MM/yyyy')}
                  </div>
                </div>
                <div className="text-2xl">🗓️</div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between">
                <div>
                  <div className="text-slate-400 flex items-center gap-1.5 mb-1">
                    <span>🔔</span> Ngày bắt đầu kỳ kế tiếp
                  </div>
                  <div className="font-bold text-rose-300 text-base">
                    {format(new Date(previewCycleInfo.nextPeriodStartDate), 'dd/MM/yyyy')}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    {previewCycleInfo.daysUntilNextPeriod === 0
                      ? 'Hôm nay!'
                      : `Còn ${previewCycleInfo.daysUntilNextPeriod} ngày nữa`}
                  </div>
                </div>
                <div className="text-2xl">⏰</div>
              </div>
            </div>

            {/* Care Guide For Boyfriend Section */}
            <div className="glass-card rounded-3xl p-5 border border-rose-500/30 bg-gradient-to-br from-slate-900 via-rose-950/20 to-slate-900 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h4 className="font-bold text-white text-sm flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  Bí Kíp & Lời Khuyên Chăm Sóc Người Yêu
                </h4>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-semibold">
                  Tâm lý & Yêu thương ❤️
                </span>
              </div>

              <div className="space-y-2.5">
                {previewCycleInfo.careTips.map((tip, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-800/50 border border-slate-700/40 text-xs text-slate-200"
                  >
                    <span className="text-rose-400 font-bold">✓</span>
                    <span className="leading-relaxed">{tip}</span>
                  </div>
                ))}
              </div>

              {/* Suggested Comfort Foods */}
              <div className="pt-2">
                <div className="text-[11px] font-semibold text-slate-400 mb-2 flex items-center gap-1.5">
                  <Coffee className="w-3.5 h-3.5 text-amber-400" />
                  Món ăn / đồ uống ấm nên chuẩn bị cho nàng:
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {previewCycleInfo.foodTips.map((food, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 text-rose-300 border border-slate-700/60 text-[11px] font-medium"
                    >
                      🍽️ {food}
                    </span>
                  ))}
                </div>
              </div>

              {/* Custom Personal Notes */}
              {initialSetting?.notes && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-slate-300">
                  <span className="font-bold text-rose-300">📌 Ghi chú riêng về {partnerName}: </span>
                  {initialSetting.notes}
                </div>
              )}
            </div>

            {/* Quick Action Buttons */}
            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => setActiveView('settings')}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition-colors"
              >
                <Settings className="w-3.5 h-3.5" /> Điều chỉnh ngày & chu kỳ
              </button>

              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-purple-600 text-white text-xs font-bold hover:from-rose-600 hover:to-purple-700 shadow-md shadow-rose-500/20 transition-all"
              >
                Đã hiểu & Quan tâm nàng ❤️
              </button>
            </div>
          </div>
        )}

        {/* View 2: Settings Form */}
        {activeView === 'settings' && (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-slate-300 text-xs leading-relaxed space-y-1">
              <div className="font-bold text-rose-300 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" /> Cách thức hoạt động của chu kỳ 28 ngày:
              </div>
              <p>
                • Bạn chỉ cần chọn <strong>ngày bắt đầu bị gần nhất</strong> (ví dụ: ngày 10).
              </p>
              <p>
                • Hệ thống sẽ tự động tính ngày bắt đầu kế tiếp sau <strong>28 ngày</strong> (lặp lại liên tục cho tất cả các tháng) và hiển thị thông báo đếm ngược chính xác cùng dấu 🩸 trên Lịch Đôi.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Start Date */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1.5">
                  Ngày bắt đầu đến tháng gần nhất *
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-100 focus:outline-none focus:border-rose-500"
                  required
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Ví dụ: Chọn ngày 10/08 thì kỳ sau là 07/09 (+28 ngày).
                </span>
              </div>

              {/* Partner Name */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1.5">
                  Tên / Danh xưng của bạn gái
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: Em, Bé Yêu, Vợ..."
                  value={partnerName}
                  onChange={(e) => setPartnerName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-rose-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Cycle Length */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1.5">
                  Độ dài chu kỳ (ngày)
                </label>
                <input
                  type="number"
                  min={20}
                  max={45}
                  value={cycleLength}
                  onChange={(e) => setCycleLength(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-100 focus:outline-none focus:border-rose-500"
                  required
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Mặc định: <strong>28 ngày</strong> (lặp lại sau 28 ngày)
                </span>
              </div>

              {/* Reminder Days Before */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1.5">
                  Thông báo trước (ngày)
                </label>
                <select
                  value={reminderDaysBefore}
                  onChange={(e) => setReminderDaysBefore(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-100 focus:outline-none focus:border-rose-500"
                >
                  <option value={1}>Trước 1 ngày</option>
                  <option value={2}>Trước 2 ngày</option>
                  <option value={3}>Trước 3 ngày (Khuyên dùng)</option>
                  <option value={5}>Trước 5 ngày</option>
                </select>
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Nhận chuông thông báo
                </span>
              </div>
            </div>

            {/* Custom Notes */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1.5">
                Ghi chú sở thích & triệu chứng của {partnerName || 'Em'} (Không bắt buộc)
              </label>
              <textarea
                rows={2}
                placeholder="Ví dụ: Nàng hay bị đau lưng, thích uống trà gừng ấm, thích ăn sô cô la ngọt..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-rose-500"
              />
            </div>

            {/* Preview Box */}
            {previewCycleInfo && (
              <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700 text-slate-300 flex items-center justify-between">
                <div>
                  <div className="text-[10px] uppercase font-bold text-rose-400">Dự báo ngày đến tháng</div>
                  <div className="font-bold text-white text-sm mt-0.5">
                    {previewCycleInfo.countdownText}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Kỳ tiếp theo: {format(previewCycleInfo.nextPeriodStartDate, 'dd/MM/yyyy')} (Lặp lại {cycleLength} ngày)
                  </div>
                </div>
                <div className="text-2xl">🩸</div>
              </div>
            )}

            {/* Form Actions */}
            <div className="pt-4 border-t border-slate-700/60 flex items-center justify-between">
              {initialSetting ? (
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={loading}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-rose-950/40 text-rose-400 hover:text-rose-300 text-xs font-semibold flex items-center gap-1 border border-slate-700 hover:border-rose-500/40 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Xóa theo dõi
                </button>
              ) : (
                <div />
              )}

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-purple-600 text-white font-bold hover:from-rose-600 hover:to-purple-700 shadow-lg shadow-rose-500/25 transition-all"
                >
                  {loading ? 'Đang lưu...' : 'Lưu Ngày Đến Tháng ❤️'}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
