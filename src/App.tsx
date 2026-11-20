import React, { useState, useEffect, useRef } from 'react';
import { CosmicHorizonBackground } from './CosmicHorizonBackground.tsx';
import { RevealOnScroll } from './RevealOnScroll.tsx';
import { CalmNavbarBorder } from './CalmNavbarBorder.tsx';
import { AnimatedGeminiBorder, GeminiColorPreset } from './AnimatedGeminiBorder.tsx';
import { CustomVideoPlayer } from './CustomVideoPlayer.tsx';
import { AboutShowcase3D } from './AboutShowcase3D.tsx';
import { Spatial3DEngine } from './Spatial3DEngine.tsx';
import { FaqItem } from './types.ts';
import {
  Play,
  ExternalLink,
  ChevronDown,
  Mail,
  Instagram,
  MessageSquare,
  Sparkles,
  Zap,
  Volume2,
  Layers,
  Copy,
  Check,
  Film,
  Star,
  CreditCard,
  ShieldCheck,
  Loader2,
  Send,
  CheckCircle2,
  AlertCircle,
  X,
  Menu,
} from 'lucide-react';

interface WorkProject {
  id: string;
  num: string;
  title: string;
  category: string;
  format: string;
  tag: string;
  reviewTitle: string;
  quote: string;
  rating: number;
  gradient: string;
  colSpan: string;
  aspectClass?: string;
  aspectBadge?: string;
  videoUrl?: string; // YouTube URL, Vimeo, Drive, or direct MP4/WebM URL
  thumbnailUrl?: string; // Image thumbnail URL or local file path
}

function getVideoEmbedInfo(url?: string): { type: 'youtube' | 'vimeo' | 'video' | 'none'; src: string } {
  if (!url) return { type: 'none', src: '' };

  // YouTube (standard, shorts, embed, youtu.be)
  const ytMatch = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/
  );
  if (ytMatch && ytMatch[1]) {
    return {
      type: 'youtube',
      src: `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1&rel=0&modestbranding=1`,
    };
  }

  // Vimeo
  const vimeoMatch = url.match(/vimeo\.com\/(?:video\/)?([0-9]+)/);
  if (vimeoMatch && vimeoMatch[1]) {
    return {
      type: 'vimeo',
      src: `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1`,
    };
  }

  // Direct video file (.mp4, .webm, etc.) or local file path
  if (url.match(/\.(mp4|webm|ogg|mov)($|\?)/i) || url.startsWith('/')) {
    return {
      type: 'video',
      src: url,
    };
  }

  return { type: 'video', src: url };
}

const WORK_PROJECTS: WorkProject[] = [
  {
    id: '1',
    num: '01',
    title: 'Bags - Mograph',
    category: 'KINETIC MOTION',
    format: 'AFTER EFFECTS • 1:1',
    tag: 'SQUARE EDIT • 1:1',
    reviewTitle: 'Creator review',
    quote: '"Your review goes here. Tell visitors what this edit helped you achieve."',
    rating: 5,
    gradient: 'from-[#191919] via-[#0d0d0d] to-[#000000]',
    colSpan: 'lg:col-span-5',
    aspectClass: 'aspect-square',
    aspectBadge: '1:1',
    videoUrl: '/assets/aistudio/done_5440f745.mp4',
  },
  {
    id: '2',
    num: '02',
    title: 'Documentary Deep Dive: The Algorithm Trap',
    category: 'RETENTION CUT',
    format: 'COMMENTARY • 16:9',
    tag: 'YOUTUBE EDIT • HIGH RETENTION',
    reviewTitle: 'Creator review',
    quote: '"Add a short quote from the creator about the hook, pacing, or final result."',
    rating: 5,
    gradient: 'from-[#171717] via-[#0b0b0b] to-[#000000]',
    colSpan: 'lg:col-span-7',
    aspectClass: 'aspect-video',
    aspectBadge: '16:9',
  },
  {
    id: '3',
    num: '03',
    title: 'Cinematic Travel & Pacing Showcase',
    category: 'CINEMATIC EDIT',
    format: 'TRAVEL • 16:9',
    tag: 'YOUTUBE EDIT • HIGH RETENTION',
    reviewTitle: 'Creator review',
    quote: '"Leave space here for a real client testimonial when this project is ready."',
    rating: 5,
    gradient: 'from-[#181818] via-[#0c0c0c] to-[#000000]',
    colSpan: 'lg:col-span-7',
    aspectClass: 'aspect-video',
    aspectBadge: '16:9',
  },
  {
    id: '4',
    num: '04',
    title: 'Creator Tech & Studio Overhaul Vlog',
    category: 'CREATOR EDIT',
    format: 'VLOG • 1:1',
    tag: 'SQUARE EDIT • 1:1',
    reviewTitle: 'Creator review',
    quote: '"Your best feedback can live here under the finished video."',
    rating: 5,
    gradient: 'from-[#161616] via-[#0a0a0a] to-[#000000]',
    colSpan: 'lg:col-span-5',
    aspectClass: 'aspect-square',
    aspectBadge: '1:1',
  },
];

const SHORTS_PROJECTS = [
  {
    id: 's1',
    num: '01',
    title: 'High-Paced Viral Short Hook',
    format: 'SHORTS • 9:16',
    gradient: 'from-[#191919] via-[#090909] to-[#000000]',
    preset: 'discord' as const,
    stagger: '',
    delay: 0,
  },
  {
    id: 's2',
    num: '02',
    title: 'Kinetic Retention Reel',
    format: 'REEL • 9:16',
    gradient: 'from-[#1a1a1a] via-[#0a0a0a] to-[#000000]',
    preset: 'instagram' as const,
    stagger: 'md:translate-y-8',
    delay: 150,
  },
  {
    id: 's3',
    num: '03',
    title: 'Vertical Storytelling Cut',
    format: 'TIKTOK • 9:16',
    gradient: 'from-[#181818] via-[#090909] to-[#000000]',
    preset: 'gemini' as const,
    stagger: '',
    delay: 300,
  },
];

const FAQS: FaqItem[] = [
  {
    question: 'What is your turnaround time?',
    answer:
      'For short-form content (TikTok, Reels, Shorts), turnaround is 24–48 hours. For long-form YouTube edits, typical delivery is 3–5 business days depending on footage length and complexity. Rush delivery is available upon request.',
  },
  {
    question: 'How many revisions do you offer?',
    answer:
      'Each project includes up to 3 focused revisions. If you ever want to change more or explore additional passes beyond that, simply contact me and we can easily arrange extra passes.',
  },
  {
    question: 'What software do you edit with?',
    answer:
      'I edit exclusively in Adobe After Effects. This allows me to craft bespoke kinetic typography, surgical keyframe pacing, 3D camera sweeps, and custom visual effects without compromise.',
  },
  {
    question: 'Can you adapt to my specific channel style?',
    answer:
      'Yes, I can adapt to any editing style! Whether you want fast-paced gaming cuts, clean talking-head pacing, documentary deep-dives, commercial SaaS polish, or hyper-engaging viral shorts, I adapt seamlessly to your brand identity.',
  },
  {
    question: 'How do we send raw footage and assets?',
    answer:
      'You can share your raw files via Google Drive, Dropbox, Frame.io, or WeTransfer. I can also download directly from Twitch or YouTube VOD links.',
  },
  {
    question: 'What payment methods do you accept?',
    answer:
      'Payments are accepted via direct Bank Transfer and UPI. If you need any other payment method (such as international wire or custom payment services), please contact me directly.',
  },
];

interface ServiceOption {
  value: string;
  label: string;
  desc: string;
}

const SERVICE_OPTIONS: ServiceOption[] = [
  {
    value: 'Mix of All / Dedicated Account Manager',
    label: 'Mix of All / Dedicated Account Manager',
    desc: 'Complete channel management: long-form edits, viral shorts, thumbnails & packaging strategy',
  },
  {
    value: 'YouTube Long-form (Talking Head / Documentary / Gaming)',
    label: 'YouTube Long-form (Talking Head / Documentary / Gaming)',
    desc: 'High-retention story cuts, narrative pacing, cinematic sound design & custom motion design',
  },
  {
    value: 'Shorts & Reels High-Retention Batch (9:16)',
    label: 'Shorts & Reels High-Retention Batch (9:16)',
    desc: 'Rapid vertical hooks, kinetic motion typography, and punchy cuts tailored for TikTok, Reels & Shorts',
  },
  {
    value: 'Commercial / SaaS / Product Launch Edit',
    label: 'Commercial / SaaS / Product Launch Edit',
    desc: 'Premium commercial polish, feature showcases, sleek 3D camera sweeps & launch trailers',
  },
  {
    value: 'Full-Time Dedicated Monthly Retainer',
    label: 'Full-Time Dedicated Monthly Retainer',
    desc: 'Priority queue, dedicated weekly video volume, direct Slack/Discord workflow access',
  },
  {
    value: 'Custom Scope / Multiple Styles',
    label: 'Custom Scope / Multiple Styles',
    desc: 'Tailored timeline, custom VFX milestone, documentary series, or specific channel requirements',
  },
];

