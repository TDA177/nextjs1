'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Calendar,
  CheckSquare,
  MessageSquare,
  Paperclip,
  Trash2,
  Plus,
  Send,
  Sparkles,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Heart,
  FileText,
  Image as ImageIcon,
  Tag,
  MapPin,
  Flame,
  Camera,
  Edit3,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import CreateMemoryModal, { MEMORY_EMOTIONS } from './CreateMemoryModal';

interface BucketDetailModalProps {
  item: any;
  currentUser: { id: string; name: string; avatar: string };
  onClose: () => void;
  onRefresh: () => void;
}

export default function BucketDetailModal({ item, currentUser, onClose, onRefresh }: BucketDetailModalProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'checklist' | 'events' | 'comments' | 'attachments' | 'memories'>('overview');

  // Memories linked to this item
  const [itemMemories, setItemMemories] = useState<any[]>(item.memories || []);
  const [editingMemory, setEditingMemory] = useState<any | null>(null);

  // Memory Prompt & Modal state
  const [showSaveMemoryPrompt, setShowSaveMemoryPrompt] = useState(false);
  const [showCreateMemoryModal, setShowCreateMemoryModal] = useState(false);

  // Fetch memories for this item
  const fetchItemMemories = async () => {
    try {
      const res = await fetch(`/api/memories?plannerItemId=${item.id}&coupleId=couple-1`);
      if (res.ok) {
        const data = await res.json();
        setItemMemories(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  React.useEffect(() => {
    if (item?.id) {
      fetchItemMemories();
    }
  }, [item?.id]);

  // Checklist state
  const [newChecklistTitle, setNewChecklistTitle] = useState('');
  const [promptCompleteModal, setPromptCompleteModal] = useState(false);

  // Sub-Event state (Rule 5)
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventDate, setNewEventDate] = useState('');

  // Comment state
  const [commentText, setCommentText] = useState('');

  // Attachment state
  const [attachName, setAttachName] = useState('');
  const [attachUrl, setAttachUrl] = useState('');
  const [attachType, setAttachType] = useState('ticket');

  // Status & Error
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Status toggle handler
  const handleUpdateStatus = async (newStatus: string) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/planner/${item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        if (newStatus === 'Completed') {
          confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
          setShowSaveMemoryPrompt(true);
        }
        onRefresh();
      }
    } catch (e: any) {
      setErrorMessage(e.message);
    } finally {
      setLoading(false);
    }
  };

  // Rule 6: Delete handler with validation
  const handleDeleteItem = async () => {
    if (!confirm('Bạn có chắc chắn muốn xóa mục này?')) return;
    try {
      setLoading(true);
      setErrorMessage(null);
      const res = await fetch(`/api/planner/${item.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) {
        setErrorMessage(data.error || 'Lỗi khi xóa mục');
        return;
      }
      onClose();
      onRefresh();
    } catch (e: any) {
      setErrorMessage(e.message);
    } finally {
      setLoading(false);
    }
  };

  // Add Sub-Event (Rule 5)
  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventTitle || !newEventDate) return;

    try {
      setLoading(true);
      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plannerItemId: item.id,
          title: newEventTitle,
          eventStart: newEventDate,
        }),
      });

      if (res.ok) {
        setNewEventTitle('');
        setNewEventDate('');
        onRefresh();
      }
    } catch (e: any) {
      setErrorMessage(e.message);
    } finally {
      setLoading(false);
    }
  };

  // Toggle Sub-Event completion
  const handleToggleEvent = async (eventId: string, currentCompleted: boolean) => {
    try {
      await fetch('/api/events', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: eventId, isCompleted: !currentCompleted }),
      });
      onRefresh();
    } catch (e: any) {
      console.error(e);
    }
  };

  // Add Checklist item
  const handleAddChecklist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChecklistTitle) return;

    try {
      const res = await fetch('/api/checklist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plannerItemId: item.id, title: newChecklistTitle }),
      });
      if (res.ok) {
        setNewChecklistTitle('');
        onRefresh();
      }
    } catch (e: any) {
      console.error(e);
    }
  };

  // Toggle Checklist item & Rule 7 check
  const handleToggleChecklist = async (checklistId: string, currentCompleted: boolean) => {
    try {
      const res = await fetch('/api/checklist', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: checklistId, isCompleted: !currentCompleted }),
      });
      const data = await res.json();
      if (data.shouldPromptBucketCompleted && item.status !== 'Completed') {
        setPromptCompleteModal(true);
      }
      onRefresh();
    } catch (e: any) {
      console.error(e);
    }
  };

  // Post Comment
  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    try {
      await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plannerItemId: item.id,
          userId: currentUser.id,
          userName: currentUser.name,
          content: commentText,
        }),
      });
      setCommentText('');
      onRefresh();
    } catch (e: any) {
      console.error(e);
    }
  };

  // Add Attachment
  const handleAddAttachment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!attachName || !attachUrl) return;

    try {
      await fetch('/api/attachments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plannerItemId: item.id,
          name: attachName,
          url: attachUrl,
          fileType: attachType,
        }),
      });
      setAttachName('');
      setAttachUrl('');
      onRefresh();
    } catch (e: any) {
      console.error(e);
    }
  };

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !showCreateMemoryModal) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, showCreateMemoryModal]);

  const checklists = item.checklists || [];
  const doneChecklists = checklists.filter((c: any) => c.isCompleted).length;
  const progressPct = checklists.length > 0 ? Math.round((doneChecklists / checklists.length) * 100) : 0;

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget && !showCreateMemoryModal) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-lg animate-fadeIn"
    >
      <div className="glass-modal rounded-3xl w-full max-w-3xl max-h-[90vh] flex flex-col border border-rose-500/30 shadow-2xl overflow-hidden relative">
        {/* Header */}
        <div className="p-6 border-b border-slate-700/60 bg-slate-900/60 flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="p-3.5 bg-gradient-to-br from-rose-500 to-purple-600 rounded-2xl text-2xl shadow-lg shadow-rose-500/20">
              {item.type === 'Bucket' ? '✈️' : item.type === 'Event' ? '🎬' : '❤️'}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  {item.type}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  {item.priority} Priority
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                    item.status === 'Completed'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : item.status === 'Overdue'
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  }`}
                >
                  {item.status}
                </span>
              </div>
              <h2 className="text-2xl font-black text-white">{item.title}</h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Completed Memory Section: Synced Memories or Prompt to Add */}
        {itemMemories.length > 0 ? (
          <div className="mx-6 mt-4 p-4 bg-gradient-to-br from-rose-950/70 via-slate-900/90 to-purple-950/70 border border-rose-500/40 rounded-2xl shadow-xl space-y-3 animate-fadeIn">
            <div className="flex items-center justify-between pb-2 border-b border-rose-500/20">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-rose-500 to-purple-600 text-white flex items-center justify-center text-xs shadow-md shadow-rose-500/30">
                  <Camera className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="text-xs font-bold text-white flex items-center gap-2">
                    Kỷ niệm đã đồng bộ lên Dòng Thời Gian ({itemMemories.length})
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 font-medium">
                      Love Timeline
                    </span>
                  </span>
                </div>
              </div>
              <button
                onClick={() => {
                  setEditingMemory(null);
                  setShowCreateMemoryModal(true);
                }}
                className="px-2.5 py-1 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 text-[11px] font-semibold transition-colors flex items-center gap-1"
              >
                + Thêm kỷ niệm khác
              </button>
            </div>

            {/* List of synced memories for this item */}
            <div className="space-y-3">
              {itemMemories.map((mem) => {
                const emConfig = MEMORY_EMOTIONS.find((e) => e.id === mem.emotion) || MEMORY_EMOTIONS[0];
                const formattedDate = format(new Date(mem.date), 'EEEE, dd/MM/yyyy', { locale: vi });
                return (
                  <div key={mem.id} className="p-3.5 bg-slate-900/80 rounded-xl border border-slate-700/60 space-y-2.5 hover:border-rose-500/40 transition-colors">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${emConfig.color}`}>
                          <span>{emConfig.emoji}</span>
                          <span>{emConfig.label}</span>
                        </span>
                        <span className="text-[11px] text-slate-300 font-medium capitalize">
                          {formattedDate}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-rose-300 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20">
                          Chia sẻ bởi: {mem.authorName} ❤️
                        </span>
                        <button
                          onClick={() => {
                            setEditingMemory(mem);
                            setShowCreateMemoryModal(true);
                          }}
                          className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                          title="Chỉnh sửa kỷ niệm"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {mem.note && (
                      <p className="text-xs text-rose-100 italic bg-rose-500/10 p-2.5 rounded-xl border border-rose-500/20 leading-relaxed">
                        “{mem.note}”
                      </p>
                    )}

                    {mem.photos && mem.photos.length > 0 && (
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 pt-1">
                        {mem.photos.map((p: string, pIdx: number) => (
                          <div key={pIdx} className="aspect-square rounded-xl overflow-hidden border border-slate-700">
                            <img src={p} alt="" className="w-full h-full object-cover" />
                          </div>
                        ))}
                      </div>
                    )}

                    {mem.location && (
                      <div className="flex items-center gap-1.5 text-xs text-slate-300">
                        <MapPin className="w-3.5 h-3.5 text-rose-400" />
                        <span>{mem.location}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ) : item.status === 'Completed' ? (
          <div className="mx-6 mt-4 p-3.5 bg-gradient-to-r from-rose-950/60 via-purple-950/60 to-slate-900 border border-rose-500/30 rounded-2xl flex items-center justify-between gap-3 shadow-md">
            <div className="flex items-center gap-2.5 text-xs text-rose-200">
              <Camera className="w-4 h-4 text-rose-400 shrink-0" />
              <span>Kế hoạch này đã hoàn thành! Lưu lại ảnh & cảm xúc kỷ niệm nhé?</span>
            </div>
            <button
              onClick={() => {
                setEditingMemory(null);
                setShowCreateMemoryModal(true);
              }}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-rose-500 to-purple-600 hover:from-rose-600 hover:to-purple-700 text-white text-xs font-semibold shadow-md whitespace-nowrap transition-transform hover:scale-105 active:scale-95"
            >
              + Lưu Kỷ Niệm
            </button>
          </div>
        ) : null}

        {/* Error Alert Box */}
        {errorMessage && (
          <div className="m-4 p-4 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-200 text-xs flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
            <div className="flex-1 font-medium">{errorMessage}</div>
            <button onClick={() => setErrorMessage(null)} className="text-rose-400 font-bold">✕</button>
          </div>
        )}

        {/* Navigation Tabs inside Modal */}
        <div className="flex items-center gap-2 border-b border-slate-700/60 bg-slate-900/40 px-6 py-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'overview' ? 'bg-rose-500 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Tổng Quan & Trạng Thái
          </button>
          <button
            onClick={() => setActiveTab('memories')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeTab === 'memories' ? 'bg-gradient-to-r from-rose-500 to-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            Kỷ Niệm ({itemMemories.length})
          </button>
          <button
            onClick={() => setActiveTab('checklist')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeTab === 'checklist' ? 'bg-rose-500 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <CheckSquare className="w-3.5 h-3.5" />
            Checklist ({doneChecklists}/{checklists.length})
          </button>
          <button
            onClick={() => setActiveTab('events')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeTab === 'events' ? 'bg-rose-500 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            Events Liên Kết ({item.events?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('comments')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeTab === 'comments' ? 'bg-rose-500 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            Trao Đổi ({item.comments?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('attachments')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeTab === 'attachments' ? 'bg-rose-500 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Paperclip className="w-3.5 h-3.5" />
            Đính Kèm ({item.attachments?.length || 0})
          </button>
        </div>

        {/* Modal Body Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Description */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Mô tả chi tiết</h4>
                <p className="text-slate-200 text-sm bg-slate-800/50 p-4 rounded-2xl border border-slate-700/60 leading-relaxed">
                  {item.description || 'Chưa có mô tả chi tiết.'}
                </p>
              </div>

              {/* Status Switcher Controls */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Chuyển trạng thái</h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {['Planned', 'In Progress', 'Completed', 'Cancelled'].map((st) => (
                    <button
                      key={st}
                      onClick={() => handleUpdateStatus(st)}
                      className={`p-3 rounded-2xl border text-xs font-bold transition-all ${
                        item.status === st
                          ? 'bg-rose-500 text-white border-rose-400 shadow-lg shadow-rose-500/20'
                          : 'bg-slate-800/80 text-slate-300 border-slate-700/60 hover:bg-slate-700'
                      }`}
                    >
                      {st === 'Completed' ? '✓ ' : ''}{st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Metadata Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-slate-800/40 p-4 rounded-2xl border border-slate-700/60 space-y-2 text-xs">
                  <div className="text-slate-400">Thời gian & Hạn chót</div>
                  <div className="font-semibold text-rose-300">
                    {item.deadline
                      ? `Deadline: ${new Date(item.deadline).toLocaleDateString('vi-VN')}`
                      : item.startDate
                      ? `Ngày bắt đầu: ${new Date(item.startDate).toLocaleDateString('vi-VN')}`
                      : 'Chưa đặt hạn ngày'}
                  </div>
                </div>

                <div className="bg-slate-800/40 p-4 rounded-2xl border border-slate-700/60 space-y-2 text-xs">
                  <div className="text-slate-400">Người khởi tạo & Phụ trách</div>
                  <div className="font-semibold text-purple-300">
                    Tạo bởi: {item.createdBy} • Giao cho: {item.assignedTo || 'Cả hai'}
                  </div>
                </div>
              </div>

              {/* Rule 6: Delete Button */}
              <div className="pt-4 border-t border-slate-700/60 flex justify-end">
                <button
                  onClick={handleDeleteItem}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-semibold border border-rose-500/30 transition-colors"
                >
                  <Trash2 className="w-4 h-4" /> Xóa Bucket này (Kiểm tra Rule 6)
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: CHECKLIST (Rule 7) */}
          {activeTab === 'checklist' && (
            <div className="space-y-6">
              {/* Progress Summary */}
              <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700/60">
                <div className="flex items-center justify-between text-xs font-bold mb-2">
                  <span className="text-slate-300">Tiến độ Checklist</span>
                  <span className="text-rose-300">{doneChecklists} / {checklists.length} ({progressPct}%)</span>
                </div>
                <div className="w-full bg-slate-900 rounded-full h-2.5 overflow-hidden">
                  <div className="bg-rose-500 h-2.5 rounded-full transition-all duration-500" style={{ width: `${progressPct}%` }} />
                </div>
              </div>

              {/* Checklist items list */}
              <div className="space-y-2">
                {checklists.map((c: any) => (
                  <div
                    key={c.id}
                    onClick={() => handleToggleChecklist(c.id, c.isCompleted)}
                    className="p-3.5 rounded-2xl bg-slate-800/60 hover:bg-slate-700/60 border border-slate-700/60 cursor-pointer flex items-center justify-between text-xs transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={c.isCompleted}
                        onChange={() => {}}
                        className="w-4 h-4 rounded text-rose-500 focus:ring-rose-500"
                      />
                      <span className={c.isCompleted ? 'line-through text-slate-500' : 'text-slate-200 font-medium'}>
                        {c.title}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Checklist Form */}
              <form onSubmit={handleAddChecklist} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Thêm việc nhỏ (Ví dụ: Xin Visa, Mua vé, Đặt khách sạn...)"
                  value={newChecklistTitle}
                  onChange={(e) => setNewChecklistTitle(e.target.value)}
                  className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-rose-500"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-rose-500 text-white text-xs font-bold hover:bg-rose-600 transition-colors"
                >
                  + Thêm
                </button>
              </form>
            </div>
          )}

          {/* TAB 3: LINKED EVENTS (Rule 5) */}
          {activeTab === 'events' && (
            <div className="space-y-6">
              <div className="bg-purple-500/10 p-4 rounded-2xl border border-purple-500/20 text-xs text-purple-200">
                💡 <strong>Rule 5:</strong> Bạn có thể thêm nhiều Event có ngày giờ cụ thể vào Bucket. Các Event này sẽ tự động xuất hiện trên Lịch Đôi!
              </div>

              {/* List of sub-events */}
              <div className="space-y-3">
                {(item.events || []).length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-4">Chưa có sự kiện liên kết nào!</p>
                ) : (
                  item.events.map((ev: any) => (
                    <div
                      key={ev.id}
                      className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={ev.isCompleted}
                          onChange={() => handleToggleEvent(ev.id, ev.isCompleted)}
                          className="w-4 h-4 rounded text-purple-500"
                        />
                        <div>
                          <div className={`font-semibold ${ev.isCompleted ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                            🎬 {ev.title}
                          </div>
                          <div className="text-[10px] text-slate-400 mt-0.5">
                            Ngày diễn ra: {new Date(ev.eventStart).toLocaleString('vi-VN')}
                          </div>
                        </div>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] ${ev.isCompleted ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'}`}>
                        {ev.isCompleted ? 'Hoàn thành' : 'Sắp diễn ra'}
                      </span>
                    </div>
                  ))
                )}
              </div>

              {/* Form to create sub-event */}
              <form onSubmit={handleAddEvent} className="bg-slate-800/40 p-4 rounded-2xl border border-slate-700/60 space-y-3">
                <h5 className="font-bold text-xs text-slate-200">Chuyển Bucket thành Event / Thêm Event mới:</h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Tên sự kiện (Ví dụ: Đi thử váy, Đặt nhà hàng...)"
                    value={newEventTitle}
                    onChange={(e) => setNewEventTitle(e.target.value)}
                    className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-purple-500"
                  />
                  <input
                    type="datetime-local"
                    value={newEventDate}
                    onChange={(e) => setNewEventDate(e.target.value)}
                    className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-rose-500 text-white text-xs font-bold hover:from-purple-600 hover:to-rose-600 transition-all"
                >
                  + Thêm Event lên Calendar
                </button>
              </form>
            </div>
          )}

          {/* TAB 4: COMMENTS */}
          {activeTab === 'comments' && (
            <div className="space-y-6">
              {/* Comment Feed */}
              <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                {(item.comments || []).length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-6">Chưa có bình luận nào. Hãy để lại tin nhắn cho nhau! ❤️</p>
                ) : (
                  item.comments.map((cm: any) => {
                    const isMe = cm.userName === currentUser.name;
                    return (
                      <div
                        key={cm.id}
                        className={`flex gap-3 p-3 rounded-2xl text-xs ${
                          isMe ? 'bg-rose-500/10 border border-rose-500/20 ml-6' : 'bg-slate-800/80 border border-slate-700/60 mr-6'
                        }`}
                      >
                        <div className="font-bold text-rose-300 shrink-0">{cm.userName}:</div>
                        <div className="flex-1">
                          <p className="text-slate-200 leading-relaxed">{cm.content}</p>
                          <span className="text-[9px] text-slate-500 mt-1 block">
                            {new Date(cm.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Chat Input */}
              <form onSubmit={handleAddComment} className="flex gap-2">
                <input
                  type="text"
                  placeholder={`Viết lời nhắn với tên: ${currentUser.name}...`}
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-rose-500"
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 rounded-xl bg-rose-500 text-white text-xs font-bold hover:bg-rose-600 transition-colors flex items-center gap-1"
                >
                  <Send className="w-3.5 h-3.5" /> Gửi
                </button>
              </form>
            </div>
          )}

          {/* TAB 5: ATTACHMENTS */}
          {activeTab === 'attachments' && (
            <div className="space-y-6">
              {/* Attachment Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {(item.attachments || []).map((att: any) => (
                  <a
                    key={att.id}
                    href={att.url}
                    target="_blank"
                    rel="noreferrer"
                    className="p-3 rounded-2xl bg-slate-800/60 border border-slate-700/60 hover:border-purple-500/40 flex items-center justify-between text-xs group transition-all"
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <Paperclip className="w-4 h-4 text-purple-400 shrink-0" />
                      <span className="font-medium text-slate-200 group-hover:text-purple-300 truncate">{att.name}</span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-700 text-slate-400">{att.fileType}</span>
                  </a>
                ))}
              </div>

              {/* Form to add attachment */}
              <form onSubmit={handleAddAttachment} className="bg-slate-800/40 p-4 rounded-2xl border border-slate-700/60 space-y-3">
                <h5 className="font-bold text-xs text-slate-200">Đính kèm hóa đơn, vé máy bay, PDF, ảnh...</h5>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input
                    type="text"
                    placeholder="Tên file (Vé máy bay.pdf)"
                    value={attachName}
                    onChange={(e) => setAttachName(e.target.value)}
                    className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-400"
                  />
                  <input
                    type="text"
                    placeholder="URL file / Image link"
                    value={attachUrl}
                    onChange={(e) => setAttachUrl(e.target.value)}
                    className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-400"
                  />
                  <select
                    value={attachType}
                    onChange={(e) => setAttachType(e.target.value)}
                    className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  >
                    <option value="ticket">Vé máy bay / Vé</option>
                    <option value="receipt">Hóa đơn</option>
                    <option value="image">Hình ảnh</option>
                    <option value="pdf">Tài liệu PDF</option>
                  </select>
                </div>
                <button
                  type="submit"
                  className="w-full py-2 rounded-xl bg-purple-500 text-white text-xs font-bold hover:bg-purple-600 transition-colors"
                >
                  + Đính Kèm Tệp
                </button>
              </form>
            </div>
          )}

          {/* TAB 6: KỶ NIỆM (MEMORIES) */}
          {activeTab === 'memories' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div>
                  <h4 className="font-bold text-sm text-white flex items-center gap-2">
                    📸 Kỷ Niệm Của Kế Hoạch Này
                    <span className="text-xs font-normal text-rose-300 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20">
                      {itemMemories.length} khoảnh khắc
                    </span>
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Các ảnh, cảm xúc và câu chuyện được đồng bộ tự động với Dòng Thời Gian tình yêu
                  </p>
                </div>
                <button
                  onClick={() => {
                    setEditingMemory(null);
                    setShowCreateMemoryModal(true);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-rose-500 to-purple-600 hover:from-rose-600 hover:to-purple-700 text-white text-xs font-semibold shadow-md flex items-center gap-1.5 transition-transform hover:scale-105"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>+ Lưu Kỷ Niệm Mới</span>
                </button>
              </div>

              {itemMemories.length === 0 ? (
                <div className="text-center py-12 px-4 bg-slate-800/20 border border-dashed border-slate-700 rounded-2xl">
                  <Camera className="w-10 h-10 text-slate-500 mx-auto mb-2" />
                  <p className="text-xs text-slate-300 font-semibold mb-1">Chưa có kỷ niệm nào cho kế hoạch này</p>
                  <p className="text-[11px] text-slate-400 mb-4 max-w-sm mx-auto">
                    Sau khi hoàn thành hoặc đi chơi cùng nhau, hãy đăng ảnh và cảm nghĩ để lưu giữ khoảnh khắc ngọt ngào nhé!
                  </p>
                  <button
                    onClick={() => {
                      setEditingMemory(null);
                      setShowCreateMemoryModal(true);
                    }}
                    className="px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-semibold transition-colors"
                  >
                    + Thêm Kỷ Niệm Đầu Tiên
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {itemMemories.map((mem) => {
                    const emConfig = MEMORY_EMOTIONS.find((e) => e.id === mem.emotion) || MEMORY_EMOTIONS[0];
                    const formattedDate = format(new Date(mem.date), 'EEEE, dd/MM/yyyy', { locale: vi });
                    return (
                      <div
                        key={mem.id}
                        className="p-4 bg-slate-800/40 border border-slate-700/60 rounded-2xl space-y-3 hover:border-rose-500/40 transition-colors"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${emConfig.color}`}>
                              <span>{emConfig.emoji}</span>
                              <span>{emConfig.label}</span>
                            </span>
                            <span className="text-xs font-semibold text-slate-200 capitalize">
                              {formattedDate}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-rose-300 bg-rose-500/10 px-2.5 py-0.5 rounded-full border border-rose-500/20">
                              {mem.authorName} ❤️
                            </span>
                            <button
                              onClick={() => {
                                setEditingMemory(mem);
                                setShowCreateMemoryModal(true);
                              }}
                              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
                              title="Chỉnh sửa kỷ niệm"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {mem.title && mem.title !== `Kỷ niệm: ${item.title}` && (
                          <h5 className="text-sm font-bold text-white">{mem.title}</h5>
                        )}

                        {mem.note && (
                          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-100 italic leading-relaxed">
                            “{mem.note}”
                          </div>
                        )}

                        {mem.photos && mem.photos.length > 0 && (
                          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 pt-1">
                            {mem.photos.map((photoUrl: string, pIdx: number) => (
                              <div key={pIdx} className="aspect-square rounded-xl overflow-hidden border border-slate-700 bg-slate-900">
                                <img src={photoUrl} alt="" className="w-full h-full object-cover" />
                              </div>
                            ))}
                          </div>
                        )}

                        {mem.location && (
                          <div className="flex items-center gap-1.5 text-xs text-slate-300">
                            <MapPin className="w-3.5 h-3.5 text-rose-400" />
                            <span>{mem.location}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* RULE 7 PROMPT MODAL */}
      {promptCompleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-lg animate-fadeIn">
          <div className="glass-modal rounded-3xl p-6 max-w-md w-full border border-rose-500/40 text-center space-y-4 shadow-2xl">
            <div className="w-16 h-16 bg-rose-500/20 text-rose-400 rounded-full flex items-center justify-center mx-auto border border-rose-500/30">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-white">Hoàn Thành Tất Cả Checklist! 🎉</h3>
            <p className="text-slate-300 text-xs leading-relaxed">
              "Bạn có muốn đánh dấu Bucket <strong>[{item.title}]</strong> là <strong>Completed</strong> không?"
            </p>
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => {
                  setPromptCompleteModal(false);
                  handleUpdateStatus('Completed');
                }}
                className="flex-1 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold transition-all shadow-lg shadow-rose-500/25"
              >
                Đồng ý (Completed) ❤️
              </button>
              <button
                onClick={() => setPromptCompleteModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Giữ In Progress
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PROMPT LƯU KỶ NIỆM KHI HOÀN THÀNH */}
      {showSaveMemoryPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-lg animate-fadeIn">
          <div className="glass-modal rounded-3xl p-6 max-w-md w-full border border-rose-500/40 text-center space-y-4 shadow-2xl">
            <div className="w-16 h-16 bg-gradient-to-tr from-rose-500 to-purple-600 text-white rounded-full flex items-center justify-center mx-auto shadow-lg shadow-rose-500/30">
              <Camera className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-white">Hoàn Thành Kế Hoạch! 🎉</h3>
            <p className="text-slate-300 text-xs leading-relaxed">
              Bạn có muốn lưu lại hình ảnh & cảm xúc về <strong>[{item.title}]</strong> vào <strong>Dòng Thời Gian Tình Yêu</strong> ngay không?
            </p>
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => {
                  setShowSaveMemoryPrompt(false);
                  setShowCreateMemoryModal(true);
                }}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-purple-600 hover:from-rose-600 hover:to-purple-700 text-white text-xs font-bold transition-all shadow-lg shadow-rose-500/25 flex items-center justify-center gap-1.5"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Lưu Kỷ Niệm Ngay</span>
              </button>
              <button
                onClick={() => setShowSaveMemoryPrompt(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Để sau nhé
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL TẠO KỶ NIỆM TỪ ITEM */}
      {showCreateMemoryModal && (
        <CreateMemoryModal
          isOpen={showCreateMemoryModal}
          onClose={() => {
            setShowCreateMemoryModal(false);
            setEditingMemory(null);
          }}
          onSuccess={() => {
            setShowCreateMemoryModal(false);
            setEditingMemory(null);
            fetchItemMemories();
            onRefresh();
          }}
          initialItem={item}
          currentUser={currentUser}
          memoryToEdit={editingMemory}
        />
      )}
    </div>
  );
}
