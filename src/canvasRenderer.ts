export interface PanelCanvasState {
  hoveredButton: 'open-studio' | 'read-paper' | null;
  hoveredNavLink: string | null;
}

export interface InteractiveHitBoxes {
  openStudio: { x: number; y: number; width: number; height: number };
  readPaper: { x: number; y: number; width: number; height: number };
  navFacet: { x: number; y: number; width: number; height: number };
  navStudio: { x: number; y: number; width: number; height: number };
  navMaterials: { x: number; y: number; width: number; height: number };
  navPricing: { x: number; y: number; width: number; height: number };
  navSignIn: { x: number; y: number; width: number; height: number };
}

/**
 * Draws the shard panel content onto a 2D canvas with DPR >= 1.5.
 */
export function drawPanelCanvas(
  canvas: HTMLCanvasElement,
  width: number,
  height: number,
  scaleS: number,
  state: PanelCanvasState
): { hitBoxes: InteractiveHitBoxes['openStudio'] & InteractiveHitBoxes['readPaper'] } {
  const dpr = Math.max(window.devicePixelRatio || 1, 1.5);
  canvas.width = Math.round(width * dpr);
  canvas.height = Math.round(height * dpr);

  const ctx = canvas.getContext('2d', { alpha: true });
  if (!ctx) return { hitBoxes: { x: 0, y: 0, width: 0, height: 0 } as any };

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.save();
  ctx.scale(dpr, dpr);

  const S = scaleS;
  const padLeft = Math.max(36 * S, 28);

  // 1. Eyebrow "REAL-TIME MATERIAL STUDIO": 11*S px, tracking .2em, 38% white, at 13.5% height
  const eyebrowY = height * 0.135;
  const eyebrowSize = Math.max(10, 11 * S);
  ctx.font = `600 ${eyebrowSize}px Inter, sans-serif`;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.38)';
  ctx.letterSpacing = `${0.2 * eyebrowSize}px`;
  ctx.fillText('REAL-TIME MATERIAL STUDIO', padLeft, eyebrowY);

  // 2. Headline "Designed / in glass.": Inter 500, size min(7.8% width, 20% height), tracking -.045em, leading .97, #dcdce0 -> #bdbdc3
  const headlineSize = Math.min(width * 0.078, height * 0.2);
  const leading = headlineSize * 0.97;
  const line1Y = eyebrowY + headlineSize * 0.92;
  const line2Y = line1Y + leading;

  ctx.font = `500 ${headlineSize}px Inter, sans-serif`;
  ctx.letterSpacing = `${-0.045 * headlineSize}px`;

  // Gradient fill #dcdce0 -> #bdbdc3
  const grad = ctx.createLinearGradient(0, line1Y - headlineSize, 0, line2Y + headlineSize * 0.2);
  grad.addColorStop(0, '#dcdce0');
  grad.addColorStop(1, '#bdbdc3');
  ctx.fillStyle = grad;

  ctx.fillText('Designed', padLeft, line1Y);
  ctx.fillText('in glass.', padLeft, line2Y);

  // 3. Two-line sub: "Author dispersion, transmission, and refraction in the browser. Live / previews, real materials.": 55% white
  const subSize = Math.max(13, 16.5 * S);
  const subLeading = subSize * 1.5;
  const sub1Y = line2Y + subSize * 1.8;
  const sub2Y = sub1Y + subLeading;

  ctx.font = `400 ${subSize}px Inter, sans-serif`;
  ctx.letterSpacing = '-0.015em';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
  ctx.fillText('Author dispersion, transmission, and refraction in the browser. Live', padLeft, sub1Y);
  ctx.fillText('previews, real materials.', padLeft, sub2Y);

  // 4. CTA Row:
  // "Open studio" light pill (116*S x 40*S, radius 6*S). Turns green #36d67e on hover
  const ctaY = sub2Y + Math.max(26 * S, 24);
  const pillW = Math.max(100, 116 * S);
  const pillH = Math.max(34, 40 * S);
  const pillRadius = Math.max(4, 6 * S);

  const isOpenHovered = state.hoveredButton === 'open-studio';
  const isReadHovered = state.hoveredButton === 'read-paper';

  // Draw pill button background
  ctx.beginPath();
  const px = padLeft;
  const py = ctaY;
  ctx.roundRect(px, py, pillW, pillH, pillRadius);

  if (isOpenHovered) {
    ctx.fillStyle = '#36d67e';
    ctx.fill();
    // Subtle button shadow glow
    ctx.shadowColor = 'rgba(54, 214, 126, 0.4)';
    ctx.shadowBlur = 12 * S;
  } else {
    // Light frosted white pill
    ctx.fillStyle = 'rgba(240, 240, 245, 0.94)';
    ctx.fill();
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
  }

  // Pill text
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.font = `500 ${Math.max(12, 14 * S)}px Inter, sans-serif`;
  ctx.letterSpacing = '-0.01em';
  ctx.fillStyle = isOpenHovered ? '#050507' : '#09090b';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('Open studio', px + pillW / 2, py + pillH / 2);

  // "Read paper →" link (underlines on hover)
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  const linkX = px + pillW + Math.max(22 * S, 18);
  const linkY = py + pillH * 0.65;
  const linkText = 'Read paper →';
  const linkSize = Math.max(13, 14.5 * S);
  ctx.font = `500 ${linkSize}px Inter, sans-serif`;
  ctx.letterSpacing = '-0.015em';
  ctx.fillStyle = isReadHovered ? '#ffffff' : 'rgba(255, 255, 255, 0.85)';
  ctx.fillText(linkText, linkX, linkY);

  const linkMetrics = ctx.measureText(linkText);
  if (isReadHovered) {
    // Draw underline
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(linkX, linkY + 3);
    ctx.lineTo(linkX + linkMetrics.width, linkY + 3);
    ctx.stroke();
  }

  // 5. Bottom labels: "© Facet Lab" bottom-left, "KHR_materials_dispersion" bottom-right (11*S px, 34% white)
  const bottomY = height - Math.max(24 * S, 20);
  const footerSize = Math.max(10, 11 * S);
  ctx.font = `400 ${footerSize}px Inter, sans-serif`;
  ctx.letterSpacing = '0.04em';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.34)';
  ctx.fillText('© Facet Lab', padLeft, bottomY);

  ctx.textAlign = 'right';
  ctx.fillText('KHR_materials_dispersion', width - padLeft, bottomY);

  ctx.restore();

  return {
    hitBoxes: {
      openStudio: { x: px, y: py, width: pillW, height: pillH },
      readPaper: { x: linkX, y: py, width: linkMetrics.width, height: pillH },
    } as any,
  };
}

