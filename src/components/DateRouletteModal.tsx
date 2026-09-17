'use client';

import React, { useState, useEffect, useRef } from 'react';
import { X, Sparkles, Utensils, Compass, Plus, Trash2, RotateCw, CalendarPlus, Trophy, Heart } from 'lucide-react';
import confetti from 'canvas-confetti';

interface DateRouletteModalProps {
  bucketItems?: any[];
  onClose: () => void;
  onScheduleEvent?: (title: string, category: string) => void;
}

const DEFAULT_FOOD_ITEMS = [
  'Lẩu Haidilao / Manwah',
  'Nướng BBQ Hàn Quốc',
  'Trà sữa & Bánh ngọt',
  'Bún chả / Bún bò',
  'Pizza & Mì Ý',
  'Phở bò truyền thống',
  'Cơm tấm sườn trứng',
  'Sushi / Đồ Nhật',
  'Gà rán giòn sốt cay',
  'Hai đứa cùng nấu ở nhà',
];

const DEFAULT_ACTIVITY_ITEMS = [
  'Xem phim rạp CGV',
  'Dạo bờ hồ & Cafe acoustic',
  'Workshop tô tượng / làm gốm',
  'Dạo phố đêm & ăn vặt',
  'Lái xe hóng gió ngắm thành phố',
  'Đi dạo TTTM (Shopping & Game)',
  'Cắm trại picnic công viên',
  'Ở nhà xem Netflix & Chill',
];

const WHEEL_COLORS = [
  '#f43f5e', // rose-500
  '#a855f7', // purple-500
  '#ec4899', // pink-500
  '#3b82f6', // blue-500
  '#10b981', // emerald-500
  '#f59e0b', // amber-500
  '#06b6d4', // cyan-500
  '#8b5cf6', // violet-500
  '#f97316', // orange-500
  '#14b8a6', // teal-500
];

