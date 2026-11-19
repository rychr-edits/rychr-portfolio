import { useEffect } from 'react';

interface ElementSmoothState {
  tx: number;
  ty: number;
  rx: number;
  ry: number;
  scale: number;
}

/**
 * Dual-layer 3D spatial engine:
 * 1. Site-wide slow, fluid collective cursor parallax across all `[data-s3d]` elements
 *    (`global`, `card`, `bar`, `button`) whenever the cursor moves anywhere on the page.
 * 2. Individual hover growth & cursor-relative 3D bend strictly for `button` elements
 *    and the floating taskbar (`bar`) — never magnifying or distorting static text.
 */
export const Spatial3DEngine: React.FC = () => {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;

    const target = { x: 0, y: 0 };
    const smooth = { x: 0, y: 0 };
    const pointerClient = {
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
      active: false,
      down: false,
    };

    const states = new WeakMap<HTMLElement, ElementSmoothState>();
    let cachedNodes: HTMLElement[] = [];

    const refreshNodes = () => {
      cachedNodes = Array.from(document.querySelectorAll<HTMLElement>('[data-s3d]'));
    };
    refreshNodes();

    const observer = new MutationObserver(() => {
      refreshNodes();
    });
    observer.observe(document.body, { childList: true, subtree: true });

    const onPointerMove = (e: PointerEvent) => {
      const vw = Math.max(1, window.innerWidth);
      const vh = Math.max(1, window.innerHeight);
      target.x = Math.max(-1, Math.min(1, (e.clientX / vw) * 2 - 1));
      target.y = Math.max(-1, Math.min(1, (e.clientY / vh) * 2 - 1));
      pointerClient.x = e.clientX;
      pointerClient.y = e.clientY;
      pointerClient.active = true;
    };

    const onPointerDown = (e: PointerEvent) => {
      pointerClient.x = e.clientX;
      pointerClient.y = e.clientY;
      pointerClient.active = true;
      pointerClient.down = true;
    };

    const onPointerUp = (e: PointerEvent) => {
      pointerClient.down = false;
      if (e.pointerType === 'touch') {
        pointerClient.active = false;
        target.x = 0;
        target.y = 0;
      }
    };

    const onPointerReset = () => {
      target.x = 0;
      target.y = 0;
      pointerClient.active = false;
      pointerClient.down = false;
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerdown', onPointerDown, { passive: true });
    window.addEventListener('pointerup', onPointerUp, { passive: true });
    window.addEventListener('pointercancel', onPointerReset, { passive: true });
    document.addEventListener('mouseleave', onPointerReset);
    window.addEventListener('blur', onPointerReset);

    let rafId = 0;
    let lastTime = performance.now();

    const tick = (now: number) => {
      const dt = Math.min(0.05, Math.max(0.001, (now - lastTime) / 1000));
      lastTime = now;

      // Slow, fluid global camera drift + silky button hover damping
      const globalAlpha = 1 - Math.exp(-1.9 * dt);
      const cardAlpha = 1 - Math.exp(-2.4 * dt);
      const btnHoverBendAlpha = 1 - Math.exp(-5.6 * dt);
      const btnHoverScaleAlpha = 1 - Math.exp(-4.8 * dt);
      const btnRestAlpha = 1 - Math.exp(-3.4 * dt);

      smooth.x += (target.x - smooth.x) * globalAlpha;
      smooth.y += (target.y - smooth.y) * globalAlpha;

      const mx = smooth.x;
      const my = smooth.y;
      const vw = window.innerWidth || 1200;
      const vh = window.innerHeight || 800;

      const topHit = pointerClient.active
        ? document.elementFromPoint(pointerClient.x, pointerClient.y)
        : null;
      const activeEl = document.activeElement;
      const directClickTarget = topHit?.closest('a, button, [role="button"]');

      interface PendingItem {
        el: HTMLElement;
        mode: string;
        depth: number;
        globalTilt: number;
        rect: DOMRect | null;
        hovered: boolean;
        pressed: boolean;
        paused: boolean;
        targetScale: number;
        hoverTilt: number;
        hoverShift: number;
      }

      // Pass 1 (READS): inspect rects BEFORE any style writes
      const batch: PendingItem[] = [];

      for (let i = 0; i < cachedNodes.length; i++) {
        const el = cachedNodes[i];
        const mode = el.dataset.s3d || 'global';

        const parsedDepth = Number.parseFloat(el.dataset.s3dDepth ?? '');
        const depth = Number.isFinite(parsedDepth) ? parsedDepth : 1;

        const parsedGlobalTilt = Number.parseFloat(el.dataset.s3dGlobalTilt ?? '');
        const fallbackGlobalTilt =
          mode === 'bar' ? 1.1 : mode === 'card' ? 3.2 : mode === 'button' ? 1.0 : 1.8;
        const globalTilt = Number.isFinite(parsedGlobalTilt)
          ? parsedGlobalTilt
          : fallbackGlobalTilt;

        let paused = el.dataset.s3dPaused === 'true';
        if (
          !paused &&
          el.dataset.s3dPauseOnInput === 'true' &&
          activeEl &&
          (activeEl.tagName === 'INPUT' ||
            activeEl.tagName === 'TEXTAREA' ||
            activeEl.tagName === 'SELECT') &&
          el.contains(activeEl)
        ) {
          paused = true;
        }

        if (mode === 'button' || mode === 'bar') {
          const isHovered = !paused && topHit !== null && el.contains(topHit);
          const rect = el.getBoundingClientRect();
          if (rect.bottom < -180 || rect.top > vh + 180) continue;

          const parsedScale = Number.parseFloat(el.dataset.s3dScale ?? '');
          const targetScale = Number.isFinite(parsedScale)
            ? parsedScale
            : mode === 'bar'
            ? 1.022
            : 1.065;

          const parsedTilt = Number.parseFloat(el.dataset.s3dTilt ?? '');
          const hoverTilt = Number.isFinite(parsedTilt)
            ? parsedTilt
            : mode === 'bar'
            ? 7.5
            : 9.5;

          const parsedShift = Number.parseFloat(el.dataset.s3dShift ?? '');
          const hoverShift = Number.isFinite(parsedShift)
            ? parsedShift
            : mode === 'bar'
            ? 5
            : 4;

          const pressed = isHovered && pointerClient.down && directClickTarget === el;

          batch.push({
            el,
            mode,
            depth,
            globalTilt,
            rect,
            hovered: isHovered,
            pressed,
            paused,
            targetScale,
            hoverTilt,
            hoverShift,
          });
        } else if (mode === 'card') {
          const rect = el.getBoundingClientRect();
          if (rect.bottom < -180 || rect.top > vh + 180) continue;

          batch.push({
            el,
            mode,
            depth,
            globalTilt,
            rect,
            hovered: false,
            pressed: false,
            paused,
            targetScale: 1,
            hoverTilt: 0,
            hoverShift: 0,
          });
        } else {
          // Pure global spatial layer (text, headings, badges, background grid, etc.)
          batch.push({
            el,
            mode: 'global',
            depth,
            globalTilt,
            rect: null,
            hovered: false,
            pressed: false,
            paused,
            targetScale: 1,
            hoverTilt: 0,
            hoverShift: 0,
          });
        }
      }

      // Pass 2 (COMPUTE + WRITES)
      for (let i = 0; i < batch.length; i++) {
        const item = batch[i];
        const {
          el,
          mode,
          depth,
          globalTilt,
          rect,
          hovered,
          pressed,
          paused,
          targetScale,
          hoverTilt,
          hoverShift,
        } = item;

        if (mode === 'button' || mode === 'bar') {
          let state = states.get(el);
          if (!state) {
            state = { tx: 0, ty: 0, rx: 0, ry: 0, scale: 1 };
            states.set(el, state);
          }

          let goalTx = paused ? 0 : mx * depth * 11;
          let goalTy = paused ? 0 : my * depth * 7.5;
          let goalRx = paused ? 0 : -my * globalTilt;
          let goalRy = paused ? 0 : mx * globalTilt;
          let goalScale = 1;

          if (hovered && rect && rect.width > 0 && rect.height > 0) {
            const cx = rect.left + rect.width * 0.5;
            const cy = rect.top + rect.height * 0.5;
            const halfW = Math.max(12, rect.width * 0.5);
            const halfH = Math.max(12, rect.height * 0.5);

            const localX = Math.max(-1, Math.min(1, (pointerClient.x - cx) / halfW));
            const localY = Math.max(-1, Math.min(1, (pointerClient.y - cy) / halfH));

            const tiltYScale = Math.min(1.25, Math.pow(340 / Math.max(110, rect.width), 0.36));
            const tiltXScale = Math.min(1.25, Math.pow(240 / Math.max(56, rect.height), 0.24));
            const effTiltY = Math.min(13, hoverTilt * tiltYScale);
            const effTiltX = Math.min(13, hoverTilt * tiltXScale);

            goalRx = -my * globalTilt * 0.35 + -localY * effTiltX;
            goalRy = mx * globalTilt * 0.35 + localX * effTiltY;
            goalTx = mx * depth * 6 + localX * hoverShift;
            goalTy = my * depth * 4 + localY * hoverShift;
            goalScale = pressed ? Math.max(0.97, targetScale - 0.03) : targetScale;
          }

          const bendA = hovered ? btnHoverBendAlpha : btnRestAlpha;
          const scaleA = hovered ? btnHoverScaleAlpha : btnRestAlpha;

          state.tx += (goalTx - state.tx) * bendA;
          state.ty += (goalTy - state.ty) * bendA;
          state.rx += (goalRx - state.rx) * bendA;
          state.ry += (goalRy - state.ry) * bendA;
          state.scale += (goalScale - state.scale) * scaleA;

          el.style.transform = `perspective(1200px) translate3d(${state.tx.toFixed(
            2
          )}px, ${state.ty.toFixed(2)}px, 0) rotateX(${state.rx.toFixed(
            2
          )}deg) rotateY(${state.ry.toFixed(2)}deg) scale3d(${state.scale.toFixed(
            4
          )}, ${state.scale.toFixed(4)}, 1)`;
        } else if (mode === 'card') {
          let state = states.get(el);
          if (!state) {
            state = { tx: 0, ty: 0, rx: 0, ry: 0, scale: 1 };
            states.set(el, state);
          }

          let goalRx = paused ? 0 : -my * globalTilt * 0.65;
          let goalRy = paused ? 0 : mx * globalTilt * 0.65;

          if (!paused && pointerClient.active && rect && rect.width > 0 && rect.height > 0) {
            const cx = rect.left + rect.width * 0.5;
            const cy = rect.top + rect.height * 0.5;
            const dx = (pointerClient.x - cx) / Math.max(rect.width * 0.65, vw * 0.25);
            const dy = (pointerClient.y - cy) / Math.max(rect.height * 0.65, vh * 0.25);
            const dist = Math.hypot(dx, dy);
            const proximity = Math.max(0, 1 - dist * 0.45);
            const localX = Math.max(-1, Math.min(1, dx));
            const localY = Math.max(-1, Math.min(1, dy));

            goalRx = -my * globalTilt * 0.45 + -localY * globalTilt * (0.6 + 0.55 * proximity);
            goalRy = mx * globalTilt * 0.45 + localX * globalTilt * (0.6 + 0.55 * proximity);
          }

          const goalTx = paused ? 0 : mx * depth * 11;
          const goalTy = paused ? 0 : my * depth * 8;

          state.tx += (goalTx - state.tx) * cardAlpha;
          state.ty += (goalTy - state.ty) * cardAlpha;
          state.rx += (goalRx - state.rx) * cardAlpha;
          state.ry += (goalRy - state.ry) * cardAlpha;

          el.style.transform = `perspective(1200px) translate3d(${state.tx.toFixed(
            2
          )}px, ${state.ty.toFixed(2)}px, 0) rotateX(${state.rx.toFixed(
            2
          )}deg) rotateY(${state.ry.toFixed(2)}deg)`;
        } else {
          // Pure global collective cursor parallax (for text, headings, badges, inner labels)
          const tx = paused ? 0 : mx * depth * 12;
          const ty = paused ? 0 : my * depth * 8.5;
          const rx = paused ? 0 : -my * globalTilt;
          const ry = paused ? 0 : mx * globalTilt;

          el.style.transform = `perspective(1200px) translate3d(${tx.toFixed(
            2
          )}px, ${ty.toFixed(2)}px, 0) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(
            2
          )}deg)`;
        }
      }

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafId);
      observer.disconnect();
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointercancel', onPointerReset);
      document.removeEventListener('mouseleave', onPointerReset);
      window.removeEventListener('blur', onPointerReset);
    };
  }, []);

  return null;
};
