'use client';

import React, { useState } from 'react';
import { X, Heart, Sparkles, CheckCircle2, Calendar, Clock, Save, Image as ImageIcon, Flame } from 'lucide-react';
import { calculateLoveStats } from '@/lib/loveUtils';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

interface LoveCounterModalProps {
  profile: any;
  onClose: () => void;
  onRefresh: () => void;
}

export default function LoveCounterModal({ profile, onClose, onRefresh }: LoveCounterModalProps) {
  const [activeTab, setActiveTab] = useState<'milestones' | 'settings'>('milestones');

  const [startDate, setStartDate] = useState(
    profile?.startDate
      ? new Date(profile.startDate).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0]
  );
  const [partner1Name, setPartner1Name] = useState(profile?.partner1Name || 'Anh');
  const [partner1Avatar, setPartner1Avatar] = useState(profile?.partner1Avatar || '');
  const [partner2Name, setPartner2Name] = useState(profile?.partner2Name || 'Em');
  const [partner2Avatar, setPartner2Avatar] = useState(profile?.partner2Avatar || '');
  const [loveQuote, setLoveQuote] = useState(
    profile?.loveQuote || 'Cùng nhau già đi là điều lãng mạn nhất thế gian ❤️'
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const currentStats = calculateLoveStats(startDate);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      setSuccess(false);

      const res = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startDate,
          partner1Name,
          partner1Avatar,
          partner2Name,
          partner2Avatar,
          loveQuote,
        }),
      });

      if (!res.ok) {
        throw new Error('Lỗi khi lưu thông tin');
      }

      setSuccess(true);
      onRefresh();
      setTimeout(() => {
        setSuccess(false);
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Đã có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-slate-900/95 border border-rose-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden glass-card">
        {/* Header decoration */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-700/60 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-500 to-pink-500 flex items-center justify-center shadow-lg shadow-rose-500/30">
              <Heart className="w-5 h-5 text-white fill-white animate-pulse" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                Hành Trình Yêu Thương
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  {currentStats.totalDays} Ngày
                </span>
              </h2>
              <p className="text-xs text-slate-400">Xem các cột mốc kỷ niệm & tùy chỉnh ngày yêu</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex gap-2 p-1 bg-slate-800/80 rounded-2xl border border-slate-700/60 mb-6">
          <button
            onClick={() => setActiveTab('milestones')}
            className={`flex-1 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'milestones'
                ? 'bg-gradient-to-r from-rose-500 to-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            Cột Mốc Kỷ Niệm ({currentStats.milestones.length})
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex-1 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'settings'
                ? 'bg-gradient-to-r from-rose-500 to-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Calendar className="w-4 h-4" />
            Tùy Chỉnh Ngày & Profile
          </button>
        </div>

        {/* Tab 1: Milestones */}
        {activeTab === 'milestones' && (
          <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
            {/* Overview Box */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-rose-500/10 via-purple-500/10 to-pink-500/10 border border-rose-500/20 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <div className="text-xs text-rose-300 font-medium">Tổng thời gian bên nhau</div>
                <div className="text-2xl font-extrabold text-white mt-0.5">
                  {currentStats.totalDays} ngày ({currentStats.years > 0 ? `${currentStats.years} năm ` : ''}
                  {currentStats.months > 0 ? `${currentStats.months} tháng ` : ''}
                  {currentStats.days} ngày)
                </div>
              </div>
              {currentStats.nextMilestone && (
                <div className="text-center sm:text-right">
                  <div className="text-xs text-amber-400 font-medium flex items-center gap-1 justify-center sm:justify-end">
                    <Flame className="w-3.5 h-3.5" /> Mốc sắp tới
                  </div>
                  <div className="text-sm font-bold text-rose-300">
                    {currentStats.nextMilestone.label}
                  </div>
                  <div className="text-xs text-slate-400">
                    {currentStats.nextMilestone.daysLeft === 0
                      ? 'Hôm nay!'
                      : `Còn ${currentStats.nextMilestone.daysLeft} ngày nữa`}
                  </div>
                </div>
              )}
            </div>

            {/* List of Milestones */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {currentStats.milestones.map((m) => {
                const formattedDate = format(m.targetDate, 'dd/MM/yyyy', { locale: vi });
                return (
                  <div
                    key={m.targetDays}
                    className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between ${
                      m.isReached
                        ? 'bg-emerald-950/20 border-emerald-500/30 text-slate-200'
                        : 'bg-slate-800/40 border-slate-700/50 text-slate-400 hover:border-rose-500/40'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold ${
                          m.isReached
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-slate-700/50 text-slate-400'
                        }`}
                      >
                        {m.isReached ? <CheckCircle2 className="w-5 h-5 text-emerald-400" /> : '⏳'}
                      </div>
                      <div>
                        <div
                          className={`text-sm font-semibold ${
                            m.isReached ? 'text-emerald-300' : 'text-slate-200'
                          }`}
                        >
                          {m.label}
                        </div>
                        <div className="text-[11px] text-slate-400">{formattedDate}</div>
                      </div>
                    </div>

                    <div className="text-right">
                      {m.isReached ? (
                        <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                          Đã đạt
                        </span>
                      ) : (
                        <span className="text-[11px] font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20">
                          Còn {m.daysLeft} ngày
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 2: Settings */}
        {activeTab === 'settings' && (
          <form onSubmit={handleSave} className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
            {error && (
              <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs">
                {error}
              </div>
            )}
            {success && (
              <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" /> Đã cập nhật thông tin thành công!
              </div>
            )}

            {/* Start Date */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-rose-400" />
                Ngày bắt đầu yêu nhau *
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
                className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Số ngày yêu sẽ được tự động tính bắt đầu từ ngày này.
              </p>
            </div>

            {/* Partners Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {/* Partner 1 */}
              <div className="p-3 rounded-2xl bg-slate-800/40 border border-slate-700/60 space-y-3">
                <div className="text-xs font-bold text-rose-300">Thông tin Bạn Nam (Anh)</div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Tên hiển thị</label>
                  <input
                    type="text"
                    value={partner1Name}
                    onChange={(e) => setPartner1Name(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-rose-500"
                    placeholder="VD: Anh, Trường..."
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Link Ảnh Avatar</label>
                  <input
                    type="url"
                    value={partner1Avatar}
                    onChange={(e) => setPartner1Avatar(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-rose-500"
                    placeholder="https://..."
                  />
                </div>
              </div>

              {/* Partner 2 */}
              <div className="p-3 rounded-2xl bg-slate-800/40 border border-slate-700/60 space-y-3">
                <div className="text-xs font-bold text-pink-300">Thông tin Bạn Nữ (Em)</div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Tên hiển thị</label>
                  <input
                    type="text"
                    value={partner2Name}
                    onChange={(e) => setPartner2Name(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-pink-500"
                    placeholder="VD: Em, Bé Yêu..."
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Link Ảnh Avatar</label>
                  <input
                    type="url"
                    value={partner2Avatar}
                    onChange={(e) => setPartner2Avatar(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-pink-500"
                    placeholder="https://..."
                  />
                </div>
              </div>
            </div>

            {/* Love Quote */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Heart className="w-4 h-4 text-rose-400 fill-rose-400/30" />
                Câu châm ngôn tình yêu của hai bạn
              </label>
              <textarea
                value={loveQuote}
                onChange={(e) => setLoveQuote(e.target.value)}
                rows={2}
                className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl px-4 py-2 text-xs sm:text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all resize-none"
                placeholder="Nhập lời yêu thương..."
              />
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-rose-500 via-pink-500 to-purple-600 hover:from-rose-600 hover:to-purple-700 text-white font-semibold text-sm shadow-lg shadow-rose-500/25 transition-all flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                {loading ? 'Đang lưu...' : 'Lưu Thay Đổi'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
