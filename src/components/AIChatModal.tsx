'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Send,
  Sparkles,
  User,
  Key,
  Calendar,
  Heart,
  Clock,
  RefreshCw,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';
import AnimatedMascot from '@/components/AnimatedMascot';

interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  createdAt: Date;
}

interface AIChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser?: { id: string; name: string; avatar?: string };
}

const QUICK_PROMPTS = [
  { label: 'Sắp tới là ngày gì?', icon: Calendar },
  { label: 'Bao nhiêu ngày nữa tới 20/10?', icon: Clock },
  { label: 'Bao nhiêu ngày nữa tới Tết?', icon: Sparkles },
  { label: 'Tụi mình yêu nhau được bao lâu rồi?', icon: Heart },
  { label: 'Sắp tới tụi mình có lịch hẹn nào không?', icon: Calendar },
];

export default function AIChatModal({ isOpen, onClose, currentUser }: AIChatModalProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      text: 'Chào bạn! Mình là Haha ❤️ Mình có thể giúp bạn kiểm tra các ngày lễ sắp tới, đếm ngược sự kiện, hoặc xem lịch hẹn hò của 2 bạn. Bạn muốn hỏi gì hôm nay nào?',
      createdAt: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [keyInput, setKeyInput] = useState('');
  const [keySavedToast, setKeySavedToast] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Tải API key từ LocalStorage nếu có
  useEffect(() => {
    const saved = localStorage.getItem('GEMINI_CUSTOM_API_KEY');
    if (saved) {
      setApiKey(saved);
      setKeyInput(saved);
    }
  }, []);

  // Tự động cuộn xuống cuối tin nhắn
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isLoading]);

  const handleSaveKey = () => {
    if (!keyInput.trim()) {
      localStorage.removeItem('GEMINI_CUSTOM_API_KEY');
      setApiKey('');
    } else {
      localStorage.setItem('GEMINI_CUSTOM_API_KEY', keyInput.trim());
      setApiKey(keyInput.trim());
    }
    setShowKeyModal(false);
    setKeySavedToast(true);
    setTimeout(() => setKeySavedToast(false), 3000);
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputValue).trim();
    if (!text || isLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text,
      createdAt: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Chuẩn bị history cho backend
      const history = messages
        .filter((m) => m.id !== 'welcome')
        .slice(-6)
        .map((m) => ({
          role: m.role,
          text: m.text,
        }));

      const res = await fetch('/api/chat-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history,
          customApiKey: apiKey || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.needApiKey) {
          setShowKeyModal(true);
        }
        throw new Error(data.error || 'Có lỗi xảy ra khi gửi tin nhắn');
      }

      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: data.reply,
        createdAt: new Date(),
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: `⚠️ ${err.message || 'Không thể kết nối tới Haha. Hãy thử lại nhé!'}`,
        createdAt: new Date(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="relative flex flex-col w-full max-w-lg h-[620px] max-h-[90vh] bg-gradient-to-b from-rose-50/95 via-white to-pink-50/80 dark:from-slate-900 dark:via-slate-900 dark:to-rose-950/40 rounded-3xl shadow-2xl border border-rose-200/60 dark:border-rose-900/40 overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-rose-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-slate-800 flex items-center justify-center shadow-md overflow-hidden border border-rose-200/50">
                <AnimatedMascot
                  directions="/mascots/redpanda-directions.webp"
                  reactions="/mascots/redpanda-reactions.webp"
                  size={38}
                  shakeIntervalMs={60000}
                />
              </div>
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-white text-base">
                Haha AI Assistant
                <Sparkles className="w-4 h-4 text-amber-500 fill-amber-500" />
              </div>
              <p className="text-xs text-rose-500 dark:text-rose-400 font-medium">
                Hỏi lịch, ngày lễ & chuyện cặp đôi
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setShowKeyModal(true)}
              title="Cài đặt Gemini API Key"
              className={`p-2 rounded-xl transition-all ${
                apiKey
                  ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100'
                  : 'text-amber-600 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100'
              }`}
            >
              <Key className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-rose-50 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Toast thông báo đã lưu key */}
        {keySavedToast && (
          <div className="bg-emerald-500 text-white text-xs px-4 py-1.5 text-center font-medium animate-fade-in shadow">
            ✓ Đã lưu cài đặt API Key thành công!
          </div>
        )}

        {/* Khung tin nhắn */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => {
            const isMe = msg.role === 'user';
            return (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}
              >
                {/* Avatar */}
                <div className="flex-shrink-0">
                  {isMe ? (
                    <div className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center text-xs font-semibold shadow">
                      {currentUser?.name ? currentUser.name.slice(0, 1) : <User className="w-4 h-4" />}
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-amber-50 dark:bg-slate-800 flex items-center justify-center shadow overflow-hidden border border-rose-200/60">
                      <AnimatedMascot
                        directions="/mascots/redpanda-directions.webp"
                        reactions="/mascots/redpanda-reactions.webp"
                        size={30}
                        autoIdle={false}
                        shakeIntervalMs={0}
                      />
                    </div>
                  )}
                </div>

                {/* Nội dung bong bóng */}
                <div
                  className={`max-w-[82%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-line shadow-sm ${
                    isMe
                      ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-tr-none'
                      : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-rose-100/70 dark:border-slate-700/60 rounded-tl-none'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            );
          })}

          {/* Hiệu ứng đang gõ */}
          {isLoading && (
            <div className="flex gap-2.5 items-center">
              <div className="w-8 h-8 rounded-full bg-amber-50 dark:bg-slate-800 flex items-center justify-center shadow overflow-hidden border border-rose-200/60">
                <AnimatedMascot
                  directions="/mascots/redpanda-directions.webp"
                  reactions="/mascots/redpanda-reactions.webp"
                  size={30}
                  autoIdle={true}
                  shakeIntervalMs={0}
                />
              </div>
              <div className="bg-white dark:bg-slate-800 px-4 py-3 rounded-2xl rounded-tl-none border border-rose-100 dark:border-slate-700 shadow-sm flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 rounded-full bg-rose-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 rounded-full bg-rose-400 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Chips gợi ý câu hỏi */}
        <div className="px-4 py-2 flex gap-2 overflow-x-auto no-scrollbar border-t border-rose-100/70 dark:border-slate-800/80 bg-rose-50/40 dark:bg-slate-900/40">
          {QUICK_PROMPTS.map((item, idx) => {
            const Icon = item.icon;
            return (
              <button
                key={idx}
                onClick={() => handleSendMessage(item.label)}
                disabled={isLoading}
                className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-white dark:bg-slate-800 text-rose-600 dark:text-rose-300 border border-rose-200/70 dark:border-slate-700 hover:bg-rose-500 hover:text-white transition-all shadow-xs"
              >
                <Icon className="w-3.5 h-3.5 text-rose-500" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-white/90 dark:bg-slate-900/90 border-t border-rose-100 dark:border-slate-800">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Hỏi Haha: 'Sắp tới là ngày gì?', 'Bao nhiêu ngày nữa tới Tết?'..."
              disabled={isLoading}
              className="flex-1 px-4 py-2.5 rounded-2xl bg-rose-50/60 dark:bg-slate-800 text-sm text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-400 dark:focus:ring-rose-500 border border-rose-100 dark:border-slate-700 transition"
            />
            <button
              type="submit"
              disabled={isLoading || !inputValue.trim()}
              className="p-2.5 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 text-white font-medium hover:opacity-95 active:scale-95 disabled:opacity-40 disabled:scale-100 transition-all shadow-md shadow-rose-500/20"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Modal Cài đặt API Key */}
        {showKeyModal && (
          <div className="absolute inset-0 z-20 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
            <div className="w-full max-w-sm bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-xl border border-rose-200 dark:border-slate-700 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-white">
                  <Key className="w-4 h-4 text-amber-500" />
                  <span>Cài đặt Gemini API Key</span>
                </div>
                <button
                  onClick={() => setShowKeyModal(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Gemini API hoàn toàn <b>miễn phí</b>. Bạn có thể tự tạo API Key tại Google AI Studio rồi dán vào đây:
              </p>

              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between px-3 py-2 text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 rounded-xl hover:underline"
              >
                <span>Lấy Gemini API Key miễn phí ngay</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Nhập API Key của bạn:
                </label>
                <input
                  type="password"
                  value={keyInput}
                  onChange={(e) => setKeyInput(e.target.value)}
                  placeholder="AIzaSy..."
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-400"
                />
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowKeyModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={handleSaveKey}
                  className="px-4 py-1.5 text-xs font-medium bg-rose-500 hover:bg-rose-600 text-white rounded-lg shadow"
                >
                  Lưu Key
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
