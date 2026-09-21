'use client';

import React, { useState, useEffect } from 'react';
import { X, Plus, Calendar, Sparkles, Heart, Tag, User, Clock, Check } from 'lucide-react';
import { format } from 'date-fns';

interface CreateItemModalProps {
  initialDate?: Date | null;
  initialTitle?: string;
  initialType?: string;
  currentUser: { id: string; name: string; avatar: string };
  onClose: () => void;
  onRefresh: () => void;
}

export default function CreateItemModal({
  initialDate,
  initialTitle = '',
  initialType = 'Event',
  currentUser,
  onClose,
  onRefresh,
}: CreateItemModalProps) {
  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState('');
  const [type, setType] = useState(initialType);
  const [priority, setPriority] = useState('Medium');
  const [eventTime, setEventTime] = useState('');
  const [keepOpenAfterSave, setKeepOpenAfterSave] = useState(false);
  const [savedCount, setSavedCount] = useState(0);

  const getInitialDateStr = (d?: Date | null) => {
    if (!d) return '';
    try {
      return format(d, 'yyyy-MM-dd');
    } catch {
      return '';
    }
  };

  const [deadline, setDeadline] = useState(getInitialDateStr(initialDate));
  const [color, setColor] = useState('Hồng');
  const [assignedTo, setAssignedTo] = useState('Both');
  const [checklists, setChecklists] = useState<string[]>([]);
  const [checklistInput, setChecklistInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  useEffect(() => {
    if (initialDate) {
      setDeadline(getInitialDateStr(initialDate));
    }
  }, [initialDate]);

  const handleAddChecklistItem = () => {
    if (!checklistInput.trim()) return;
    setChecklists([...checklists, checklistInput.trim()]);
    setChecklistInput('');
  };

  const handleRemoveChecklistItem = (idx: number) => {
    setChecklists(checklists.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Vui lòng nhập tên sự kiện / kế hoạch');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccessNotice(null);

      // Nếu có nhập giờ cụ thể, kết hợp với ngày deadline
      let finalDeadline: string | null = null;
      let finalStartDate: string | null = null;

      if (deadline) {
        if (eventTime) {
          const dateTimeStr = `${deadline}T${eventTime}:00`;
          finalDeadline = new Date(dateTimeStr).toISOString();
          finalStartDate = finalDeadline;
        } else {
          finalDeadline = new Date(`${deadline}T00:00:00`).toISOString();
          finalStartDate = finalDeadline;
        }
      }

      const res = await fetch('/api/planner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          type,
          priority,
          startDate: finalStartDate,
          deadline: finalDeadline,
          color,
          createdBy: currentUser.name,
          assignedTo,
          checklists: checklists.map((c) => ({ title: c })),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Lỗi khi tạo');
        return;
      }

      onRefresh();

      if (keepOpenAfterSave) {
        setSavedCount((prev) => prev + 1);
        setSuccessNotice(`Đã thêm thành công "${title}"! Bạn có thể nhập tiếp sự kiện tiếp theo cho ngày này.`);
        setTitle('');
        setDescription('');
        setEventTime('');
        setChecklists([]);
        setTimeout(() => setSuccessNotice(null), 3000);
      } else {
        onClose();
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fadeIn">
      <div className="glass-modal rounded-3xl w-full max-w-xl p-6 border border-rose-500/30 shadow-2xl space-y-6 relative max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-700/60 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-rose-500 to-purple-600 rounded-2xl text-white">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-extrabold text-white">Tạo Mục Kế Hoạch / Bucket Mới</h3>
              <p className="text-xs text-slate-400">Anh ❤️ Em Couple Planner</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-200 text-xs font-semibold">
            {error}
          </div>
        )}

        {successNotice && (
          <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 text-xs font-semibold flex items-center gap-2 animate-fadeIn">
            <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>{successNotice}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Title */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1.5">Tên sự kiện / kế hoạch *</label>
            <input
              type="text"
              placeholder="Ví dụ: Đi ăn tối, Xem phim rạp, Đi dạo phố, Chụp ảnh..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-100 placeholder-slate-400 focus:outline-none focus:border-rose-500"
              required
            />
          </div>

          {/* Type & Priority */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-1.5">Loại (Type)</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-slate-100 focus:outline-none focus:border-rose-500"
              >
                <option value="Event">Event (Sự kiện diễn ra tại mốc thời gian)</option>
                <option value="Bucket">Bucket (Điều muốn làm trong tương lai)</option>
                <option value="Task">Task (Việc cần hoàn thành)</option>
                <option value="Anniversary">Anniversary (Ngày kỷ niệm ❤️)</option>
                <option value="Birthday">Birthday (Sinh nhật 🎂)</option>
                <option value="Reminder">Reminder (Nhắc việc 🔔)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1.5">Độ ưu tiên (Priority)</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-slate-100 focus:outline-none focus:border-rose-500"
              >
                <option value="Low">Low (Thấp)</option>
                <option value="Medium">Medium (Trung bình)</option>
                <option value="High">High (Cao)</option>
                <option value="Critical">Critical (Rất quan trọng)</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1.5">Mô tả chi tiết (Không bắt buộc)</label>
            <textarea
              rows={2}
              placeholder="Ghi chú thêm thông tin, địa điểm, chuẩn bị trang phục..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-100 placeholder-slate-400 focus:outline-none focus:border-rose-500"
            />
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-rose-400" />
                Ngày diễn ra *
              </label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-slate-100 focus:outline-none focus:border-rose-500"
                required
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1.5 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-purple-400" />
                Giờ diễn ra (Không bắt buộc)
              </label>
              <input
                type="time"
                value={eventTime}
                onChange={(e) => setEventTime(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-slate-100 focus:outline-none focus:border-rose-500"
              />
            </div>
          </div>

          {/* Color & Multiple Events Option */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-1.5">Màu hiển thị trên Calendar</label>
              <select
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-slate-100 focus:outline-none focus:border-rose-500"
              >
                <option value="Hồng">Màu Hồng ❤️</option>
                <option value="Xanh">Màu Xanh 💙</option>
                <option value="Vàng">Màu Vàng 💛</option>
                <option value="Đỏ">Màu Đỏ ❤️‍🔥</option>
                <option value="Tím">Màu Tím 💜</option>
              </select>
            </div>

            <div className="flex items-end">
              <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-slate-300 bg-slate-800/80 p-2.5 rounded-xl border border-slate-700/80 hover:border-rose-500/40 w-full transition-all">
                <input
                  type="checkbox"
                  checked={keepOpenAfterSave}
                  onChange={(e) => setKeepOpenAfterSave(e.target.checked)}
                  className="w-4 h-4 rounded text-rose-500 focus:ring-0 accent-rose-500"
                />
                <span className="font-medium text-[11px] leading-tight text-rose-200">
                  ⚡ Tiếp tục thêm sự kiện khác cho ngày này sau khi lưu
                </span>
              </label>
            </div>
          </div>

          {/* Checklist initialization */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1.5">Checklist việc nhỏ ban đầu</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                placeholder="Nhập việc nhỏ (Ví dụ: Xin Visa, Mua vé...)"
                value={checklistInput}
                onChange={(e) => setChecklistInput(e.target.value)}
                className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
              />
              <button
                type="button"
                onClick={handleAddChecklistItem}
                className="px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded-xl text-white font-bold"
              >
                + Thêm
              </button>
            </div>

            <div className="space-y-1">
              {checklists.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-slate-800/60 text-slate-200">
                  <span>• {item}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveChecklistItem(idx)}
                    className="text-rose-400 font-bold hover:text-rose-300"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Form Actions */}
          <div className="pt-4 border-t border-slate-700/60 flex items-center justify-end gap-3">
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
              {loading ? 'Đang tạo...' : 'Tạo Kế Hoạch ❤️'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
