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

interface ShootingStar {
  x: number;
  y: number;
  length: number;
  speed: number;
  cosAngle: number;
  sinAngle: number;
  progress: number;
  duration: number;
  maxAlpha: number;
  headRadius: number;
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
    let height = (canvas.height = Math.round(window.innerHeight * 1.5));

    // Create 180 twinkling background stars
    const starCount = 180;
    const stars: Star[] = [];
    for (let i = 0; i < starCount; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 1.3 + 0.35,
        baseAlpha: Math.random() * 0.45 + 0.18,
        twinkleSpeed: Math.random() * 2 + 0.8,
        twinklePhase: Math.random() * Math.PI * 2,
      });
    }

    // Subtle shooting stars
    const shootingStars: ShootingStar[] = [];
    let nextSpawnTime = 1.2; // First shooting star appears ~1.2s after load
    let lastTime = 0;

    const spawnShootingStar = (currentTimeSec: number) => {
      // Natural gentle angle between 32° and 44° downward-right
      const angleDeg = Math.random() * 12 + 32;
      const angleRad = (angleDeg * Math.PI) / 180;
      const cosAngle = Math.cos(angleRad);
      const sinAngle = Math.sin(angleRad);

      // Start across the upper sky
      const startX = Math.random() * (width * 0.85);
      const startY = Math.random() * (height * 0.45);

      shootingStars.push({
        x: startX,
        y: startY,
        length: Math.random() * 60 + 80, // 80px - 140px elegant trail
        speed: Math.random() * 320 + 480, // gentle cosmic glide
        cosAngle,
        sinAngle,
        progress: 0,
        duration: Math.random() * 0.45 + 0.85, // 0.85s to 1.3s
        maxAlpha: Math.random() * 0.22 + 0.32, // 0.32 - 0.54: deliberately subtle & deep in space
        headRadius: Math.random() * 0.3 + 0.8,
      });

      // Next spawn scheduled naturally every 4 to 8.5 seconds
      nextSpawnTime = currentTimeSec + Math.random() * 4.5 + 4;
    };

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = Math.round(window.innerHeight * 1.5);
    };

    window.addEventListener('resize', handleResize);

    let animId = 0;

    const render = (now: number) => {
      ctx.clearRect(0, 0, width, height);

      const timeSec = now / 1000;
      if (lastTime === 0) lastTime = timeSec;
      const dt = Math.min(0.1, timeSec - lastTime);
      lastTime = timeSec;

      // 1. Draw static twinkling stars
      for (let i = 0; i < stars.length; i++) {
        const star = stars[i];
        const twinkle = Math.sin(timeSec * star.twinkleSpeed + star.twinklePhase) * 0.28;
        const alpha = Math.min(1.0, Math.max(0.12, star.baseAlpha + twinkle));

        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fill();
      }

      // 2. Periodic shooting star spawn
      if (timeSec >= nextSpawnTime) {
        spawnShootingStar(timeSec);
      }

      // 3. Update & render subtle shooting stars
      for (let i = shootingStars.length - 1; i >= 0; i--) {
        const ss = shootingStars[i];
        ss.progress += dt / ss.duration;
        ss.x += ss.cosAngle * ss.speed * dt;
        ss.y += ss.sinAngle * ss.speed * dt;

        if (ss.progress >= 1 || ss.x > width + 150 || ss.y > height + 150) {
          shootingStars.splice(i, 1);
          continue;
        }

        // Smooth alpha envelope: fade in -> steady -> graceful fade out
        let alpha = ss.maxAlpha;
        if (ss.progress < 0.15) {
          alpha = (ss.progress / 0.15) * ss.maxAlpha;
        } else if (ss.progress > 0.65) {
          alpha = ((1 - ss.progress) / 0.35) * ss.maxAlpha;
        }

        const trailLen = ss.length * Math.min(1, ss.progress * 3);
        const tailX = ss.x - ss.cosAngle * trailLen;
        const tailY = ss.y - ss.sinAngle * trailLen;

        ctx.save();
        const grad = ctx.createLinearGradient(tailX, tailY, ss.x, ss.y);
        grad.addColorStop(0, 'rgba(236, 72, 153, 0)');
        grad.addColorStop(0.3, `rgba(192, 132, 252, ${alpha * 0.35})`);
        grad.addColorStop(0.65, `rgba(236, 72, 153, ${alpha * 0.55})`);
        grad.addColorStop(0.85, `rgba(244, 63, 94, ${alpha * 0.85})`);
        grad.addColorStop(1, `rgba(255, 255, 255, ${alpha})`);

        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.3;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(tailX, tailY);
        ctx.lineTo(ss.x, ss.y);
        ctx.stroke();

        // Subtle glowing nucleus with sunset magenta-rose halo
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.shadowColor = '#ec4899';
        ctx.shadowBlur = 7;
        ctx.beginPath();
        ctx.arc(ss.x, ss.y, ss.headRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
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
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-black">
      {/* 1. Twinkling Stars moving VERY SLIGHTLY with scroll (scrollY * 0.14) */}
      <div
        className="absolute inset-0 w-full h-[150vh] will-change-transform"
        style={{
          transform: `translate3d(0, ${-scrollY * 0.14}px, 0)`,
        }}
      >
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />
      </div>

      {/* 2. TOP OF PLANET (Peak moved to the LEFT: Q 700,-100, pronounced sweeping slanted curve) */}
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
        {/* Soft Sunset Magenta / Royal Orchid Atmospheric Glow behind slanted top arc */}
        <div
          className="absolute -top-[200px] left-1/2 -translate-x-1/2 w-[200vw] h-[400px] pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse at 42% 100%, rgba(236, 72, 153, 0.40) 0%, rgba(192, 132, 252, 0.32) 32%, rgba(244, 63, 94, 0.18) 58%, transparent 80%)',
            filter: 'blur(50px)',
          }}
        />

        <svg viewBox="0 0 3200 800" preserveAspectRatio="none" className="w-full h-[750px] overflow-visible">
          <defs>
            {/* Slanted beam gradient with Sunset Magenta to Royal Orchid spectrum */}
            <linearGradient id="topHorizonBeam" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.25" />
              <stop offset="14%" stopColor="#c084fc" stopOpacity="0.5" />
              <stop offset="28%" stopColor="#ec4899" stopOpacity="0.95" />
              <stop offset="38%" stopColor="#ffffff" stopOpacity="1" />
              <stop offset="48%" stopColor="#f43f5e" stopOpacity="0.95" />
              <stop offset="70%" stopColor="#ec4899" stopOpacity="0.65" />
              <stop offset="86%" stopColor="#c084fc" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#7c3aed" stopOpacity="0.15" />
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
              <stop offset="0%" stopColor="#000000" stopOpacity="1" />
              <stop offset="100%" stopColor="#000000" stopOpacity="1" />
            </linearGradient>
          </defs>

          {/* Slanted Planet Body Silhouette: pure pitch black */}
          <path d="M -600,280 Q 700,-100 3800,340 L 3800,900 L -600,900 Z" fill="url(#topPlanetBody)" />

          {/* Wide Soft Atmospheric Sunset Magenta Glow */}
          <path
            d="M -500,280 Q 700,-100 3700,340"
            fill="none"
            stroke="#ec4899"
            strokeWidth="28"
            strokeOpacity="0.32"
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

          {/* Core Crisp Razor White-Rose Rim */}
          <path d="M -500,280 Q 700,-100 3700,340" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeOpacity="0.95" />
        </svg>
      </div>

      {/* 3. UNDERSIDE OF PLANET (Properly separated: emerges after top curve departs, sits comfortably low) */}
      <div
        className="absolute left-1/2 pointer-events-none transition-opacity duration-700"
        style={{
          width: '240vw',
          maxWidth: '4800px',
          bottom: `${-250 + Math.pow(Math.max(0, (progress - 0.28) / 0.72), 1.1) * 260}px`,
          transform: 'translate3d(-50%, 0, 0)',
          opacity: Math.min(1.0, Math.max(0, (progress - 0.28) * 2.2)),
        }}
      >
        {/* Soft Sunset Magenta / Royal Orchid Atmospheric Glow below underside arc */}
        <div
          className="absolute -bottom-[200px] left-1/2 -translate-x-1/2 w-[200vw] h-[400px] pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse at 32% 0%, rgba(236, 72, 153, 0.42) 0%, rgba(192, 132, 252, 0.32) 32%, rgba(244, 63, 94, 0.18) 60%, transparent 80%)',
            filter: 'blur(50px)',
          }}
        />

        <svg viewBox="0 0 3200 800" preserveAspectRatio="none" className="w-full h-[750px] overflow-visible">
          <defs>
            <linearGradient id="bottomHorizonBeam" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.25" />
              <stop offset="12%" stopColor="#c084fc" stopOpacity="0.5" />
              <stop offset="26%" stopColor="#ec4899" stopOpacity="0.95" />
              <stop offset="34%" stopColor="#ffffff" stopOpacity="1" />
              <stop offset="44%" stopColor="#f43f5e" stopOpacity="0.95" />
              <stop offset="68%" stopColor="#ec4899" stopOpacity="0.65" />
              <stop offset="85%" stopColor="#c084fc" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#7c3aed" stopOpacity="0.15" />
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
              <stop offset="0%" stopColor="#000000" stopOpacity="1" />
              <stop offset="100%" stopColor="#000000" stopOpacity="1" />
            </linearGradient>
          </defs>

          {/* Underside arc with peak shifted left to X=700: pure pitch black */}
          <path d="M -600,520 Q 700,880 3800,480 L 3800,-100 L -600,-100 Z" fill="url(#bottomPlanetBody)" />

          {/* Wide Soft Atmospheric Cosmic Purple-Cyan Glow */}
          <path
            d="M -500,520 Q 700,880 3700,480"
            fill="none"
            stroke="#ec4899"
            strokeWidth="28"
            strokeOpacity="0.32"
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
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/80 pointer-events-none" />
    </div>
  );
};
