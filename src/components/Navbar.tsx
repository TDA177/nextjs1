'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Heart,
  Bell,
  Plus,
  Calendar as CalendarIcon,
  LayoutDashboard,
  Sparkles,
  CheckCheck,
  Compass,
  Camera,
  User,
} from 'lucide-react';

interface NavbarProps {
  activeTab: 'calendar' | 'dashboard' | 'buckets' | 'memories';
  setActiveTab: (tab: 'calendar' | 'dashboard' | 'buckets' | 'memories') => void;
  currentUser: { id: string; name: string; avatar: string };
  setCurrentUser: (user: { id: string; name: string; avatar: string }) => void;
  onOpenCreate: () => void;
  notificationsCount: number;
  notifications: any[];
  onMarkNotificationRead: (id: string) => void;
  onOpenPeriodTracker?: () => void;
  periodCycleInfo?: any | null;
  onOpenLoveModal?: () => void;
  onOpenRouletteModal?: () => void;
  loveDaysCount?: number;
}

export const USERS = [
  {
    id: 'user_anh',
    name: 'Anh',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'user_em',
    name: 'Em',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  },
];

export default function Navbar({
  activeTab,
  setActiveTab,
  currentUser,
  setCurrentUser,
  onOpenCreate,
  notificationsCount,
  notifications,
  onMarkNotificationRead,
  onOpenPeriodTracker,
  periodCycleInfo,
  onOpenLoveModal,
  onOpenRouletteModal,
  loveDaysCount,
}: NavbarProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);

  // Close notifications on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    }
    if (showNotifications) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNotifications]);

  return (
    <>
      {/* Desktop & Main Web App Sticky Header */}
      <header className="sticky top-0 z-40 bg-slate-900/85 backdrop-blur-xl border-b border-rose-500/20 shadow-lg shadow-black/20">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-2 sm:gap-4">
          {/* Left: Brand & Couple Title */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <div className="flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-rose-500 via-pink-500 to-purple-600 shadow-md shadow-rose-500/25">
              <Heart className="w-5 h-5 sm:w-6 sm:h-6 text-white fill-white animate-pulse" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-black bg-gradient-to-r from-rose-400 via-pink-300 to-purple-400 bg-clip-text text-transparent flex items-center gap-1.5 whitespace-nowrap">
                Couple Planner
                <span className="hidden 2xl:inline text-[10px] font-normal px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-300 border border-rose-500/20">
                  Together ❤️
                </span>
              </h1>
            </div>
          </div>

          {/* Center: Desktop Navigation Tabs (Hidden on small mobile screens, shown on md and above) */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-800/80 p-1.5 rounded-2xl border border-slate-700/60 shadow-inner">
            <button
              onClick={() => setActiveTab('calendar')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
                activeTab === 'calendar'
                  ? 'bg-gradient-to-r from-rose-500 to-purple-600 text-white shadow-md shadow-rose-500/20 scale-[1.02]'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <CalendarIcon className="w-4 h-4 shrink-0" />
              <span>Lịch Đôi</span>
            </button>
            <button
              onClick={() => setActiveTab('buckets')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
                activeTab === 'buckets'
                  ? 'bg-gradient-to-r from-rose-500 to-purple-600 text-white shadow-md shadow-rose-500/20 scale-[1.02]'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <Sparkles className="w-4 h-4 shrink-0" />
              <span>Kế Hoạch</span>
            </button>
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-gradient-to-r from-rose-500 to-purple-600 text-white shadow-md shadow-rose-500/20 scale-[1.02]'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <LayoutDashboard className="w-4 h-4 shrink-0" />
              <span>Dashboard</span>
            </button>
            <button
              onClick={() => setActiveTab('memories')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
                activeTab === 'memories'
                  ? 'bg-gradient-to-r from-rose-500 to-purple-600 text-white shadow-md shadow-rose-500/20 scale-[1.02]'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <Camera className="w-4 h-4 shrink-0" />
              <span>Kỷ Niệm</span>
            </button>
          </nav>

          {/* Right: Quick Tools, Actions, Notification, User Switcher */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            {/* Love Days Quick Widget */}
            {onOpenLoveModal && (
              <button
                onClick={onOpenLoveModal}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 text-xs font-bold transition-all hover:scale-105 shrink-0"
                title="Đếm ngày yêu nhau & Các mốc kỷ niệm"
              >
                <Heart className="w-3.5 h-3.5 fill-rose-400 text-rose-400 animate-pulse shrink-0" />
                <span className="whitespace-nowrap">
                  {loveDaysCount ? `${loveDaysCount} Ngày` : 'Đếm Ngày'}
                </span>
              </button>
            )}

            {/* Date Decision Roulette Button (Hidden on very narrow, visible on xl or tooltip) */}
            {onOpenRouletteModal && (
              <button
                onClick={onOpenRouletteModal}
                className="hidden xl:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 text-purple-300 border border-purple-500/30 text-xs font-semibold transition-all hover:scale-105 shrink-0"
                title="Vòng quay: Hôm nay ăn gì, đi đâu?"
              >
                <Compass className="w-3.5 h-3.5 text-purple-400 animate-spin shrink-0" style={{ animationDuration: '8s' }} />
                <span className="whitespace-nowrap">Vòng Quay</span>
              </button>
            )}

            {/* Period Tracker Button (Compact badge) */}
            {onOpenPeriodTracker && (
              <button
                onClick={onOpenPeriodTracker}
                className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-pink-500/15 hover:bg-pink-500/25 text-rose-200 border border-pink-500/30 text-xs font-semibold transition-all hover:scale-105 shrink-0"
                title="Góc chăm sóc nàng (Đếm ngược & Nhắc nhở yêu thương)"
              >
                <span className="shrink-0 text-sm">🌸</span>
                <span className="whitespace-nowrap">
                  {periodCycleInfo ? periodCycleInfo.statusBadgeText : 'Ngày Nàng'}
                </span>
              </button>
            )}

            {/* Create Button */}
            <button
              onClick={onOpenCreate}
              className="flex items-center gap-1.5 bg-gradient-to-r from-rose-500 via-pink-500 to-purple-600 hover:from-rose-600 hover:to-purple-700 text-white px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-xl font-bold shadow-md shadow-rose-500/25 transition-all hover:scale-105 active:scale-95 text-xs sm:text-sm shrink-0"
              title="Tạo lịch hẹn hoặc mục tiêu mới"
            >
              <Plus className="w-4 h-4 stroke-[3] shrink-0" />
              <span className="hidden sm:inline whitespace-nowrap">Tạo Mục</span>
            </button>

            {/* Notifications Dropdown */}
            <div className="relative shrink-0" ref={notificationRef}>
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 sm:p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-colors border border-slate-700/60"
                title="Thông báo"
              >
                <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-rose-300" />
                {notificationsCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-bold w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center animate-bounce border-2 border-slate-900">
                    {notificationsCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-3 w-80 sm:w-96 glass-modal rounded-2xl p-4 shadow-2xl z-50 border border-rose-500/30 animate-fadeIn">
                  <div className="flex items-center justify-between border-b border-slate-700/60 pb-3 mb-3">
                    <h3 className="font-semibold text-slate-100 flex items-center gap-2 text-sm">
                      <Bell className="w-4 h-4 text-rose-400" />
                      Thông báo ({notifications.length})
                    </h3>
                    <button
                      onClick={() => onMarkNotificationRead('all')}
                      className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 font-medium"
                    >
                      <CheckCheck className="w-3.5 h-3.5" />
                      Đọc tất cả
                    </button>
                  </div>
                  <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
                    {notifications.length === 0 ? (
                      <p className="text-xs text-slate-400 text-center py-6">Không có thông báo mới!</p>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          onClick={() => onMarkNotificationRead(n.id)}
                          className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                            n.isRead
                              ? 'bg-slate-800/40 border-slate-700/40 text-slate-400'
                              : 'bg-rose-500/10 border-rose-500/30 text-slate-100 hover:bg-rose-500/20'
                          }`}
                        >
                          <div className="font-semibold text-rose-300 mb-1">{n.title}</div>
                          <p className="text-slate-300 leading-relaxed">{n.message}</p>
                          <span className="text-[10px] text-slate-500 mt-1 block">
                            {new Date(n.createdAt).toLocaleDateString('vi-VN')}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User Switcher (Anh / Em) */}
            <div className="flex items-center bg-slate-800/90 p-1 rounded-xl border border-slate-700/70 shrink-0">
              {USERS.map((u) => {
                const isActive = currentUser.id === u.id;
                return (
                  <button
                    key={u.id}
                    onClick={() => setCurrentUser(u)}
                    className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-bold transition-all ${
                      isActive
                        ? 'bg-gradient-to-r from-rose-500 to-purple-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                    title={`Đang đăng nhập: ${u.name} (Bấm để chuyển)`}
                  >
                    <img
                      src={u.avatar}
                      alt={u.name}
                      className="w-4 h-4 sm:w-5 sm:h-5 rounded-full object-cover border border-white/20 shrink-0"
                    />
                    <span className="whitespace-nowrap">{u.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Fixed Bottom Navigation Bar (Visible only on < md screens) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-2xl border-t border-rose-500/20 px-2 py-1.5 flex items-center justify-around shadow-2xl">
        <button
          onClick={() => setActiveTab('calendar')}
          className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-xl transition-all ${
            activeTab === 'calendar' ? 'text-rose-400 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <CalendarIcon className="w-5 h-5" />
          <span className="text-[10px]">Lịch</span>
        </button>

        <button
          onClick={() => setActiveTab('buckets')}
          className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-xl transition-all ${
            activeTab === 'buckets' ? 'text-rose-400 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sparkles className="w-5 h-5" />
          <span className="text-[10px]">Kế Hoạch</span>
        </button>

        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-xl transition-all ${
            activeTab === 'dashboard' ? 'text-rose-400 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span className="text-[10px]">Dashboard</span>
        </button>

        <button
          onClick={() => setActiveTab('memories')}
          className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-xl transition-all ${
            activeTab === 'memories' ? 'text-rose-400 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Camera className="w-5 h-5" />
          <span className="text-[10px]">Kỷ Niệm</span>
        </button>

        {onOpenRouletteModal && (
          <button
            onClick={onOpenRouletteModal}
            className="flex flex-col items-center gap-0.5 py-1 px-2 text-purple-400 hover:text-purple-300 transition-all"
            title="Vòng quay ăn gì, đi đâu"
          >
            <Compass className="w-5 h-5" />
            <span className="text-[10px]">Vòng Quay</span>
          </button>
        )}

        {onOpenPeriodTracker && (
          <button
            onClick={onOpenPeriodTracker}
            className="flex flex-col items-center gap-0.5 py-1 px-2 text-pink-400 hover:text-pink-300 transition-all"
            title="Ngày của nàng"
          >
            <span className="text-base leading-none">🌸</span>
            <span className="text-[10px]">Ngày Nàng</span>
          </button>
        )}
      </nav>
    </>
  );
}
