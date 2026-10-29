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
        // Sunset Magenta & Royal Orchid with Deep Velvet Plum accent
        gradient = `conic-gradient(from ${angle.toFixed(1)}deg,
          transparent 0deg,
          rgba(244, 63, 94, ${(0.88 * breath).toFixed(3)}) 25deg,
          rgba(236, 72, 153, ${(0.95 * breath).toFixed(3)}) 65deg,
          rgba(192, 132, 252, ${(0.90 * breath).toFixed(3)}) 100deg,
          rgba(168, 85, 247, ${(0.65 * breath).toFixed(3)}) 130deg,
          transparent 160deg,
          transparent 220deg,
          rgba(236, 72, 153, ${(0.45 * breath).toFixed(3)}) 260deg,
          rgba(192, 132, 252, ${(0.40 * breath).toFixed(3)}) 295deg,
          transparent 335deg,
          transparent 360deg
        )`;
      } else if (preset === 'gmail') {
        // Radiant Fuchsia & Soft Orchid with Ruby Crimson accent
        gradient = `conic-gradient(from ${angle.toFixed(1)}deg,
          transparent 0deg,
          rgba(236, 72, 153, ${(0.92 * breath).toFixed(3)}) 25deg,
          rgba(251, 113, 133, ${(0.90 * breath).toFixed(3)}) 60deg,
          rgba(192, 132, 252, ${(0.95 * breath).toFixed(3)}) 95deg,
          rgba(225, 29, 72, ${(0.70 * breath).toFixed(3)}) 125deg,
          transparent 155deg,
          transparent 225deg,
          rgba(236, 72, 153, ${(0.45 * breath).toFixed(3)}) 265deg,
          rgba(192, 132, 252, ${(0.40 * breath).toFixed(3)}) 295deg,
          transparent 330deg,
          transparent 360deg
        )`;
      } else if (preset === 'cyan-purple') {
        // Sunset Magenta into Electric Violet & Orchid with subtle Ice Cyan spark
        gradient = `conic-gradient(from ${angle.toFixed(1)}deg,
          transparent 0deg,
          rgba(236, 72, 153, ${(0.95 * breath).toFixed(3)}) 25deg,
          rgba(192, 132, 252, ${(0.90 * breath).toFixed(3)}) 65deg,
          rgba(56, 189, 248, ${(0.75 * breath).toFixed(3)}) 95deg,
          rgba(244, 63, 94, ${(0.80 * breath).toFixed(3)}) 125deg,
          transparent 155deg,
          transparent 220deg,
          rgba(236, 72, 153, ${(0.50 * breath).toFixed(3)}) 260deg,
          rgba(192, 132, 252, ${(0.40 * breath).toFixed(3)}) 290deg,
          transparent 330deg,
          transparent 360deg
        )`;
      } else {
        // Primary Signature Sunset Magenta / Royal Orchid / Electric Rose spectrum (from Card 02 screenshot)
        gradient = `conic-gradient(from ${angle.toFixed(1)}deg,
          transparent 0deg,
          rgba(236, 72, 153, ${(0.95 * breath).toFixed(3)}) 25deg,
          rgba(192, 132, 252, ${(0.95 * breath).toFixed(3)}) 65deg,
          rgba(244, 63, 94, ${(0.85 * breath).toFixed(3)}) 100deg,
          rgba(168, 85, 247, ${(0.70 * breath).toFixed(3)}) 128deg,
          transparent 158deg,
          transparent 220deg,
          rgba(236, 72, 153, ${(0.50 * breath).toFixed(3)}) 260deg,
          rgba(192, 132, 252, ${(0.45 * breath).toFixed(3)}) 295deg,
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
