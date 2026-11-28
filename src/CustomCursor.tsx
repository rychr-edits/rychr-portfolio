import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

const INTERACTIVE_SELECTOR = [
  'a[href]',
  'button:not(:disabled)',
  'input:not(:disabled)',
  'textarea:not(:disabled)',
  'select:not(:disabled)',
  '[role="button"]:not([aria-disabled="true"])',
  '[role="option"]',
  '[data-s3d="button"]',
  '.cursor-pointer',
].join(', ');

const SPARK_DIRS: ReadonlyArray<readonly [number, number]> = [
  [-1, -1],
  [1, -1],
  [-1, 1],
  [1, 1],
];

// Deterministic stepped electrical flicker patterns (like a buzzing streetlight)
const FLICKER_PATTERNS: ReadonlyArray<readonly number[]> = [
  [0.14, 0.96, 0.08, 0.88, 0.22, 1.0],
  [0.18, 0.06, 0.98, 0.16, 0.92],
  [0.24, 0.86, 0.1, 0.95],
  [0.12, 0.92, 0.05, 0.35, 1.0, 0.18, 0.9],
];

// 3-pixel L-shape with top-left corner at (0,0) on a 2x2 grid
const L_POINTS = '0,0 2,0 2,1 1,1 1,2 0,2';

