'use client';

import React, { useState, useRef } from 'react';
import {
  X,
  Camera,
  Calendar,
  MapPin,
  Heart,
  Sparkles,
  Upload,
  Link as LinkIcon,
  Trash2,
  Smile,
  User,
  Plus,
  Bookmark,
} from 'lucide-react';
import { format } from 'date-fns';

export const MEMORY_EMOTIONS = [
  { id: 'happy', label: 'Hạnh phúc', emoji: '🥰', color: 'bg-rose-500/20 text-rose-300 border-rose-500/40' },
  { id: 'romantic', label: 'Lãng mạn', emoji: '💖', color: 'bg-pink-500/20 text-pink-300 border-pink-500/40' },
  { id: 'peaceful', label: 'Bình yên', emoji: '🌿', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' },
  { id: 'excited', label: 'Siêu vui', emoji: '🥳', color: 'bg-amber-500/20 text-amber-300 border-amber-500/40' },
  { id: 'touched', label: 'Cảm động', emoji: '🥺', color: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40' },
  { id: 'funny', label: 'Hài hước', emoji: '😂', color: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40' },
  { id: 'foodie', label: 'Ăn ngon', emoji: '🍕', color: 'bg-orange-500/20 text-orange-300 border-orange-500/40' },
  { id: 'travel', label: 'Chuyến đi', emoji: '✈️', color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' },
];

interface CreateMemoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialItem?: {
    id: string;
    title: string;
    location?: string | null;
    startDate?: string | Date | null;
  } | null;
  initialDate?: Date;
  currentUser?: { name: string };
  completedItems?: Array<{ id: string; title: string }>;
  memoryToEdit?: any | null;
}

// Hàm nén ảnh client-side bằng canvas
const compressImage = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (e) => {
      const img = new Image();
      img.src = e.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const maxDim = 1200;

        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return resolve(img.src);
        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL('image/jpeg', 0.78);
        resolve(dataUrl);
      };
      img.onerror = reject;
    };
    reader.onerror = reject;
  });
};