export default function DateRouletteModal({
  bucketItems = [],
  onClose,
  onScheduleEvent,
}: DateRouletteModalProps) {
  const [activeCategory, setActiveCategory] = useState<'food' | 'activity' | 'bucket'>('food');

  // Items lists
  const [foodList, setFoodList] = useState<string[]>(DEFAULT_FOOD_ITEMS);
  const [activityList, setActivityList] = useState<string[]>(DEFAULT_ACTIVITY_ITEMS);
  const [newItemText, setNewItemText] = useState('');

  // Spinning State
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rotationRef = useRef<number>(0);
  const animationFrameRef = useRef<number | null>(null);

  // Determine current active list
  const currentList =
    activeCategory === 'food'
      ? foodList
      : activeCategory === 'activity'
      ? activityList
      : bucketItems
          .filter((i) => i.status !== 'Completed')
          .map((i) => i.title)
          .slice(0, 16);

  // Effective list ensuring at least 2 items
  const activeItems = currentList.length >= 2 ? currentList : ['Mục 1', 'Mục 2'];

  // Draw the Wheel on Canvas
  const drawWheel = (rotationAngle: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const numItems = activeItems.length;
    const sliceAngle = (2 * Math.PI) / numItems;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = centerX - 10;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(rotationAngle);

    // Draw Slices
    for (let i = 0; i < numItems; i++) {
      const angle = i * sliceAngle;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, radius, angle, angle + sliceAngle);
      ctx.closePath();

      ctx.fillStyle = WHEEL_COLORS[i % WHEEL_COLORS.length];
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#0f172a';
      ctx.stroke();

      // Draw Slice Text
      ctx.save();
      ctx.rotate(angle + sliceAngle / 2);
      ctx.textAlign = 'right';
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 13px system-ui, -apple-system, sans-serif';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
      ctx.shadowBlur = 4;

      const label = activeItems[i];
      const maxTextLength = 16;
      const displayLabel = label.length > maxTextLength ? label.substring(0, maxTextLength) + '...' : label;
      ctx.fillText(displayLabel, radius - 20, 5);
      ctx.restore();
    }

    // Outer Rim
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, 2 * Math.PI);
    ctx.lineWidth = 6;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.stroke();

    ctx.restore();

    // Center Hub (Heart Button)
    ctx.beginPath();
    ctx.arc(centerX, centerY, 28, 0, 2 * Math.PI);
    ctx.fillStyle = '#0f172a';
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#f43f5e';
    ctx.stroke();

    ctx.fillStyle = '#f43f5e';
    ctx.font = 'bold 18px system-ui';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('❤️', centerX, centerY);
  };

  useEffect(() => {
    drawWheel(rotationRef.current);
  }, [activeItems, activeCategory]);

  // Handle Add Item
  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemText.trim()) return;

    if (activeCategory === 'food') {
      setFoodList([newItemText.trim(), ...foodList]);
    } else if (activeCategory === 'activity') {
      setActivityList([newItemText.trim(), ...activityList]);
    }
    setNewItemText('');
  };

  // Handle Delete Item
  const handleDeleteItem = (index: number) => {
    if (activeCategory === 'food') {
      if (foodList.length <= 2) return;
      setFoodList(foodList.filter((_, i) => i !== index));
    } else if (activeCategory === 'activity') {
      if (activityList.length <= 2) return;
      setActivityList(activityList.filter((_, i) => i !== index));
    }
  };

  // Spin the Wheel with physics animation
  const handleSpin = () => {
    if (isSpinning || activeItems.length < 2) return;

    setIsSpinning(true);
    setResult(null);

    const numItems = activeItems.length;
    const sliceAngle = (2 * Math.PI) / numItems;

    // Random turns: between 5 and 9 full rotations + random slice offset
    const randomTurns = 5 + Math.random() * 4;
    const totalAddedRotation = randomTurns * 2 * Math.PI;
    const startRotation = rotationRef.current;
    const targetRotation = startRotation + totalAddedRotation;

    const duration = 4000; // 4 seconds
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease-out quintic: 1 - Math.pow(1 - progress, 5)
      const easeOut = 1 - Math.pow(1 - progress, 4);
      const currentAngle = startRotation + totalAddedRotation * easeOut;

      rotationRef.current = currentAngle;
      drawWheel(currentAngle);

      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(animate);
      } else {
        setIsSpinning(false);

        // Calculate winning index (Pointer is at top: 3 * PI / 2 or 270 deg)
        // Normalized angle within [0, 2*PI)
        const normalized = (currentAngle % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI);
        // Pointer is at Top (angle = 3*PI/2 = 4.71 rad)
        const pointerAngle = (3 * Math.PI) / 2;
        let relativeAngle = (pointerAngle - normalized) % (2 * Math.PI);
        if (relativeAngle < 0) relativeAngle += 2 * Math.PI;

        const winningIndex = Math.floor(relativeAngle / sliceAngle) % numItems;
        const winner = activeItems[winningIndex];
        setResult(winner);

        // Trigger Confetti!
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#f43f5e', '#ec4899', '#a855f7', '#fbbf24'],
        });
      }
    };

    animationFrameRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-3xl bg-slate-900/95 border border-rose-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden glass-card">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-700/60 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-500 to-purple-600 flex items-center justify-center shadow-lg shadow-rose-500/30">
              <Compass className="w-5 h-5 text-white animate-spin" style={{ animationDuration: '8s' }} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                Vòng Quay Hẹn Hò
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  Hôm nay ăn gì, đi đâu?
                </span>
              </h2>
              <p className="text-xs text-slate-400">Giải quyết bài toán "Ăn gì cũng được" của hai đứa</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Category Switcher */}
        <div className="grid grid-cols-3 gap-2 p-1 bg-slate-800/80 rounded-2xl border border-slate-700/60 mb-6">
          <button
            onClick={() => {
              setActiveCategory('food');
              setResult(null);
            }}
            className={`py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-1.5 ${
              activeCategory === 'food'
                ? 'bg-gradient-to-r from-rose-500 to-pink-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Utensils className="w-4 h-4" />
            <span>Ăn Gì?</span>
          </button>
          <button
            onClick={() => {
              setActiveCategory('activity');
              setResult(null);
            }}
            className={`py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-1.5 ${
              activeCategory === 'activity'
                ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>Đi Đâu?</span>
          </button>
          <button
            onClick={() => {
              setActiveCategory('bucket');
              setResult(null);
            }}
            className={`py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-1.5 ${
              activeCategory === 'bucket'
                ? 'bg-gradient-to-r from-amber-500 to-rose-500 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Từ Bucket List</span>
          </button>
        </div>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          {/* Wheel Display Side */}
          <div className="flex flex-col items-center justify-center relative">
            {/* Pointer at the top */}
            <div className="absolute top-0 z-20 -translate-y-2 flex flex-col items-center filter drop-shadow-lg">
              <div className="w-0 h-0 border-l-[14px] border-l-transparent border-r-[14px] border-r-transparent border-t-[22px] border-t-amber-400" />
            </div>

            {/* Canvas Wheel */}
            <div className="relative p-2 rounded-full bg-slate-800/60 border-2 border-rose-500/30 shadow-2xl">
              <canvas
                ref={canvasRef}
                width={320}
                height={320}
                className="rounded-full max-w-[280px] sm:max-w-[320px] aspect-square block"
              />
            </div>

            {/* Spin Button */}
            <div className="mt-5 w-full max-w-[280px]">
              <button
                onClick={handleSpin}
                disabled={isSpinning || activeItems.length < 2}
                className={`w-full py-3.5 rounded-2xl font-bold text-sm shadow-xl flex items-center justify-center gap-2 transition-all transform active:scale-95 ${
                  isSpinning
                    ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-rose-500 via-pink-500 to-purple-600 hover:from-rose-600 hover:to-purple-700 text-white shadow-rose-500/30 hover:scale-102'
                }`}
              >
                <RotateCw className={`w-4 h-4 ${isSpinning ? 'animate-spin' : ''}`} />
                <span>{isSpinning ? 'Đang quay...' : 'QUAY NGAY! 🎲'}</span>
              </button>
            </div>
          </div>

          {/* Right Side: Options List or Winner Announcement */}
          <div className="flex flex-col h-full justify-between space-y-4">
            {/* Winner Announcement Card */}
            {result ? (
              <div className="p-5 rounded-2xl bg-gradient-to-br from-rose-500/20 via-purple-500/20 to-pink-500/10 border-2 border-rose-400/50 shadow-xl text-center space-y-3 animate-fadeIn">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/30 text-rose-200 text-xs font-semibold">
                  <Trophy className="w-3.5 h-3.5 text-amber-300" /> Kết Quả Định Mệnh!
                </div>
                <div className="text-2xl sm:text-3xl font-black text-white px-2 py-1">
                  🎉 {result}
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Vũ trụ đã chọn xong! Hai bạn hãy cùng nhau thưởng thức hoặc lên đường ngay thôi ❤️
                </p>

                <div className="flex flex-col sm:flex-row gap-2 pt-2">
                  <button
                    onClick={handleSpin}
                    className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-all border border-slate-700"
                  >
                    Quay lại lần nữa
                  </button>

                  {onScheduleEvent && (
                    <button
                      onClick={() => {
                        onScheduleEvent(result, activeCategory);
                        onClose();
                      }}
                      className="flex-1 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-purple-600 text-white text-xs font-semibold shadow-md flex items-center justify-center gap-1.5 transition-all hover:scale-102"
                    >
                      <CalendarPlus className="w-3.5 h-3.5" />
                      Lên lịch hẹn này!
                    </button>
                  )}
                </div>
              </div>
            ) : null}

            {/* Manage List Box */}
            <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/60 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-xs font-bold text-slate-300 mb-2">
                  <span>
                    Danh sách lựa chọn ({activeItems.length})
                  </span>
                  <span className="text-[11px] text-slate-400 font-normal">
                    {activeCategory === 'bucket' ? 'Lấy từ Bucket List' : 'Có thể thêm/xóa'}
                  </span>
                </div>

                {/* Add Item Input (for Food & Activity) */}
                {activeCategory !== 'bucket' && (
                  <form onSubmit={handleAddItem} className="flex gap-2 mb-3">
                    <input
                      type="text"
                      value={newItemText}
                      onChange={(e) => setNewItemText(e.target.value)}
                      placeholder={activeCategory === 'food' ? 'Thêm món bạn thích...' : 'Thêm địa điểm...'}
                      className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-rose-500"
                    />
                    <button
                      type="submit"
                      className="px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 text-xs font-semibold flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" /> Thêm
                    </button>
                  </form>
                )}

                {/* Items Scrollable List */}
                <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1 custom-scrollbar">
                  {activeItems.length === 0 ? (
                    <div className="text-center py-6 text-xs text-slate-400">
                      Chưa có mục nào. Hãy thêm ít nhất 2 mục để bắt đầu quay nhé!
                    </div>
                  ) : (
                    activeItems.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-slate-800/60 border border-slate-700/40 text-xs text-slate-200"
                      >
                        <div className="flex items-center gap-2 truncate">
                          <span
                            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                            style={{ backgroundColor: WHEEL_COLORS[idx % WHEEL_COLORS.length] }}
                          />
                          <span className="truncate">{item}</span>
                        </div>

                        {activeCategory !== 'bucket' && activeItems.length > 2 && (
                          <button
                            onClick={() => handleDeleteItem(idx)}
                            className="text-slate-500 hover:text-rose-400 p-1 transition-colors"
                            title="Xóa mục này"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>

              {activeCategory === 'bucket' && activeItems.length === 0 && (
                <div className="text-[11px] text-amber-300 bg-amber-500/10 p-2.5 rounded-xl border border-amber-500/20 mt-2">
                  💡 Bạn chưa có mục nào trong Bucket List. Hãy thêm các kế hoạch muốn đi/làm cùng nhau ở tab <b>Bucket List</b> nhé!
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
