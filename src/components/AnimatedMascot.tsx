'use client';

import React, { useEffect, useRef, useState } from 'react';

const DIRECTIONS = [
  'up-left',
  'up',
  'up-right',
  'left',
  'center',
  'right',
  'down-left',
  'down',
  'down-right',
] as const;

type Direction = (typeof DIRECTIONS)[number];

const REACTIONS = [
  'blink',
  'heart',
  'sparkle',
  'surprised',
  'wink',
  'bashful',
  'sleepy',
  'dizzy',
  'delighted',
] as const;

type Reaction = (typeof REACTIONS)[number];

const CLOCKWISE = [
  'right',
  'down-right',
  'down',
  'down-left',
  'left',
  'up-left',
  'up',
  'up-right',
] as const;

const SECTOR = (Math.PI * 2) / CLOCKWISE.length;
const HYSTERESIS = 0.12;
const DEAD_ZONE = 70;

const SQUASH = [
  { transform: 'scale(1, 1)', easing: 'ease-in' },
  { transform: 'scale(1.15, 0.85)', offset: 0.2, easing: 'ease-out' },
  { transform: 'scale(0.92, 1.12)', offset: 0.5, easing: 'ease-in-out' },
  { transform: 'scale(1.04, 0.96)', offset: 0.75, easing: 'ease-in-out' },
  { transform: 'scale(1, 1)' },
];

function cell(index: number) {
  return { backgroundPosition: `${(index % 3) * 50}% ${Math.floor(index / 3) * 50}%` };
}

function wrap(angle: number) {
  return Math.atan2(Math.sin(angle), Math.cos(angle));
}

const layerStyle: React.CSSProperties = {
  position: 'absolute',
  inset: 0,
  backgroundSize: '300% 300%',
  backgroundRepeat: 'no-repeat',
};

export interface AnimatedMascotProps {
  /** Đường dẫn ảnh mascot đơn lẻ (mặc định là bé cáo fox-mascot.webp) */
  image?: string;
  /** Hỗ trợ sprite-sheet cũ nếu có */
  directions?: string;
  reactions?: string;
  size?: number;
  className?: string;
  label?: string;
  /** Tự động lắc đầu định kỳ (mặc định mỗi 45 giây) */
  shakeIntervalMs?: number;
  /** Tự động tương tác / thở nhẹ khi rảnh rỗi */
  autoIdle?: boolean;
}

