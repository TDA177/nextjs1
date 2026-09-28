'use client';

import React, { useState, useEffect } from 'react';
import {
  Heart,
  Calendar,
  Sparkles,
  Camera,
  MapPin,
  Plus,
  Filter,
  ArrowUpDown,
  Search,
  Trash2,
  Edit3,
  Bookmark,
  ChevronLeft,
  ChevronRight,
  X,
  Smile,
  Clock,
  Images,
} from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { vi } from 'date-fns/locale';
import CreateMemoryModal, { MEMORY_EMOTIONS } from './CreateMemoryModal';

interface CoupleMemoryItem {
  id: string;
  coupleId: string;
  plannerItemId?: string | null;
  plannerItem?: {
    id: string;
    title: string;
    type: string;
    color: string;
    status: string;
  } | null;
  title: string;
  date: string;
  photos: string[];
  emotion?: string | null;
  note?: string | null;
  location?: string | null;
  authorName: string;
  createdAt: string;
}

interface LoveTimelineProps {
  currentUser: { id: string; name: string; avatar: string };
  profile?: {
    startDate?: string | Date;
    partner1Name?: string;
    partner2Name?: string;
    partner1Avatar?: string;
    partner2Avatar?: string;
  } | null;
  completedItems?: Array<{ id: string; title: string }>;
  onOpenItemDetail?: (item: any) => void;
}