/**
 * Draws the nav slab content onto a 2D canvas with DPR >= 1.5.
 */
export function drawNavCanvas(
  canvas: HTMLCanvasElement,
  width: number,
  height: number,
  scaleS: number,
  state: PanelCanvasState
): { hitBoxes: any } {
  const dpr = Math.max(window.devicePixelRatio || 1, 1.5);
  canvas.width = Math.round(width * dpr);
  canvas.height = Math.round(height * dpr);

  const ctx = canvas.getContext('2d', { alpha: true });
  if (!ctx) return { hitBoxes: {} };

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.save();
  ctx.scale(dpr, dpr);

  const S = scaleS;
  const padLeft = Math.max(32 * S, 24);
  const centerY = height / 2;

  // Left: Square mark + "Facet"
  const markSize = Math.max(14, 16 * S);
  const markX = padLeft;
  const markY = centerY - markSize / 2;

  // Smoked square mark with hairline border
  ctx.fillStyle = '#1c1c22';
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.28)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(markX, markY, markSize, markSize, 3 * S);
  ctx.fill();
  ctx.stroke();

  // "Facet" brand wordmark
  const brandSize = Math.max(13, 15 * S);
  ctx.font = `600 ${brandSize}px Inter, sans-serif`;
  ctx.letterSpacing = '-0.025em';
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText('Facet', markX + markSize + 10 * S, centerY);

  // Center: "Studio · Materials · Pricing" (60% white, brighten on hover)
  const navItemSize = Math.max(12, 13 * S);
  ctx.font = `400 ${navItemSize}px Inter, sans-serif`;
  ctx.letterSpacing = '-0.01em';

  const midX = width / 2;
  const navText = 'Studio   ·   Materials   ·   Pricing';
  ctx.textAlign = 'center';
  ctx.fillStyle = state.hoveredNavLink ? '#ffffff' : 'rgba(255, 255, 255, 0.60)';
  ctx.fillText(navText, midX, centerY);

  // Right: "Sign in"
  const signInSize = Math.max(12, 13 * S);
  ctx.font = `500 ${signInSize}px Inter, sans-serif`;
  ctx.textAlign = 'right';
  ctx.fillStyle = state.hoveredNavLink === 'signin' ? '#ffffff' : 'rgba(255, 255, 255, 0.75)';
  ctx.fillText('Sign in', width - padLeft, centerY);

  ctx.restore();

  return {
    hitBoxes: {
      facet: { x: markX, y: markY, width: 80 * S, height: markSize },
      centerLinks: { x: midX - 120 * S, y: centerY - 15 * S, width: 240 * S, height: 30 * S },
      signIn: { x: width - padLeft - 60 * S, y: centerY - 15 * S, width: 60 * S, height: 30 * S },
    },
  };
}
