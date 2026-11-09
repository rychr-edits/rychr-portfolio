import React, { useState, useEffect, useMemo } from 'react';
import { Film } from 'lucide-react';

export type FilmGrainMode = '35mm' | '16mm' | 'off';

interface FilmGrainOverlayProps {
  initialMode?: FilmGrainMode;
  onModeChange?: (mode: FilmGrainMode) => void;
  showToggleControl?: boolean;
}

// Generate an authentic procedural silver-halide film grain data URL
function createFilmGrainDataUrl(grainType: '35mm' | '16mm'): string {
  if (typeof document === 'undefined') return '';
  const size = grainType === '16mm' ? 220 : 180;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  const imgData = ctx.createImageData(size, size);
  const data = imgData.data;

  // Grain density and distribution
  const is16mm = grainType === '16mm';
  const density = is16mm ? 0.38 : 0.28;
  const maxBrightness = is16mm ? 255 : 230;
  const baseAlpha = is16mm ? 120 : 80;

  for (let i = 0; i < data.length; i += 4) {
    if (Math.random() < density) {
      // Natural non-linear distribution (clusters of silver halide crystals)
      const noise = Math.random();
      const val = Math.floor(noise * maxBrightness);
      data[i] = val; // R
      data[i + 1] = val; // G
      data[i + 2] = val; // B
      data[i + 3] = Math.floor(Math.random() * baseAlpha + 20); // Alpha
    } else {
      data[i + 3] = 0;
    }
  }

  ctx.putImageData(imgData, 0, 0);
  return canvas.toDataURL('image/png');
}

export const FilmGrainOverlay: React.FC<FilmGrainOverlayProps> = ({
  initialMode = '35mm',
  onModeChange,
  showToggleControl = true,
}) => {
  const [grainMode, setGrainMode] = useState<FilmGrainMode>(initialMode);
  const [grain35Url, setGrain35Url] = useState<string>('');
  const [grain16Url, setGrain16Url] = useState<string>('');

  useEffect(() => {
    // Generate tiles once client-side
    const url35 = createFilmGrainDataUrl('35mm');
    const url16 = createFilmGrainDataUrl('16mm');
    setGrain35Url(url35);
    setGrain16Url(url16);
  }, []);

  const handleCycleMode = () => {
    const next: FilmGrainMode =
      grainMode === '35mm' ? '16mm' : grainMode === '16mm' ? 'off' : '35mm';
    setGrainMode(next);
    onModeChange?.(next);
  };

  const activeDataUrl = grainMode === '16mm' ? grain16Url : grain35Url;
  const opacity = grainMode === '16mm' ? 0.24 : grainMode === '35mm' ? 0.15 : 0;

  return (
    <>
      {/* GLOBAL FULL-PAGE CINEMATIC FILM GRAIN LAYER */}
      {grainMode !== 'off' && activeDataUrl && (
        <div
          className="pointer-events-none fixed -inset-[8%] w-[116%] h-[116%] z-40 overflow-hidden select-none"
          aria-hidden="true"
        >
          <div
            className="w-full h-full animate-film-grain"
            style={{
              backgroundImage: `url(${activeDataUrl})`,
              backgroundRepeat: 'repeat',
              backgroundSize: grainMode === '16mm' ? '160px 160px' : '130px 130px',
              opacity: opacity,
              mixBlendMode: 'screen',
              filter: grainMode === '16mm' ? 'contrast(140%)' : 'contrast(115%)',
            }}
          />
        </div>
      )}

      {/* DISCREET FLOATING FILM GRAIN SWITCHER IN BOTTOM-LEFT CORNER */}
      {showToggleControl && (
        <div className="fixed bottom-5 left-5 z-50 pointer-events-auto">
          <button
            onClick={handleCycleMode}
            type="button"
            title="Toggle Film Grain Intensity (35mm / 16mm / Off)"
            className="group flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-black/85 hover:bg-black/95 text-white/80 hover:text-white border border-white/15 hover:border-white/40 backdrop-blur-xl shadow-[0_4px_24px_rgba(0,0,0,0.8)] transition-all cursor-pointer text-xs font-mono select-none active:scale-95"
          >
            <div className="relative flex items-center justify-center">
              <Film className="w-3.5 h-3.5 text-white/90 group-hover:text-white transition-colors" />
              {grainMode !== 'off' && (
                <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              )}
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-[11px] uppercase tracking-wider text-white/60">Grain:</span>
              <span className="font-semibold text-white tracking-wide">
                {grainMode === '35mm' ? '35mm' : grainMode === '16mm' ? '16mm Grit' : 'Off'}
              </span>
            </div>

            <span className="text-[10px] text-white/40 hidden sm:inline-block border-l border-white/15 pl-2">
              click to cycle
            </span>
          </button>
        </div>
      )}
    </>
  );
};

// EMBEDDABLE FILM GRAIN VIGNETTE CONTAINER FOR CARD SCREENS & MODALS
export const FilmGrainCardTexture: React.FC<{
  className?: string;
  intensity?: 'subtle' | 'standard' | 'heavy';
  showVignette?: boolean;
}> = ({ className = '', intensity = 'standard', showVignette = true }) => {
  const [grainUrl, setGrainUrl] = useState('');

  useEffect(() => {
    const url = createFilmGrainDataUrl(intensity === 'heavy' ? '16mm' : '35mm');
    setGrainUrl(url);
  }, [intensity]);

  const opacityVal = intensity === 'heavy' ? 0.35 : intensity === 'standard' ? 0.22 : 0.14;

  return (
    <div className={`absolute inset-0 pointer-events-none overflow-hidden z-10 ${className}`} aria-hidden="true">
      {/* Authentic Film Grain Layer with Jitter */}
      {grainUrl && (
        <div
          className="absolute -inset-[10%] w-[120%] h-[120%] animate-film-grain"
          style={{
            backgroundImage: `url(${grainUrl})`,
            backgroundRepeat: 'repeat',
            backgroundSize: intensity === 'heavy' ? '140px 140px' : '110px 110px',
            opacity: opacityVal,
            mixBlendMode: 'screen',
          }}
        />
      )}

      {/* Cinematic 35mm Radial Lens Vignette */}
      {showVignette && (
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_45%,rgba(0,0,0,0.55)_100%)] pointer-events-none" />
      )}
    </div>
  );
};
