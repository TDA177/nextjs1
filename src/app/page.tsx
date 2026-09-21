'use client';

import React, { useState, useEffect } from 'react';
import Navbar, { USERS } from '@/components/Navbar';
import Dashboard from '@/components/Dashboard';
import CoupleCalendar from '@/components/CoupleCalendar';
import BucketList from '@/components/BucketList';
import BucketDetailModal from '@/components/BucketDetailModal';
import CreateItemModal from '@/components/CreateItemModal';
import PeriodTrackerModal from '@/components/PeriodTrackerModal';
import LoveCounterModal from '@/components/LoveCounterModal';
import DateRouletteModal from '@/components/DateRouletteModal';
import AIChatModal from '@/components/AIChatModal';
import { Mascot } from 'page-mascot';
import { calculateLoveStats } from '@/lib/loveUtils';
import { Sparkles } from 'lucide-react';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'calendar' | 'dashboard' | 'buckets'>('calendar');
  const [currentUser, setCurrentUser] = useState(USERS[0]); // Trường by default

  const [items, setItems] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Couple Profile (Love days, avatars, names)
  const [profile, setProfile] = useState<any | null>(null);
  const [showLoveModal, setShowLoveModal] = useState(false);
  const [showRouletteModal, setShowRouletteModal] = useState(false);
  const [showAIChatModal, setShowAIChatModal] = useState(false);

  // Period Tracker states
  const [periodSetting, setPeriodSetting] = useState<any | null>(null);
  const [periodCycleInfo, setPeriodCycleInfo] = useState<any | null>(null);
  const [showPeriodModal, setShowPeriodModal] = useState(false);

  // Modals state
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createInitialDate, setCreateInitialDate] = useState<Date | null>(null);
  const [createInitialTitle, setCreateInitialTitle] = useState('');
  const [createInitialType, setCreateInitialType] = useState('Bucket');

  // Fetch all planner items
  const fetchItems = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/planner?coupleId=couple-1');
      if (res.ok) {
        const data = await res.json();
        setItems(data);

        // Keep selectedItem fresh if currently open
        if (selectedItem) {
          const updated = data.find((i: any) => i.id === selectedItem.id);
          if (updated) setSelectedItem(updated);
        }
      }
    } catch (e) {
      console.error('Error fetching planner items:', e);
    } finally {
      setLoading(false);
    }
  };

  // Fetch period settings & cycle info
  const fetchPeriod = async () => {
    try {
      const res = await fetch('/api/period?coupleId=couple-1');
      if (res.ok) {
        const data = await res.json();
        setPeriodSetting(data.setting || null);
        setPeriodCycleInfo(data.cycleInfo || null);
        // Refresh notifications since period check might have generated one
        fetchNotifications();
      }
    } catch (e) {
      console.error('Error fetching period settings:', e);
    }
  };

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      const res = await fetch(`/api/notifications?userId=${currentUser.id}`);
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
    } catch (e) {
      console.error('Error fetching notifications:', e);
    }
  };

  // Fetch couple profile
  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/profile?coupleId=couple-1');
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
      }
    } catch (e) {
      console.error('Error fetching couple profile:', e);
    }
  };

  useEffect(() => {
    fetchItems();
    fetchPeriod();
    fetchProfile();
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [currentUser]);

  const handleMarkNotificationRead = async (id: string) => {
    try {
      await fetch('/api/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, isRead: true }),
      });
      fetchNotifications();
    } catch (e) {
      console.error(e);
    }
  };

  const unreadNotificationsCount = notifications.filter((n) => !n.isRead).length;
  const loveDaysCount = profile?.startDate ? calculateLoveStats(profile.startDate).totalDays : undefined;

  return (
    <div className="min-h-screen pb-16">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        setCurrentUser={setCurrentUser}
        onOpenCreate={() => {
          setCreateInitialDate(null);
          setCreateInitialTitle('');
          setCreateInitialType('Bucket');
          setShowCreateModal(true);
        }}
        onOpenPeriodTracker={() => setShowPeriodModal(true)}
        onOpenLoveModal={() => setShowLoveModal(true)}
        onOpenRouletteModal={() => setShowRouletteModal(true)}
        loveDaysCount={loveDaysCount}
        periodCycleInfo={periodCycleInfo}
        notificationsCount={unreadNotificationsCount}
        notifications={notifications}
        onMarkNotificationRead={handleMarkNotificationRead}
      />

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {loading && items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-rose-300 gap-3">
            <div className="w-10 h-10 border-4 border-rose-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm font-semibold">Đang tải dữ liệu Couple Planner...</p>
          </div>
        ) : (
          <>
            {activeTab === 'calendar' && (
              <CoupleCalendar
                items={items}
                onSelectItem={(item) => setSelectedItem(item)}
                onOpenCreateDate={(date) => {
                  setCreateInitialDate(date);
                  setCreateInitialTitle('');
                  setCreateInitialType('Event');
                  setShowCreateModal(true);
                }}
                periodSetting={periodSetting}
                periodCycleInfo={periodCycleInfo}
                onOpenPeriodTracker={() => setShowPeriodModal(true)}
              />
            )}

            {activeTab === 'buckets' && (
              <BucketList
                items={items}
                onSelectItem={(item) => setSelectedItem(item)}
                onOpenCreate={() => {
                  setCreateInitialDate(null);
                  setCreateInitialTitle('');
                  setCreateInitialType('Bucket');
                  setShowCreateModal(true);
                }}
              />
            )}

            {activeTab === 'dashboard' && (
              <Dashboard
                items={items}
                onSelectItem={(item) => setSelectedItem(item)}
                periodSetting={periodSetting}
                periodCycleInfo={periodCycleInfo}
                onOpenPeriodTracker={() => setShowPeriodModal(true)}
                profile={profile}
                onOpenLoveModal={() => setShowLoveModal(true)}
                onOpenRouletteModal={() => setShowRouletteModal(true)}
              />
            )}
          </>
        )}
      </main>

      {/* Detail Modal */}
      {selectedItem && (
        <BucketDetailModal
          item={selectedItem}
          currentUser={currentUser}
          onClose={() => setSelectedItem(null)}
          onRefresh={fetchItems}
        />
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <CreateItemModal
          initialDate={createInitialDate}
          initialTitle={createInitialTitle}
          initialType={createInitialType}
          currentUser={currentUser}
          onClose={() => {
            setShowCreateModal(false);
            setCreateInitialTitle('');
            setCreateInitialType('Bucket');
          }}
          onRefresh={fetchItems}
        />
      )}

      {/* Period Tracker Modal */}
      {showPeriodModal && (
        <PeriodTrackerModal
          initialSetting={periodSetting}
          onClose={() => setShowPeriodModal(false)}
          onRefresh={() => {
            fetchPeriod();
          }}
        />
      )}

      {/* Love Counter Modal */}
      {showLoveModal && (
        <LoveCounterModal
          profile={profile}
          onClose={() => setShowLoveModal(false)}
          onRefresh={fetchProfile}
        />
      )}

      {/* Date Decision Roulette Modal */}
      {showRouletteModal && (
        <DateRouletteModal
          bucketItems={items}
          onClose={() => setShowRouletteModal(false)}
          onScheduleEvent={(title, category) => {
            setCreateInitialTitle(category === 'food' ? `Ăn uống: ${title}` : `Hẹn hò: ${title}`);
            setCreateInitialType('Event');
            setCreateInitialDate(new Date());
            setShowCreateModal(true);
          }}
        />
      )}

      {/* Floating AI Chat Assistant Button with Redpanda Mascot */}
      <button
        onClick={() => setShowAIChatModal(true)}
        className="fixed bottom-6 right-6 z-40 group flex items-center gap-2 pl-2.5 pr-4 py-2 bg-gradient-to-r from-rose-500 via-pink-500 to-amber-400 text-white font-medium rounded-full shadow-lg shadow-rose-500/30 hover:shadow-xl hover:shadow-rose-500/40 hover:scale-105 active:scale-95 transition-all"
        title="Hỏi trợ lý Haha về ngày lễ, lịch hẹn"
      >
        <div className="relative w-10 h-10 flex items-center justify-center -my-1">
          <Mascot
            directions="/mascots/redpanda-directions.webp"
            reactions="/mascots/redpanda-reactions.webp"
            size={40}
            className="pointer-events-none"
          />
          <Sparkles className="w-3.5 h-3.5 text-amber-200 fill-amber-200 absolute -top-1 -right-1 animate-pulse pointer-events-none" />
        </div>
        <span className="hidden sm:inline text-sm font-semibold tracking-wide">
          Hỏi Haha AI
        </span>
      </button>

      {/* Haha AI Chat Modal */}
      <AIChatModal
        isOpen={showAIChatModal}
        onClose={() => setShowAIChatModal(false)}
        currentUser={currentUser}
      />
    </div>
  );
}