export const CustomCursor: React.FC = () => {
  const [enabled, setEnabled] = useState(false);

  const glitchLayerRef = React.useRef<HTMLDivElement>(null);
  const invertLayerRef = React.useRef<HTMLDivElement>(null);
  const invertFillRef = React.useRef<HTMLDivElement>(null);
  const glowLayerRef = React.useRef<HTMLDivElement>(null);
  const glowShapeRef = React.useRef<HTMLDivElement>(null);
  const sparkRefs = React.useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const pointerQuery = window.matchMedia('(hover: hover) and (pointer: fine)');
    if (!pointerQuery.matches) return;

    setEnabled(true);
  }, []);

  useEffect(() => {
    if (!enabled) return;

    const rootEl = document.documentElement;
    const syncNativeCursorSuppression = () => {
      if (document.fullscreenElement) {
        rootEl.classList.remove('has-custom-cursor');
      } else {
        rootEl.classList.add('has-custom-cursor');
      }
    };
    syncNativeCursorSuppression();

    let mouseX = -100;
    let mouseY = -100;
    let prevMouseX = -100;
    let prevMouseY = -100;
    let velX = 0;
    let velY = 0;

    let isVisible = false;
    let isInteractive = false;
    let prevInteractive = false;
    let isPressed = false;

    let smoothBoxSize = 10;
    let smoothOpacity = 0;
    let appliedBoxSize = -1;

    // L-pointer maneuver state (hover/click twist, velocity flick, chromatic glitch)
    let targetBaseAngle = 0;
    let smoothAngle = 0;
    let flipImpulse = 0;
    let glitchTimer = 0;
    let glitchTick = 0;

    // Streetlight-style glitch flicker scheduler (runs continuously whether idle or moving)
    let flickerCooldown = 1.6;
    let flickerStepTimer = 0;
    let flickerStepIndex = -1;
    let activeFlickerPattern = FLICKER_PATTERNS[0];
    let patternCursor = 0;

    // Tight corner pop sparks on click
    let burstLife = 0;
    let burstOriginX = -100;
    let burstOriginY = -100;

    const updateInteractiveHit = (clientX: number, clientY: number, eventTarget?: EventTarget | null) => {
      let hitEl = eventTarget instanceof Element ? eventTarget : null;
      if (!hitEl || !hitEl.isConnected) {
        hitEl = document.elementFromPoint(clientX, clientY);
      }
      if (!hitEl || hitEl.tagName === 'IFRAME') {
        isInteractive = false;
        return;
      }
      const match = hitEl.closest(INTERACTIVE_SELECTOR);
      isInteractive = Boolean(match);
    };

    const onPointerMove = (e: PointerEvent) => {
      if (e.pointerType === 'touch') {
        isVisible = false;
        rootEl.classList.remove('has-custom-cursor');
        return;
      }
      if (!document.fullscreenElement) {
        rootEl.classList.add('has-custom-cursor');
      }
      mouseX = Math.round(e.clientX);
      mouseY = Math.round(e.clientY);

      if (prevMouseX > -50) {
        velX = Math.max(-60, Math.min(60, mouseX - prevMouseX));
        velY = Math.max(-60, Math.min(60, mouseY - prevMouseY));
      }
      prevMouseX = mouseX;
      prevMouseY = mouseY;

      const overIframe = e.target instanceof Element && e.target.tagName === 'IFRAME';
      isVisible = !document.fullscreenElement && !overIframe;
      updateInteractiveHit(mouseX, mouseY, e.target);
    };

    const onPointerDown = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return;
      mouseX = Math.round(e.clientX);
      mouseY = Math.round(e.clientY);
      isPressed = true;
      isVisible = !document.fullscreenElement;
      if (isVisible) {
        burstOriginX = mouseX + 4;
        burstOriginY = mouseY + 4;
        burstLife = 1;
        flipImpulse = 1;
        glitchTimer = 0.1;
      }
      updateInteractiveHit(mouseX, mouseY, e.target);
    };

    const onPointerUp = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return;
      isPressed = false;
      updateInteractiveHit(e.clientX, e.clientY, e.target);
    };

    const onPointerOut = (e: MouseEvent) => {
      if (!e.relatedTarget) {
        isVisible = false;
        isPressed = false;
        isInteractive = false;
      }
    };

    const onWindowBlur = () => {
      isVisible = false;
      isPressed = false;
      isInteractive = false;
    };

    const onScroll = () => {
      if (isVisible) {
        updateInteractiveHit(mouseX, mouseY);
      }
    };

    const onFullscreenChange = () => {
      syncNativeCursorSuppression();
      if (document.fullscreenElement) {
        isVisible = false;
      }
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerdown', onPointerDown, { passive: true });
    window.addEventListener('pointerup', onPointerUp, { passive: true });
    window.addEventListener('mouseout', onPointerOut, { passive: true });
    window.addEventListener('blur', onWindowBlur);
    window.addEventListener('scroll', onScroll, { passive: true });
    document.addEventListener('fullscreenchange', onFullscreenChange);

    let rafId = 0;
    let lastTime = performance.now();

    const tick = (now: number) => {
      const dt = Math.min(0.05, Math.max(0.001, (now - lastTime) / 1000));
      lastTime = now;

      // Subtle quantized maneuver on interactive hover transitions while keeping top-left L clear
      if (isInteractive !== prevInteractive) {
        if (isInteractive) {
          targetBaseAngle = 15;
          flipImpulse = 1;
          glitchTimer = 0.09;
        } else {
          targetBaseAngle = 0;
          glitchTimer = 0.06;
        }
        prevInteractive = isInteractive;
      }

      const morphAlpha = 1 - Math.exp(-22 * dt);
      const opacityAlpha = 1 - Math.exp(-24 * dt);
      const velDecay = Math.exp(-16 * dt);

      velX *= velDecay;
      velY *= velDecay;
      const speed = Math.hypot(velX, velY);

      if (glitchTimer > 0) {
        glitchTimer = Math.max(0, glitchTimer - dt);
        glitchTick += 1;
      }

      if (flipImpulse > 0) {
        flipImpulse = Math.max(0, flipImpulse - dt * 7.8);
      }

      // Continuous Streetlight Glitch Flicker (active whether moving or idle)
      let flickerIntensity = 0.84;
      let flickerChromatic = false;
      let flickerJitterX = 0;

      if (isVisible) {
        if (flickerStepIndex >= 0) {
          flickerStepTimer -= dt;
          if (flickerStepTimer <= 0) {
            flickerStepIndex += 1;
            if (flickerStepIndex >= activeFlickerPattern.length) {
              flickerStepIndex = -1;
              flickerCooldown = 1.2 + ((Math.sin(now * 0.017) + 1) * 0.5) * 2.2;
            } else {
              flickerStepTimer = 0.028 + ((flickerStepIndex * 19 + Math.round(now)) % 30) / 1000;
            }
          }
          if (flickerStepIndex >= 0) {
            flickerIntensity = activeFlickerPattern[flickerStepIndex];
            if (flickerIntensity < 0.3) {
              flickerChromatic = true;
              flickerJitterX = flickerStepIndex % 2 === 0 ? 1 : -1;
            }
          }
        } else {
          const hum = Math.sin(now * 0.045) * 0.03 + Math.sin(now * 0.11) * 0.02;
          flickerIntensity = 0.85 + hum;
          flickerCooldown -= dt;
          if (flickerCooldown <= 0) {
            patternCursor = (patternCursor + 1) % FLICKER_PATTERNS.length;
            activeFlickerPattern = FLICKER_PATTERNS[patternCursor];
            flickerStepIndex = 0;
            flickerStepTimer = 0.034;
          }
        }
      }

      // Crisp 3-pixel L-shape: 10px normally (5px per pixel) -> 14px on hover (7px per pixel)
      const baseSize = isInteractive ? 14 : 10;
      const targetBoxSize = isPressed ? Math.max(8, baseSize - 2) : baseSize;
      const targetOpacity = isVisible ? 1 : 0;

      smoothBoxSize += (targetBoxSize - smoothBoxSize) * morphAlpha;
      smoothOpacity += (targetOpacity - smoothOpacity) * opacityAlpha;

      const flickTilt = speed > 16 ? 15 : 0;
      smoothAngle += (targetBaseAngle + flickTilt - smoothAngle) * morphAlpha;
      const steppedAngle = Math.round(smoothAngle / 15) * 15;

      const flipScale = flipImpulse > 0.05 ? 0.85 + 0.15 * Math.cos(flipImpulse * Math.PI) : 1;

      let stretchX = 1;
      let stretchY = 1;
      if (speed > 12 && flipImpulse <= 0.05) {
        const ax = Math.abs(velX);
        const ay = Math.abs(velY);
        if (ax > ay * 1.35) {
          stretchX = 1.2;
          stretchY = 0.9;
        } else if (ay > ax * 1.35) {
          stretchX = 0.9;
          stretchY = 1.2;
        }
      }

      const actionGlitchX = glitchTimer > 0 ? (glitchTick % 2 === 0 ? 2 : -2) : 0;
      const actionGlitchY = glitchTimer > 0 && glitchTick % 3 === 0 ? -1 : 0;
      const glitchShiftX = actionGlitchX !== 0 ? actionGlitchX : flickerJitterX;
      const glitchShiftY = actionGlitchY;

      // Quantize cleanly onto even integer steps (8, 10, 12, 14 -> 4px..7px blocks)
      const quantizedBox = Math.max(8, Math.min(14, Math.round(smoothBoxSize / 2) * 2));

      // Top-left L corner sits directly at pointer coordinate (mouseX, mouseY)
      const px = Math.round(mouseX + glitchShiftX);
      const py = Math.round(mouseY + glitchShiftY);
      const posTransform = `translate3d(${px}px, ${py}px, 0)`;
      const maneuverTransform = `rotate(${steppedAngle}deg) scale(${(flipScale * stretchX).toFixed(3)}, ${(flipScale * stretchY).toFixed(3)})`;

      if (quantizedBox !== appliedBoxSize) {
        appliedBoxSize = quantizedBox;
        const sizeStr = `${quantizedBox}px`;
        if (glitchLayerRef.current) {
          glitchLayerRef.current.style.width = sizeStr;
          glitchLayerRef.current.style.height = sizeStr;
        }
        if (invertLayerRef.current) {
          invertLayerRef.current.style.width = sizeStr;
          invertLayerRef.current.style.height = sizeStr;
        }
        if (glowLayerRef.current) {
          glowLayerRef.current.style.width = sizeStr;
          glowLayerRef.current.style.height = sizeStr;
        }
      }

      if (glitchLayerRef.current) {
        if ((glitchTimer > 0 || flickerChromatic) && isVisible) {
          const splitDir = glitchShiftX !== 0 ? glitchShiftX : 1;
          const splitX = Math.round(mouseX - splitDir * 1.5);
          const splitY = Math.round(mouseY + (glitchTick % 2 === 0 ? 1 : -1));
          glitchLayerRef.current.style.transform = `translate3d(${splitX}px, ${splitY}px, 0) ${maneuverTransform}`;
          glitchLayerRef.current.style.opacity = ((flickerChromatic ? 0.6 : 0.78) * smoothOpacity).toFixed(2);
        } else {
          glitchLayerRef.current.style.opacity = '0';
        }
      }

      const fillAlpha = Math.max(0.32, Math.min(1, 0.34 + flickerIntensity * 0.7));
      if (invertLayerRef.current && invertFillRef.current) {
        invertLayerRef.current.style.transform = posTransform;
        invertLayerRef.current.style.opacity = (smoothOpacity * fillAlpha).toFixed(3);
        invertFillRef.current.style.transform = maneuverTransform;
      }

      if (glowLayerRef.current && glowShapeRef.current) {
        const ringAlpha = Math.max(0.28, Math.min(1, 0.25 + flickerIntensity * 0.78));
        const glowInner = (flickerIntensity * 0.92).toFixed(2);
        const glowOuter = (flickerIntensity * 0.45).toFixed(2);
        glowLayerRef.current.style.transform = posTransform;
        glowLayerRef.current.style.opacity = (smoothOpacity * ringAlpha).toFixed(3);
        glowShapeRef.current.style.transform = maneuverTransform;
        glowShapeRef.current.style.filter = `drop-shadow(0 0 4px rgba(255,255,255,${glowInner})) drop-shadow(0 0 10px rgba(255,255,255,${glowOuter}))`;
      }

      if (burstLife > 0) {
        burstLife = Math.max(0, burstLife - dt * 8.0);
      }
      const burstProgress = 1 - burstLife;
      const sparkStep = burstProgress < 0.34 ? 7 : burstProgress < 0.68 ? 10 : 12;
      const sparkOpacity = burstLife <= 0.02 ? 0 : burstLife > 0.55 ? 0.9 : 0.4;

      for (let i = 0; i < SPARK_DIRS.length; i++) {
        const el = sparkRefs.current[i];
        if (el) {
          if (sparkOpacity === 0) {
            el.style.opacity = '0';
          } else {
            const [dx, dy] = SPARK_DIRS[i];
            const sx = Math.round(burstOriginX + dx * sparkStep);
            const sy = Math.round(burstOriginY + dy * sparkStep);
            el.style.transform = `translate3d(${sx}px, ${sy}px, 0)`;
            el.style.opacity = sparkOpacity.toFixed(2);
          }
        }
      }

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafId);
      rootEl.classList.remove('has-custom-cursor');
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('mouseout', onPointerOut);
      window.removeEventListener('blur', onWindowBlur);
      window.removeEventListener('scroll', onScroll);
      document.removeEventListener('fullscreenchange', onFullscreenChange);
    };
  }, [enabled]);

  if (!enabled || typeof document === 'undefined') return null;

  return createPortal(
    <>
      {/* Tight click pixel sparks */}
      {SPARK_DIRS.map((_, i) => (
        <div
          key={`spark-${i}`}
          ref={(el) => {
            sparkRefs.current[i] = el;
          }}
          aria-hidden="true"
          className="fixed top-0 left-0 w-[2px] h-[2px] bg-white pointer-events-none z-[9996] mix-blend-difference opacity-0 will-change-transform"
        />
      ))}

      {/* Transient cyan glitch silhouette on flickers/actions */}
      <div
        ref={glitchLayerRef}
        aria-hidden="true"
        className="fixed top-0 left-0 w-[10px] h-[10px] pointer-events-none z-[9997] mix-blend-screen opacity-0 will-change-transform origin-[25%_25%]"
      >
        <svg viewBox="0 0 2 2" className="w-full h-full block" shapeRendering="crispEdges">
          <polygon points={L_POINTS} fill="rgba(103, 232, 249, 0.85)" />
        </svg>
      </div>

      {/* Layer 1: White inverted 3-pixel L pointer */}
      <div
        ref={invertLayerRef}
        aria-hidden="true"
        className="fixed top-0 left-0 w-[10px] h-[10px] pointer-events-none z-[9998] mix-blend-difference opacity-0 will-change-transform"
      >
        <div ref={invertFillRef} className="w-full h-full origin-[25%_25%] will-change-transform">
          <svg viewBox="0 0 2 2" className="w-full h-full block" shapeRendering="crispEdges">
            <polygon points={L_POINTS} fill="#ffffff" />
          </svg>
        </div>
      </div>

      {/* Layer 2: Streetlight-flicker luminous L silhouette */}
      <div
        ref={glowLayerRef}
        aria-hidden="true"
        className="fixed top-0 left-0 w-[10px] h-[10px] pointer-events-none z-[9999] opacity-0 will-change-transform"
      >
        <div
          ref={glowShapeRef}
          className="w-full h-full origin-[25%_25%] will-change-transform"
          style={{
            filter: 'drop-shadow(0 0 4px rgba(255,255,255,0.85)) drop-shadow(0 0 10px rgba(255,255,255,0.4))',
          }}
        >
          <svg viewBox="0 0 2 2" className="w-full h-full block overflow-visible" shapeRendering="crispEdges">
            <polygon
              points={L_POINTS}
              fill="none"
              stroke="rgba(255, 255, 255, 0.92)"
              strokeWidth="0.22"
            />
          </svg>
        </div>
      </div>
    </>,
    document.body
  );
};