export default function CreateMemoryModal({
  isOpen,
  onClose,
  onSuccess,
  initialItem,
  initialDate,
  currentUser,
  completedItems = [],
  memoryToEdit,
}: CreateMemoryModalProps) {
  const [title, setTitle] = useState(
    memoryToEdit?.title || (initialItem ? `Kỷ niệm: ${initialItem.title}` : '')
  );
  const [date, setDate] = useState(
    memoryToEdit?.date
      ? format(new Date(memoryToEdit.date), 'yyyy-MM-dd')
      : initialItem?.startDate
      ? format(new Date(initialItem.startDate), 'yyyy-MM-dd')
      : format(initialDate || new Date(), 'yyyy-MM-dd')
  );
  const [emotion, setEmotion] = useState(memoryToEdit?.emotion || 'happy');
  const [location, setLocation] = useState(memoryToEdit?.location || initialItem?.location || '');
  const [authorName, setAuthorName] = useState(
    memoryToEdit?.authorName || currentUser?.name || 'Anh'
  );
  const [note, setNote] = useState(memoryToEdit?.note || '');
  const [plannerItemId, setPlannerItemId] = useState<string>(
    memoryToEdit?.plannerItemId || initialItem?.id || ''
  );

  const [photos, setPhotos] = useState<string[]>(memoryToEdit?.photos || []);
  const [newPhotoUrl, setNewPhotoUrl] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      setIsCompressing(true);
      const newUrls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const compressed = await compressImage(files[i]);
        newUrls.push(compressed);
      }
      setPhotos((prev) => [...prev, ...newUrls]);
    } catch (err) {
      console.error(err);
      setError('Lỗi khi tải ảnh lên, vui lòng thử lại');
    } finally {
      setIsCompressing(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleAddUrl = () => {
    if (!newPhotoUrl.trim()) return;
    setPhotos((prev) => [...prev, newPhotoUrl.trim()]);
    setNewPhotoUrl('');
    setShowUrlInput(false);
  };

  const handleRemovePhoto = (idx: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Vui lòng nhập tiêu đề kỷ niệm');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const payload = {
        title: title.trim(),
        date: new Date(date).toISOString(),
        emotion,
        location: location.trim() || null,
        authorName,
        note: note.trim() || null,
        plannerItemId: plannerItemId || null,
        photos,
        coupleId: 'couple-1',
      };

      let res;
      if (memoryToEdit?.id) {
        res = await fetch('/api/memories', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: memoryToEdit.id, ...payload }),
        });
      } else {
        res = await fetch('/api/memories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Có lỗi xảy ra');
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Không thể lưu kỷ niệm');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl max-h-[92vh] flex flex-col bg-slate-900/95 border border-rose-500/30 rounded-3xl shadow-2xl overflow-hidden glass-card">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700/60 bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-500 to-purple-600 flex items-center justify-center shadow-lg shadow-rose-500/30">
              <Camera className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                {memoryToEdit ? 'Chỉnh Sửa Kỷ Niệm' : 'Lưu Giữ Kỷ Niệm Mới'}
                <Sparkles className="w-4 h-4 text-amber-400 fill-amber-400" />
              </h2>
              <p className="text-xs text-rose-300">
                Lưu lại cảm xúc & hình ảnh đẹp trên Dòng Thời Gian tình yêu
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5 custom-scrollbar">
          {error && (
            <div className="p-3 bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs rounded-xl">
              {error}
            </div>
          )}

          {/* Tiêu đề */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-rose-400" />
              Tên khoảnh khắc / Kỷ niệm *
            </label>
            <input
              type="text"
              required
              placeholder="VD: Buổi hẹn hò xem phim đầu tiên, Đi dạo ngắm hoàng hôn..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
            />
          </div>

          {/* Ngày diễn ra & Người ghi */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-rose-400" />
                Ngày diễn ra *
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-sm text-white focus:outline-none focus:border-rose-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-rose-400" />
                Người chia sẻ kỷ niệm
              </label>
              <select
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                className="w-full px-4 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-sm text-white focus:outline-none focus:border-rose-500"
              >
                <option value="Anh">Anh ❤️</option>
                <option value="Em">Em 💖</option>
                <option value="Cả hai">Cả hai đứa 💑</option>
              </select>
            </div>
          </div>

          {/* Chọn Cảm Xúc */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
              <Smile className="w-3.5 h-3.5 text-rose-400" />
              Cảm xúc lúc ấy thế nào?
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {MEMORY_EMOTIONS.map((em) => {
                const isSelected = emotion === em.id;
                return (
                  <button
                    key={em.id}
                    type="button"
                    onClick={() => setEmotion(em.id)}
                    className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-medium transition-all ${
                      isSelected
                        ? `${em.color} shadow-md scale-[1.02] ring-2 ring-rose-500/50`
                        : 'bg-slate-800/50 border-slate-700/60 text-slate-400 hover:text-white hover:bg-slate-700/50'
                    }`}
                  >
                    <span className="text-lg">{em.emoji}</span>
                    <span className="truncate">{em.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Địa điểm & Kế hoạch liên kết */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-rose-400" />
                Địa điểm (nếu có)
              </label>
              <input
                type="text"
                placeholder="VD: Quán cà phê Yên, Bờ Hồ, Đà Lạt..."
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-4 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Bookmark className="w-3.5 h-3.5 text-rose-400" />
                Liên kết kế hoạch / Bucket List
              </label>
              <select
                value={plannerItemId}
                onChange={(e) => setPlannerItemId(e.target.value)}
                className="w-full px-4 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-sm text-white focus:outline-none focus:border-rose-500"
              >
                <option value="">-- Không liên kết --</option>
                {initialItem && (
                  <option value={initialItem.id}>
                    {initialItem.title} (Hiện tại)
                  </option>
                )}
                {completedItems
                  .filter((it) => it.id !== initialItem?.id)
                  .map((it) => (
                    <option key={it.id} value={it.id}>
                      {it.title}
                    </option>
                  ))}
              </select>
            </div>
          </div>

          {/* Hình ảnh kỷ niệm */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5 text-rose-400" />
                Ảnh kỷ niệm ({photos.length} ảnh)
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 text-xs font-medium border border-rose-500/30 transition-colors"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Chọn ảnh từ máy</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowUrlInput(!showUrlInput)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 text-xs font-medium border border-slate-700 transition-colors"
                >
                  <LinkIcon className="w-3.5 h-3.5" />
                  <span>Link ảnh</span>
                </button>
              </div>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleFileUpload}
            />

            {/* Input link ảnh thủ công */}
            {showUrlInput && (
              <div className="flex items-center gap-2 mb-3 animate-fadeIn">
                <input
                  type="url"
                  placeholder="Dán URL hình ảnh (https://...)..."
                  value={newPhotoUrl}
                  onChange={(e) => setNewPhotoUrl(e.target.value)}
                  className="flex-1 px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                />
                <button
                  type="button"
                  onClick={handleAddUrl}
                  className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-medium"
                >
                  Thêm
                </button>
              </div>
            )}

            {isCompressing && (
              <div className="p-3 text-center text-xs text-rose-300 bg-rose-500/10 rounded-xl mb-3 animate-pulse">
                Đang tối ưu & nén ảnh, chờ chút nhé...
              </div>
            )}

            {/* Photo Preview Grid */}
            {photos.length > 0 ? (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 p-3 bg-slate-800/40 border border-slate-700/50 rounded-2xl">
                {photos.map((url, idx) => (
                  <div key={idx} className="relative group aspect-square rounded-xl overflow-hidden bg-slate-900 border border-slate-700">
                    <img src={url} alt={`Kỷ niệm ${idx + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleRemovePhoto(idx)}
                      className="absolute top-1.5 right-1.5 p-1 rounded-lg bg-black/70 text-rose-400 hover:text-white hover:bg-rose-600 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="cursor-pointer border-2 border-dashed border-slate-700 hover:border-rose-500/50 rounded-2xl p-6 text-center transition-colors group"
              >
                <Camera className="w-8 h-8 text-slate-500 group-hover:text-rose-400 mx-auto mb-2 transition-colors" />
                <p className="text-xs text-slate-400 group-hover:text-slate-300">
                  Nhấn để chọn ảnh kỷ niệm hoặc kéo thả ảnh vào đây
                </p>
                <p className="text-[10px] text-slate-500 mt-1">Ảnh sẽ được tự động tối ưu sắc nét</p>
              </div>
            )}
          </div>

          {/* Lời nhắn / Cảm nghĩ */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Heart className="w-3.5 h-3.5 text-rose-400" />
              Lời nhắn gửi / Cảm xúc về khoảnh khắc này
            </label>
            <textarea
              rows={3}
              placeholder="Hôm đó hai đứa vui thế nào? Có khoảnh khắc hay lời nói nào đáng nhớ không?..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
            />
          </div>

          {/* Submit Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 px-6 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-purple-600 hover:from-rose-600 hover:to-purple-700 text-white text-sm font-semibold shadow-lg shadow-rose-500/30 transition-all hover:scale-102 active:scale-98 disabled:opacity-50"
            >
              <Heart className="w-4 h-4 fill-white" />
              <span>{submitting ? 'Đang lưu...' : memoryToEdit ? 'Lưu Thay Đổi' : 'Lưu Vào Dòng Thời Gian'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
