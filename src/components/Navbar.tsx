'use client';

import React, { useState } from 'react';
import { Heart, Bell, Plus, Calendar as CalendarIcon, LayoutDashboard, Sparkles, CheckCheck, Users } from 'lucide-react';

interface NavbarProps {
  activeTab: 'calendar' | 'dashboard' | 'buckets';
  setActiveTab: (tab: 'calendar' | 'dashboard' | 'buckets') => void;
  currentUser: { id: string; name: string; avatar: string };
  setCurrentUser: (user: { id: string; name: string; avatar: string }) => void;
  onOpenCreate: () => void;
  notificationsCount: number;
  notifications: any[];
  onMarkNotificationRead: (id: string) => void;
}

export const USERS = [
  { id: 'user_anh', name: 'Anh', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80' },
  { id: 'user_em', name: 'Em', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80' },
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
}: NavbarProps) {
  const [showNotifications, setShowNotifications] = useState(false);

  const partner = USERS.find((u) => u.id !== currentUser.id) || USERS[1];

  return (
    <header className="sticky top-0 z-40 glass-card border-b border-rose-500/20 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand & Couple Badge */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-gradient-to-r from-rose-500 to-purple-600 p-2.5 rounded-2xl shadow-lg shadow-rose-500/20">
            <Heart className="w-6 h-6 text-white animate-pulse fill-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-rose-400 via-pink-300 to-purple-400 bg-clip-text text-transparent flex items-center gap-2">
              Couple Planner
              <span className="text-xs font-normal px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-300 border border-rose-500/20">
                Together ❤️
              </span>
            </h1>
            <p className="text-xs text-slate-400">Anh ❤️ Em's Shared Journey</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-800/60 p-1.5 rounded-2xl border border-slate-700/50">
          <button
            onClick={() => setActiveTab('calendar')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              activeTab === 'calendar'
                ? 'bg-gradient-to-r from-rose-500 to-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/40'
            }`}
          >
            <CalendarIcon className="w-4 h-4" />
            Lịch Đôi (Calendar)
          </button>
          <button
            onClick={() => setActiveTab('buckets')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              activeTab === 'buckets'
                ? 'bg-gradient-to-r from-rose-500 to-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/40'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            Danh Sách Bucket & Event
          </button>
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              activeTab === 'dashboard'
                ? 'bg-gradient-to-r from-rose-500 to-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/40'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            Dashboard
          </button>
        </nav>

        {/* Actions & User Switcher */}
        <div className="flex items-center gap-3">
          {/* Create Button */}
          <button
            onClick={onOpenCreate}
            className="flex items-center gap-2 bg-gradient-to-r from-rose-500 via-pink-500 to-purple-600 hover:from-rose-600 hover:to-purple-700 text-white px-4 py-2.5 rounded-xl font-semibold shadow-lg shadow-rose-500/25 transition-all transform hover:scale-105 active:scale-95 text-sm"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span className="hidden sm:inline">Tạo Mục Mới</span>
          </button>

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-colors border border-slate-700/60"
            >
              <Bell className="w-5 h-5 text-rose-300" />
              {notificationsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center animate-bounce border-2 border-slate-900">
                  {notificationsCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-3 w-80 sm:w-96 glass-modal rounded-2xl p-4 shadow-2xl z-50 border border-rose-500/30">
                <div className="flex items-center justify-between border-b border-slate-700/60 pb-3 mb-3">
                  <h3 className="font-semibold text-slate-100 flex items-center gap-2 text-sm">
                    <Bell className="w-4 h-4 text-rose-400" />
                    Thông báo ({notifications.length})
                  </h3>
                  <button
                    onClick={() => onMarkNotificationRead('all')}
                    className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    Đọc tất cả
                  </button>
                </div>
                <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
                  {notifications.length === 0 ? (
                    <p className="text-xs text-slate-400 text-center py-4">Không có thông báo mới!</p>
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

          {/* User Switcher Dropdown (Rule 8) */}
          <div className="flex items-center gap-2 pl-2 border-l border-slate-700/60">
            <button
              onClick={() => setCurrentUser(partner)}
              title={`Bấm để chuyển tài khoản sang: ${partner.name}`}
              className="flex items-center gap-2 p-1.5 pr-3 bg-slate-800/80 hover:bg-slate-700 rounded-xl border border-slate-700/80 transition-all text-xs"
            >
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-7 h-7 rounded-full object-cover ring-2 ring-rose-400"
              />
              <div className="text-left hidden lg:block">
                <div className="font-semibold text-slate-200">{currentUser.name}</div>
                <div className="text-[10px] text-rose-400 flex items-center gap-1">
                  <Users className="w-2.5 h-2.5" /> Chuyển sang {partner.name}
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Tab Switcher */}
      <div className="md:hidden flex border-t border-slate-800 bg-slate-900/90 px-4 py-2 justify-around text-xs">
        <button
          onClick={() => setActiveTab('calendar')}
          className={`flex flex-col items-center gap-1 py-1 ${activeTab === 'calendar' ? 'text-rose-400 font-bold' : 'text-slate-400'}`}
        >
          <CalendarIcon className="w-4 h-4" />
          Lịch Đôi
        </button>
        <button
          onClick={() => setActiveTab('buckets')}
          className={`flex flex-col items-center gap-1 py-1 ${activeTab === 'buckets' ? 'text-rose-400 font-bold' : 'text-slate-400'}`}
        >
          <Sparkles className="w-4 h-4" />
          Bucket List
        </button>
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center gap-1 py-1 ${activeTab === 'dashboard' ? 'text-rose-400 font-bold' : 'text-slate-400'}`}
        >
          <LayoutDashboard className="w-4 h-4" />
          Dashboard
        </button>
      </div>
    </header>
  );
}
