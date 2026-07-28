'use client';

import React, { useState } from 'react';
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
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface BucketDetailModalProps {
  item: any;
  currentUser: { id: string; name: string; avatar: string };
  onClose: () => void;
  onRefresh: () => void;
}

export default function BucketDetailModal({ item, currentUser, onClose, onRefresh }: BucketDetailModalProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'checklist' | 'events' | 'comments' | 'attachments'>('overview');

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

  const checklists = item.checklists || [];
  const doneChecklists = checklists.filter((c: any) => c.isCompleted).length;
  const progressPct = checklists.length > 0 ? Math.round((doneChecklists / checklists.length) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-lg animate-fadeIn">
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
    </div>
  );
}
