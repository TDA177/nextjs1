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
const PAYOFFS: Reaction[] = ['heart', 'sparkle', 'delighted'];

const SQUASH = [
  { transform: 'scale(1, 1)', easing: 'ease-in' },
  { transform: 'scale(1.10, 0.86)', offset: 0.18, easing: 'ease-out' },
  { transform: 'scale(0.95, 1.08)', offset: 0.45, easing: 'ease-in-out' },
  { transform: 'scale(1.03, 0.97)', offset: 0.72, easing: 'ease-in-out' },
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
  directions?: string;
  reactions?: string;
  size?: number;
  className?: string;
  label?: string;
  /** Tự động lắc đầu định kỳ (mặc định mỗi 60 giây) */
  shakeIntervalMs?: number;
  /** Tự động đảo mắt/chớp mắt ngẫu nhiên khi rảnh rỗi */
  autoIdle?: boolean;
}

export default function AnimatedMascot({
  directions = '/mascots/redpanda-directions.webp',
  reactions = '/mascots/redpanda-reactions.webp',
  size = 40,
  className = '',
  label = 'redpanda mascot',
  shakeIntervalMs = 60000, // Cứ mỗi 60 giây lắc đầu 1 lần
  autoIdle = true,
}: AnimatedMascotProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const squashRef = useRef<HTMLSpanElement>(null);
  const timersRef = useRef<NodeJS.Timeout[]>([]);
  const boopsRef = useRef({ count: 0, at: 0 });

  const [direction, setDirection] = useState<Direction>('center');
  const [reaction, setReaction] = useState<Reaction | null>(null);
  const isInteractingRef = useRef(false);
  const lastMouseMoveRef = useRef(Date.now());

  // 1. Lắng nghe di chuột nếu có (desktop)
  useEffect(() => {
    let sector = -1;
    let pointer: { x: number; y: number } | null = null;

    const aim = () => {
      const button = buttonRef.current;
      if (!button || !pointer || isInteractingRef.current) return;

      const box = button.getBoundingClientRect();
      const dx = pointer.x - (box.left + box.width / 2);
      const dy = pointer.y - (box.top + box.height / 2);

      if (Math.hypot(dx, dy) < DEAD_ZONE) {
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
      lastMouseMoveRef.current = Date.now();
    };

    const onPointerMove = (event: PointerEvent) => {
      pointer = { x: event.clientX, y: event.clientY };
      lastMouseMoveRef.current = Date.now();
      aim();
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('scroll', aim, { passive: true });

    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('scroll', aim);
    };
  }, []);

  // 2. Tự động lắc đầu (Head Shake animation)
  const triggerHeadShake = () => {
    isInteractingRef.current = true;

    // Chuỗi chuyển động lắc đầu: Trái -> Phải -> Trái -> Phải -> Nháy mắt -> Về giữa
    const sequence: { dir?: Direction; react?: Reaction | null; delay: number }[] = [
      { dir: 'left', delay: 100 },
      { dir: 'right', delay: 250 },
      { dir: 'left', delay: 400 },
      { dir: 'right', delay: 550 },
      { dir: 'center', react: 'wink', delay: 700 },
      { dir: 'center', react: null, delay: 1200 },
    ];

    sequence.forEach(({ dir, react, delay }) => {
      const t = setTimeout(() => {
        if (dir) setDirection(dir);
        if (react !== undefined) setReaction(react);
        if (delay === 1200) {
          isInteractingRef.current = false;
        }
      }, delay);
      timersRef.current.push(t);
    });

    // Hiệu ứng nảy nhẹ khi lắc
    squashRef.current?.animate(
      [
        { transform: 'rotate(0deg) scale(1)' },
        { transform: 'rotate(-12deg) scale(1.05)', offset: 0.25 },
        { transform: 'rotate(12deg) scale(1.05)', offset: 0.5 },
        { transform: 'rotate(-8deg) scale(1.02)', offset: 0.75 },
        { transform: 'rotate(0deg) scale(1)' },
      ],
      { duration: 800, easing: 'ease-in-out' }
    );
  };

  // 3. Chu kỳ cứ 1 phút (hoặc shakeIntervalMs) lại tự động lắc đầu
  useEffect(() => {
    if (!shakeIntervalMs) return;

    const interval = setInterval(() => {
      triggerHeadShake();
    }, shakeIntervalMs);

    return () => clearInterval(interval);
  }, [shakeIntervalMs]);

  // 4. Chuyển động Idle tự nhiên (cứ 3-5 giây đổi hướng nhìn, chớp mắt nếu không có chuột di chuyển)
  useEffect(() => {
    if (!autoIdle) return;

    const idleInterval = setInterval(() => {
      if (isInteractingRef.current) return;

      // Nếu người dùng vừa di chuột trong vòng 3 giây trước thì ưu tiên chuột
      if (Date.now() - lastMouseMoveRef.current < 3000) return;

      const rand = Math.random();
      if (rand < 0.3) {
        // Chớp mắt
        setReaction('blink');
        setTimeout(() => setReaction(null), 300);
      } else if (rand < 0.45) {
        // Nháy mắt hoặc thả tim
        const payoff = rand < 0.38 ? 'wink' : 'delighted';
        setReaction(payoff);
        setTimeout(() => setReaction(null), 600);
      } else if (rand < 0.75) {
        // Liếc nhìn ngẫu nhiên (trái, phải, lên, xuống, center)
        const idleDirs: Direction[] = ['left', 'right', 'up', 'down-right', 'center'];
        const picked = idleDirs[Math.floor(Math.random() * idleDirs.length)];
        setDirection(picked);
      } else {
        setDirection('center');
      }
    }, 3500);

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

    if (boops.count >= 4) {
      boops.count = 0;
      setReaction('dizzy');
      const t = setTimeout(() => {
        setReaction(null);
        isInteractingRef.current = false;
      }, 1200);
      timersRef.current.push(t);
    } else {
      setReaction('blink');
      const t1 = setTimeout(() => {
        setReaction(PAYOFFS[(boops.count - 1) % PAYOFFS.length]);
      }, 120);
      const t2 = setTimeout(() => {
        setReaction(null);
        isInteractingRef.current = false;
      }, 700);
      timersRef.current.push(t1, t2);
    }

    squashRef.current?.animate(SQUASH, { duration: 420, easing: 'linear' });
  };

  const dirIndex = DIRECTIONS.indexOf(direction);
  const reactIndex = reaction ? REACTIONS.indexOf(reaction) : 0;

  return (
    <button
      ref={buttonRef}
      type="button"
      onClick={boop}
      aria-label={label}
      className={className}
      style={{
        position: 'relative',
        display: 'block',
        flexShrink: 0,
        width: size,
        height: size,
        padding: 0,
        border: 0,
        background: 'transparent',
        appearance: 'none',
        cursor: 'pointer',
        userSelect: 'none',
      }}
    >
      <span
        ref={squashRef}
        style={{
          position: 'relative',
          display: 'block',
          width: '100%',
          height: '100%',
          transformOrigin: '50% 78%',
        }}
      >
        {/* Layer 1: Hướng quay đầu */}
        <span
          style={{
            ...layerStyle,
            backgroundImage: `url(${directions})`,
            ...cell(dirIndex),
            opacity: reaction ? 0 : 1,
            transition: 'background-position 0.15s ease-out',
          }}
        />

        {/* Layer 2: Biểu cảm phản ứng / chớp mắt */}
        <span
          style={{
            ...layerStyle,
            backgroundImage: `url(${reactions})`,
            ...cell(reactIndex),
            opacity: reaction ? 1 : 0,
            transition: 'opacity 0.12s ease-in-out',
          }}
        />
      </span>
    </button>
  );
}