export default function App() {
  const [scrollY, setScrollY] = useState(0);
  const [activeFaq, setActiveFaq] = useState<number | null>(0);
  const [activeVideoModal, setActiveVideoModal] = useState<WorkProject | null>(null);

  const [copiedSocial, setCopiedSocial] = useState<string | null>(null);

  // Real On-Site Working Contact Form State
  const [formData, setFormData] = useState({
    name: '',
    contact: '',
    service: 'Mix of All / Dedicated Account Manager',
    message: '',
  });
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Mouse-reactive & scroll-driven light state for the #about 3D spotlight stage (zero React re-renders)
  const aboutSectionRef = useRef<HTMLElement>(null);
  const aboutPointerRef = useRef({ x: 0, y: 0 });
  const aboutScrollLightRef = useRef(0);
  const aboutStageFrameRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = aboutSectionRef.current;
    if (!section) return;

    const updateScrollLight = () => {
      const targetEl = aboutStageFrameRef.current || section;
      const rect = targetEl.getBoundingClientRect();
      const vh = window.innerHeight || 800;
      // 0 light at the end of #whyme (rect.top >= 88% vh), fading smoothly to 1.0 as you scroll into #about
      const raw = (vh * 0.88 - rect.top) / (vh * 0.54);
      const clamped = Math.max(0, Math.min(1, raw));
      aboutScrollLightRef.current = clamped * clamped * (3 - 2 * clamped);
    };

    updateScrollLight();

    const onPointerMove = (e: PointerEvent) => {
      const rect = section.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return;
      const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const ny = ((e.clientY - rect.top) / rect.height) * 2 - 1;
      aboutPointerRef.current.x = Math.max(-1, Math.min(1, nx));
      aboutPointerRef.current.y = Math.max(-1, Math.min(1, ny));
    };

    const onPointerLeave = () => {
      aboutPointerRef.current.x = 0;
      aboutPointerRef.current.y = 0;
    };

    section.addEventListener('pointermove', onPointerMove, { passive: true });
    section.addEventListener('pointerleave', onPointerLeave);
    window.addEventListener('scroll', updateScrollLight, { passive: true });
    window.addEventListener('resize', updateScrollLight, { passive: true });

    return () => {
      section.removeEventListener('pointermove', onPointerMove);
      section.removeEventListener('pointerleave', onPointerLeave);
      window.removeEventListener('scroll', updateScrollLight);
      window.removeEventListener('resize', updateScrollLight);
    };
  }, []);

  // Smooth Dropdown Outside Click & Escape Key Listener
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsDropdownOpen(false);
        setIsMobileNavOpen(false);
        setActiveVideoModal(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);
  const [formStatus, setFormStatus] = useState<
    'idle' | 'submitting' | 'success' | 'needs_activation' | 'error'
  >('idle');
  const [formErrorMsg, setFormErrorMsg] = useState('');

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormStatus('submitting');
    setFormErrorMsg('');

    try {
      const response = await fetch(
        'https://formsubmit.co/ajax/raymondchristopher360@gmail.com',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({
            'Client Name': formData.name,
            'Client Contact (Email or Discord)': formData.contact,
            'Requested Service': formData.service,
            'Project Scope & Details': formData.message,
            _subject: `New Video Editing Inquiry from ${formData.name} — Rychr`,
            _cc: 'rychr.edits@gmail.com',
            _template: 'table',
            _captcha: 'false',
          }),
        }
      );

      const result = await response.json();

      if (result.success === 'true' || result.success === true) {
        setFormStatus('success');
        setFormData({
          name: '',
          contact: '',
          service: 'Mix of All / Dedicated Account Manager',
          message: '',
        });
      } else if (
        result.message &&
        result.message.toLowerCase().includes('activation')
      ) {
        setFormStatus('needs_activation');
      } else {
        setFormStatus('error');
        setFormErrorMsg(result.message || 'Submission failed. Please try again or reach out on Discord.');
      }
    } catch {
      setFormStatus('error');
      setFormErrorMsg('Network error. Please try again or message directly via Discord / Gmail.');
    }
  };

  // Smooth scroll tracker
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSocial(label);
    setTimeout(() => setCopiedSocial(null), 2500);
  };

  return (
    <div className="relative min-h-screen bg-black text-white font-['Inter',sans-serif] selection:bg-white/20 selection:text-white overflow-x-hidden">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2.5 focus:rounded-xl focus:bg-white focus:text-black focus:font-semibold focus:text-sm focus:shadow-xl focus:outline-none focus:ring-2 focus:ring-white"
      >
        Skip to main content
      </a>

      {/* PROCEDURAL PLANET HORIZON BACKGROUND (Top horizon + Underside on scroll to bottom + Glowing Cursor with Stars) */}
      <CosmicHorizonBackground scrollY={scrollY} />
      <Spatial3DEngine />

      {/* PERSISTENT HEADER NAVBAR */}
      <header className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-6 md:px-10 py-4 sm:py-5 transition-colors duration-300">
        <div
          data-s3d="bar"
          data-s3d-depth="0.45"
          data-s3d-global-tilt="1.1"
          data-s3d-scale="1.024"
          data-s3d-tilt="7.5"
          data-s3d-shift="5"
          className="relative max-w-7xl mx-auto flex items-center justify-between px-5 sm:px-8 py-4 rounded-2xl bg-black/88 backdrop-blur-xl border border-white/15 shadow-[0_6px_36px_rgba(0,0,0,0.92)] will-change-transform"
        >
          {/* Calm, slow subtle dual parallel glowing border covering all sides of the rounded tab */}
          <CalmNavbarBorder />

          {/* Top Left: Animated Crescent Moon & Brand Video Playing as GIF (15 FPS, Monochromatic) */}
          <a
            href="#"
            aria-label="Rychr — back to top"
            data-s3d="button"
            data-s3d-depth="0.55"
            data-s3d-global-tilt="1.0"
            data-s3d-scale="1.06"
            data-s3d-tilt="9"
            className="inline-flex items-center gap-3.5 py-1 px-1.5 rounded-xl group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 will-change-transform"
          >
            <div className="relative w-11 h-11 rounded-xl overflow-hidden border border-white/25 bg-black flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.28)] group-hover:shadow-[0_0_28px_rgba(255,255,255,0.5)] group-hover:border-white/55 transition-[border-color,box-shadow] shrink-0">
              <video
                src="/assets/aistudio/export_2_-_15_fps_dc6d6217.mp4"
                poster="/assets/aistudio/image_5a1c3c4a.png"
                autoPlay
                loop
                muted
                playsInline
                disablePictureInPicture
                className="w-full h-full object-cover scale-[1.03] grayscale contrast-125 pointer-events-none select-none"
              />
            </div>
            <span className="font-brand-rychr text-2xl tracking-tight text-white group-hover:text-white/85 transition-colors">
              Rychr
            </span>
          </a>

          {/* Center Tabs: Work, Shorts, Why me, About, FAQ */}
          <nav
            aria-label="Primary navigation"
            className="hidden md:flex items-center gap-1.5 lg:gap-3 text-[15px] lg:text-base font-medium text-white/80"
          >
            <a
              href="#work"
              data-s3d="button"
              data-s3d-depth="0.5"
              data-s3d-global-tilt="1.0"
              data-s3d-scale="1.1"
              data-s3d-tilt="10"
              className="inline-flex items-center min-h-[44px] px-4 py-2 rounded-xl hover:text-white hover:bg-white/[0.07] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:bg-white/10 focus-visible:text-white transition-[color,background-color] will-change-transform"
            >
              Work
            </a>
            <a
              href="#shorts"
              data-s3d="button"
              data-s3d-depth="0.5"
              data-s3d-global-tilt="1.0"
              data-s3d-scale="1.1"
              data-s3d-tilt="10"
              className="inline-flex items-center min-h-[44px] px-4 py-2 rounded-xl hover:text-white hover:bg-white/[0.07] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:bg-white/10 focus-visible:text-white transition-[color,background-color] will-change-transform"
            >
              Shorts
            </a>
            <a
              href="#whyme"
              data-s3d="button"
              data-s3d-depth="0.5"
              data-s3d-global-tilt="1.0"
              data-s3d-scale="1.1"
              data-s3d-tilt="10"
              className="inline-flex items-center min-h-[44px] px-4 py-2 rounded-xl hover:text-white hover:bg-white/[0.07] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:bg-white/10 focus-visible:text-white transition-[color,background-color] will-change-transform"
            >
              Why me
            </a>
            <a
              href="#about"
              data-s3d="button"
              data-s3d-depth="0.5"
              data-s3d-global-tilt="1.0"
              data-s3d-scale="1.1"
              data-s3d-tilt="10"
              className="inline-flex items-center min-h-[44px] px-4 py-2 rounded-xl hover:text-white hover:bg-white/[0.07] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:bg-white/10 focus-visible:text-white transition-[color,background-color] will-change-transform"
            >
              About
            </a>
            <a
              href="#faq"
              data-s3d="button"
              data-s3d-depth="0.5"
              data-s3d-global-tilt="1.0"
              data-s3d-scale="1.1"
              data-s3d-tilt="10"
              className="inline-flex items-center min-h-[44px] px-4 py-2 rounded-xl hover:text-white hover:bg-white/[0.07] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:bg-white/10 focus-visible:text-white transition-[color,background-color] will-change-transform"
            >
              FAQ
            </a>
          </nav>

          {/* Right Action: Let's Talk CTA + Accessible Mobile Menu Toggle */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            <a
              href="#contact"
              data-s3d="button"
              data-s3d-depth="0.6"
              data-s3d-global-tilt="1.2"
              data-s3d-scale="1.07"
              data-s3d-tilt="9.5"
              className="relative inline-flex items-center min-h-[44px] px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl text-sm sm:text-[15px] font-semibold bg-black/90 hover:bg-black text-white shadow-[0_0_20px_rgba(255,255,255,0.28)] hover:shadow-[0_0_32px_rgba(255,255,255,0.52)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/85 transition-[background-color,box-shadow,color] cursor-pointer overflow-visible group/btn will-change-transform"
            >
              <AnimatedGeminiBorder
                preset="instagram"
                borderRadius="rounded-xl"
                borderWidth="1.2px"
                auraBlur="blur-sm"
                auraOpacity={0.7}
                speedMs={12000}
                angleOffset={60}
              />
              <span className="relative z-10 group-hover/btn:text-white/95 transition-colors">
                Let's Talk
              </span>
            </a>

            <button
              type="button"
              data-s3d="button"
              data-s3d-depth="0.55"
              data-s3d-global-tilt="1.0"
              data-s3d-scale="1.08"
              data-s3d-tilt="9"
              onClick={() => setIsMobileNavOpen((prev) => !prev)}
              aria-expanded={isMobileNavOpen}
              aria-controls="mobile-primary-nav"
              aria-label={isMobileNavOpen ? 'Close navigation menu' : 'Open navigation menu'}
              className="md:hidden w-11 h-11 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/20 text-white flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/85 transition-[background-color,border-color] cursor-pointer will-change-transform"
            >
              {isMobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Accessible Mobile Navigation Drawer (< md) */}
        {isMobileNavOpen && (
          <nav
            id="mobile-primary-nav"
            aria-label="Mobile navigation"
            className="md:hidden max-w-7xl mx-auto mt-3 p-3 rounded-2xl bg-[#070707]/95 backdrop-blur-2xl border border-white/15 shadow-[0_18px_50px_rgba(0,0,0,0.92)] flex flex-col gap-1"
          >
            {[
              { href: '#work', label: 'Work' },
              { href: '#shorts', label: 'Shorts' },
              { href: '#whyme', label: 'Why me' },
              { href: '#about', label: 'About' },
              { href: '#faq', label: 'FAQ' },
              { href: '#contact', label: "Let's Talk" },
            ].map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileNavOpen(false)}
                className="flex items-center justify-between min-h-[48px] px-4 py-3 rounded-xl text-base font-medium text-white/85 hover:text-white hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/85 transition-[color,background-color]"
              >
                <span>{item.label}</span>
              </a>
            ))}
          </nav>
        )}
      </header>

      <main id="main-content" className="focus:outline-none">
      {/* HERO SECTION (Text floats cleanly above the planet horizon; description is NEVER hidden!) */}
      <section className="relative min-h-[95vh] flex flex-col justify-center items-center px-6 pt-36 md:pt-40 pb-20 z-20 pointer-events-auto">
        <div className="max-w-4xl mx-auto text-center flex flex-col items-center">
          {/* Status Badge in signature crisp style with Pure White rim */}
          <div
            data-s3d="global"
            data-s3d-depth="0.85"
            data-s3d-global-tilt="1.8"
            className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/[0.04] border border-white/20 backdrop-blur-md mb-8 text-xs font-mono text-white/90 shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:border-white/40 hover:shadow-[0_0_28px_rgba(255,255,255,0.35)] transition-[border-color,box-shadow] will-change-transform"
          >
            <span className="w-2 h-2 rounded-full bg-white shadow-[0_0_8px_#ffffff]" />
            <span className="tracking-wide">Available for New Projects</span>
          </div>

          {/* Main Title: Rychr strictly in Mazzard M Black with deep luminous white aura */}
          <h1
            data-s3d="global"
            data-s3d-depth="1.35"
            data-s3d-global-tilt="2.6"
            className="text-7xl sm:text-8xl md:text-9xl font-brand-rychr tracking-tight mb-4 text-white drop-shadow-[0_10px_45px_rgba(255,255,255,0.22)] px-4 will-change-transform"
          >
            Rychr
          </h1>

          {/* Subheading in crisp Plus Jakarta Sans */}
          <h2
            data-s3d="global"
            data-s3d-depth="1.05"
            data-s3d-global-tilt="2.0"
            className="text-2xl sm:text-3xl md:text-4xl font-heading font-bold tracking-tight text-white/95 mb-6 px-3 will-change-transform"
          >
            Creative Video Editor & Motion Designer
          </h2>

          {/* Bio text (cleanly situated above the planet's outline) */}
          <p
            data-s3d="global"
            data-s3d-depth="0.8"
            data-s3d-global-tilt="1.5"
            className="text-base sm:text-lg text-white/75 max-w-2xl mx-auto leading-relaxed mb-10 font-normal px-3 py-1 will-change-transform"
          >
            I edit cinematic, fast-paced, and engaging videos tailored for YouTube, streams, and social media. Let's make content that hooks your audience and drives growth.
          </p>

          {/* CTA Buttons: Direct to Work page */}
          <div className="flex flex-wrap items-center justify-center gap-4">
            <a
              href="#work"
              data-s3d="button"
              data-s3d-depth="1.05"
              data-s3d-global-tilt="1.8"
              data-s3d-scale="1.065"
              data-s3d-tilt="9.5"
              className="px-8 py-4 rounded-xl font-semibold text-sm md:text-base bg-white text-black hover:bg-neutral-200 transition-[background-color,box-shadow] duration-300 shadow-[0_0_35px_rgba(255,255,255,0.25)] hover:shadow-[0_0_45px_rgba(255,255,255,0.45)] flex items-center gap-2 group cursor-pointer will-change-transform"
            >
              <span>Explore My Work</span>
              <ChevronDown className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
            </a>

            <a
              href="#contact"
              data-s3d="button"
              data-s3d-depth="1.05"
              data-s3d-global-tilt="1.8"
              data-s3d-scale="1.065"
              data-s3d-tilt="9.5"
              className="relative inline-block px-7 py-4 rounded-xl font-semibold text-sm md:text-base bg-black/90 hover:bg-black text-white hover:text-white/80 transition-[background-color,color,box-shadow] duration-300 shadow-[0_0_25px_rgba(255,255,255,0.25)] hover:shadow-[0_0_35px_rgba(255,255,255,0.45)] overflow-visible group/btn will-change-transform"
            >
              <AnimatedGeminiBorder
                preset="instagram"
                borderRadius="rounded-xl"
                borderWidth="1.5px"
                auraBlur="blur-md"
                auraOpacity={0.7}
                speedMs={15000}
                angleOffset={180}
              />
              <span className="relative z-10">Let's Talk</span>
            </a>
          </div>

          {/* Indicator: text "scroll" and glowing white line that animates downward */}
          <div
            data-s3d="global"
            data-s3d-depth="0.6"
            data-s3d-global-tilt="1.2"
            className="mt-14 flex flex-col items-center gap-2 select-none pointer-events-none px-4 py-2 will-change-transform"
          >
            <span className="text-[11px] uppercase tracking-[0.35em] font-mono text-white/70 font-medium">
              scroll
            </span>
            <div className="w-[1.5px] h-12 bg-white/20 relative overflow-hidden rounded-full">
              <div className="absolute top-0 left-0 w-full h-5 bg-gradient-to-b from-transparent via-white to-white/60 shadow-[0_0_10px_#ffffff] animate-scrollIndicator" />
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 1: WORK (EXACT ASYMMETRICAL 4-CARD LAYOUT WITH MONOCHROME PURE WHITE GLOW) */}
      <section id="work" className="relative py-28 px-6 md:px-12 z-20 max-w-7xl mx-auto scroll-mt-24">
        {/* Subtle grid texture overlay with faint white touch */}
        <div
          data-s3d="global"
          data-s3d-depth="-0.85"
          data-s3d-global-tilt="0.7"
          className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:28px_28px] pointer-events-none rounded-3xl will-change-transform"
        />

        <RevealOnScroll className="mb-14 relative z-10">
          <div
            data-s3d="global"
            data-s3d-depth="0.85"
            data-s3d-global-tilt="1.8"
            className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-[0.2em] text-transparent bg-clip-text bg-gradient-to-r from-white via-neutral-200 to-neutral-400 mb-3 will-change-transform"
          >
            <Film className="w-3.5 h-3.5 text-white" />
            <span>01 / Selected Work</span>
          </div>
          <h2
            data-s3d="global"
            data-s3d-depth="1.15"
            data-s3d-global-tilt="2.2"
            className="block w-fit text-4xl md:text-5xl font-mazzard tracking-tight text-white will-change-transform"
          >
            Featured Edits
          </h2>
        </RevealOnScroll>

        <div className="flex flex-col gap-6 lg:gap-7 relative z-10 w-full">
          {/* TOP ROW: Card 01 (1:1) on left + Card 02 (16:9) on right */}
          <div className="flex flex-col md:flex-row items-center md:items-center justify-center md:justify-end md:pr-8 lg:pr-14 gap-6 lg:gap-8 w-full">
            {/* Card 01: 1:1 Square Preview */}
            <RevealOnScroll className="relative hover:z-30 w-full md:w-[38%] max-w-[440px] shrink-0" delay={0}>
              <div
                data-s3d="card"
                data-s3d-depth="0.95"
                data-s3d-global-tilt="3.4"
                data-s3d-scale="1.045"
                data-s3d-tilt="8.5"
                data-s3d-shift="4"
                onClick={() => setActiveVideoModal(WORK_PROJECTS[0])}
                className={`group relative hover:z-30 aspect-square w-full rounded-2xl md:rounded-3xl bg-gradient-to-br ${WORK_PROJECTS[0].gradient} border border-white/10 hover:border-transparent flex items-center justify-center p-4 shadow-[0_0_40px_rgba(0,0,0,0.8)] hover:shadow-[0_0_60px_rgba(255,255,255,0.22)] transition-[border-color,box-shadow] duration-500 cursor-pointer overflow-visible will-change-transform`}
              >
                {/* Gemini Rotating Border Halo */}
                <AnimatedGeminiBorder
                  preset="gemini"
                  mode="hover-brighten"
                  borderRadius="rounded-2xl md:rounded-3xl"
                  borderWidth="1.5px"
                  auraBlur="blur-xl"
                  auraOpacity={0.4}
                  speedMs={20000}
                  angleOffset={0}
                />

                {/* Background Looping Muted Video Preview */}
                {WORK_PROJECTS[0].videoUrl && (
                  <video
                    src={WORK_PROJECTS[0].videoUrl}
                    autoPlay
                    loop
                    muted
                    playsInline
                    disablePictureInPicture
                    className="absolute inset-0 w-full h-full object-cover rounded-2xl md:rounded-3xl pointer-events-none"
                  />
                )}

                {/* Thumbnail image if provided and no video */}
                {!WORK_PROJECTS[0].videoUrl && WORK_PROJECTS[0].thumbnailUrl && (
                  <img
                    src={WORK_PROJECTS[0].thumbnailUrl}
                    alt={WORK_PROJECTS[0].title}
                    className="absolute inset-0 w-full h-full object-cover rounded-2xl md:rounded-3xl opacity-75 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500 pointer-events-none"
                  />
                )}

                {/* Dark Vignette Overlay for Text & Button Contrast */}
                <div
                  className={`absolute inset-0 rounded-2xl md:rounded-3xl pointer-events-none transition-colors duration-300 ${
                    WORK_PROJECTS[0].videoUrl
                      ? 'bg-black/25 group-hover:bg-black/50'
                      : 'bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.05)_0%,transparent_70%)]'
                  }`}
                />

                {/* Numeral inside top-left */}
                <span
                  data-s3d="global"
                  data-s3d-depth="0.45"
                  data-s3d-global-tilt="1.0"
                  className="absolute top-4 left-4 z-20 text-xs font-mono font-medium text-white/90 drop-shadow-md tracking-wider px-1 py-0.5 pointer-events-none will-change-transform"
                >
                  {WORK_PROJECTS[0].num}
                </span>

                {/* Aspect ratio label inside top-right (1:1) */}
                <span
                  data-s3d="global"
                  data-s3d-depth="0.45"
                  data-s3d-global-tilt="1.0"
                  className="absolute top-4 right-4 z-20 text-xs font-mono font-medium text-white/70 drop-shadow-md tracking-wider px-1 py-0.5 pointer-events-none will-change-transform"
                >
                  1:1
                </span>

                {/* Central Glowing Play Button */}
                <div
                  data-s3d="button"
                  data-s3d-depth="0.5"
                  data-s3d-global-tilt="1.0"
                  data-s3d-scale="1.12"
                  data-s3d-tilt="11"
                  className="relative z-20 will-change-transform"
                >
                  <div
                    className={`w-14 h-14 md:w-16 md:h-16 rounded-full bg-white/15 border border-white/30 backdrop-blur-md flex items-center justify-center text-white transition-[opacity,background-color,color,box-shadow] duration-300 shadow-[0_0_25px_rgba(255,255,255,0.25)] group-hover:shadow-[0_0_40px_rgba(255,255,255,0.7)] group-hover:bg-white group-hover:text-black ${
                      WORK_PROJECTS[0].videoUrl
                        ? 'opacity-0 group-hover:opacity-100'
                        : 'opacity-100'
                    }`}
                  >
                    <Play className="w-6 h-6 fill-current ml-0.5" />
                  </div>
                </div>
              </div>
            </RevealOnScroll>

            {/* Card 02: 16:9 Widescreen Preview */}
            <RevealOnScroll className="relative hover:z-30 w-full md:w-[58%] max-w-[680px]" delay={120}>
              <div
                data-s3d="card"
                data-s3d-depth="0.95"
                data-s3d-global-tilt="3.4"
                data-s3d-scale="1.045"
                data-s3d-tilt="8.5"
                data-s3d-shift="4"
                onClick={() => setActiveVideoModal(WORK_PROJECTS[1])}
                className={`group relative hover:z-30 aspect-video w-full rounded-2xl md:rounded-3xl bg-gradient-to-br ${WORK_PROJECTS[1].gradient} border border-white/10 hover:border-transparent flex items-center justify-center p-4 shadow-[0_0_40px_rgba(0,0,0,0.8)] hover:shadow-[0_0_60px_rgba(255,255,255,0.22)] transition-[border-color,box-shadow] duration-500 cursor-pointer overflow-visible will-change-transform`}
              >
                {/* Gemini Rotating Border Halo */}
                <AnimatedGeminiBorder
                  preset="instagram"
                  mode="hover-brighten"
                  borderRadius="rounded-2xl md:rounded-3xl"
                  borderWidth="1.5px"
                  auraBlur="blur-xl"
                  auraOpacity={0.4}
                  speedMs={20000}
                  angleOffset={90}
                />

                {/* Thumbnail image if provided */}
                {WORK_PROJECTS[1].thumbnailUrl && (
                  <img
                    src={WORK_PROJECTS[1].thumbnailUrl}
                    alt={WORK_PROJECTS[1].title}
                    className="absolute inset-0 w-full h-full object-cover rounded-2xl md:rounded-3xl opacity-75 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500 pointer-events-none"
                  />
                )}

                {/* Subtle Inner Background Noise / Depth glow */}
                <div className="absolute inset-0 rounded-2xl md:rounded-3xl bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.05)_0%,transparent_70%)] pointer-events-none" />

                {/* Numeral inside top-left */}
                <span
                  data-s3d="global"
                  data-s3d-depth="0.45"
                  data-s3d-global-tilt="1.0"
                  className="absolute top-4 left-4 z-20 text-xs font-mono font-medium text-white/80 tracking-wider px-1 py-0.5 pointer-events-none will-change-transform"
                >
                  {WORK_PROJECTS[1].num}
                </span>

                {/* Aspect ratio label inside top-right (16:9) */}
                <span
                  data-s3d="global"
                  data-s3d-depth="0.45"
                  data-s3d-global-tilt="1.0"
                  className="absolute top-4 right-4 z-20 text-xs font-mono font-medium text-white/50 tracking-wider px-1 py-0.5 pointer-events-none will-change-transform"
                >
                  16:9
                </span>

                {/* Central Glowing Play Button */}
                <div
                  data-s3d="button"
                  data-s3d-depth="0.5"
                  data-s3d-global-tilt="1.0"
                  data-s3d-scale="1.12"
                  data-s3d-tilt="11"
                  className="relative z-20 will-change-transform"
                >
                  <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-white/10 border border-white/25 backdrop-blur-md flex items-center justify-center text-white group-hover:bg-white group-hover:text-black transition-[background-color,color,box-shadow] shadow-[0_0_25px_rgba(255,255,255,0.25)] group-hover:shadow-[0_0_35px_rgba(255,255,255,0.7)]">
                    <Play className="w-6 h-6 fill-current ml-0.5" />
                  </div>
                </div>
              </div>
            </RevealOnScroll>
          </div>

          {/* BOTTOM ROW: Card 03 (16:9) on left + Card 04 (1:1) on right */}
          <div className="flex flex-col md:flex-row items-center md:items-center justify-center md:justify-start md:pl-8 lg:pl-14 gap-6 lg:gap-8 w-full">
            {/* Card 03: 16:9 Widescreen Preview */}
            <RevealOnScroll className="relative hover:z-30 w-full md:w-[58%] max-w-[680px]" delay={240}>
              <div
                data-s3d="card"
                data-s3d-depth="0.95"
                data-s3d-global-tilt="3.4"
                data-s3d-scale="1.045"
                data-s3d-tilt="8.5"
                data-s3d-shift="4"
                onClick={() => setActiveVideoModal(WORK_PROJECTS[2])}
                className={`group relative hover:z-30 aspect-video w-full rounded-2xl md:rounded-3xl bg-gradient-to-br ${WORK_PROJECTS[2].gradient} border border-white/10 hover:border-transparent flex items-center justify-center p-4 shadow-[0_0_40px_rgba(0,0,0,0.8)] hover:shadow-[0_0_60px_rgba(255,255,255,0.22)] transition-[border-color,box-shadow] duration-500 cursor-pointer overflow-visible will-change-transform`}
              >
                {/* Gemini Rotating Border Halo */}
                <AnimatedGeminiBorder
                  preset="discord"
                  mode="hover-brighten"
                  borderRadius="rounded-2xl md:rounded-3xl"
                  borderWidth="1.5px"
                  auraBlur="blur-xl"
                  auraOpacity={0.4}
                  speedMs={20000}
                  angleOffset={180}
                />

                {/* Thumbnail image if provided */}
                {WORK_PROJECTS[2].thumbnailUrl && (
                  <img
                    src={WORK_PROJECTS[2].thumbnailUrl}
                    alt={WORK_PROJECTS[2].title}
                    className="absolute inset-0 w-full h-full object-cover rounded-2xl md:rounded-3xl opacity-75 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500 pointer-events-none"
                  />
                )}

                {/* Subtle Inner Background Noise / Depth glow */}
                <div className="absolute inset-0 rounded-2xl md:rounded-3xl bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.05)_0%,transparent_70%)] pointer-events-none" />

                {/* Numeral inside top-left */}
                <span
                  data-s3d="global"
                  data-s3d-depth="0.45"
                  data-s3d-global-tilt="1.0"
                  className="absolute top-4 left-4 z-20 text-xs font-mono font-medium text-white/80 tracking-wider px-1 py-0.5 pointer-events-none will-change-transform"
                >
                  {WORK_PROJECTS[2].num}
                </span>

                {/* Aspect ratio label inside top-right (16:9) */}
                <span
                  data-s3d="global"
                  data-s3d-depth="0.45"
                  data-s3d-global-tilt="1.0"
                  className="absolute top-4 right-4 z-20 text-xs font-mono font-medium text-white/50 tracking-wider px-1 py-0.5 pointer-events-none will-change-transform"
                >
                  16:9
                </span>

                {/* Central Glowing Play Button */}
                <div
                  data-s3d="button"
                  data-s3d-depth="0.5"
                  data-s3d-global-tilt="1.0"
                  data-s3d-scale="1.12"
                  data-s3d-tilt="11"
                  className="relative z-20 will-change-transform"
                >
                  <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-white/10 border border-white/25 backdrop-blur-md flex items-center justify-center text-white group-hover:bg-white group-hover:text-black transition-[background-color,color,box-shadow] shadow-[0_0_25px_rgba(255,255,255,0.25)] group-hover:shadow-[0_0_35px_rgba(255,255,255,0.7)]">
                    <Play className="w-6 h-6 fill-current ml-0.5" />
                  </div>
                </div>
              </div>
            </RevealOnScroll>

            {/* Card 04: 1:1 Square Preview */}
            <RevealOnScroll className="relative hover:z-30 w-full md:w-[38%] max-w-[440px] shrink-0" delay={360}>
              <div
                data-s3d="card"
                data-s3d-depth="0.95"
                data-s3d-global-tilt="3.4"
                data-s3d-scale="1.045"
                data-s3d-tilt="8.5"
                data-s3d-shift="4"
                onClick={() => setActiveVideoModal(WORK_PROJECTS[3])}
                className={`group relative hover:z-30 aspect-square w-full rounded-2xl md:rounded-3xl bg-gradient-to-br ${WORK_PROJECTS[3].gradient} border border-white/10 hover:border-transparent flex items-center justify-center p-4 shadow-[0_0_40px_rgba(0,0,0,0.8)] hover:shadow-[0_0_60px_rgba(255,255,255,0.22)] transition-[border-color,box-shadow] duration-500 cursor-pointer overflow-visible will-change-transform`}
              >
                {/* Gemini Rotating Border Halo */}
                <AnimatedGeminiBorder
                  preset="gmail"
                  mode="hover-brighten"
                  borderRadius="rounded-2xl md:rounded-3xl"
                  borderWidth="1.5px"
                  auraBlur="blur-xl"
                  auraOpacity={0.4}
                  speedMs={20000}
                  angleOffset={270}
                />

                {/* Thumbnail image if provided */}
                {WORK_PROJECTS[3].thumbnailUrl && (
                  <img
                    src={WORK_PROJECTS[3].thumbnailUrl}
                    alt={WORK_PROJECTS[3].title}
                    className="absolute inset-0 w-full h-full object-cover rounded-2xl md:rounded-3xl opacity-75 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500 pointer-events-none"
                  />
                )}

                {/* Subtle Inner Background Noise / Depth glow */}
                <div className="absolute inset-0 rounded-2xl md:rounded-3xl bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.05)_0%,transparent_70%)] pointer-events-none" />

                {/* Numeral inside top-left */}
                <span
                  data-s3d="global"
                  data-s3d-depth="0.45"
                  data-s3d-global-tilt="1.0"
                  className="absolute top-4 left-4 z-20 text-xs font-mono font-medium text-white/80 tracking-wider px-1 py-0.5 pointer-events-none will-change-transform"
                >
                  {WORK_PROJECTS[3].num}
                </span>

                {/* Aspect ratio label inside top-right (1:1) */}
                <span
                  data-s3d="global"
                  data-s3d-depth="0.45"
                  data-s3d-global-tilt="1.0"
                  className="absolute top-4 right-4 z-20 text-xs font-mono font-medium text-white/50 tracking-wider px-1 py-0.5 pointer-events-none will-change-transform"
                >
                  1:1
                </span>

                {/* Central Glowing Play Button */}
                <div
                  data-s3d="button"
                  data-s3d-depth="0.5"
                  data-s3d-global-tilt="1.0"
                  data-s3d-scale="1.12"
                  data-s3d-tilt="11"
                  className="relative z-20 will-change-transform"
                >
                  <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-white/10 border border-white/25 backdrop-blur-md flex items-center justify-center text-white group-hover:bg-white group-hover:text-black transition-[background-color,color,box-shadow] shadow-[0_0_25px_rgba(255,255,255,0.25)] group-hover:shadow-[0_0_35px_rgba(255,255,255,0.7)]">
                    <Play className="w-6 h-6 fill-current ml-0.5" />
                  </div>
                </div>
              </div>
            </RevealOnScroll>
          </div>
        </div>
      </section>

      {/* SECTION 2: SHORTS / VERTICAL REELS */}
      <section id="shorts" className="relative py-28 px-6 md:px-12 z-20 max-w-7xl mx-auto scroll-mt-24 border-t border-white/10">
        <RevealOnScroll className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-16">
          <div>
            <div
              data-s3d="global"
              data-s3d-depth="0.85"
              data-s3d-global-tilt="1.8"
              className="inline-block text-xs font-mono tracking-[0.2em] text-transparent bg-clip-text bg-gradient-to-r from-white via-neutral-200 to-neutral-400 uppercase mb-4 will-change-transform"
            >
              02 / SHORTS & REELS
            </div>
            <h2
              data-s3d="global"
              data-s3d-depth="1.15"
              data-s3d-global-tilt="2.2"
              className="text-5xl sm:text-6xl md:text-7xl font-mazzard tracking-tight text-white leading-[0.95] will-change-transform"
            >
              Small screen.<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-neutral-200 to-neutral-400 drop-shadow-[0_0_30px_rgba(255,255,255,0.25)]">
                Big energy.
              </span>
            </h2>
          </div>

          <div
            data-s3d="global"
            data-s3d-depth="0.85"
            data-s3d-global-tilt="1.5"
            className="max-w-md lg:text-right px-2 py-1 will-change-transform"
          >
            <p className="text-sm md:text-base text-white/70 leading-relaxed font-normal">
              Vertical edits that hook fast, land clean, and give your audience one more reason to hit replay.
            </p>
          </div>
        </RevealOnScroll>

        {/* 3 Staggered Phone-style Vertical Preview Frames with No Subtitles (Only Preview) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start pt-4 pb-12">
          {SHORTS_PROJECTS.map((short) => (
            <RevealOnScroll key={short.id} delay={short.delay} className={`relative hover:z-30 ${short.stagger}`}>
              <div
                data-s3d="card"
                data-s3d-depth="1.0"
                data-s3d-global-tilt="3.6"
                data-s3d-scale="1.045"
                data-s3d-tilt="9"
                data-s3d-shift="4"
                onClick={() =>
                  setActiveVideoModal({
                    id: short.id,
                    num: short.num,
                    title: short.title,
                    category: 'VERTICAL EDIT',
                    format: short.format,
                    tag: 'HIGH RETENTION SHORT',
                    reviewTitle: '',
                    quote: '',
                    rating: 5,
                    gradient: short.gradient,
                    colSpan: '',
                    aspectClass: 'aspect-[9/16]',
                    aspectBadge: '9:16',
                    videoUrl: (short as any).videoUrl,
                    thumbnailUrl: (short as any).thumbnailUrl,
                  })
                }
                className={`group relative hover:z-30 aspect-[9/16] w-full rounded-2xl md:rounded-3xl bg-gradient-to-b ${short.gradient} border border-white/10 hover:border-transparent flex items-center justify-center p-6 shadow-[0_0_40px_rgba(0,0,0,0.8)] hover:shadow-[0_0_60px_rgba(255,255,255,0.22)] transition-[border-color,box-shadow] duration-500 cursor-pointer overflow-visible will-change-transform`}
              >
                <AnimatedGeminiBorder
                  preset={short.preset}
                  mode="hover-brighten"
                  borderRadius="rounded-2xl md:rounded-3xl"
                  borderWidth="1.5px"
                  auraBlur="blur-xl"
                  auraOpacity={0.45}
                  speedMs={18000}
                  angleOffset={short.delay}
                />

                {/* Thumbnail image if provided */}
                {(short as any).thumbnailUrl && (
                  <img
                    src={(short as any).thumbnailUrl}
                    alt={short.title}
                    className="absolute inset-0 w-full h-full object-cover rounded-2xl md:rounded-3xl opacity-75 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500 pointer-events-none"
                  />
                )}

                {/* Subtle Inner Background Noise / Depth glow */}
                <div className="absolute inset-0 rounded-2xl md:rounded-3xl bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.05)_0%,transparent_70%)] pointer-events-none" />

                {/* Numeral inside top-left */}
                <span
                  data-s3d="global"
                  data-s3d-depth="0.45"
                  data-s3d-global-tilt="1.0"
                  className="absolute top-5 left-5 z-20 text-xs font-mono font-medium text-white/80 tracking-wider px-1 py-0.5 pointer-events-none will-change-transform"
                >
                  {short.num}
                </span>

                {/* 9:16 aspect ratio label inside top-right */}
                <span
                  data-s3d="global"
                  data-s3d-depth="0.45"
                  data-s3d-global-tilt="1.0"
                  className="absolute top-5 right-5 z-20 text-xs font-mono font-medium text-white/50 tracking-wider px-1 py-0.5 pointer-events-none will-change-transform"
                >
                  9:16
                </span>

                {/* Central Glowing Play Button */}
                <div
                  data-s3d="button"
                  data-s3d-depth="0.5"
                  data-s3d-global-tilt="1.0"
                  data-s3d-scale="1.12"
                  data-s3d-tilt="11"
                  className="relative z-20 will-change-transform"
                >
                  <div className="w-14 h-14 rounded-full bg-white/10 border border-white/25 backdrop-blur-md flex items-center justify-center text-white group-hover:bg-white group-hover:text-black transition-[background-color,color,box-shadow] shadow-[0_0_25px_rgba(255,255,255,0.25)] group-hover:shadow-[0_0_35px_rgba(255,255,255,0.7)]">
                    <Play className="w-5 h-5 fill-current ml-0.5" />
                  </div>
                </div>
              </div>
            </RevealOnScroll>
          ))}
        </div>
      </section>

      {/* SECTION 3: WHY ME */}
      <section id="whyme" className="relative py-28 px-6 md:px-12 z-20 max-w-7xl mx-auto scroll-mt-24 border-t border-white/10">
        <RevealOnScroll className="max-w-3xl mb-16">
          <div
            data-s3d="global"
            data-s3d-depth="0.85"
            data-s3d-global-tilt="1.8"
            className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-[0.2em] text-transparent bg-clip-text bg-gradient-to-r from-white via-neutral-200 to-neutral-400 mb-3 will-change-transform"
          >
            <Zap className="w-3.5 h-3.5 text-white" />
            <span>The Competitive Edge</span>
          </div>
          <h2
            data-s3d="global"
            data-s3d-depth="1.15"
            data-s3d-global-tilt="2.2"
            className="text-4xl md:text-5xl font-heading font-bold tracking-tight text-white will-change-transform"
          >
            Why Creators Work With <span className="font-brand-rychr">Rychr</span>
          </h2>
          <p
            data-s3d="global"
            data-s3d-depth="0.85"
            data-s3d-global-tilt="1.5"
            className="text-white/60 text-base mt-3 font-normal will-change-transform"
          >
            Video editing isn’t just assembling clips. It's viewer psychology, pacing mathematics, and storytelling in After Effects that keeps people glued until the last frame.
          </p>
        </RevealOnScroll>

        {/* 6 Core Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <RevealOnScroll delay={0} className="relative hover:z-30">
            <div
              data-s3d="card"
              data-s3d-depth="0.95"
              data-s3d-global-tilt="3.4"
              data-s3d-scale="1.095"
              data-s3d-tilt="10"
              data-s3d-shift="5"
              className="group relative hover:z-30 rounded-3xl p-8 bg-[#050505]/90 backdrop-blur-xl border border-white/10 hover:border-transparent shadow-[0_0_30px_rgba(0,0,0,0.8)] hover:shadow-[0_0_55px_rgba(255,255,255,0.18)] transition-[border-color,box-shadow] h-full overflow-visible will-change-transform"
            >
              <AnimatedGeminiBorder
                preset="gemini"
                mode="hover-brighten"
                borderRadius="rounded-3xl"
                borderWidth="1.5px"
                auraBlur="blur-lg"
                auraOpacity={0.35}
                speedMs={18000}
                angleOffset={0}
              />
              <div className="relative z-10">
                <div
                  data-s3d="global"
                  data-s3d-depth="0.5"
                  data-s3d-global-tilt="1.2"
                  className="w-12 h-12 rounded-2xl bg-white/[0.06] border border-white/20 flex items-center justify-center text-white mb-6 group-hover:border-white/50 group-hover:bg-white/12 shadow-[0_0_20px_rgba(255,255,255,0.12)] transition-[border-color,background-color] will-change-transform"
                >
                  <Sparkles className="w-6 h-6" />
                </div>
                <h3
                  data-s3d="global"
                  data-s3d-depth="0.4"
                  data-s3d-global-tilt="0.9"
                  className="text-xl font-heading font-bold text-white mb-2 will-change-transform"
                >
                  1. The 1.8s Hook Formula
                </h3>
                <p
                  data-s3d="global"
                  data-s3d-depth="0.3"
                  data-s3d-global-tilt="0.7"
                  className="text-sm text-white/65 leading-relaxed font-normal will-change-transform"
                >
                  Every video dies or thrives in the first 3 seconds. I engineer curiosity loops, sound stingers, and visual anchors so your viewers never scroll away.
                </p>
              </div>
            </div>
          </RevealOnScroll>

          <RevealOnScroll delay={100} className="relative hover:z-30">
            <div
              data-s3d="card"
              data-s3d-depth="0.95"
              data-s3d-global-tilt="3.4"
              data-s3d-scale="1.095"
              data-s3d-tilt="10"
              data-s3d-shift="5"
              className="group relative hover:z-30 rounded-3xl p-8 bg-[#050505]/90 backdrop-blur-xl border border-white/10 hover:border-transparent shadow-[0_0_30px_rgba(0,0,0,0.8)] hover:shadow-[0_0_55px_rgba(255,255,255,0.18)] transition-[border-color,box-shadow] h-full overflow-visible will-change-transform"
            >
              <AnimatedGeminiBorder
                preset="discord"
                mode="hover-brighten"
                borderRadius="rounded-3xl"
                borderWidth="1.5px"
                auraBlur="blur-lg"
                auraOpacity={0.35}
                speedMs={18000}
                angleOffset={60}
              />
              <div className="relative z-10">
                <div
                  data-s3d="global"
                  data-s3d-depth="0.5"
                  data-s3d-global-tilt="1.2"
                  className="w-12 h-12 rounded-2xl bg-white/[0.06] border border-white/20 flex items-center justify-center text-white mb-6 group-hover:border-white/50 group-hover:bg-white/12 shadow-[0_0_20px_rgba(255,255,255,0.12)] transition-[border-color,background-color] will-change-transform"
                >
                  <Layers className="w-6 h-6" />
                </div>
                <h3
                  data-s3d="global"
                  data-s3d-depth="0.4"
                  data-s3d-global-tilt="0.9"
                  className="text-xl font-heading font-bold text-white mb-2 will-change-transform"
                >
                  2. Adaptable to Any Style
                </h3>
                <p
                  data-s3d="global"
                  data-s3d-depth="0.3"
                  data-s3d-global-tilt="0.7"
                  className="text-sm text-white/65 leading-relaxed font-normal will-change-transform"
                >
                  Talking head, documentary, SaaS commercial, or gaming: I match your channel tone, brand voice, and pacing rhythm flawlessly.
                </p>
              </div>
            </div>
          </RevealOnScroll>

          <RevealOnScroll delay={200} className="relative hover:z-30">
            <div
              data-s3d="card"
              data-s3d-depth="0.95"
              data-s3d-global-tilt="3.4"
              data-s3d-scale="1.095"
              data-s3d-tilt="10"
              data-s3d-shift="5"
              className="group relative hover:z-30 rounded-3xl p-8 bg-[#050505]/90 backdrop-blur-xl border border-white/10 hover:border-transparent shadow-[0_0_30px_rgba(0,0,0,0.8)] hover:shadow-[0_0_55px_rgba(255,255,255,0.18)] transition-[border-color,box-shadow] h-full overflow-visible will-change-transform"
            >
              <AnimatedGeminiBorder
                preset="instagram"
                mode="hover-brighten"
                borderRadius="rounded-3xl"
                borderWidth="1.5px"
                auraBlur="blur-lg"
                auraOpacity={0.35}
                speedMs={18000}
                angleOffset={120}
              />
              <div className="relative z-10">
                <div
                  data-s3d="global"
                  data-s3d-depth="0.5"
                  data-s3d-global-tilt="1.2"
                  className="w-12 h-12 rounded-2xl bg-white/[0.06] border border-white/20 flex items-center justify-center text-white mb-6 group-hover:border-white/50 group-hover:bg-white/12 shadow-[0_0_20px_rgba(255,255,255,0.12)] transition-[border-color,background-color] will-change-transform"
                >
                  <Volume2 className="w-6 h-6" />
                </div>
                <h3
                  data-s3d="global"
                  data-s3d-depth="0.4"
                  data-s3d-global-tilt="0.9"
                  className="text-xl font-heading font-bold text-white mb-2 will-change-transform"
                >
                  3. 3-Layer Soundscapes
                </h3>
                <p
                  data-s3d="global"
                  data-s3d-depth="0.3"
                  data-s3d-global-tilt="0.7"
                  className="text-sm text-white/65 leading-relaxed font-normal will-change-transform"
                >
                  70% of perceived quality is audio. Every cut is paired with tailored risers, whooshes, sub-drops, and atmospheric foley to deliver crisp, immersive punch.
                </p>
              </div>
            </div>
          </RevealOnScroll>

          <RevealOnScroll delay={300} className="relative hover:z-30">
            <div
              data-s3d="card"
              data-s3d-depth="0.95"
              data-s3d-global-tilt="3.4"
              data-s3d-scale="1.095"
              data-s3d-tilt="10"
              data-s3d-shift="5"
              className="group relative hover:z-30 rounded-3xl p-8 bg-[#050505]/90 backdrop-blur-xl border border-white/10 hover:border-transparent shadow-[0_0_30px_rgba(0,0,0,0.8)] hover:shadow-[0_0_55px_rgba(255,255,255,0.18)] transition-[border-color,box-shadow] h-full overflow-visible will-change-transform"
            >
              <AnimatedGeminiBorder
                preset="gmail"
                mode="hover-brighten"
                borderRadius="rounded-3xl"
                borderWidth="1.5px"
                auraBlur="blur-lg"
                auraOpacity={0.35}
                speedMs={18000}
                angleOffset={180}
              />
              <div className="relative z-10">
                <div
                  data-s3d="global"
                  data-s3d-depth="0.5"
                  data-s3d-global-tilt="1.2"
                  className="w-12 h-12 rounded-2xl bg-white/[0.06] border border-white/20 flex items-center justify-center text-white mb-6 group-hover:border-white/50 group-hover:bg-white/12 shadow-[0_0_20px_rgba(255,255,255,0.12)] transition-[border-color,background-color] will-change-transform"
                >
                  <Film className="w-6 h-6" />
                </div>
                <h3
                  data-s3d="global"
                  data-s3d-depth="0.4"
                  data-s3d-global-tilt="0.9"
                  className="text-xl font-heading font-bold text-white mb-2 will-change-transform"
                >
                  4. 100% After Effects
                </h3>
                <p
                  data-s3d="global"
                  data-s3d-depth="0.3"
                  data-s3d-global-tilt="0.7"
                  className="text-sm text-white/65 leading-relaxed font-normal will-change-transform"
                >
                  Edited exclusively in After Effects. Custom motion graphics, surgical speed ramping, keyframe curves, and 3D camera sweeps.
                </p>
              </div>
            </div>
          </RevealOnScroll>

          <RevealOnScroll delay={400} className="relative hover:z-30">
            <div
              data-s3d="card"
              data-s3d-depth="0.95"
              data-s3d-global-tilt="3.4"
              data-s3d-scale="1.095"
              data-s3d-tilt="10"
              data-s3d-shift="5"
              className="group relative hover:z-30 rounded-3xl p-8 bg-[#050505]/90 backdrop-blur-xl border border-white/10 hover:border-transparent shadow-[0_0_30px_rgba(0,0,0,0.8)] hover:shadow-[0_0_55px_rgba(255,255,255,0.18)] transition-[border-color,box-shadow] h-full overflow-visible will-change-transform"
            >
              <AnimatedGeminiBorder
                preset="cyan-purple"
                mode="hover-brighten"
                borderRadius="rounded-3xl"
                borderWidth="1.5px"
                auraBlur="blur-lg"
                auraOpacity={0.35}
                speedMs={18000}
                angleOffset={240}
              />
              <div className="relative z-10">
                <div
                  data-s3d="global"
                  data-s3d-depth="0.5"
                  data-s3d-global-tilt="1.2"
                  className="w-12 h-12 rounded-2xl bg-white/[0.06] border border-white/20 flex items-center justify-center text-white mb-6 group-hover:border-white/50 group-hover:bg-white/12 shadow-[0_0_20px_rgba(255,255,255,0.12)] transition-[border-color,background-color] will-change-transform"
                >
                  <Zap className="w-6 h-6" />
                </div>
                <h3
                  data-s3d="global"
                  data-s3d-depth="0.4"
                  data-s3d-global-tilt="0.9"
                  className="text-xl font-heading font-bold text-white mb-2 will-change-transform"
                >
                  5. Reliable Turnaround
                </h3>
                <p
                  data-s3d="global"
                  data-s3d-depth="0.3"
                  data-s3d-global-tilt="0.7"
                  className="text-sm text-white/65 leading-relaxed font-normal will-change-transform"
                >
                  Content calendars move fast. I deliver consistent drafts on schedule, respect agreed delivery dates, and keep communication clear and transparent.
                </p>
              </div>
            </div>
          </RevealOnScroll>

          <RevealOnScroll delay={500} className="relative hover:z-30">
            <div
              data-s3d="card"
              data-s3d-depth="0.95"
              data-s3d-global-tilt="3.4"
              data-s3d-scale="1.095"
              data-s3d-tilt="10"
              data-s3d-shift="5"
              className="group relative hover:z-30 rounded-3xl p-8 bg-[#050505]/90 backdrop-blur-xl border border-white/10 hover:border-transparent shadow-[0_0_30px_rgba(0,0,0,0.8)] hover:shadow-[0_0_55px_rgba(255,255,255,0.18)] transition-[border-color,box-shadow] h-full overflow-visible will-change-transform"
            >
              <AnimatedGeminiBorder
                preset="discord"
                mode="hover-brighten"
                borderRadius="rounded-3xl"
                borderWidth="1.5px"
                auraBlur="blur-lg"
                auraOpacity={0.35}
                speedMs={18000}
                angleOffset={300}
              />
              <div className="relative z-10">
                <div
                  data-s3d="global"
                  data-s3d-depth="0.5"
                  data-s3d-global-tilt="1.2"
                  className="w-12 h-12 rounded-2xl bg-white/[0.06] border border-white/20 flex items-center justify-center text-white mb-6 group-hover:border-white/50 group-hover:bg-white/12 shadow-[0_0_20px_rgba(255,255,255,0.12)] transition-[border-color,background-color] will-change-transform"
                >
                  <Check className="w-6 h-6" />
                </div>
                <h3
                  data-s3d="global"
                  data-s3d-depth="0.4"
                  data-s3d-global-tilt="0.9"
                  className="text-xl font-heading font-bold text-white mb-2 will-change-transform"
                >
                  6. Up to 3 Revisions
                </h3>
                <p
                  data-s3d="global"
                  data-s3d-depth="0.3"
                  data-s3d-global-tilt="0.7"
                  className="text-sm text-white/65 leading-relaxed font-normal will-change-transform"
                >
                  Each project includes up to 3 focused revisions. If you ever want to change more or explore additional passes, just contact me to discuss!
                </p>
              </div>
            </div>
          </RevealOnScroll>
        </div>
      </section>

      {/* SECTION 4: ABOUT RYCHR — SEAMLESS FULL-BLEED 3D STUDIO PROTRACTOR SHOWCASE */}
      <section
        id="about"
        ref={aboutSectionRef}
        className="relative py-28 z-20 w-full scroll-mt-24 overflow-visible"
      >
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <RevealOnScroll className="mb-2 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div
                data-s3d="global"
                data-s3d-depth="0.85"
                data-s3d-global-tilt="1.8"
                className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-[0.2em] text-transparent bg-clip-text bg-gradient-to-r from-white via-neutral-200 to-neutral-400 mb-2 will-change-transform"
              >
                <span>04 / About The Editor</span>
              </div>
              <h2
                data-s3d="global"
                data-s3d-depth="1.15"
                data-s3d-global-tilt="2.2"
                className="block w-fit text-3xl sm:text-4xl font-mazzard font-bold tracking-tight text-white will-change-transform"
              >
                Meet <span className="font-brand-rychr">Rychr</span>
              </h2>
            </div>
          </RevealOnScroll>
        </div>

        {/* Full-Width Borderless 3D Character Stage (Light fades in smoothly on scroll) */}
        <div ref={aboutStageFrameRef} className="relative w-full overflow-visible">
          <AboutShowcase3D
            pointerTargetRef={aboutPointerRef}
            scrollLightRef={aboutScrollLightRef}
          />
        </div>

        <div className="max-w-7xl mx-auto px-6 md:px-12">
          {/* Mobile Stats Strip (< md) so curved desktop stats remain crisp on small screens */}
          <div className="grid grid-cols-2 gap-3 mt-5 md:hidden">
            <div
              data-s3d="card"
              data-s3d-depth="0.9"
              data-s3d-global-tilt="3.0"
              data-s3d-scale="1.05"
              data-s3d-tilt="9"
              className="relative hover:z-30 rounded-2xl p-4 bg-[#050505] border border-white/10 hover:border-white/30 transition-colors will-change-transform"
            >
              <div className="text-2xl font-mazzard font-bold text-white tabular-nums">4+</div>
              <div className="text-xs text-white/60 mt-0.5">years experience</div>
            </div>
            <div
              data-s3d="card"
              data-s3d-depth="0.9"
              data-s3d-global-tilt="3.0"
              data-s3d-scale="1.05"
              data-s3d-tilt="9"
              className="relative hover:z-30 rounded-2xl p-4 bg-[#050505] border border-white/10 hover:border-white/30 transition-colors will-change-transform"
            >
              <div className="text-2xl font-mazzard font-bold text-white tabular-nums">50+</div>
              <div className="text-xs text-white/60 mt-0.5">videos edited</div>
            </div>
            <div
              data-s3d="card"
              data-s3d-depth="0.9"
              data-s3d-global-tilt="3.0"
              data-s3d-scale="1.05"
              data-s3d-tilt="9"
              className="relative hover:z-30 rounded-2xl p-4 bg-[#050505] border border-white/10 hover:border-white/30 transition-colors will-change-transform"
            >
              <div className="text-xl font-mazzard font-bold text-white">Reliable</div>
              <div className="text-xs text-white/60 mt-0.5">turnaround time</div>
            </div>
            <div
              data-s3d="card"
              data-s3d-depth="0.9"
              data-s3d-global-tilt="3.0"
              data-s3d-scale="1.05"
              data-s3d-tilt="9"
              className="relative hover:z-30 rounded-2xl p-4 bg-[#050505] border border-white/10 hover:border-white/30 transition-colors will-change-transform"
            >
              <div className="text-2xl font-mazzard font-bold text-white tabular-nums">100%</div>
              <div className="text-xs text-white/60 mt-0.5">After Effects</div>
            </div>
          </div>

          {/* 3 Glowing-Border Editorial Cards Below Stage */}
          <RevealOnScroll delay={160}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 pt-2">
              <div
                data-s3d="card"
                data-s3d-depth="0.95"
                data-s3d-global-tilt="3.4"
                data-s3d-scale="1.055"
                data-s3d-tilt="8.5"
                data-s3d-shift="4"
                className="group relative hover:z-30 rounded-3xl p-7 sm:p-8 bg-[#050505]/90 backdrop-blur-xl border border-white/10 hover:border-transparent shadow-[0_0_30px_rgba(0,0,0,0.8)] hover:shadow-[0_0_45px_rgba(255,255,255,0.12)] transition-[border-color,box-shadow] h-full overflow-visible will-change-transform"
              >
                <AnimatedGeminiBorder
                  preset="gemini"
                  mode="always"
                  borderRadius="rounded-3xl"
                  borderWidth="1.5px"
                  auraBlur="blur-lg"
                  auraOpacity={0.32}
                  innerGlowOpacity={0.9}
                  speedMs={18000}
                  angleOffset={0}
                />
                <p
                  data-s3d="global"
                  data-s3d-depth="0.35"
                  data-s3d-global-tilt="0.8"
                  className="relative z-10 text-sm sm:text-base text-white/70 leading-relaxed font-normal will-change-transform"
                >
                  I’ve spent the last <strong className="text-white">4+ years</strong> deep in <strong className="text-white">Adobe After Effects</strong>, engineering and cutting 50+ high-retention videos for creators across YouTube, Reels, and TikTok. Video editing isn't just trimming fat—it's pacing mathematics and keeping a viewer hooked from frame zero.
                </p>
              </div>

              <div
                data-s3d="card"
                data-s3d-depth="0.95"
                data-s3d-global-tilt="3.4"
                data-s3d-scale="1.055"
                data-s3d-tilt="8.5"
                data-s3d-shift="4"
                className="group relative hover:z-30 rounded-3xl p-7 sm:p-8 bg-[#050505]/90 backdrop-blur-xl border border-white/10 hover:border-transparent shadow-[0_0_30px_rgba(0,0,0,0.8)] hover:shadow-[0_0_45px_rgba(255,255,255,0.12)] transition-[border-color,box-shadow] h-full overflow-visible will-change-transform"
              >
                <AnimatedGeminiBorder
                  preset="discord"
                  mode="always"
                  borderRadius="rounded-3xl"
                  borderWidth="1.5px"
                  auraBlur="blur-lg"
                  auraOpacity={0.32}
                  innerGlowOpacity={0.9}
                  speedMs={18000}
                  angleOffset={120}
                />
                <p
                  data-s3d="global"
                  data-s3d-depth="0.35"
                  data-s3d-global-tilt="0.8"
                  className="relative z-10 text-sm sm:text-base text-white/70 leading-relaxed font-normal will-change-transform"
                >
                  Whether your channel runs on fast-paced gaming cuts, documentary storytelling, clean talking-head essays, or viral vertical hooks: <strong className="text-white">I adapt completely to your exact style and brand voice.</strong> Every cut is built from scratch to match your rhythm.
                </p>
              </div>

              <div
                data-s3d="card"
                data-s3d-depth="0.95"
                data-s3d-global-tilt="3.4"
                data-s3d-scale="1.055"
                data-s3d-tilt="8.5"
                data-s3d-shift="4"
                className="group relative hover:z-30 rounded-3xl p-7 sm:p-8 bg-[#050505]/90 backdrop-blur-xl border border-white/10 hover:border-transparent shadow-[0_0_30px_rgba(0,0,0,0.8)] hover:shadow-[0_0_45px_rgba(255,255,255,0.12)] transition-[border-color,box-shadow] h-full overflow-visible will-change-transform"
              >
                <AnimatedGeminiBorder
                  preset="instagram"
                  mode="always"
                  borderRadius="rounded-3xl"
                  borderWidth="1.5px"
                  auraBlur="blur-lg"
                  auraOpacity={0.32}
                  innerGlowOpacity={0.9}
                  speedMs={18000}
                  angleOffset={240}
                />
                <p
                  data-s3d="global"
                  data-s3d-depth="0.35"
                  data-s3d-global-tilt="0.8"
                  className="relative z-10 text-sm sm:text-base text-white/70 leading-relaxed font-normal will-change-transform"
                >
                  From surgical keyframing, whip zooms, and kinetic captions to 3-layer sound design with atmospheric risers and sub-drops: you bring the vision and raw footage, I engineer the cut that turns casual scrollers into loyal subscribers.
                </p>
              </div>
            </div>
          </RevealOnScroll>
        </div>
      </section>

      {/* SECTION 5: FAQ */}
      <section id="faq" className="relative py-28 px-6 md:px-12 z-20 max-w-5xl mx-auto scroll-mt-24 border-t border-white/10">
        <RevealOnScroll className="text-center max-w-2xl mx-auto mb-16">
          <div
            data-s3d="global"
            data-s3d-depth="0.85"
            data-s3d-global-tilt="1.8"
            className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-[0.2em] text-transparent bg-clip-text bg-gradient-to-r from-white via-neutral-200 to-neutral-400 mb-3 will-change-transform"
          >
            <span>Got Questions?</span>
          </div>
          <h2
            data-s3d="global"
            data-s3d-depth="1.15"
            data-s3d-global-tilt="2.2"
            className="text-4xl md:text-5xl font-mazzard tracking-tight text-white will-change-transform"
          >
            Frequently Asked Questions
          </h2>
          <p
            data-s3d="global"
            data-s3d-depth="0.85"
            data-s3d-global-tilt="1.5"
            className="text-white/60 text-base mt-3 font-normal will-change-transform"
          >
            Everything you need to know about turnaround times, revisions, software, and payment terms.
          </p>
        </RevealOnScroll>

        {/* Glass Accordions in neutral dark glass */}
        <div className="space-y-4">
          {FAQS.map((faq, index) => {
            const isOpen = activeFaq === index;
            return (
              <RevealOnScroll key={index} delay={index * 70} className="relative hover:z-30">
                <div
                  data-s3d="card"
                  data-s3d-depth="0.85"
                  data-s3d-global-tilt="2.8"
                  data-s3d-scale="1.022"
                  data-s3d-tilt="5.5"
                  className="group relative hover:z-30 rounded-2xl bg-[#050505]/90 backdrop-blur-xl border border-white/10 hover:border-transparent transition-[border-color,box-shadow] overflow-visible shadow-lg will-change-transform"
                >
                  <AnimatedGeminiBorder
                    preset={
                      (['gemini', 'discord', 'instagram', 'gmail', 'cyan-purple'] as const)[
                        index % 5
                      ]
                    }
                    mode={isOpen ? 'always' : 'hover-brighten'}
                    borderRadius="rounded-2xl"
                    borderWidth="1.2px"
                    auraBlur="blur-md"
                    auraOpacity={isOpen ? 0.45 : 0.25}
                    speedMs={16000}
                    angleOffset={index * 72}
                  />
                  <div className="relative z-10 overflow-hidden rounded-2xl">
                    <button
                      type="button"
                      aria-expanded={isOpen}
                      onClick={() => setActiveFaq(isOpen ? null : index)}
                      className="w-full px-6 py-5 flex items-center justify-between text-left gap-4 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white/80 rounded-2xl"
                    >
                      <span
                        data-s3d="global"
                        data-s3d-depth="0.35"
                        data-s3d-global-tilt="0.8"
                        className="inline-block text-base md:text-lg font-mazzard text-white will-change-transform"
                      >
                        {faq.question}
                      </span>
                      <div
                        data-s3d="button"
                        data-s3d-depth="0.45"
                        data-s3d-global-tilt="1.0"
                        data-s3d-scale="1.12"
                        data-s3d-tilt="10"
                        className={`w-8 h-8 rounded-full bg-white/[0.05] border border-white/15 flex items-center justify-center shrink-0 transition-colors duration-300 will-change-transform ${isOpen ? 'bg-white/20' : ''}`}
                      >
                        <ChevronDown className={`w-4 h-4 text-white transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                      </div>
                    </button>

                    {isOpen && (
                      <div
                        data-s3d="global"
                        data-s3d-depth="0.25"
                        data-s3d-global-tilt="0.6"
                        className="px-6 pb-6 pt-1 text-sm md:text-base text-white/70 leading-relaxed border-t border-white/10 font-normal will-change-transform"
                      >
                        {faq.answer}
                      </div>
                    )}
                  </div>
                </div>
              </RevealOnScroll>
            );
          })}
        </div>
      </section>

      {/* SECTION 6: CONTACT & SOCIALS */}
      <section id="contact" className="relative py-28 px-6 md:px-12 z-20 max-w-5xl mx-auto scroll-mt-24 border-t border-white/10">
        <RevealOnScroll className="text-center max-w-2xl mx-auto mb-16">
          <div
            data-s3d="global"
            data-s3d-depth="0.85"
            data-s3d-global-tilt="1.8"
            className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-[0.2em] text-transparent bg-clip-text bg-gradient-to-r from-white via-neutral-200 to-neutral-400 mb-3 will-change-transform"
          >
            <span>Direct Channels</span>
          </div>
          <h2
            data-s3d="global"
            data-s3d-depth="1.15"
            data-s3d-global-tilt="2.2"
            className="text-4xl md:text-5xl font-mazzard tracking-tight text-white will-change-transform"
          >
            Let's Make High-Retention Edits
          </h2>
          <p
            data-s3d="global"
            data-s3d-depth="0.85"
            data-s3d-global-tilt="1.5"
            className="text-white/60 text-base mt-3 font-normal will-change-transform"
          >
            Ready to upgrade your videos? Reach out directly via Gmail, Discord, or Instagram to discuss your vision, rates, and test edits.
          </p>
        </RevealOnScroll>

        {/* 3 Explicit Social Cards with Asymmetric Animated Gemini Outlines */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {/* Discord: @ray_christo */}
          <RevealOnScroll delay={0} className="relative hover:z-30">
            <div
              data-s3d="card"
              data-s3d-depth="0.95"
              data-s3d-global-tilt="3.4"
              data-s3d-scale="1.05"
              data-s3d-tilt="8.5"
              data-s3d-shift="4"
              className="relative hover:z-30 rounded-3xl p-6 bg-[#050505]/95 backdrop-blur-xl border border-white/10 shadow-[0_0_35px_rgba(0,0,0,0.8)] overflow-visible flex flex-col justify-between h-full group will-change-transform"
            >
              <AnimatedGeminiBorder
                preset="discord"
                borderRadius="rounded-3xl"
                borderWidth="1.5px"
                auraBlur="blur-xl"
                auraOpacity={0.35}
                speedMs={20000}
                angleOffset={0}
              />

              <div className="relative z-10">
                <div
                  data-s3d="global"
                  data-s3d-depth="0.45"
                  data-s3d-global-tilt="1.1"
                  className="w-12 h-12 rounded-2xl bg-white/[0.06] border border-white/20 flex items-center justify-center text-white mb-5 shadow-[0_0_20px_rgba(255,255,255,0.12)] will-change-transform"
                >
                  <MessageSquare className="w-6 h-6 text-white" />
                </div>
                <h4
                  data-s3d="global"
                  data-s3d-depth="0.4"
                  data-s3d-global-tilt="0.9"
                  className="inline-block text-lg font-mazzard text-white mb-1 will-change-transform"
                >
                  Discord
                </h4>
                <p
                  data-s3d="global"
                  data-s3d-depth="0.3"
                  data-s3d-global-tilt="0.7"
                  className="text-xs text-white/50 mb-4 will-change-transform"
                >
                  Fast messaging & file reviews
                </p>
                <div
                  data-s3d="global"
                  data-s3d-depth="0.35"
                  data-s3d-global-tilt="0.8"
                  className="p-3 rounded-xl bg-black border border-white/20 font-mono text-sm text-white break-all select-all font-semibold shadow-[inset_0_1px_12px_rgba(255,255,255,0.06)] will-change-transform"
                >
                  @ray_christo
                </div>
              </div>

              <div className="relative z-10 mt-6 flex gap-2">
                <button
                  data-s3d="button"
                  data-s3d-depth="0.45"
                  data-s3d-global-tilt="1.0"
                  data-s3d-scale="1.055"
                  data-s3d-tilt="8.5"
                  onClick={() => handleCopy('@ray_christo', 'discord')}
                  className="relative flex-1 py-3 px-4 rounded-xl bg-black/90 hover:bg-black text-white font-mazzard text-xs font-semibold flex items-center justify-center gap-2 transition-[background-color,box-shadow] cursor-pointer shadow-[0_0_25px_rgba(255,255,255,0.2)] hover:shadow-[0_0_35px_rgba(255,255,255,0.45)] group/btn overflow-visible will-change-transform"
                >
                  <AnimatedGeminiBorder
                    preset="discord"
                    borderRadius="rounded-xl"
                    borderWidth="1.5px"
                    auraBlur="blur-md"
                    auraOpacity={0.7}
                    speedMs={14000}
                    angleOffset={45}
                  />
                  <span className="relative z-10 flex items-center gap-1.5 group-hover/btn:text-white transition-colors">
                    <span>{copiedSocial === 'discord' ? 'Copied @ray_christo!' : 'Copy Discord ID'}</span>
                    {copiedSocial === 'discord' ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5 text-white/70" />}
                  </span>
                </button>
              </div>
            </div>
          </RevealOnScroll>

          {/* Instagram: rychr.prod */}
          <RevealOnScroll delay={120} className="relative hover:z-30">
            <div
              data-s3d="card"
              data-s3d-depth="0.95"
              data-s3d-global-tilt="3.4"
              data-s3d-scale="1.05"
              data-s3d-tilt="8.5"
              data-s3d-shift="4"
              className="relative hover:z-30 rounded-3xl p-6 bg-[#050505]/95 backdrop-blur-xl border border-white/10 shadow-[0_0_35px_rgba(0,0,0,0.8)] overflow-visible flex flex-col justify-between h-full group will-change-transform"
            >
              <AnimatedGeminiBorder
                preset="instagram"
                borderRadius="rounded-3xl"
                borderWidth="1.5px"
                auraBlur="blur-xl"
                auraOpacity={0.35}
                speedMs={20000}
                angleOffset={120}
              />

              <div className="relative z-10">
                <div
                  data-s3d="global"
                  data-s3d-depth="0.45"
                  data-s3d-global-tilt="1.1"
                  className="w-12 h-12 rounded-2xl bg-white/[0.06] border border-white/20 flex items-center justify-center text-white mb-5 shadow-[0_0_20px_rgba(255,255,255,0.12)] will-change-transform"
                >
                  <Instagram className="w-6 h-6 text-white" />
                </div>
                <h4
                  data-s3d="global"
                  data-s3d-depth="0.4"
                  data-s3d-global-tilt="0.9"
                  className="inline-block text-lg font-mazzard text-white mb-1 will-change-transform"
                >
                  Instagram
                </h4>
                <p
                  data-s3d="global"
                  data-s3d-depth="0.3"
                  data-s3d-global-tilt="0.7"
                  className="text-xs text-white/50 mb-4 will-change-transform"
                >
                  Direct messages & reel edits
                </p>
                <div
                  data-s3d="global"
                  data-s3d-depth="0.35"
                  data-s3d-global-tilt="0.8"
                  className="p-3 rounded-xl bg-black border border-white/20 font-mono text-sm text-white break-all select-all font-semibold shadow-[inset_0_1px_12px_rgba(255,255,255,0.06)] will-change-transform"
                >
                  rychr.prod
                </div>
              </div>

              <div className="relative z-10 mt-6 flex gap-2">
                <a
                  data-s3d="button"
                  data-s3d-depth="0.45"
                  data-s3d-global-tilt="1.0"
                  data-s3d-scale="1.055"
                  data-s3d-tilt="8.5"
                  href="https://instagram.com/rychr.prod"
                  target="_blank"
                  rel="noreferrer"
                  className="relative flex-1 py-3 px-4 rounded-xl bg-black/90 hover:bg-black text-white font-mazzard text-xs font-semibold flex items-center justify-center gap-2 transition-[background-color,box-shadow] cursor-pointer shadow-[0_0_25px_rgba(255,255,255,0.2)] hover:shadow-[0_0_35px_rgba(255,255,255,0.45)] group/btn overflow-visible will-change-transform"
                >
                  <AnimatedGeminiBorder
                    preset="instagram"
                    borderRadius="rounded-xl"
                    borderWidth="1.5px"
                    auraBlur="blur-md"
                    auraOpacity={0.7}
                    speedMs={14000}
                    angleOffset={165}
                  />
                  <span className="relative z-10 flex items-center gap-1.5 group-hover/btn:text-white transition-colors">
                    <span>Open Profile</span>
                    <ExternalLink className="w-3.5 h-3.5 text-white/70" />
                  </span>
                </a>
                <button
                  data-s3d="button"
                  data-s3d-depth="0.45"
                  data-s3d-global-tilt="1.0"
                  data-s3d-scale="1.1"
                  data-s3d-tilt="10"
                  onClick={() => handleCopy('rychr.prod', 'instagram')}
                  className="relative p-3 rounded-xl bg-black/85 hover:bg-black text-white border border-white/15 hover:border-white/40 transition-[background-color,border-color,box-shadow] cursor-pointer hover:shadow-[0_0_20px_rgba(255,255,255,0.2)] will-change-transform"
                  title="Copy Instagram Handle"
                >
                  {copiedSocial === 'instagram' ? <Check className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4 text-white/70" />}
                </button>
              </div>
            </div>
          </RevealOnScroll>

          {/* Gmail: rychr.edits@gmail.com */}
          <RevealOnScroll delay={240} className="relative hover:z-30">
            <div
              data-s3d="card"
              data-s3d-depth="0.95"
              data-s3d-global-tilt="3.4"
              data-s3d-scale="1.05"
              data-s3d-tilt="8.5"
              data-s3d-shift="4"
              className="relative hover:z-30 rounded-3xl p-6 bg-[#050505]/95 backdrop-blur-xl border border-white/10 shadow-[0_0_35px_rgba(0,0,0,0.8)] overflow-visible flex flex-col justify-between h-full group will-change-transform"
            >
              <AnimatedGeminiBorder
                preset="gmail"
                borderRadius="rounded-3xl"
                borderWidth="1.5px"
                auraBlur="blur-xl"
                auraOpacity={0.35}
                speedMs={20000}
                angleOffset={240}
              />

              <div className="relative z-10">
                <div
                  data-s3d="global"
                  data-s3d-depth="0.45"
                  data-s3d-global-tilt="1.1"
                  className="w-12 h-12 rounded-2xl bg-white/[0.06] border border-white/20 flex items-center justify-center text-white mb-5 shadow-[0_0_20px_rgba(255,255,255,0.12)] will-change-transform"
                >
                  <Mail className="w-6 h-6 text-white" />
                </div>
                <h4
                  data-s3d="global"
                  data-s3d-depth="0.4"
                  data-s3d-global-tilt="0.9"
                  className="inline-block text-lg font-mazzard text-white mb-1 will-change-transform"
                >
                  Gmail
                </h4>
                <p
                  data-s3d="global"
                  data-s3d-depth="0.3"
                  data-s3d-global-tilt="0.7"
                  className="text-xs text-white/50 mb-4 will-change-transform"
                >
                  Official business inquiries
                </p>
                <div
                  data-s3d="global"
                  data-s3d-depth="0.35"
                  data-s3d-global-tilt="0.8"
                  className="p-3 rounded-xl bg-black border border-white/20 font-mono text-xs text-white break-all select-all font-semibold shadow-[inset_0_1px_12px_rgba(255,255,255,0.06)] will-change-transform"
                >
                  rychr.edits@gmail.com
                </div>
              </div>

              <div className="relative z-10 mt-6 flex gap-2">
                <a
                  data-s3d="button"
                  data-s3d-depth="0.45"
                  data-s3d-global-tilt="1.0"
                  data-s3d-scale="1.055"
                  data-s3d-tilt="8.5"
                  href="https://mail.google.com/mail/?view=cm&fs=1&to=rychr.edits@gmail.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative flex-1 py-3 px-4 rounded-xl bg-black/90 hover:bg-black text-white font-mazzard text-xs font-semibold flex items-center justify-center gap-2 transition-[background-color,box-shadow] cursor-pointer shadow-[0_0_25px_rgba(255,255,255,0.2)] hover:shadow-[0_0_35px_rgba(255,255,255,0.45)] group/btn overflow-visible will-change-transform"
                >
                  <AnimatedGeminiBorder
                    preset="gmail"
                    borderRadius="rounded-xl"
                    borderWidth="1.5px"
                    auraBlur="blur-md"
                    auraOpacity={0.7}
                    speedMs={14000}
                    angleOffset={285}
                  />
                  <span className="relative z-10 flex items-center gap-1.5 group-hover/btn:text-white transition-colors">
                    <span>Send Email</span>
                    <ExternalLink className="w-3.5 h-3.5 text-white/70" />
                  </span>
                </a>
                <button
                  data-s3d="button"
                  data-s3d-depth="0.45"
                  data-s3d-global-tilt="1.0"
                  data-s3d-scale="1.1"
                  data-s3d-tilt="10"
                  onClick={() => handleCopy('rychr.edits@gmail.com', 'email')}
                  className="relative p-3 rounded-xl bg-black/85 hover:bg-black text-white border border-white/15 hover:border-white/40 transition-[background-color,border-color,box-shadow] cursor-pointer hover:shadow-[0_0_20px_rgba(255,255,255,0.2)] will-change-transform"
                  title="Copy Email"
                >
                  {copiedSocial === 'email' ? <Check className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4 text-white/70" />}
                </button>
              </div>
            </div>
          </RevealOnScroll>
        </div>

        {/* WORKING ON-SITE INQUIRY FORM */}
        <RevealOnScroll delay={140} className="mb-14">
          <div
            data-s3d="card"
            data-s3d-depth="0.7"
            data-s3d-global-tilt="2.4"
            data-s3d-scale="1.01"
            data-s3d-tilt="4"
            data-s3d-pause-on-input="true"
            data-s3d-paused={isDropdownOpen ? 'true' : undefined}
            className="group relative rounded-3xl p-7 sm:p-9 md:p-10 bg-[#050505]/95 backdrop-blur-xl border border-white/15 shadow-[0_0_50px_rgba(0,0,0,0.85)] overflow-visible will-change-transform"
          >
            {/* Animated Gemini Glowing White Halo */}
            <AnimatedGeminiBorder
              preset="gemini"
              borderRadius="rounded-3xl"
              borderWidth="1.5px"
              auraBlur="blur-xl"
              auraOpacity={0.4}
              speedMs={18000}
              angleOffset={140}
            />

            <div className="relative z-10">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10 mb-7">
                <div
                  data-s3d="global"
                  data-s3d-depth="0.4"
                  data-s3d-global-tilt="0.9"
                  className="will-change-transform"
                >
                  <div className="text-xs uppercase font-mono tracking-[0.2em] text-transparent bg-clip-text bg-gradient-to-r from-white via-neutral-200 to-neutral-400 mb-1">
                    Send Direct Message
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-mazzard font-bold text-white tracking-tight">
                    Project Inquiry & Booking
                  </h3>
                </div>
                <div
                  data-s3d="global"
                  data-s3d-depth="0.4"
                  data-s3d-global-tilt="0.9"
                  className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/20 text-xs font-mono text-white/80 shrink-0 self-start sm:self-auto will-change-transform"
                >
                  <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                  <span>Direct to Inbox • 24h Response</span>
                </div>
              </div>

              {/* SUCCESS STATE */}
              {formStatus === 'success' && (
                <div className="p-8 rounded-2xl bg-white/[0.04] border border-white/20 text-center">
                  <div className="w-14 h-14 rounded-full bg-white/10 border border-white/30 text-white flex items-center justify-center mx-auto mb-4 shadow-[0_0_25px_rgba(255,255,255,0.4)]">
                    <CheckCircle2 className="w-7 h-7 text-white" />
                  </div>
                  <h4 className="text-2xl font-mazzard font-bold text-white mb-2">
                    Inquiry Delivered Successfully!
                  </h4>
                  <p className="text-sm text-white/70 max-w-lg mx-auto leading-relaxed mb-6 font-normal">
                    Thank you! Your project details have been transmitted directly to Ray's email inbox. I'll review your footage links and reply within 24 hours.
                  </p>
                  <button
                    type="button"
                    data-s3d="button"
                    data-s3d-depth="0.45"
                    data-s3d-global-tilt="1.0"
                    data-s3d-scale="1.06"
                    data-s3d-tilt="8.5"
                    onClick={() => setFormStatus('idle')}
                    className="px-6 py-2.5 rounded-xl bg-white text-black font-semibold text-xs hover:bg-neutral-200 transition-colors cursor-pointer shadow-md will-change-transform"
                  >
                    Send Another Message
                  </button>
                </div>
              )}

              {/* NEEDS 1-TIME ACTIVATION STATE */}
              {formStatus === 'needs_activation' && (
                <div className="p-8 rounded-2xl bg-white/[0.04] border border-white/30 text-center">
                  <div className="w-14 h-14 rounded-full bg-white/10 border border-white/30 text-white flex items-center justify-center mx-auto mb-4 shadow-[0_0_25px_rgba(255,255,255,0.4)]">
                    <Mail className="w-7 h-7 text-white" />
                  </div>
                  <h4 className="text-2xl font-mazzard font-bold text-white mb-2">
                    Activation Email Sent!
                  </h4>
                  <p className="text-sm text-white/75 max-w-lg mx-auto leading-relaxed mb-6 font-normal">
                    FormSubmit sent a one-time activation link to your inbox. Simply click <strong className="text-white">"Activate Form"</strong> once in that email, and every future submission will land directly in your inbox!
                  </p>
                  <button
                    type="button"
                    data-s3d="button"
                    data-s3d-depth="0.45"
                    data-s3d-global-tilt="1.0"
                    data-s3d-scale="1.06"
                    data-s3d-tilt="8.5"
                    onClick={() => setFormStatus('idle')}
                    className="px-6 py-2.5 rounded-xl bg-white text-black font-semibold text-xs hover:bg-neutral-200 transition-colors cursor-pointer shadow-md will-change-transform"
                  >
                    Back to Form
                  </button>
                </div>
              )}

              {/* ACTIVE FORM */}
              {formStatus !== 'success' && formStatus !== 'needs_activation' && (
                <form onSubmit={handleFormSubmit} className="space-y-5">
                  {formStatus === 'error' && (
                    <div className="p-4 rounded-xl bg-white/10 border border-white/30 flex items-center gap-3 text-sm text-white">
                      <AlertCircle className="w-5 h-5 text-white shrink-0" />
                      <div className="flex-1">
                        <p className="font-semibold text-white">Message couldn't be sent automatically</p>
                        <p className="text-xs text-white/70">{formErrorMsg}</p>
                      </div>
                      <a
                        href="https://mail.google.com/mail/?view=cm&fs=1&to=rychr.edits@gmail.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        data-s3d="button"
                        data-s3d-depth="0.45"
                        data-s3d-global-tilt="1.0"
                        data-s3d-scale="1.06"
                        data-s3d-tilt="8.5"
                        className="px-3 py-1.5 rounded-lg bg-white text-black text-xs font-semibold hover:bg-neutral-200 transition-colors shrink-0 will-change-transform"
                      >
                        Open Gmail
                      </a>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div
                      data-s3d="global"
                      data-s3d-depth="0.3"
                      data-s3d-global-tilt="0.7"
                      data-s3d-pause-on-input="true"
                      className="will-change-transform"
                    >
                      <label className="block text-xs font-mono uppercase tracking-wider text-white/70 mb-2">
                        Your Name / Channel Name <span className="text-white">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Liam | Apex Creator"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-3.5 rounded-xl bg-black border border-white/20 text-white placeholder-white/30 text-sm focus:outline-none focus:border-white focus:ring-1 focus:ring-white/40 transition-colors"
                      />
                    </div>

                    <div
                      data-s3d="global"
                      data-s3d-depth="0.3"
                      data-s3d-global-tilt="0.7"
                      data-s3d-pause-on-input="true"
                      className="will-change-transform"
                    >
                      <label className="block text-xs font-mono uppercase tracking-wider text-white/70 mb-2">
                        Your Email or Discord Tag <span className="text-white">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. you@creator.com or @discord_tag"
                        value={formData.contact}
                        onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                        className="w-full px-4 py-3.5 rounded-xl bg-black border border-white/20 text-white placeholder-white/30 text-sm focus:outline-none focus:border-white focus:ring-1 focus:ring-white/40 transition-colors"
                      />
                    </div>
                  </div>

                  {/* CUSTOM ANIMATED MONOCHROMATIC DROPDOWN */}
                  <div className="relative" ref={dropdownRef}>
                    <label className="block text-xs font-mono uppercase tracking-wider text-white/70 mb-2">
                      What type of video editing do you need?
                    </label>

                    {/* Hidden input to ensure native form data captures the service value */}
                    <input type="hidden" name="service" value={formData.service} />

                    {/* Custom Animated Trigger Button */}
                    <button
                      type="button"
                      data-s3d="button"
                      data-s3d-depth="0.35"
                      data-s3d-global-tilt="0.8"
                      data-s3d-scale="1.022"
                      data-s3d-tilt="4.5"
                      data-s3d-paused={isDropdownOpen ? 'true' : undefined}
                      onClick={() => setIsDropdownOpen((prev) => !prev)}
                      aria-expanded={isDropdownOpen}
                      aria-haspopup="listbox"
                      className={`w-full px-4 py-3.5 rounded-xl bg-black border text-left text-sm text-white flex items-center justify-between transition-[border-color,background-color,box-shadow] duration-300 cursor-pointer shadow-inner will-change-transform ${
                        isDropdownOpen
                          ? 'border-white ring-1 ring-white/50 shadow-[0_0_25px_rgba(255,255,255,0.2)] bg-neutral-950'
                          : 'border-white/20 hover:border-white/40 hover:bg-neutral-950/80'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 overflow-hidden pr-2">
                        <span className="font-medium text-white truncate">
                          {formData.service}
                        </span>
                      </div>
                      <ChevronDown
                        className={`w-4 h-4 text-white/70 transition-transform duration-300 ease-out shrink-0 ml-3 ${
                          isDropdownOpen ? 'rotate-180 text-white' : 'rotate-0'
                        }`}
                      />
                    </button>

                    {/* Smoothly Animated Dropdown Menu with Monochromatic Glass Effect */}
                    <div
                      role="listbox"
                      className={`absolute left-0 right-0 top-full mt-2.5 z-50 rounded-2xl bg-[#0a0a0a]/98 border border-white/20 p-2 shadow-[0_20px_60px_rgba(0,0,0,0.95)] backdrop-blur-2xl transition-all duration-300 ease-out origin-top ${
                        isDropdownOpen
                          ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto visible'
                          : 'opacity-0 scale-95 -translate-y-2 pointer-events-none invisible'
                      }`}
                    >
                      <div className="px-3 py-1.5 text-[10px] font-mono uppercase tracking-[0.15em] text-white/40 border-b border-white/10 mb-1 flex items-center justify-between">
                        <span>Select Service Tier</span>
                        <span>{SERVICE_OPTIONS.length} options</span>
                      </div>

                      <div className="space-y-1 max-h-72 overflow-y-auto pr-1 select-none">
                        {SERVICE_OPTIONS.map((option) => {
                          const isSelected = formData.service === option.value;
                          return (
                            <button
                              key={option.value}
                              type="button"
                              role="option"
                              aria-selected={isSelected}
                              onClick={() => {
                                setFormData((prev) => ({ ...prev, service: option.value }));
                                setIsDropdownOpen(false);
                              }}
                              className={`w-full text-left p-3 rounded-xl transition-all duration-200 cursor-pointer flex items-center justify-between group ${
                                isSelected
                                  ? 'bg-white/15 text-white border border-white/30 shadow-sm'
                                  : 'hover:bg-white/10 text-white/80 hover:text-white border border-transparent'
                              }`}
                            >
                              <div className="flex-1 pr-3">
                                <div className="flex items-center gap-2 mb-1">
                                  <span
                                    className={`text-sm font-medium ${
                                      isSelected
                                        ? 'text-white font-semibold'
                                        : 'text-white/90 group-hover:text-white'
                                    }`}
                                  >
                                    {option.label}
                                  </span>
                                </div>
                                <p className="text-xs text-white/50 group-hover:text-white/75 transition-colors line-clamp-1">
                                  {option.desc}
                                </p>
                              </div>

                              {isSelected && (
                                <div className="w-5 h-5 rounded-full bg-white text-black flex items-center justify-center shrink-0 shadow-[0_0_12px_rgba(255,255,255,0.6)]">
                                  <Check className="w-3 h-3 stroke-[2.5]" />
                                </div>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <div
                    data-s3d="global"
                    data-s3d-depth="0.3"
                    data-s3d-global-tilt="0.7"
                    data-s3d-pause-on-input="true"
                    className="will-change-transform"
                  >
                    <label className="block text-xs font-mono uppercase tracking-wider text-white/70 mb-2">
                      Project Details, Footage Links & Deadlines <span className="text-white">*</span>
                    </label>
                    <textarea
                      rows={4}
                      required
                      placeholder="Share your raw footage length, turnaround deadline, channel link, and any reference editing styles you want me to match..."
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full px-4 py-3.5 rounded-xl bg-black border border-white/20 text-white placeholder-white/30 text-sm focus:outline-none focus:border-white focus:ring-1 focus:ring-white/40 transition-colors resize-none font-normal"
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      data-s3d="button"
                      data-s3d-depth="0.4"
                      data-s3d-global-tilt="0.9"
                      data-s3d-scale="1.025"
                      data-s3d-tilt="5.5"
                      disabled={formStatus === 'submitting'}
                      className="relative w-full py-4 rounded-xl bg-black/90 hover:bg-black text-white font-semibold text-sm transition-[background-color,box-shadow] duration-300 shadow-[0_0_30px_rgba(255,255,255,0.25)] hover:shadow-[0_0_45px_rgba(255,255,255,0.5)] cursor-pointer overflow-visible group/btn disabled:opacity-60 disabled:cursor-not-allowed will-change-transform"
                    >
                      <AnimatedGeminiBorder
                        preset="gemini"
                        borderRadius="rounded-xl"
                        borderWidth="1.5px"
                        auraBlur="blur-md"
                        auraOpacity={0.7}
                        speedMs={14000}
                        angleOffset={180}
                      />
                      <span className="relative z-10 flex items-center justify-center gap-2 group-hover/btn:text-white transition-colors">
                        {formStatus === 'submitting' ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin text-white" />
                            <span>Sending Directly to Ray's Inbox...</span>
                          </>
                        ) : (
                          <>
                            <span>Send Message Directly to <span className="font-brand-rychr font-bold text-white">Rychr</span></span>
                            <Send className="w-4 h-4 text-white group-hover/btn:translate-x-0.5 transition-transform" />
                          </>
                        )}
                      </span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </RevealOnScroll>

        {/* ENHANCED PROMINENT ACCEPTED PAYMENTS CARD */}
        <RevealOnScroll delay={150}>
          <div
            data-s3d="card"
            data-s3d-depth="0.75"
            data-s3d-global-tilt="2.5"
            data-s3d-scale="1.015"
            data-s3d-tilt="4.5"
            className="group relative rounded-3xl p-7 sm:p-9 md:p-10 bg-[#050505]/95 backdrop-blur-xl border border-white/15 shadow-[0_0_50px_rgba(0,0,0,0.85)] overflow-visible will-change-transform"
          >
            {/* Animated Gemini Glowing White Halo */}
            <AnimatedGeminiBorder
              preset="gemini"
              borderRadius="rounded-3xl"
              borderWidth="1.5px"
              auraBlur="blur-xl"
              auraOpacity={0.45}
              speedMs={16000}
              angleOffset={60}
            />

            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-white/10">
              <div className="flex items-center gap-4">
                <div
                  data-s3d="global"
                  data-s3d-depth="0.35"
                  data-s3d-global-tilt="0.8"
                  className="w-12 h-12 rounded-2xl bg-white/10 border border-white/25 flex items-center justify-center text-white shadow-[0_0_20px_rgba(255,255,255,0.2)] shrink-0 will-change-transform"
                >
                  <CreditCard className="w-6 h-6 text-white" />
                </div>
                <div
                  data-s3d="global"
                  data-s3d-depth="0.35"
                  data-s3d-global-tilt="0.8"
                  className="will-change-transform"
                >
                  <div className="text-xs uppercase font-mono tracking-[0.2em] text-transparent bg-clip-text bg-gradient-to-r from-white via-neutral-200 to-neutral-400">
                    Payment Terms & Invoicing
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-mazzard font-bold text-white tracking-tight mt-0.5">
                    Accepted Payment Channels
                  </h3>
                </div>
              </div>

              <div
                data-s3d="global"
                data-s3d-depth="0.35"
                data-s3d-global-tilt="0.8"
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/20 text-xs font-mono text-white/90 shadow-sm shrink-0 will-change-transform"
              >
                <ShieldCheck className="w-4 h-4 text-white" />
                <span>Verified Creator Invoicing</span>
              </div>
            </div>

            {/* Payment Method Cards */}
            <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
              {/* Method 1: Direct Bank Transfer */}
              <div
                data-s3d="card"
                data-s3d-depth="0.45"
                data-s3d-global-tilt="1.8"
                data-s3d-scale="1.045"
                data-s3d-tilt="8"
                className="relative hover:z-30 p-5 sm:p-6 rounded-2xl bg-black/85 border border-white/15 shadow-inner flex flex-col justify-between group/pm hover:border-white/40 transition-colors will-change-transform"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-lg font-mazzard font-bold text-white">Direct Bank Transfer</span>
                  <span className="px-2.5 py-1 rounded-md bg-white/10 text-[11px] font-mono text-white/85 border border-white/15">
                    Wire / NEFT / IMPS
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-white/70 leading-relaxed font-normal">
                  Domestic & international wire transfers directly to verified business accounts. Formal invoices with itemized project scope provided for accounting.
                </p>
              </div>

              {/* Method 2: UPI */}
              <div
                data-s3d="card"
                data-s3d-depth="0.45"
                data-s3d-global-tilt="1.8"
                data-s3d-scale="1.045"
                data-s3d-tilt="8"
                className="relative hover:z-30 p-5 sm:p-6 rounded-2xl bg-black/85 border border-white/15 shadow-inner flex flex-col justify-between group/pm hover:border-white/40 transition-colors will-change-transform"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-lg font-mazzard font-bold text-white">UPI (Instant)</span>
                  <span className="px-2.5 py-1 rounded-md bg-white/10 text-[11px] font-mono text-white/85 border border-white/15">
                    Zero Fees • Instant QR
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-white/70 leading-relaxed font-normal">
                  Instant settlement via UPI ID & QR code for milestone releases, rapid turnarounds, and rush edits with zero settlement delay.
                </p>
              </div>
            </div>

            {/* Bottom Support Footnote */}
            <div className="relative z-10 mt-6 pt-5 border-t border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-white/60">
              <p
                data-s3d="global"
                data-s3d-depth="0.3"
                data-s3d-global-tilt="0.7"
                className="will-change-transform"
              >
                Need custom milestones, PayPal, international escrow, or alternative payment options? Let's discuss directly.
              </p>
              <a
                href="https://mail.google.com/mail/?view=cm&fs=1&to=rychr.edits@gmail.com"
                target="_blank"
                rel="noopener noreferrer"
                data-s3d="button"
                data-s3d-depth="0.45"
                data-s3d-global-tilt="1.0"
                data-s3d-scale="1.06"
                data-s3d-tilt="9"
                className="inline-block text-white hover:underline font-mono text-xs font-semibold shrink-0 px-1 py-0.5 will-change-transform"
              >
                rychr.edits@gmail.com →
              </a>
            </div>
          </div>
        </RevealOnScroll>
      </section>
      </main>

      {/* FOOTER */}
      <footer className="relative py-12 px-6 border-t border-white/10 z-20 text-center text-xs text-white/40 font-mono">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div
            data-s3d="global"
            data-s3d-depth="0.6"
            data-s3d-global-tilt="1.2"
            className="flex items-center gap-2.5 px-2 py-1 will-change-transform"
          >
            <div className="w-5 h-5 rounded-md overflow-hidden bg-black border border-white/20 shrink-0 flex items-center justify-center">
              <video
                src="/assets/aistudio/export_2_-_15_fps_dc6d6217.mp4"
                poster="/assets/aistudio/image_5a1c3c4a.png"
                autoPlay
                loop
                muted
                playsInline
                disablePictureInPicture
                className="w-full h-full object-cover grayscale contrast-125 pointer-events-none select-none"
              />
            </div>
            <span className="text-white/90 font-brand-rychr text-base">Rychr</span>
            <span>— Creative Video Editor & Motion Designer (After Effects)</span>
          </div>

          <div className="flex items-center gap-6 font-medium text-xs text-white/70">
            <a
              href="#work"
              data-s3d="button"
              data-s3d-depth="0.6"
              data-s3d-global-tilt="1.2"
              data-s3d-scale="1.1"
              data-s3d-tilt="10"
              className="inline-block px-1 py-0.5 hover:text-white transition-colors will-change-transform"
            >
              Work
            </a>
            <a
              href="#shorts"
              data-s3d="button"
              data-s3d-depth="0.6"
              data-s3d-global-tilt="1.2"
              data-s3d-scale="1.1"
              data-s3d-tilt="10"
              className="inline-block px-1 py-0.5 hover:text-white transition-colors will-change-transform"
            >
              Shorts
            </a>
            <a
              href="#whyme"
              data-s3d="button"
              data-s3d-depth="0.6"
              data-s3d-global-tilt="1.2"
              data-s3d-scale="1.1"
              data-s3d-tilt="10"
              className="inline-block px-1 py-0.5 hover:text-white transition-colors will-change-transform"
            >
              Why me
            </a>
            <a
              href="#about"
              data-s3d="button"
              data-s3d-depth="0.6"
              data-s3d-global-tilt="1.2"
              data-s3d-scale="1.1"
              data-s3d-tilt="10"
              className="inline-block px-1 py-0.5 hover:text-white transition-colors will-change-transform"
            >
              About
            </a>
            <a
              href="#faq"
              data-s3d="button"
              data-s3d-depth="0.6"
              data-s3d-global-tilt="1.2"
              data-s3d-scale="1.1"
              data-s3d-tilt="10"
              className="inline-block px-1 py-0.5 hover:text-white transition-colors will-change-transform"
            >
              FAQ
            </a>
            <a
              href="#contact"
              data-s3d="button"
              data-s3d-depth="0.6"
              data-s3d-global-tilt="1.2"
              data-s3d-scale="1.1"
              data-s3d-tilt="10"
              className="inline-block px-1 py-0.5 hover:text-white transition-colors will-change-transform"
            >
              Contact
            </a>
          </div>

          <span
            data-s3d="global"
            data-s3d-depth="0.6"
            data-s3d-global-tilt="1.2"
            className="inline-block px-2 py-1 will-change-transform"
          >
            © {new Date().getFullYear()} <span className="font-brand-rychr font-bold text-white/70">Rychr</span>. All rights reserved.
          </span>
        </div>
      </footer>

      {/* VIDEO PREVIEW MODAL */}
      {activeVideoModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-10 bg-black/90 backdrop-blur-2xl"
          onClick={(e) => {
            if (e.target === e.currentTarget) setActiveVideoModal(null);
          }}
        >
          {/* Modal Outer Container with Floating Corner Close Button */}
          <div
            className={`relative w-full ${
              activeVideoModal.format.includes('9:16')
                ? 'max-w-md'
                : activeVideoModal.format.includes('1:1')
                ? 'max-w-2xl'
                : 'max-w-4xl'
            }`}
          >
            {/* Close Button positioned outside preview next to top-right corner */}
            <button
              data-s3d="button"
              data-s3d-depth="0.6"
              data-s3d-global-tilt="1.2"
              data-s3d-scale="1.14"
              data-s3d-tilt="12"
              onClick={() => setActiveVideoModal(null)}
              aria-label="Close preview"
              title="Close (Esc)"
              className="absolute -top-3.5 -right-3.5 md:-top-5 md:-right-5 z-50 w-9 h-9 md:w-11 md:h-11 rounded-full bg-[#0a0a0a] hover:bg-white text-white hover:text-black border border-white/25 hover:border-white shadow-[0_0_25px_rgba(0,0,0,0.9)] hover:shadow-[0_0_30px_rgba(255,255,255,0.4)] flex items-center justify-center transition-[background-color,color,border-color,box-shadow] duration-200 cursor-pointer will-change-transform"
            >
              <X className="w-4 h-4 md:w-5 md:h-5 stroke-[2.2]" />
            </button>

            {/* Inner Modal Card */}
            <div
              data-s3d="card"
              data-s3d-depth="0.65"
              data-s3d-global-tilt="2.2"
              data-s3d-scale="1.012"
              data-s3d-tilt="3.5"
              className="relative w-full rounded-3xl p-5 md:p-6 bg-[#050505] border border-white/15 shadow-[0_0_100px_rgba(0,0,0,0.9)] overflow-hidden will-change-transform"
            >
              {(() => {
                const embed = getVideoEmbedInfo(activeVideoModal.videoUrl);
                const aspectClass = activeVideoModal.format.includes('9:16')
                  ? 'aspect-[9/16]'
                  : activeVideoModal.format.includes('1:1')
                  ? 'aspect-square'
                  : 'aspect-video';

                if (embed.type === 'video') {
                  return (
                    <div className="mb-6 w-full">
                      <CustomVideoPlayer
                        src={embed.src}
                        title={activeVideoModal.title}
                        aspectClass={aspectClass}
                        autoPlayWithSound={true}
                      />
                    </div>
                  );
                }

                return (
                  <div
                    className={`relative w-full rounded-2xl overflow-hidden bg-black mb-6 ${
                      activeVideoModal.format.includes('9:16')
                        ? 'aspect-[9/16] max-h-[70vh] mx-auto'
                        : activeVideoModal.format.includes('1:1')
                        ? 'aspect-square max-h-[60vh] mx-auto'
                        : 'aspect-video'
                    }`}
                  >
                    {embed.type === 'youtube' || embed.type === 'vimeo' ? (
                      <iframe
                        src={embed.src}
                        title={activeVideoModal.title}
                        className="w-full h-full border-0 rounded-2xl"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                      />
                    ) : (
                      <div
                        className={`w-full h-full flex flex-col items-center justify-center bg-gradient-to-br ${activeVideoModal.gradient} p-6 text-center`}
                      >
                        <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-white/10 border border-white/25 backdrop-blur-md flex items-center justify-center mb-4 text-white shadow-[0_0_35px_rgba(255,255,255,0.35)]">
                          <Play className="w-7 h-7 md:w-8 md:h-8 fill-current ml-1 text-white" />
                        </div>
                        <h4 className="text-xl md:text-2xl font-heading font-bold text-white mb-2">
                          {activeVideoModal.title}
                        </h4>
                        <p className="text-xs text-white/50 font-mono tracking-wider">
                          PREVIEW READY • DROP YOUR VIDEO URL IN WORK_PROJECTS
                        </p>
                      </div>
                    )}
                  </div>
                );
              })()}

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-4 border-t border-white/10">
                <div
                  data-s3d="global"
                  data-s3d-depth="0.35"
                  data-s3d-global-tilt="0.8"
                  className="will-change-transform"
                >
                  <h3 className="text-xl font-heading font-bold text-white">
                    {activeVideoModal.title}
                  </h3>
                </div>

                <a
                  href="#contact"
                  data-s3d="button"
                  data-s3d-depth="0.45"
                  data-s3d-global-tilt="1.0"
                  data-s3d-scale="1.07"
                  data-s3d-tilt="9.5"
                  onClick={() => setActiveVideoModal(null)}
                  className="relative inline-block px-6 py-3 rounded-xl bg-black/90 hover:bg-black text-white font-semibold text-xs transition-[background-color,box-shadow] shrink-0 shadow-[0_0_25px_rgba(255,255,255,0.25)] hover:shadow-[0_0_35px_rgba(255,255,255,0.5)] overflow-visible group/btn will-change-transform"
                >
                  <AnimatedGeminiBorder
                    preset="gemini"
                    borderRadius="rounded-xl"
                    borderWidth="1.2px"
                    auraBlur="blur-sm"
                    auraOpacity={0.65}
                    speedMs={12000}
                    angleOffset={210}
                  />
                  <span className="relative z-10 group-hover/btn:text-white transition-colors">
                    Hire <span className="font-brand-rychr font-bold text-white">Rychr</span>
                  </span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
