import React, { useEffect, useRef } from 'react';

export type GeminiColorPreset = 'discord' | 'instagram' | 'gmail' | 'gemini' | 'cyan-purple';
export type GeminiBorderMode = 'always' | 'hover-only' | 'hover-brighten';

interface AnimatedGeminiBorderProps {
  preset?: GeminiColorPreset;
  mode?: GeminiBorderMode;
  borderRadius?: string; // Tailwind class, e.g. "rounded-2xl", "rounded-xl", "rounded-3xl", "rounded-[28px]"
  borderWidth?: string; // e.g. "1.5px" or "1.2px"
  speedMs?: number; // duration of 1 full cycle, default 16000
  angleOffset?: number; // starting angle in degrees (e.g. 0, 120, 240) so multiple items don't sync mechanically
  auraBlur?: string; // e.g. "blur-xl" or "blur-md"
  auraOpacity?: number; // max opacity of outer glow, default 0.5
  innerGlowOpacity?: number;
  className?: string;
}

export const AnimatedGeminiBorder: React.FC<AnimatedGeminiBorderProps> = ({
  preset = 'gemini',
  mode = 'always',
  borderRadius = 'rounded-2xl',
  borderWidth = '1.5px',
  speedMs = 16000,
  angleOffset = 0,
  auraBlur = 'blur-lg',
  auraOpacity = 0.5,
  innerGlowOpacity = 0.95,
  className = '',
}) => {
  const outerAuraRef = useRef<HTMLDivElement>(null);
  const borderMaskRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let animId: number;
    let angle = angleOffset;
    let lastTime = performance.now();
    const ROTATION_SPEED = 360 / Math.max(1000, speedMs); // deg per ms

    const animate = (currentTime: number) => {
      const dt = currentTime - lastTime;
      lastTime = currentTime;
      angle = (angle + dt * ROTATION_SPEED) % 360;

      // Organic, slow breathing modulation (period ~12s)
      const breath = 0.6 + 0.4 * Math.sin(currentTime * 0.0005 + angleOffset);

      let gradient = '';

      if (preset === 'discord') {
        // Pure Brilliant White & Platinum Beam with Crisp Silver Fade
        gradient = `conic-gradient(from ${angle.toFixed(1)}deg,
          transparent 0deg,
          rgba(255, 255, 255, ${(0.95 * breath).toFixed(3)}) 30deg,
          rgba(235, 235, 240, ${(0.90 * breath).toFixed(3)}) 70deg,
          rgba(190, 190, 200, ${(0.70 * breath).toFixed(3)}) 105deg,
          rgba(130, 130, 140, ${(0.35 * breath).toFixed(3)}) 135deg,
          transparent 165deg,
          transparent 225deg,
          rgba(255, 255, 255, ${(0.55 * breath).toFixed(3)}) 265deg,
          rgba(200, 200, 210, ${(0.35 * breath).toFixed(3)}) 300deg,
          transparent 335deg,
          transparent 360deg
        )`;
      } else if (preset === 'gmail') {
        // High-Luminance Razor White Beam
        gradient = `conic-gradient(from ${angle.toFixed(1)}deg,
          transparent 0deg,
          rgba(255, 255, 255, ${(0.98 * breath).toFixed(3)}) 25deg,
          rgba(240, 240, 245, ${(0.88 * breath).toFixed(3)}) 60deg,
          rgba(180, 180, 190, ${(0.65 * breath).toFixed(3)}) 95deg,
          rgba(120, 120, 130, ${(0.30 * breath).toFixed(3)}) 125deg,
          transparent 155deg,
          transparent 225deg,
          rgba(255, 255, 255, ${(0.50 * breath).toFixed(3)}) 265deg,
          rgba(190, 190, 200, ${(0.30 * breath).toFixed(3)}) 295deg,
          transparent 330deg,
          transparent 360deg
        )`;
      } else if (preset === 'cyan-purple') {
        // Silvery Starlight Pure White Glow
        gradient = `conic-gradient(from ${angle.toFixed(1)}deg,
          transparent 0deg,
          rgba(255, 255, 255, ${(0.96 * breath).toFixed(3)}) 25deg,
          rgba(225, 225, 235, ${(0.85 * breath).toFixed(3)}) 65deg,
          rgba(175, 175, 185, ${(0.60 * breath).toFixed(3)}) 100deg,
          rgba(110, 110, 120, ${(0.30 * breath).toFixed(3)}) 130deg,
          transparent 160deg,
          transparent 220deg,
          rgba(255, 255, 255, ${(0.60 * breath).toFixed(3)}) 260deg,
          rgba(185, 185, 195, ${(0.35 * breath).toFixed(3)}) 295deg,
          transparent 330deg,
          transparent 360deg
        )`;
      } else {
        // Signature Pure Glowing White Outline & Halo
        gradient = `conic-gradient(from ${angle.toFixed(1)}deg,
          transparent 0deg,
          rgba(255, 255, 255, ${(0.98 * breath).toFixed(3)}) 25deg,
          rgba(245, 245, 250, ${(0.90 * breath).toFixed(3)}) 65deg,
          rgba(195, 195, 205, ${(0.70 * breath).toFixed(3)}) 100deg,
          rgba(130, 130, 140, ${(0.35 * breath).toFixed(3)}) 130deg,
          transparent 160deg,
          transparent 220deg,
          rgba(255, 255, 255, ${(0.60 * breath).toFixed(3)}) 260deg,
          rgba(190, 190, 200, ${(0.40 * breath).toFixed(3)}) 295deg,
          transparent 335deg,
          transparent 360deg
        )`;
      }

      if (outerAuraRef.current) {
        outerAuraRef.current.style.background = gradient;
        outerAuraRef.current.style.opacity = `${(auraOpacity * breath).toFixed(3)}`;
      }

      if (borderMaskRef.current) {
        borderMaskRef.current.style.background = gradient;
        borderMaskRef.current.style.opacity = `${(innerGlowOpacity * breath).toFixed(3)}`;
      }

      animId = requestAnimationFrame(animate);
    };

    animId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animId);
  }, [preset, speedMs, angleOffset, auraOpacity, innerGlowOpacity]);

  const modeClass =
    mode === 'hover-only'
      ? 'opacity-0 group-hover:opacity-100 transition-opacity duration-500'
      : mode === 'hover-brighten'
      ? 'opacity-25 group-hover:opacity-100 transition-opacity duration-500'
      : 'opacity-100';

  return (
    <div
      className={`absolute inset-0 pointer-events-none ${borderRadius} overflow-visible ${modeClass} ${className}`}
      aria-hidden="true"
    >
      {/* 1. Deep Atmospheric Ambient Outer Aura: soft diffusion bleeding into background */}
      <div
        ref={outerAuraRef}
        className={`absolute -inset-2.5 ${borderRadius} pointer-events-none ${auraBlur} z-0 transition-opacity duration-300`}
        style={{
          opacity: auraOpacity,
          pointerEvents: 'none',
        }}
      />

      {/* 2. Gemini-style Precision Border Stroke: masked so ONLY the perimeter edge glows */}
      <div
        ref={borderMaskRef}
        className={`absolute -inset-[1px] ${borderRadius} pointer-events-none z-10`}
        style={{
          padding: borderWidth,
          WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          WebkitMaskComposite: 'xor',
          maskComposite: 'exclude',
          pointerEvents: 'none',
        }}
      />
    </div>
  );
};