export default function AnimatedMascot({
  image = '/mascots/fox-mascot.webp',
  directions,
  reactions,
  size = 40,
  className = '',
  label = 'fox mascot',
  shakeIntervalMs = 45000,
  autoIdle = true,
}: AnimatedMascotProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const squashRef = useRef<HTMLSpanElement>(null);
  const timersRef = useRef<NodeJS.Timeout[]>([]);
  const boopsRef = useRef({ count: 0, at: 0 });

  // Trạng thái cho single image mascot
  const [tilt, setTilt] = useState({ x: 0, y: 0, rotate: 0 });
  const [floatingHearts, setFloatingHearts] = useState<{ id: number; char: string; left: number }[]>([]);
  const [isWiggling, setIsWiggling] = useState(false);

  // Trạng thái cho sprite sheet cũ (nếu dùng)
  const [direction, setDirection] = useState<Direction>('center');
  const [reaction, setReaction] = useState<Reaction | null>(null);
  const isInteractingRef = useRef(false);
  const lastMouseMoveRef = useRef(Date.now());

  const isSpriteMode = Boolean(directions && reactions && !image);

  // 1. Lắng nghe di chuột để nghiêng / liếc nhìn theo trỏ chuột
  useEffect(() => {
    let sector = -1;

    const onPointerMove = (event: PointerEvent) => {
      lastMouseMoveRef.current = Date.now();
      const button = buttonRef.current;
      if (!button || isInteractingRef.current) return;

      const box = button.getBoundingClientRect();
      const dx = event.clientX - (box.left + box.width / 2);
      const dy = event.clientY - (box.top + box.height / 2);
      const dist = Math.hypot(dx, dy);

      if (isSpriteMode) {
        if (dist < DEAD_ZONE) {
          sector = -1;
          setDirection('center');
          return;
        }
        const angle = Math.atan2(dy, dx);
        if (sector !== -1 && Math.abs(wrap(angle - sector * SECTOR)) < SECTOR / 2 + HYSTERESIS) {
          return;
        }
        sector = (Math.round(angle / SECTOR) + CLOCKWISE.length) % CLOCKWISE.length;
        setDirection(CLOCKWISE[sector]);
      } else {
        // Single image mode: Nghiêng nhẹ đầu & thân theo hướng chuột
        const maxTilt = 12; // Góc nghiêng tối đa
        const clampedX = Math.max(-1, Math.min(1, dx / 400));
        const clampedY = Math.max(-1, Math.min(1, dy / 400));
        setTilt({
          x: clampedX * 3,
          y: clampedY * 3,
          rotate: clampedX * maxTilt,
        });
      }
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    return () => {
      window.removeEventListener('pointermove', onPointerMove);
    };
  }, [isSpriteMode]);

  // 2. Lắc đầu / Vẫy chào vui vẻ (Head shake & dance)
  const triggerHeadShake = () => {
    isInteractingRef.current = true;
    setIsWiggling(true);

    if (squashRef.current) {
      squashRef.current.animate(
        [
          { transform: 'rotate(0deg) scale(1)' },
          { transform: 'rotate(-14deg) scale(1.08)', offset: 0.2 },
          { transform: 'rotate(14deg) scale(1.08)', offset: 0.4 },
          { transform: 'rotate(-10deg) scale(1.05)', offset: 0.6 },
          { transform: 'rotate(10deg) scale(1.05)', offset: 0.8 },
          { transform: 'rotate(0deg) scale(1)', offset: 1.0 },
        ],
        { duration: 850, easing: 'ease-in-out' }
      );
    }

    const t = setTimeout(() => {
      isInteractingRef.current = false;
      setIsWiggling(false);
      setTilt({ x: 0, y: 0, rotate: 0 });
    }, 900);
    timersRef.current.push(t);
  };

  // 3. Chu kỳ tự động lắc đầu / vẫy nhẹ
  useEffect(() => {
    if (!shakeIntervalMs) return;
    const interval = setInterval(() => {
      triggerHeadShake();
    }, shakeIntervalMs);
    return () => clearInterval(interval);
  }, [shakeIntervalMs]);

  // 4. Idle micro-motion (khi không di chuột, thỉnh thoảng liếc hoặc nhún nhảy nhẹ)
  useEffect(() => {
    if (!autoIdle) return;

    const idleInterval = setInterval(() => {
      if (isInteractingRef.current) return;
      if (Date.now() - lastMouseMoveRef.current < 3500) return;

      const rand = Math.random();
      if (rand < 0.35) {
        // Nháy nghiêng đầu nhẹ
        const randomRot = (Math.random() - 0.5) * 16;
        setTilt({ x: 0, y: -2, rotate: randomRot });
        setTimeout(() => {
          setTilt({ x: 0, y: 0, rotate: 0 });
        }, 1200);
      } else if (rand < 0.6) {
        // Nhún nhẹ
        if (squashRef.current) {
          squashRef.current.animate(
            [
              { transform: 'scale(1, 1)' },
              { transform: 'scale(1.06, 0.94)', offset: 0.5 },
              { transform: 'scale(1, 1)' },
            ],
            { duration: 500, easing: 'ease-in-out' }
          );
        }
      }
    }, 4000);

    return () => clearInterval(idleInterval);
  }, [autoIdle]);

  // 5. Khi bấm/chạm vào (Boop)
  const boop = () => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
    isInteractingRef.current = true;

    const now = Date.now();
    const boops = boopsRef.current;
    boops.count = now - boops.at < 1600 ? boops.count + 1 : 1;
    boops.at = now;

    // Bắn icon tim/sao bay lên
    const heartIcons = ['❤️', '💖', '✨', '🦊', '🌸'];
    const randomIcon = heartIcons[Math.floor(Math.random() * heartIcons.length)];
    const heartId = Date.now() + Math.random();
    const heartLeft = 30 + Math.random() * 40;
    setFloatingHearts((prev) => [...prev.slice(-3), { id: heartId, char: randomIcon, left: heartLeft }]);
    setTimeout(() => {
      setFloatingHearts((prev) => prev.filter((h) => h.id !== heartId));
    }, 1200);

    if (boops.count >= 4) {
      // Khi click liên tục nhiều lần: Quay tít vui mừng!
      boops.count = 0;
      squashRef.current?.animate(
        [
          { transform: 'scale(1) rotate(0deg)' },
          { transform: 'scale(1.2) rotate(360deg)', offset: 0.8 },
          { transform: 'scale(1) rotate(360deg)' },
        ],
        { duration: 600, easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)' }
      );
      const t = setTimeout(() => {
        isInteractingRef.current = false;
      }, 700);
      timersRef.current.push(t);
    } else {
      // Nảy tưng tưng
      squashRef.current?.animate(SQUASH, { duration: 450, easing: 'linear' });
      const t = setTimeout(() => {
        isInteractingRef.current = false;
      }, 500);
      timersRef.current.push(t);
    }
  };

  const dirIndex = DIRECTIONS.indexOf(direction);
  const reactIndex = reaction ? REACTIONS.indexOf(reaction) : 0;

  return (
    <button
      ref={buttonRef}
      type="button"
      onClick={boop}
      aria-label={label}
      className={`group/mascot relative select-none cursor-pointer focus:outline-none ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: size,
        height: size,
        padding: 0,
        border: 0,
        background: 'transparent',
        appearance: 'none',
      }}
    >
      {/* Floating Hearts/Sparkles on Click */}
      {floatingHearts.map((heart) => (
        <span
          key={heart.id}
          className="absolute pointer-events-none text-base select-none z-20 animate-mascot-heart"
          style={{
            left: `${heart.left}%`,
            bottom: '60%',
          }}
        >
          {heart.char}
        </span>
      ))}

      <span
        ref={squashRef}
        className="relative block w-full h-full transition-transform duration-200 ease-out"
        style={{
          transformOrigin: '50% 85%',
          transform: !isWiggling
            ? `translate(${tilt.x}px, ${tilt.y}px) rotate(${tilt.rotate}deg)`
            : undefined,
        }}
      >
        {isSpriteMode ? (
          <>
            {/* Layer 1: Sprite Hướng quay đầu */}
            <span
              style={{
                ...layerStyle,
                backgroundImage: `url(${directions})`,
                ...cell(dirIndex),
                opacity: reaction ? 0 : 1,
                transition: 'background-position 0.15s ease-out',
              }}
            />
            {/* Layer 2: Sprite Biểu cảm phản ứng */}
            <span
              style={{
                ...layerStyle,
                backgroundImage: `url(${reactions})`,
                ...cell(reactIndex),
                opacity: reaction ? 1 : 0,
                transition: 'opacity 0.12s ease-in-out',
              }}
            />
          </>
        ) : (
          /* Single Image Mascot (Bé cáo đáng yêu) */
          <img
            src={image}
            alt={label}
            draggable={false}
            className="w-full h-full object-contain filter drop-shadow-sm pointer-events-none transition-transform duration-150 group-hover/mascot:scale-105"
          />
        )}
      </span>
    </button>
  );
}