export default function LoveTimeline({
  currentUser,
  profile,
  completedItems = [],
  onOpenItemDetail,
}: LoveTimelineProps) {
  const [memories, setMemories] = useState<CoupleMemoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingMemory, setEditingMemory] = useState<CoupleMemoryItem | null>(null);

  // Filters & Search
  const [selectedEmotion, setSelectedEmotion] = useState<string>('ALL');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc'); // desc = Mới nhất trước
  const [searchQuery, setSearchQuery] = useState('');

  // Lightbox Modal for enlarged photos
  const [lightboxPhotos, setLightboxPhotos] = useState<string[] | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const startDate = profile?.startDate ? new Date(profile.startDate) : null;

  const fetchMemories = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/memories?coupleId=couple-1');
      if (res.ok) {
        const data = await res.json();
        setMemories(data);
      }
    } catch (err) {
      console.error('Error loading memories:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMemories();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa kỷ niệm này?')) return;
    try {
      const res = await fetch(`/api/memories?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setMemories((prev) => prev.filter((m) => m.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Filter & Sort memories
  const filteredMemories = memories
    .filter((m) => {
      if (selectedEmotion !== 'ALL' && m.emotion !== selectedEmotion) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = m.title.toLowerCase().includes(q);
        const matchNote = m.note?.toLowerCase().includes(q) || false;
        const matchLocation = m.location?.toLowerCase().includes(q) || false;
        if (!matchTitle && !matchNote && !matchLocation) return false;
      }
      return true;
    })
    .sort((a, b) => {
      const timeA = new Date(a.date).getTime();
      const timeB = new Date(b.date).getTime();
      return sortOrder === 'desc' ? timeB - timeA : timeA - timeB;
    });

  const totalPhotosCount = memories.reduce((acc, m) => acc + (m.photos?.length || 0), 0);

  // Tính ngày yêu vào thời điểm kỷ niệm diễn ra
  const getLoveDayAtDate = (dateStr: string) => {
    if (!startDate) return null;
    const memDate = new Date(dateStr);
    const start = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
    const target = new Date(memDate.getFullYear(), memDate.getMonth(), memDate.getDate());
    const diff = differenceInDays(target, start);
    return diff >= 0 ? diff + 1 : null;
  };

  const getEmotionConfig = (emotionId?: string | null) => {
    return MEMORY_EMOTIONS.find((e) => e.id === emotionId) || MEMORY_EMOTIONS[0];
  };

  const openLightbox = (photos: string[], index: number) => {
    setLightboxPhotos(photos);
    setLightboxIndex(index);
  };

  return (
    <div className="space-y-8 animate-fadeIn pb-12">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-rose-950/80 via-slate-900/90 to-purple-950/80 border border-rose-500/30 p-6 sm:p-8 shadow-2xl glass-card">
        <div className="absolute -top-24 -right-24 w-80 h-80 bg-rose-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-purple-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 text-xs font-semibold mb-3 border border-rose-500/30">
              <Sparkles className="w-3.5 h-3.5 text-rose-300" />
              <span>Dòng Thời Gian Yêu Thương • Love Timeline</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black bg-gradient-to-r from-rose-300 via-pink-200 to-purple-300 bg-clip-text text-transparent">
              Album Kỷ Niệm Của Hai Đứa
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-xl">
              Nơi lưu giữ từng chuyến đi, buổi hẹn hò và khoảnh khắc đáng nhớ nhất trong hành trình bên nhau ❤️
            </p>
          </div>

          {/* Quick Stats & Add Button */}
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
            <div className="grid grid-cols-2 gap-3 w-full sm:w-auto">
              <div className="p-3 bg-slate-900/80 rounded-2xl border border-slate-700/60 text-center min-w-[100px]">
                <div className="text-xl font-black text-rose-300">{memories.length}</div>
                <div className="text-[11px] text-slate-400 font-medium">Khoảnh khắc</div>
              </div>
              <div className="p-3 bg-slate-900/80 rounded-2xl border border-slate-700/60 text-center min-w-[100px]">
                <div className="text-xl font-black text-pink-300">{totalPhotosCount}</div>
                <div className="text-[11px] text-slate-400 font-medium">Bức ảnh kỷ niệm</div>
              </div>
            </div>

            <button
              onClick={() => {
                setEditingMemory(null);
                setShowCreateModal(true);
              }}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-rose-500 to-purple-600 hover:from-rose-600 hover:to-purple-700 text-white text-sm font-semibold shadow-lg shadow-rose-500/30 transition-all hover:scale-102 active:scale-98 whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span>+ Thêm Kỷ Niệm</span>
            </button>
          </div>
        </div>
      </div>

      {/* Control Bar: Filters, Search & Sort */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-slate-900/70 p-4 rounded-2xl border border-slate-800">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm theo tên kỷ niệm, địa điểm hoặc cảm xúc..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-800/80 border border-slate-700/60 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-rose-500"
          />
        </div>

        {/* Emotion Pills & Sort Toggle */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 custom-scrollbar">
          <button
            onClick={() => setSelectedEmotion('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              selectedEmotion === 'ALL'
                ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            Tất cả ({memories.length})
          </button>

          {MEMORY_EMOTIONS.slice(0, 5).map((em) => {
            const count = memories.filter((m) => m.emotion === em.id).length;
            if (count === 0 && selectedEmotion !== em.id) return null;
            return (
              <button
                key={em.id}
                onClick={() => setSelectedEmotion(selectedEmotion === em.id ? 'ALL' : em.id)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
                  selectedEmotion === em.id
                    ? `${em.color} shadow-sm ring-1 ring-rose-400`
                    : 'bg-slate-800/60 border-slate-700/50 text-slate-400 hover:text-white'
                }`}
              >
                <span>{em.emoji}</span>
                <span>{em.label}</span>
                <span className="text-[10px] opacity-75">({count})</span>
              </button>
            );
          })}

          {/* Sort order button */}
          <button
            onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-300 hover:text-white transition-colors whitespace-nowrap ml-auto"
            title="Đổi thứ tự hiển thị"
          >
            <ArrowUpDown className="w-3.5 h-3.5 text-rose-400" />
            <span>{sortOrder === 'desc' ? 'Mới nhất trước' : 'Từ ngày đầu'}</span>
          </button>
        </div>
      </div>

      {/* Main Timeline View */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-rose-300 gap-3">
          <div className="w-10 h-10 border-4 border-rose-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-semibold">Đang tải dòng thời gian kỷ niệm...</p>
        </div>
      ) : filteredMemories.length === 0 ? (
        <div className="text-center py-16 px-4 bg-slate-900/50 border border-slate-800/80 rounded-3xl">
          <div className="w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto mb-4">
            <Heart className="w-8 h-8 text-rose-400 animate-pulse" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">Chưa có kỷ niệm nào ở đây</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto mb-5">
            Khi 2 bạn hoàn thành một lịch hẹn hoặc có một ngày hẹn hò đáng nhớ, hãy lưu lại ảnh và cảm xúc tại đây nhé!
          </p>
          <button
            onClick={() => {
              setEditingMemory(null);
              setShowCreateModal(true);
            }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-purple-600 text-white text-xs font-semibold shadow-lg shadow-rose-500/30 hover:scale-105 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Tạo Kỷ Niệm Đầu Tiên</span>
          </button>
        </div>
      ) : (
        <div className="relative pl-6 sm:pl-10 space-y-8 before:absolute before:inset-0 before:left-3 sm:before:left-5 before:w-0.5 before:bg-gradient-to-b before:from-rose-500 before:via-pink-500/50 before:to-purple-600">
          {filteredMemories.map((memory) => {
            const emConfig = getEmotionConfig(memory.emotion);
            const formattedDate = format(new Date(memory.date), 'EEEE, dd/MM/yyyy', { locale: vi });
            const loveDay = getLoveDayAtDate(memory.date);

            return (
              <div key={memory.id} className="relative group animate-fadeIn">
                {/* Timeline node icon */}
                <div className="absolute -left-[30px] sm:-left-[38px] top-4 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-slate-950 border-2 border-rose-400 flex items-center justify-center text-sm shadow-md shadow-rose-500/30 group-hover:scale-110 transition-transform">
                  <span>{emConfig.emoji}</span>
                </div>

                {/* Memory Card */}
                <div className="bg-slate-900/90 border border-slate-800 hover:border-rose-500/40 rounded-3xl p-5 sm:p-6 shadow-xl transition-all duration-300 hover:shadow-rose-950/30">
                  {/* Card Header: Date, Badges & Actions */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-bold text-slate-200 capitalize flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-rose-400" />
                        {formattedDate}
                      </span>

                      {loveDay && (
                        <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-semibold">
                          Ngày thứ {loveDay} bên nhau
                        </span>
                      )}

                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${emConfig.color}`}
                      >
                        <span>{emConfig.emoji}</span>
                        <span>{emConfig.label}</span>
                      </span>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => {
                          setEditingMemory(memory);
                          setShowCreateModal(true);
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                        title="Chỉnh sửa"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(memory.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                        title="Xóa kỷ niệm"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Title & Linked Planner Item */}
                  <div className="mt-3">
                    <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                      {memory.title}
                    </h3>

                    {memory.plannerItem && (
                      <div className="mt-1.5 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-purple-950/40 border border-purple-500/30 text-purple-300 text-xs font-medium">
                        <Bookmark className="w-3.5 h-3.5 text-purple-400" />
                        <span>Kế hoạch hoàn thành: <b>{memory.plannerItem.title}</b></span>
                      </div>
                    )}
                  </div>

                  {/* Note / Cảm xúc */}
                  {memory.note && (
                    <div className="mt-3 p-3.5 rounded-2xl bg-rose-500/5 border border-rose-500/15 text-xs sm:text-sm text-rose-100/90 italic leading-relaxed whitespace-pre-line">
                      “{memory.note}”
                    </div>
                  )}

                  {/* Photos Grid */}
                  {memory.photos && memory.photos.length > 0 && (
                    <div className="mt-4">
                      {memory.photos.length === 1 ? (
                        <div
                          onClick={() => openLightbox(memory.photos, 0)}
                          className="relative aspect-video sm:aspect-[21/9] max-h-80 rounded-2xl overflow-hidden border border-slate-700/60 cursor-pointer group/photo"
                        >
                          <img
                            src={memory.photos[0]}
                            alt={memory.title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover/photo:scale-105"
                          />
                          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/photo:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-medium">
                            🔍 Nhấn để xem toàn cảnh
                          </div>
                        </div>
                      ) : memory.photos.length === 2 ? (
                        <div className="grid grid-cols-2 gap-2 sm:gap-3">
                          {memory.photos.map((photo, pIdx) => (
                            <div
                              key={pIdx}
                              onClick={() => openLightbox(memory.photos, pIdx)}
                              className="relative aspect-square sm:aspect-video rounded-2xl overflow-hidden border border-slate-700/60 cursor-pointer group/photo"
                            >
                              <img
                                src={photo}
                                alt={`${memory.title} ${pIdx + 1}`}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover/photo:scale-105"
                              />
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 sm:gap-3">
                          {memory.photos.slice(0, 4).map((photo, pIdx) => {
                            const isLast = pIdx === 3 && memory.photos.length > 4;
                            const remain = memory.photos.length - 4;
                            return (
                              <div
                                key={pIdx}
                                onClick={() => openLightbox(memory.photos, pIdx)}
                                className="relative aspect-square rounded-2xl overflow-hidden border border-slate-700/60 cursor-pointer group/photo"
                              >
                                <img
                                  src={photo}
                                  alt={`${memory.title} ${pIdx + 1}`}
                                  className="w-full h-full object-cover transition-transform duration-500 group-hover/photo:scale-105"
                                />
                                {isLast && (
                                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white font-bold text-base sm:text-lg backdrop-blur-xs">
                                    +{remain}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Card Footer: Location & Author */}
                  <div className="mt-4 pt-3 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400 border-t border-slate-800/80">
                    <div className="flex items-center gap-1.5">
                      {memory.location ? (
                        <span className="flex items-center gap-1 text-slate-300 font-medium">
                          <MapPin className="w-3.5 h-3.5 text-rose-400" />
                          {memory.location}
                        </span>
                      ) : (
                        <span className="italic text-slate-500">Khoảnh khắc đáng nhớ</span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-slate-400">Chia sẻ bởi:</span>
                      <span className="font-semibold text-rose-300 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20">
                        {memory.authorName} ❤️
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal tạo / chỉnh sửa Kỷ niệm */}
      {showCreateModal && (
        <CreateMemoryModal
          isOpen={showCreateModal}
          onClose={() => {
            setShowCreateModal(false);
            setEditingMemory(null);
          }}
          onSuccess={() => {
            fetchMemories();
          }}
          currentUser={currentUser}
          completedItems={completedItems}
          memoryToEdit={editingMemory}
        />
      )}

      {/* Lightbox Phóng to ảnh */}
      {lightboxPhotos && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setLightboxPhotos(null)}
        >
          <button
            onClick={() => setLightboxPhotos(null)}
            className="absolute top-5 right-5 p-2 rounded-full bg-slate-800/80 text-white hover:bg-rose-600 transition-colors z-10"
          >
            <X className="w-6 h-6" />
          </button>

          {lightboxPhotos.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxIndex((prev) => (prev > 0 ? prev - 1 : lightboxPhotos.length - 1));
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-slate-800/80 text-white hover:bg-rose-600 transition-colors"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxIndex((prev) => (prev < lightboxPhotos.length - 1 ? prev + 1 : 0));
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-slate-800/80 text-white hover:bg-rose-600 transition-colors"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}

          <div className="max-w-4xl max-h-[85vh] flex flex-col items-center" onClick={(e) => e.stopPropagation()}>
            <img
              src={lightboxPhotos[lightboxIndex]}
              alt="Kỷ niệm phóng to"
              className="max-w-full max-h-[80vh] rounded-2xl object-contain shadow-2xl"
            />
            {lightboxPhotos.length > 1 && (
              <div className="mt-3 text-xs font-semibold text-slate-400 bg-slate-900/80 px-3 py-1 rounded-full border border-slate-700">
                {lightboxIndex + 1} / {lightboxPhotos.length}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
