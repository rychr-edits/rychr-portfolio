import React, { useEffect, useRef } from 'react';

export const CalmNavbarBorder: React.FC = () => {
  const outerAuraRef = useRef<HTMLDivElement>(null);
  const borderMaskRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let animId: number;
    let angle = 0;
    let lastTime = performance.now();
    // Slow, serene rotation (20s per full cycle)
    const ROTATION_SPEED = 360 / 20000; // deg per ms

    const animate = (currentTime: number) => {
      const dt = currentTime - lastTime;
      lastTime = currentTime;
      angle = (angle + dt * ROTATION_SPEED) % 360;

      // Organic, slow breathing modulation (period ~13s)
      const breath = 0.55 + 0.45 * Math.sin(currentTime * 0.00048);

      // Monochromatic Pure Glowing White & Silver Palette
      const gradient = `conic-gradient(from ${angle.toFixed(1)}deg,
        transparent 0deg,
        rgba(255, 255, 255, ${(0.88 * breath).toFixed(3)}) 25deg,
        rgba(235, 235, 245, ${(0.75 * breath).toFixed(3)}) 65deg,
        rgba(190, 190, 200, ${(0.50 * breath).toFixed(3)}) 100deg,
        rgba(130, 130, 140, ${(0.25 * breath).toFixed(3)}) 125deg,
        transparent 155deg,
        transparent 220deg,
        rgba(255, 255, 255, ${(0.55 * breath).toFixed(3)}) 260deg,
        rgba(200, 200, 215, ${(0.35 * breath).toFixed(3)}) 295deg,
        transparent 335deg,
        transparent 360deg
      )`;

      if (outerAuraRef.current) {
        outerAuraRef.current.style.background = gradient;
        outerAuraRef.current.style.opacity = `${(0.45 * breath).toFixed(3)}`;
      }

      if (borderMaskRef.current) {
        borderMaskRef.current.style.background = gradient;
      }

      animId = requestAnimationFrame(animate);
    };

    animId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none rounded-2xl overflow-visible" aria-hidden="true">
      {/* 1. Deep Ambient Outer Aura: bleeds 14px outside into the black background */}
      <div
        ref={outerAuraRef}
        className="absolute -inset-2.5 rounded-3xl pointer-events-none blur-xl z-0 transition-opacity duration-300"
        style={{
          opacity: 0.35,
          pointerEvents: 'none',
        }}
      />

      {/* 2. Gemini-style Border Stroke: masked so only the 1.5px rounded perimeter glows */}
      <div
        ref={borderMaskRef}
        className="absolute -inset-[1px] rounded-2xl pointer-events-none z-10"
        style={{
          padding: '1.5px',
          WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          WebkitMaskComposite: 'xor',
          maskComposite: 'exclude',
          pointerEvents: 'none',
        }}
      />
    </div>
  );
};
