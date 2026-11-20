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

export const CustomCursor: React.FC = () => {
  const [enabled, setEnabled] = useState(false);

  const invertLayerRef = React.useRef<HTMLDivElement>(null);
  const invertFillRef = React.useRef<HTMLDivElement>(null);
  const outlineLayerRef = React.useRef<HTMLDivElement>(null);
  const outlineRingRef = React.useRef<HTMLDivElement>(null);

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
    let isVisible = false;
    let isInteractive = false;
    let isPressed = false;

    let smoothSizeScale = 0.625;
    let smoothFillScale = 0;
    let smoothPressScale = 1;
    let smoothOpacity = 0;

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
      mouseX = e.clientX;
      mouseY = e.clientY;
      const overIframe = e.target instanceof Element && e.target.tagName === 'IFRAME';
      isVisible = !document.fullscreenElement && !overIframe;
      updateInteractiveHit(mouseX, mouseY, e.target);
    };

    const onPointerDown = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return;
      mouseX = e.clientX;
      mouseY = e.clientY;
      isPressed = true;
      isVisible = !document.fullscreenElement;
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

      const alpha = 1 - Math.exp(-16 * dt);
      const opacityAlpha = 1 - Math.exp(-20 * dt);

      const targetSizeScale = isInteractive ? 1 : 0.625;
      const targetFillScale = isInteractive ? 1 : 0;
      const targetPressScale = isPressed ? 0.85 : 1;
      const targetOpacity = isVisible ? 1 : 0;

      smoothSizeScale += (targetSizeScale - smoothSizeScale) * alpha;
      smoothFillScale += (targetFillScale - smoothFillScale) * alpha;
      smoothPressScale += (targetPressScale - smoothPressScale) * alpha;
      smoothOpacity += (targetOpacity - smoothOpacity) * opacityAlpha;

      const combinedScale = smoothSizeScale * smoothPressScale;
      const posTransform = `translate3d(${mouseX.toFixed(2)}px, ${mouseY.toFixed(2)}px, 0) translate3d(-50%, -50%, 0)`;

      if (invertLayerRef.current && invertFillRef.current) {
        invertLayerRef.current.style.transform = posTransform;
        invertLayerRef.current.style.opacity = smoothOpacity.toFixed(3);
        const rawFillScale = smoothFillScale * combinedScale;
        const fillScale = rawFillScale < 0.002 ? 0 : rawFillScale;
        invertFillRef.current.style.transform = `scale3d(${fillScale.toFixed(4)}, ${fillScale.toFixed(4)}, 1)`;
      }

      if (outlineLayerRef.current && outlineRingRef.current) {
        outlineLayerRef.current.style.transform = posTransform;
        outlineLayerRef.current.style.opacity = smoothOpacity.toFixed(3);
        outlineRingRef.current.style.transform = `scale3d(${combinedScale.toFixed(4)}, ${combinedScale.toFixed(4)}, 1)`;
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
      {/* Layer 1: True pixel-invert fill square inside the outline on interactable hover */}
      <div
        ref={invertLayerRef}
        aria-hidden="true"
        className="fixed top-0 left-0 w-4 h-4 pointer-events-none z-[9998] mix-blend-difference opacity-0 will-change-transform"
      >
        <div
          ref={invertFillRef}
          className="w-full h-full bg-white will-change-transform"
        />
      </div>

      {/* Layer 2: Luminous glowing pixel-square outline */}
      <div
        ref={outlineLayerRef}
        aria-hidden="true"
        className="fixed top-0 left-0 w-4 h-4 pointer-events-none z-[9999] opacity-0 will-change-transform"
      >
        <div
          ref={outlineRingRef}
          className="w-full h-full border-[1.5px] border-white/95 shadow-[0_0_9px_rgba(255,255,255,0.65),0_0_20px_rgba(255,255,255,0.28),inset_0_0_5px_rgba(255,255,255,0.16)] will-change-transform"
        />
      </div>
    </>,
    document.body
  );
};
