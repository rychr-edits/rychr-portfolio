import React, { useEffect, useRef } from 'react';

interface CosmicHorizonBackgroundProps {
  scrollY: number;
}

interface Star {
  x: number;
  y: number;
  radius: number;
  baseAlpha: number;
  twinkleSpeed: number;
  twinklePhase: number;
}

export const CosmicHorizonBackground: React.FC<CosmicHorizonBackgroundProps> = ({ scrollY }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Compute scroll progress
  const totalScrollHeight = typeof document !== 'undefined'
    ? Math.max(1, document.documentElement.scrollHeight - window.innerHeight)
    : 3200;
  const progress = Math.min(1.0, Math.max(0, scrollY / totalScrollHeight));

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Create 160 twinkling stars
    const starCount = 160;
    const stars: Star[] = [];
    for (let i = 0; i < starCount; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * (height * 1.6),
        radius: Math.random() * 1.3 + 0.4,
        baseAlpha: Math.random() * 0.5 + 0.2,
        twinkleSpeed: Math.random() * 2 + 0.8,
        twinklePhase: Math.random() * Math.PI * 2,
      });
    }

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    let animId = 0;

    const render = (now: number) => {
      ctx.clearRect(0, 0, width, height);

      const timeSec = now / 1000;

      for (let i = 0; i < stars.length; i++) {
        const star = stars[i];
        const twinkle = Math.sin(timeSec * star.twinkleSpeed + star.twinklePhase) * 0.28;
        const alpha = Math.min(1.0, Math.max(0.12, star.baseAlpha + twinkle));

        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.beginPath();
        ctx.arc(star.x, star.y % height, star.radius, 0, Math.PI * 2);
        ctx.fill();
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-[#030407]">
      {/* 1. Twinkling Stars moving VERY SLIGHTLY with scroll (scrollY * 0.14) */}
      <div
        className="absolute inset-0 w-full h-[150vh] will-change-transform"
        style={{
          transform: `translate3d(0, ${-scrollY * 0.14}px, 0)`,
        }}
      >
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />
      </div>

      {/* 2. Deep Blue Ambient Nebular Lighting */}
      <div
        className="absolute left-1/2 -translate-x-1/2 w-[160vw] h-[80vh] rounded-full opacity-35 pointer-events-none"
        style={{
          top: '25vh',
          background: 'radial-gradient(ellipse at 50% 50%, rgba(30, 58, 138, 0.45) 0%, rgba(15, 23, 42, 0.15) 50%, transparent 80%)',
          filter: 'blur(90px)',
          transform: `translate3d(-50%, ${-scrollY * 0.18}px, 0)`,
        }}
      />

      {/* 3. TOP OF PLANET (Peak moved to the LEFT: Q 700,-100, pronounced sweeping slanted curve) */}
      <div
        className="absolute left-1/2 pointer-events-none transition-opacity duration-500"
        style={{
          width: '240vw',
          maxWidth: '4800px',
          top: '72vh',
          transform: `translate3d(-50%, ${-scrollY * 0.45}px, 0)`,
          // Fades out completely by progress 0.25 so it never overlaps with the bottom curve
          opacity: Math.max(0, 1 - progress * 3.6),
        }}
      >
        {/* Soft Blue Atmospheric Glow behind slanted top arc */}
        <div
          className="absolute -top-[200px] left-1/2 -translate-x-1/2 w-[200vw] h-[400px] pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse at 42% 100%, rgba(56, 189, 248, 0.38) 0%, rgba(37, 99, 235, 0.24) 35%, rgba(29, 78, 216, 0.1) 60%, transparent 80%)',
            filter: 'blur(50px)',
          }}
        />

        <svg viewBox="0 0 3200 800" preserveAspectRatio="none" className="w-full h-[750px] overflow-visible">
          <defs>
            {/* Slanted beam gradient emphasizing peak on the left */}
            <linearGradient id="topHorizonBeam" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#1d4ed8" stopOpacity="0.2" />
              <stop offset="12%" stopColor="#2563eb" stopOpacity="0.5" />
              <stop offset="28%" stopColor="#38bdf8" stopOpacity="0.95" />
              <stop offset="38%" stopColor="#ffffff" stopOpacity="1" />
              <stop offset="48%" stopColor="#38bdf8" stopOpacity="0.95" />
              <stop offset="75%" stopColor="#2563eb" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#1d4ed8" stopOpacity="0.2" />
            </linearGradient>

            <filter id="topNeonGlow" x="-20%" y="-100%" width="140%" height="300%">
              <feGaussianBlur stdDeviation="6" result="blur1" />
              <feGaussianBlur stdDeviation="18" result="blur2" />
              <feGaussianBlur stdDeviation="45" result="blur3" />
              <feMerge>
                <feMergeNode in="blur3" />
                <feMergeNode in="blur2" />
                <feMergeNode in="blur1" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            <linearGradient id="topPlanetBody" x1="50%" y1="0%" x2="50%" y2="100%">
              <stop offset="0%" stopColor="#060914" stopOpacity="0.98" />
              <stop offset="35%" stopColor="#030408" stopOpacity="1" />
              <stop offset="100%" stopColor="#020204" stopOpacity="1" />
            </linearGradient>
          </defs>

          {/* Slanted Planet Body Silhouette: peak shifted left to X=700 for a pronounced sweeping slant */}
          <path d="M -600,280 Q 700,-100 3800,340 L 3800,900 L -600,900 Z" fill="url(#topPlanetBody)" />

          {/* Wide Soft Atmospheric Blue Glow */}
          <path
            d="M -500,280 Q 700,-100 3700,340"
            fill="none"
            stroke="#38bdf8"
            strokeWidth="28"
            strokeOpacity="0.38"
            style={{ filter: 'blur(24px)' }}
          />

          {/* Neon Horizon Beam */}
          <path
            d="M -500,280 Q 700,-100 3700,340"
            fill="none"
            stroke="url(#topHorizonBeam)"
            strokeWidth="9"
            filter="url(#topNeonGlow)"
            strokeOpacity="0.95"
          />

          {/* Core Crisp Razor White-Cyan Rim */}
          <path d="M -500,280 Q 700,-100 3700,340" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeOpacity="0.95" />
        </svg>
      </div>

      {/* 4. UNDERSIDE OF PLANET (Properly separated: emerges after top curve departs, sits comfortably low) */}
      <div
        className="absolute left-1/2 pointer-events-none transition-opacity duration-700"
        style={{
          width: '240vw',
          maxWidth: '4800px',
          // Sits comfortably down at the bottom of the viewport and rises gently toward the footer
          bottom: `${-250 + Math.pow(Math.max(0, (progress - 0.28) / 0.72), 1.1) * 260}px`,
          transform: 'translate3d(-50%, 0, 0)',
          // Completely transparent until progress > 0.28, ensuring clear separation from top curve
          opacity: Math.min(1.0, Math.max(0, (progress - 0.28) * 2.2)),
        }}
      >
        {/* Soft Blue Atmospheric Glow below underside arc */}
        <div
          className="absolute -bottom-[200px] left-1/2 -translate-x-1/2 w-[200vw] h-[400px] pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse at 32% 0%, rgba(56, 189, 248, 0.44) 0%, rgba(37, 99, 235, 0.3) 35%, rgba(29, 78, 216, 0.14) 60%, transparent 80%)',
            filter: 'blur(50px)',
          }}
        />

        <svg viewBox="0 0 3200 800" preserveAspectRatio="none" className="w-full h-[750px] overflow-visible">
          <defs>
            <linearGradient id="bottomHorizonBeam" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#1d4ed8" stopOpacity="0.2" />
              <stop offset="10%" stopColor="#2563eb" stopOpacity="0.5" />
              <stop offset="22%" stopColor="#38bdf8" stopOpacity="0.95" />
              <stop offset="30%" stopColor="#ffffff" stopOpacity="1" />
              <stop offset="40%" stopColor="#38bdf8" stopOpacity="0.95" />
              <stop offset="68%" stopColor="#2563eb" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#1d4ed8" stopOpacity="0.2" />
            </linearGradient>

            <filter id="bottomNeonGlow" x="-20%" y="-100%" width="140%" height="300%">
              <feGaussianBlur stdDeviation="6" result="blur1" />
              <feGaussianBlur stdDeviation="18" result="blur2" />
              <feGaussianBlur stdDeviation="45" result="blur3" />
              <feMerge>
                <feMergeNode in="blur3" />
                <feMergeNode in="blur2" />
                <feMergeNode in="blur1" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            <linearGradient id="bottomPlanetBody" x1="50%" y1="100%" x2="50%" y2="0%">
              <stop offset="0%" stopColor="#060914" stopOpacity="0.98" />
              <stop offset="35%" stopColor="#030408" stopOpacity="1" />
              <stop offset="100%" stopColor="#020204" stopOpacity="1" />
            </linearGradient>
          </defs>

          {/* Underside arc with peak shifted left to X=700 for matching slanted curvature */}
          <path d="M -600,520 Q 700,880 3800,480 L 3800,-100 L -600,-100 Z" fill="url(#bottomPlanetBody)" />

          {/* Wide Soft Atmospheric Blue Glow */}
          <path
            d="M -500,520 Q 700,880 3700,480"
            fill="none"
            stroke="#38bdf8"
            strokeWidth="28"
            strokeOpacity="0.38"
            style={{ filter: 'blur(24px)' }}
          />

          {/* Neon Horizon Beam */}
          <path
            d="M -500,520 Q 700,880 3700,480"
            fill="none"
            stroke="url(#bottomHorizonBeam)"
            strokeWidth="9"
            filter="url(#bottomNeonGlow)"
            strokeOpacity="0.95"
          />

          {/* Core Crisp Razor White-Cyan Rim */}
          <path d="M -500,520 Q 700,880 3700,480" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeOpacity="0.95" />
        </svg>
      </div>

      {/* Deep Space Obsidian Vignettes */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#030407]/40 via-transparent to-[#030407]/80 pointer-events-none" />
    </div>
  );
};
