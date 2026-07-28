'use client';

import React, { useState, useEffect } from 'react';
import Navbar, { USERS } from '@/components/Navbar';
import Dashboard from '@/components/Dashboard';
import CoupleCalendar from '@/components/CoupleCalendar';
import BucketList from '@/components/BucketList';
import BucketDetailModal from '@/components/BucketDetailModal';
import CreateItemModal from '@/components/CreateItemModal';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'calendar' | 'dashboard' | 'buckets'>('calendar');
  const [currentUser, setCurrentUser] = useState(USERS[0]); // Trường by default

  const [items, setItems] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createInitialDate, setCreateInitialDate] = useState<Date | null>(null);

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

  useEffect(() => {
    fetchItems();
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
          setShowCreateModal(true);
        }}
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
                  setShowCreateModal(true);
                }}
              />
            )}

            {activeTab === 'buckets' && (
              <BucketList
                items={items}
                onSelectItem={(item) => setSelectedItem(item)}
                onOpenCreate={() => {
                  setCreateInitialDate(null);
                  setShowCreateModal(true);
                }}
              />
            )}

            {activeTab === 'dashboard' && (
              <Dashboard
                items={items}
                onSelectItem={(item) => setSelectedItem(item)}
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
          currentUser={currentUser}
          onClose={() => setShowCreateModal(false)}
          onRefresh={fetchItems}
        />
      )}
    </div>
  );
}
