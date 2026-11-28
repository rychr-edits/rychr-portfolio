import React, { useEffect, useRef, useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { AnimatedGeminiBorder } from './AnimatedGeminiBorder.tsx';

interface AboutEditorStudioProps {
  onStartProject: () => void;
}

interface CleanCardItem {
  id: string;
  headline: string;
  sublabel: string;
  paragraph: string;
  tabular?: boolean;
  direction: 'down' | 'up';
  calloutAlign: string;
  turnSide: 'right' | 'left';
}

const TOP_THREE_CARDS: CleanCardItem[] = [
  {
    id: 'card-pacing',
    headline: 'Pacing',
    sublabel: 'built for retention',
    paragraph:
      'Editing isn’t just trimming fat—it’s breath-tight timing, J-cuts, and deliberate rhythm changes engineered to hold viewers past the opening hook.',
    direction: 'down',
    calloutAlign: 'left-0',
    turnSide: 'right',
  },
  {
    id: 'card-adaptive',
    headline: 'Adaptive',
    sublabel: 'to your exact style',
    paragraph:
      'Whether your channel runs on fast gaming cuts, documentary storytelling, or talking-head essays, every edit is built from scratch around your voice.',
    direction: 'down',
    calloutAlign: 'left-0 sm:left-1/2 sm:-translate-x-1/2',
    turnSide: 'right',
  },
  {
    id: 'card-sound',
    headline: '3-Layer',
    sublabel: 'motion & sound',
    paragraph:
      'Surgical keyframing, whip zooms, and kinetic captions paired with 3-layer soundscapes—dialogue clarity, risers, foley, and sub-drops.',
    direction: 'down',
    calloutAlign: 'right-0',
    turnSide: 'left',
  },
];

const MIDDLE_TWO_CARDS: CleanCardItem[] = [
  {
    id: 'stat-years',
    headline: '4+',
    sublabel: 'years experience',
    tabular: true,
    paragraph:
      'Started editing for fun four years ago and kept building on it in After Effects ever since—learning better timing, cleaner flow, and pacing with every project.',
    direction: 'down',
    calloutAlign: 'left-0',
    turnSide: 'right',
  },
  {
    id: 'stat-videos',
    headline: '50+',
    sublabel: 'videos edited',
    tabular: true,
    paragraph:
      'Over fifty completed cuts delivered for YouTube, Reels, and TikTok creators—from long-form documentaries to high-retention short-form.',
    direction: 'down',
    calloutAlign: 'right-0',
    turnSide: 'left',
  },
];

const BOTTOM_TWO_CARDS: CleanCardItem[] = [
  {
    id: 'stat-turnaround',
    headline: 'Reliable',
    sublabel: 'turnaround time',
    paragraph:
      'Consistent delivery windows, clear communication, and up to 3 focused revision passes included so your upload schedule never slips.',
    direction: 'up',
    calloutAlign: 'left-0',
    turnSide: 'right',
  },
  {
    id: 'stat-ae',
    headline: 'After Effects',
    sublabel: 'professional',
    paragraph:
      'Proficient in Adobe After Effects—crafting clean motion graphics, smooth keyframe curves, and transitions tailored to each video.',
    direction: 'up',
    calloutAlign: 'right-0',
    turnSide: 'left',
  },
];

export const AboutEditorStudio: React.FC<AboutEditorStudioProps> = ({ onStartProject }) => {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [pinnedId, setPinnedId] = useState<string | null>(null);

  const stageRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const isVisibleId = (id: string) => activeId === id || pinnedId === id;

  useEffect(() => {
    const video = videoRef.current;
    const stage = stageRef.current;
    if (!video || !stage || typeof IntersectionObserver === 'undefined') return;

    const reducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion) {
      video.pause();
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          video.play().catch(() => {});
        } else {
          video.pause();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(stage);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!pinnedId) return;
    const handleDocClick = (e: MouseEvent) => {
      if (stageRef.current && !stageRef.current.contains(e.target as Node)) {
        setPinnedId(null);
      }
    };
    document.addEventListener('mousedown', handleDocClick);
    return () => document.removeEventListener('mousedown', handleDocClick);
  }, [pinnedId]);

  const togglePin = (id: string) => {
    setPinnedId((prev) => (prev === id ? null : id));
  };

  const renderTurnConnector = (
    direction: 'down' | 'up',
    turnSide: 'right' | 'left',
    isOpen: boolean
  ) => {
    // Crisp 3-segment chamfered elbow turn
    const startX = turnSide === 'right' ? 22 : 62;
    const endX = turnSide === 'right' ? 62 : 22;

    const pathD =
      direction === 'down'
        ? `M ${startX} 0 L ${startX} 16 L ${endX} 34 L ${endX} 50`
        : `M ${startX} 50 L ${startX} 34 L ${endX} 16 L ${endX} 0`;

    const startY = direction === 'down' ? 3 : 47;
    const endY = direction === 'down' ? 47 : 3;

    return (
      <svg
        width="84"
        height="50"
        viewBox="0 0 84 50"
        className="shrink-0 overflow-visible"
        aria-hidden="true"
      >
        <path
          d={pathD}
          fill="none"
          stroke="rgba(255,255,255,0.88)"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          pathLength={1}
          strokeDasharray="1"
          strokeDashoffset={isOpen ? 0 : 1}
          style={{
            transition: 'stroke-dashoffset 450ms cubic-bezier(0.22, 1, 0.36, 1)',
          }}
        />
        <circle
          cx={startX}
          cy={startY}
          r="3"
          fill="#ffffff"
          style={{ opacity: isOpen ? 1 : 0, transition: 'opacity 180ms ease' }}
        />
        <circle
          cx={endX}
          cy={endY}
          r="2.6"
          fill="#050505"
          stroke="#ffffff"
          strokeWidth="1.5"
          style={{ opacity: isOpen ? 1 : 0, transition: 'opacity 220ms ease 210ms' }}
        />
      </svg>
    );
  };

  const renderStatCard = (card: CleanCardItem) => {
    const isOpen = isVisibleId(card.id);
    const isDown = card.direction === 'down';

    return (
      <div
        key={card.id}
        className={`relative ${isOpen ? 'z-50' : 'z-10'}`}
        onMouseEnter={() => setActiveId(card.id)}
        onMouseLeave={() => setActiveId((prev) => (prev === card.id ? null : prev))}
      >
        <div
          role="button"
          tabIndex={0}
          aria-expanded={isOpen}
          onClick={() => togglePin(card.id)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              togglePin(card.id);
            }
          }}
          data-s3d="card"
          data-s3d-depth="0.9"
          data-s3d-global-tilt="3.0"
          data-s3d-scale="1.045"
          data-s3d-tilt="8"
          className={`rounded-2xl p-6 sm:p-7 bg-[#050505]/90 border transition-colors cursor-pointer will-change-transform ${
            isOpen ? 'border-white/35 bg-white/[0.04]' : 'border-white/10 hover:border-white/30'
          }`}
        >
          <div
            className={`text-2xl sm:text-3xl lg:text-[32px] font-mazzard font-bold text-white leading-tight ${
              card.tabular ? 'tabular-nums' : ''
            }`}
          >
            {card.headline}
          </div>
          <div className="text-xs sm:text-sm text-white/60 mt-1.5">{card.sublabel}</div>
        </div>

        {/* Desktop Turned Line -> Floating Blurred-Background Paragraph */}
        <div
          className={`hidden sm:block w-[min(300px,82vw)] absolute z-50 ${
            isDown ? 'top-full' : 'bottom-full'
          } ${card.calloutAlign} ${isOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}
        >
          <div className={`flex ${isDown ? 'flex-col' : 'flex-col-reverse'} items-center`}>
            {renderTurnConnector(card.direction, card.turnSide, isOpen)}

            <div
              className={`w-full rounded-2xl p-5 bg-[#070707]/75 backdrop-blur-2xl border border-white/20 shadow-[0_24px_60px_rgba(0,0,0,0.92)] transition-all duration-300 ease-out will-change-transform ${
                isOpen
                  ? 'opacity-100 translate-y-0 scale-100'
                  : isDown
                  ? 'opacity-0 -translate-y-2 scale-[0.97]'
                  : 'opacity-0 translate-y-2 scale-[0.97]'
              }`}
            >
              <p className="text-xs sm:text-sm text-white/85 leading-relaxed">{card.paragraph}</p>
            </div>
          </div>
        </div>

        {/* Mobile Turned Line -> Inline Blurred-Background Paragraph */}
        <div
          className={`sm:hidden grid transition-[grid-template-rows,opacity] duration-300 ease-out ${
            isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
          }`}
        >
          <div className="overflow-hidden flex flex-col items-center">
            {renderTurnConnector('down', card.turnSide, isOpen)}
            <div className="w-full rounded-2xl p-4 bg-[#070707]/80 backdrop-blur-xl border border-white/20">
              <p className="text-xs text-white/85 leading-relaxed">{card.paragraph}</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const topRowOpen = TOP_THREE_CARDS.some((c) => isVisibleId(c.id));
  const midRowOpen = MIDDLE_TWO_CARDS.some((c) => isVisibleId(c.id));
  const botRowOpen = BOTTOM_TWO_CARDS.some((c) => isVisibleId(c.id));
  const squareOpen = isVisibleId('hero-square');

  return (
    <div
      ref={stageRef}
      className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center"
    >
      {/* LEFT SIDE: 7 Clean Bigger Cards (3 + 2 + 2) */}
      <div className={`lg:col-span-7 space-y-4 relative ${topRowOpen || midRowOpen || botRowOpen ? 'z-40' : 'z-10'}`}>
        {/* Top Row: 3 Cards */}
        <div className={`relative grid grid-cols-1 sm:grid-cols-3 gap-4 ${topRowOpen ? 'z-40' : 'z-10'}`}>
          {TOP_THREE_CARDS.map(renderStatCard)}
        </div>

        {/* Middle Row: 2 Cards */}
        <div className={`relative grid grid-cols-2 gap-4 ${midRowOpen ? 'z-40' : 'z-10'}`}>
          {MIDDLE_TWO_CARDS.map(renderStatCard)}
        </div>

        {/* Bottom Row: 2 Cards */}
        <div className={`relative grid grid-cols-2 gap-4 ${botRowOpen ? 'z-40' : 'z-10'}`}>
          {BOTTOM_TWO_CARDS.map(renderStatCard)}
        </div>
      </div>

      {/* RIGHT SIDE: 1:1 Square Animation Card + Leftward Turned Line -> Blurred Paragraph */}
      <div className={`lg:col-span-5 relative flex justify-center lg:justify-end ${squareOpen ? 'z-40' : 'z-20'}`}>
        <div
          className={`relative w-full max-w-[440px] ${squareOpen ? 'z-50' : 'z-10'}`}
          onMouseEnter={() => setActiveId('hero-square')}
          onMouseLeave={() => setActiveId((prev) => (prev === 'hero-square' ? null : prev))}
        >
          {/* True 1:1 Square Card */}
          <div
            role="button"
            tabIndex={0}
            aria-expanded={squareOpen}
            onClick={() => togglePin('hero-square')}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                togglePin('hero-square');
              }
            }}
            data-s3d="card"
            data-s3d-depth="0.95"
            data-s3d-global-tilt="3.0"
            data-s3d-scale="1.03"
            data-s3d-tilt="6.5"
            className="group relative w-full aspect-square rounded-3xl bg-black border border-white/15 hover:border-white/35 shadow-[0_24px_70px_rgba(0,0,0,0.9)] transition-colors cursor-pointer overflow-visible will-change-transform"
          >
            <AnimatedGeminiBorder
              preset="gemini"
              mode="hover-only"
              borderRadius="rounded-3xl"
              borderWidth="1.5px"
              auraBlur="blur-lg"
              auraOpacity={0.28}
              innerGlowOpacity={0.85}
              speedMs={16000}
              angleOffset={40}
            />

            <div className="relative w-full h-full rounded-3xl overflow-hidden bg-black flex items-center justify-center">
              <video
                ref={videoRef}
                src="/assets/aistudio/export_2_-_15_fps_dc6d6217.mp4"
                poster="/assets/aistudio/image_5a1c3c4a.png"
                autoPlay
                loop
                muted
                playsInline
                disablePictureInPicture
                className="w-full h-full object-cover grayscale contrast-125 pointer-events-none select-none transition-transform duration-500 ease-out group-hover:scale-[1.04]"
              />

              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0"
                style={{
                  background:
                    'radial-gradient(circle at center, transparent 52%, rgba(0, 0, 0, 0.72) 88%, rgba(0, 0, 0, 0.96) 100%)',
                }}
              />

              <div className="pointer-events-none absolute bottom-5 inset-x-6 flex items-center justify-between text-xs font-mono text-white/55">
                <span>Ray · Rychr</span>
                <span className="text-white/40">{squareOpen ? 'Active' : 'Hover'}</span>
              </div>
            </div>
          </div>

          {/* Desktop Leftward Turned Line -> Floating Blurred-Background Story Card */}
          <div
            className={`hidden lg:flex flex-row-reverse items-center absolute right-full top-1/2 -translate-y-1/2 z-50 ${
              squareOpen ? 'pointer-events-auto' : 'pointer-events-none'
            }`}
          >
            <svg
              width="90"
              height="60"
              viewBox="0 0 90 60"
              className="shrink-0 overflow-visible"
              aria-hidden="true"
            >
              <path
                d="M 90 38 L 58 38 L 34 14 L 0 14"
                fill="none"
                stroke="rgba(255,255,255,0.9)"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                pathLength={1}
                strokeDasharray="1"
                strokeDashoffset={squareOpen ? 0 : 1}
                style={{
                  transition: 'stroke-dashoffset 480ms cubic-bezier(0.22, 1, 0.36, 1)',
                }}
              />
              <circle
                cx="87"
                cy="38"
                r="3"
                fill="#ffffff"
                style={{ opacity: squareOpen ? 1 : 0, transition: 'opacity 180ms ease' }}
              />
              <circle
                cx="3"
                cy="14"
                r="2.8"
                fill="#050505"
                stroke="#ffffff"
                strokeWidth="1.5"
                style={{ opacity: squareOpen ? 1 : 0, transition: 'opacity 220ms ease 240ms' }}
              />
            </svg>

            <div
              className={`w-[360px] rounded-3xl p-6 bg-[#070707]/80 backdrop-blur-2xl border border-white/20 shadow-[0_28px_70px_rgba(0,0,0,0.92)] transition-all duration-300 ease-out will-change-transform ${
                squareOpen
                  ? 'opacity-100 translate-x-0 scale-100'
                  : 'opacity-0 translate-x-3 scale-[0.97]'
              }`}
            >
              <p className="text-sm sm:text-[15px] text-white/85 leading-relaxed">
                I&apos;m <strong className="text-white font-semibold">Ray (Rychr)</strong>—an
                independent After Effects editor turning raw footage into sharp, high-retention
                videos across YouTube, Reels, and TikTok.
              </p>
              <div className="mt-4 pt-3.5 border-t border-white/10 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onStartProject();
                  }}
                  className="inline-flex items-center gap-1.5 min-h-[38px] px-4 py-1.5 rounded-full bg-white text-black font-semibold text-xs hover:bg-neutral-200 transition-colors cursor-pointer"
                >
                  <span>Work with me</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
                <span className="text-[11px] font-mono text-white/45">Worldwide</span>
              </div>
            </div>
          </div>

          {/* Mobile/Tablet Turned Downward Line -> Blurred Paragraph */}
          <div
            className={`lg:hidden grid transition-[grid-template-rows,opacity] duration-300 ease-out ${
              squareOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
            }`}
          >
            <div className="overflow-hidden flex flex-col items-center">
              {renderTurnConnector('down', 'right', squareOpen)}
              <div className="w-full rounded-2xl p-5 bg-[#070707]/80 backdrop-blur-2xl border border-white/20">
                <p className="text-sm text-white/85 leading-relaxed">
                  I&apos;m <strong className="text-white font-semibold">Ray (Rychr)</strong>—an
                  independent After Effects editor turning raw footage into sharp, high-retention
                  videos across YouTube, Reels, and TikTok.
                </p>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onStartProject();
                  }}
                  className="mt-3.5 inline-flex items-center gap-1.5 min-h-[40px] px-4 py-2 rounded-full bg-white text-black font-semibold text-xs hover:bg-neutral-200 transition-colors cursor-pointer"
                >
                  <span>Work with me</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
