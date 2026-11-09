import React, { useState, useEffect } from 'react';
import { CosmicHorizonBackground } from './CosmicHorizonBackground.tsx';
import { RevealOnScroll } from './RevealOnScroll.tsx';
import { CalmNavbarBorder } from './CalmNavbarBorder.tsx';
import { AnimatedGeminiBorder, GeminiColorPreset } from './AnimatedGeminiBorder.tsx';
import { FilmGrainOverlay, FilmGrainCardTexture } from './FilmGrainOverlay.tsx';
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
}

const WORK_PROJECTS: WorkProject[] = [
  {
    id: '1',
    num: '01',
    title: 'High-Retention Storyline Masterclass',
    category: 'LONG-FORM EDIT',
    format: 'GAMEPLAY • 16:9',
    tag: 'YOUTUBE EDIT • HIGH RETENTION',
    reviewTitle: 'Creator review',
    quote: '"Your review goes here. Tell visitors what this edit helped you achieve."',
    rating: 5,
    gradient: 'from-[#191919] via-[#0d0d0d] to-[#000000]',
    colSpan: 'lg:col-span-7',
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
    colSpan: 'lg:col-span-5',
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
    colSpan: 'lg:col-span-5',
  },
  {
    id: '4',
    num: '04',
    title: 'Creator Tech & Studio Overhaul Vlog',
    category: 'CREATOR EDIT',
    format: 'VLOG • 16:9',
    tag: 'YOUTUBE EDIT • HIGH RETENTION',
    reviewTitle: 'Creator review',
    quote: '"Your best feedback can live here under the finished video."',
    rating: 5,
    gradient: 'from-[#161616] via-[#0a0a0a] to-[#000000]',
    colSpan: 'lg:col-span-7',
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
      'I offer up to 3 revisions max per video. This keeps our feedback focused, respects deadlines, and ensures every single hook, sound cut, and visual element is refined without dragging out the schedule.',
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

export default function App() {
  const [scrollY, setScrollY] = useState(0);
  const [activeFaq, setActiveFaq] = useState<number | null>(0);
  const [activeVideoModal, setActiveVideoModal] = useState<WorkProject | null>(null);

  const [copiedSocial, setCopiedSocial] = useState<string | null>(null);

  // Real On-Site Working Contact Form State
  const [formData, setFormData] = useState({
    name: '',
    contact: '',
    service: 'YouTube Long-form',
    message: '',
  });
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
          service: 'YouTube Long-form',
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
      {/* PROCEDURAL PLANET HORIZON BACKGROUND (Top horizon + Underside on scroll to bottom + Glowing Cursor with Stars) */}
      <CosmicHorizonBackground scrollY={scrollY} />

      {/* NOTICEABLE CINEMATIC FILM GRAIN TEXTURE & SWITCHER */}
      <FilmGrainOverlay initialMode="35mm" />

      {/* PERSISTENT HEADER NAVBAR */}
      <header className="fixed top-0 left-0 right-0 z-50 px-4 md:px-10 py-5 transition-all duration-300">
        <div className="relative max-w-6xl mx-auto flex items-center justify-between px-6 py-3.5 rounded-2xl bg-black/85 backdrop-blur-xl border border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.9)]">
          {/* Calm, slow subtle dual parallel glowing border covering all sides of the rounded tab */}
          <CalmNavbarBorder />

          {/* Top Left: Animated Crescent Moon & Brand Video Playing as GIF (15 FPS, Monochromatic) */}
          <a href="#" className="flex items-center gap-3 group">
            <div className="relative w-9 h-9 rounded-xl overflow-hidden border border-white/20 bg-black flex items-center justify-center shadow-[0_0_18px_rgba(255,255,255,0.25)] group-hover:shadow-[0_0_26px_rgba(255,255,255,0.45)] group-hover:border-white/50 transition-all shrink-0">
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
            <span className="font-brand-rychr text-xl tracking-tight text-white group-hover:text-white/80 transition-colors">
              Rychr
            </span>
          </a>

          {/* Center Tabs: Work, Shorts, Why me, About, FAQ */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-white/70">
            <a href="#work" className="hover:text-white transition-colors">
              Work
            </a>
            <a href="#shorts" className="hover:text-white transition-colors">
              Shorts
            </a>
            <a href="#whyme" className="hover:text-white transition-colors">
              Why me
            </a>
            <a href="#about" className="hover:text-white transition-colors">
              About
            </a>
            <a href="#faq" className="hover:text-white transition-colors">
              FAQ
            </a>
          </nav>

          {/* Right Action: Let's Talk CTA with Glowing White Outline */}
          <div className="flex items-center gap-3">
            <a
              href="#contact"
              className="relative px-4 py-2 rounded-xl text-xs md:text-sm font-semibold bg-black/90 hover:bg-black text-white shadow-[0_0_20px_rgba(255,255,255,0.25)] hover:shadow-[0_0_30px_rgba(255,255,255,0.5)] transition-all active:scale-95 cursor-pointer overflow-visible group/btn"
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
              <span className="relative z-10 group-hover/btn:text-white/90 transition-colors">
                Let's Talk
              </span>
            </a>
          </div>
        </div>
      </header>

      {/* HERO SECTION (Text floats cleanly above the planet horizon; description is NEVER hidden!) */}
      <section className="relative min-h-[95vh] flex flex-col justify-center items-center px-6 pt-32 pb-20 z-20 pointer-events-auto">
        <div className="max-w-4xl mx-auto text-center flex flex-col items-center">
          {/* Status Badge in signature crisp style with Pure White rim */}
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/[0.04] border border-white/20 backdrop-blur-md mb-8 text-xs font-mono text-white/90 shadow-[0_0_20px_rgba(255,255,255,0.2)]">
            <span className="w-2 h-2 rounded-full bg-white shadow-[0_0_8px_#ffffff]" />
            <span className="tracking-wide">Available for New Projects</span>
          </div>

          {/* Main Title: Rychr strictly in Mazzard M Black with deep luminous white aura */}
          <h1 className="text-7xl sm:text-8xl md:text-9xl font-brand-rychr tracking-tight mb-4 text-white drop-shadow-[0_10px_45px_rgba(255,255,255,0.22)]">
            Rychr
          </h1>

          {/* Subheading in crisp Plus Jakarta Sans */}
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-heading font-bold tracking-tight text-white/95 mb-6">
            Creative Video Editor & Motion Designer
          </h2>

          {/* Bio text (cleanly situated above the planet's outline) */}
          <p className="text-base sm:text-lg text-white/75 max-w-2xl mx-auto leading-relaxed mb-10 font-normal">
            I edit cinematic, fast-paced, and engaging videos tailored for YouTube, streams, and social media. Let's make content that hooks your audience and drives growth.
          </p>

          {/* CTA Buttons: Direct to Work page */}
          <div className="flex flex-wrap items-center justify-center gap-4">
            <a
              href="#work"
              className="px-8 py-4 rounded-xl font-semibold text-sm md:text-base bg-white text-black hover:bg-neutral-200 transition-all duration-300 shadow-[0_0_35px_rgba(255,255,255,0.25)] hover:shadow-[0_0_45px_rgba(255,255,255,0.45)] flex items-center gap-2 group cursor-pointer"
            >
              <span>Explore My Work</span>
              <ChevronDown className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
            </a>

            <a
              href="#contact"
              className="relative px-7 py-4 rounded-xl font-semibold text-sm md:text-base bg-black/90 hover:bg-black text-white hover:text-white/80 transition-all duration-300 shadow-[0_0_25px_rgba(255,255,255,0.25)] hover:shadow-[0_0_35px_rgba(255,255,255,0.45)] overflow-visible group/btn active:scale-95"
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
          <div className="mt-14 flex flex-col items-center gap-2 select-none pointer-events-none">
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
        <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:28px_28px] pointer-events-none rounded-3xl" />

        <RevealOnScroll className="mb-14 relative z-10">
          <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-[0.2em] text-transparent bg-clip-text bg-gradient-to-r from-white via-neutral-200 to-neutral-400 mb-3">
            <Film className="w-3.5 h-3.5 text-white" />
            <span>01 / Selected Work</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-mazzard tracking-tight text-white">
            Featured Edits & Reviews
          </h2>
        </RevealOnScroll>

        {/* 4 Cards in Asymmetrical Layout:
            Row 1: Card 01 Wide (lg:col-span-7) + Card 02 (lg:col-span-5)
            Row 2: Card 03 (lg:col-span-5) + Card 04 Wide (lg:col-span-7) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 relative z-10">
          {WORK_PROJECTS.map((project, index) => (
            <RevealOnScroll
              key={project.id}
              className={`${project.colSpan} h-full`}
              delay={index * 120}
            >
              <div
                onClick={() => setActiveVideoModal(project)}
                className="group relative rounded-[28px] md:rounded-[34px] bg-black/90 border border-white/10 hover:border-transparent p-5 sm:p-6 md:p-7 backdrop-blur-md shadow-[0_0_40px_rgba(0,0,0,0.8)] hover:shadow-[0_0_60px_rgba(255,255,255,0.18)] transition-all duration-500 flex flex-col justify-between cursor-pointer h-full overflow-visible"
              >
                {/* Asymmetric Gemini Rotating Border Halo */}
                <AnimatedGeminiBorder
                  preset={
                    index === 0
                      ? 'gemini'
                      : index === 1
                      ? 'instagram'
                      : index === 2
                      ? 'discord'
                      : 'gmail'
                  }
                  mode="hover-brighten"
                  borderRadius="rounded-[28px] md:rounded-[34px]"
                  borderWidth="1.5px"
                  auraBlur="blur-xl"
                  auraOpacity={0.4}
                  speedMs={20000}
                  angleOffset={index * 90}
                />

                <div className="relative z-10 flex flex-col justify-between h-full">
                  {/* Inner 16:9 Video Box with Numeral & Centered Play Button */}
                  <div
                    className={`relative aspect-video w-full rounded-2xl md:rounded-3xl overflow-hidden bg-gradient-to-br ${project.gradient} border border-white/10 flex items-center justify-center p-4 shadow-inner mb-5 group-hover:border-white/40 transition-all duration-500`}
                  >
                    {/* Noticeable Film Grain & Vignette */}
                    <FilmGrainCardTexture intensity="standard" />

                    {/* Numeral inside top-left */}
                    <span className="absolute top-4 left-4 z-20 text-xs font-mono font-medium text-white/80 tracking-wider">
                      {project.num}
                    </span>

                    {/* Film Stock Stamp inside top-right */}
                    <span className="absolute top-4 right-4 z-20 text-[10px] font-mono tracking-widest text-white/40 uppercase">
                      35MM • 24FPS
                    </span>

                    {/* Central Glowing Play Button */}
                    <div className="relative z-20 w-14 h-14 md:w-16 md:h-16 rounded-full bg-white/10 border border-white/25 backdrop-blur-md flex items-center justify-center text-white group-hover:scale-110 group-hover:bg-white group-hover:text-black transition-all shadow-[0_0_25px_rgba(255,255,255,0.25)] group-hover:shadow-[0_0_35px_rgba(255,255,255,0.7)]">
                      <Play className="w-6 h-6 fill-current ml-0.5" />
                    </div>
                  </div>

                  {/* Below Video: Metadata row, tag, Creator review title, quote & 5 stars */}
                  <div className="flex flex-col">
                    {/* Category & Format Divider Row */}
                    <div className="flex items-center justify-between text-[11px] sm:text-xs font-mono uppercase tracking-[0.16em] text-white/50 border-b border-white/10 pb-3 mb-3.5">
                      <span className="font-semibold">{project.category}</span>
                      <span className="text-white/40">{project.format}</span>
                    </div>

                    {/* Pure Silver / White Accent Tag */}
                    <div className="text-xs font-mono font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-white via-neutral-200 to-neutral-400 uppercase mb-1.5">
                      {project.tag}
                    </div>

                    {/* Creator review Heading */}
                    <h3 className="text-2xl sm:text-3xl font-mazzard text-white tracking-tight mb-2">
                      {project.reviewTitle}
                    </h3>

                    {/* Review Quote (Space for client testimonials & feedback) */}
                    <p className="text-white/70 text-sm md:text-[15px] leading-relaxed font-normal mb-4">
                      {project.quote}
                    </p>

                    {/* 5 Solid White Stars */}
                    <div className="flex items-center gap-1 text-white">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-white text-white drop-shadow-[0_0_4px_rgba(255,255,255,0.4)]" />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </RevealOnScroll>
          ))}
        </div>
      </section>

      {/* SECTION 2: SHORTS / VERTICAL REELS */}
      <section id="shorts" className="relative py-28 px-6 md:px-12 z-20 max-w-7xl mx-auto scroll-mt-24 border-t border-white/10">
        <RevealOnScroll className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-16">
          <div>
            <div className="text-xs font-mono tracking-[0.2em] text-transparent bg-clip-text bg-gradient-to-r from-white via-neutral-200 to-neutral-400 uppercase mb-4">
              02 / SHORTS & REELS
            </div>
            <h2 className="text-5xl sm:text-6xl md:text-7xl font-mazzard tracking-tight text-white leading-[0.95]">
              Small screen.<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-neutral-200 to-neutral-400 drop-shadow-[0_0_30px_rgba(255,255,255,0.25)]">
                Big energy.
              </span>
            </h2>
          </div>

          <div className="max-w-md lg:text-right">
            <p className="text-sm md:text-base text-white/70 leading-relaxed font-normal">
              Vertical edits that hook fast, land clean, and give your audience one more reason to hit replay.
            </p>
          </div>
        </RevealOnScroll>

        {/* 3 Staggered Phone-style Vertical Cards matching layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start pt-4 pb-8">
          {/* Card 01 */}
          <RevealOnScroll delay={0}>
            <div className="group relative rounded-[32px] p-3.5 bg-black/90 border border-white/10 hover:border-transparent shadow-[0_0_35px_rgba(0,0,0,0.8)] hover:shadow-[0_0_60px_rgba(255,255,255,0.18)] transition-all duration-500 cursor-pointer flex flex-col justify-between overflow-visible">
              <AnimatedGeminiBorder
                preset="discord"
                mode="hover-brighten"
                borderRadius="rounded-[32px]"
                borderWidth="1.5px"
                auraBlur="blur-xl"
                auraOpacity={0.45}
                speedMs={18000}
                angleOffset={0}
              />
              <div className="relative z-10 flex flex-col justify-between h-full">
                {/* Inner 9:16 Screen Frame */}
                <div className="relative w-full aspect-[9/16] rounded-[24px] overflow-hidden bg-gradient-to-b from-[#181818] via-[#090909] to-[#000000] border border-white/10 p-6 flex flex-col justify-between shadow-inner group-hover:scale-[1.01] transition-transform duration-500">
                  <FilmGrainCardTexture intensity="heavy" />

                  <div className="relative z-20 flex items-center justify-between">
                    <span className="text-xs font-mono text-white/90 font-semibold drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]">01</span>
                    <span className="text-[10px] font-mono tracking-widest text-white/40 uppercase">16MM GRAIN</span>
                  </div>

                  <h4 className="relative z-20 text-2xl sm:text-3xl font-mazzard text-white tracking-tight uppercase leading-snug">
                    FAST / FUN / REPLAYABLE
                  </h4>

                  <div className="relative z-20 flex justify-end">
                    <div className="w-8 h-8 rounded-full bg-white text-black shadow-[0_0_18px_rgba(255,255,255,0.7)] flex items-center justify-center group-hover:scale-110 group-hover:shadow-[0_0_25px_rgba(255,255,255,1)] transition-all">
                      <Play className="w-3.5 h-3.5 fill-current ml-0.5 text-black" />
                    </div>
                  </div>
                </div>

                {/* Bottom Tag Outside Screen */}
                <div className="px-3 pt-3 pb-1 text-[11px] font-mono text-white/50 tracking-wider">
                  SHORTS • 9:16
                </div>
              </div>
            </div>
          </RevealOnScroll>

          {/* Card 02 (Middle card staggered down as in reference image!) */}
          <RevealOnScroll delay={150}>
            <div className="group relative rounded-[32px] p-3.5 bg-black/90 border border-white/10 hover:border-transparent shadow-[0_0_35px_rgba(0,0,0,0.8)] hover:shadow-[0_0_60px_rgba(255,255,255,0.18)] transition-all duration-500 cursor-pointer flex flex-col justify-between md:translate-y-8 overflow-visible">
              <AnimatedGeminiBorder
                preset="instagram"
                mode="hover-brighten"
                borderRadius="rounded-[32px]"
                borderWidth="1.5px"
                auraBlur="blur-xl"
                auraOpacity={0.45}
                speedMs={18000}
                angleOffset={120}
              />
              <div className="relative z-10 flex flex-col justify-between h-full">
                {/* Inner 9:16 Screen Frame */}
                <div className="relative w-full aspect-[9/16] rounded-[24px] overflow-hidden bg-gradient-to-b from-[#1a1a1a] via-[#0a0a0a] to-[#000000] border border-white/10 p-6 flex flex-col justify-between shadow-inner group-hover:scale-[1.01] transition-transform duration-500">
                  <FilmGrainCardTexture intensity="heavy" />

                  <div className="relative z-20 flex items-center justify-between">
                    <span className="text-xs font-mono text-white/90 font-semibold drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]">02</span>
                    <span className="text-[10px] font-mono tracking-widest text-white/40 uppercase">16MM GRAIN</span>
                  </div>

                  <h4 className="relative z-20 text-2xl sm:text-3xl font-mazzard text-white tracking-tight uppercase leading-snug">
                    THE HOOK IS EVERYTHING
                  </h4>

                  <div className="relative z-20 flex justify-end">
                    <div className="w-8 h-8 rounded-full bg-white text-black shadow-[0_0_18px_rgba(255,255,255,0.7)] flex items-center justify-center group-hover:scale-110 group-hover:shadow-[0_0_25px_rgba(255,255,255,1)] transition-all">
                      <Play className="w-3.5 h-3.5 fill-current ml-0.5 text-black" />
                    </div>
                  </div>
                </div>

                {/* Bottom Tag Outside Screen */}
                <div className="px-3 pt-3 pb-1 text-[11px] font-mono text-white/50 tracking-wider">
                  REEL • 9:16
                </div>
              </div>
            </div>
          </RevealOnScroll>

          {/* Card 03 */}
          <RevealOnScroll delay={300}>
            <div className="group relative rounded-[32px] p-3.5 bg-black/90 border border-white/10 hover:border-transparent shadow-[0_0_35px_rgba(0,0,0,0.8)] hover:shadow-[0_0_60px_rgba(255,255,255,0.18)] transition-all duration-500 cursor-pointer flex flex-col justify-between overflow-visible">
              <AnimatedGeminiBorder
                preset="gemini"
                mode="hover-brighten"
                borderRadius="rounded-[32px]"
                borderWidth="1.5px"
                auraBlur="blur-xl"
                auraOpacity={0.45}
                speedMs={18000}
                angleOffset={240}
              />
              <div className="relative z-10 flex flex-col justify-between h-full">
                {/* Inner 9:16 Screen Frame */}
                <div className="relative w-full aspect-[9/16] rounded-[24px] overflow-hidden bg-gradient-to-b from-[#181818] via-[#090909] to-[#000000] border border-white/10 p-6 flex flex-col justify-between shadow-inner group-hover:scale-[1.01] transition-transform duration-500">
                  <FilmGrainCardTexture intensity="heavy" />

                  <div className="relative z-20 flex items-center justify-between">
                    <span className="text-xs font-mono text-white/90 font-semibold drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]">03</span>
                    <span className="text-[10px] font-mono tracking-widest text-white/40 uppercase">16MM GRAIN</span>
                  </div>

                  <h4 className="relative z-20 text-2xl sm:text-3xl font-mazzard text-white tracking-tight uppercase leading-snug">
                    CUT FOR THE FEED
                  </h4>

                  <div className="relative z-20 flex justify-end">
                    <div className="w-8 h-8 rounded-full bg-white text-black shadow-[0_0_18px_rgba(255,255,255,0.7)] flex items-center justify-center group-hover:scale-110 group-hover:shadow-[0_0_25px_rgba(255,255,255,1)] transition-all">
                      <Play className="w-3.5 h-3.5 fill-current ml-0.5 text-black" />
                    </div>
                  </div>
                </div>

                {/* Bottom Tag Outside Screen */}
                <div className="px-3 pt-3 pb-1 text-[11px] font-mono text-white/50 tracking-wider">
                  TIKTOK • 9:16
                </div>
              </div>
            </div>
          </RevealOnScroll>
        </div>
      </section>

      {/* SECTION 3: WHY ME */}
      <section id="whyme" className="relative py-28 px-6 md:px-12 z-20 max-w-7xl mx-auto scroll-mt-24 border-t border-white/10">
        <RevealOnScroll className="max-w-3xl mb-16">
          <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-[0.2em] text-transparent bg-clip-text bg-gradient-to-r from-white via-neutral-200 to-neutral-400 mb-3">
            <Zap className="w-3.5 h-3.5 text-white" />
            <span>The Competitive Edge</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-heading font-bold tracking-tight text-white">
            Why Creators Work With <span className="font-brand-rychr">Rychr</span>
          </h2>
          <p className="text-white/60 text-base mt-3 font-normal">
            Video editing isn’t just assembling clips. It's viewer psychology, pacing mathematics, and storytelling in After Effects that keeps people glued until the last frame.
          </p>
        </RevealOnScroll>

        {/* 6 Core Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <RevealOnScroll delay={0}>
            <div className="group relative rounded-3xl p-8 bg-[#050505]/90 backdrop-blur-xl border border-white/10 hover:border-transparent shadow-[0_0_30px_rgba(0,0,0,0.8)] transition-all h-full overflow-visible">
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
                <div className="w-12 h-12 rounded-2xl bg-white/[0.06] border border-white/20 flex items-center justify-center text-white mb-6 group-hover:scale-105 group-hover:border-white/50 group-hover:bg-white/12 shadow-[0_0_20px_rgba(255,255,255,0.12)] transition-all">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-heading font-bold text-white mb-2">1. The 1.8s Hook Formula</h3>
                <p className="text-sm text-white/65 leading-relaxed font-normal">
                  Every video dies or thrives in the first 3 seconds. I engineer curiosity loops, sound stingers, and visual anchors so your viewers never scroll away.
                </p>
              </div>
            </div>
          </RevealOnScroll>

          <RevealOnScroll delay={100}>
            <div className="group relative rounded-3xl p-8 bg-[#050505]/90 backdrop-blur-xl border border-white/10 hover:border-transparent shadow-[0_0_30px_rgba(0,0,0,0.8)] transition-all h-full overflow-visible">
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
                <div className="w-12 h-12 rounded-2xl bg-white/[0.06] border border-white/20 flex items-center justify-center text-white mb-6 group-hover:scale-105 group-hover:border-white/50 group-hover:bg-white/12 shadow-[0_0_20px_rgba(255,255,255,0.12)] transition-all">
                  <Layers className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-heading font-bold text-white mb-2">2. Adaptable to Any Style</h3>
                <p className="text-sm text-white/65 leading-relaxed font-normal">
                  Talking head, documentary, SaaS commercial, or gaming: I match your channel tone, brand voice, and pacing rhythm flawlessly.
                </p>
              </div>
            </div>
          </RevealOnScroll>

          <RevealOnScroll delay={200}>
            <div className="group relative rounded-3xl p-8 bg-[#050505]/90 backdrop-blur-xl border border-white/10 hover:border-transparent shadow-[0_0_30px_rgba(0,0,0,0.8)] transition-all h-full overflow-visible">
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
                <div className="w-12 h-12 rounded-2xl bg-white/[0.06] border border-white/20 flex items-center justify-center text-white mb-6 group-hover:scale-105 group-hover:border-white/50 group-hover:bg-white/12 shadow-[0_0_20px_rgba(255,255,255,0.12)] transition-all">
                  <Volume2 className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-heading font-bold text-white mb-2">3. 5-Layer Soundscapes</h3>
                <p className="text-sm text-white/65 leading-relaxed font-normal">
                  70% of perceived quality is audio. Every cut is paired with custom risers, whooshes, sub-drops, and atmospheric foley to deliver high-impact punch.
                </p>
              </div>
            </div>
          </RevealOnScroll>

          <RevealOnScroll delay={300}>
            <div className="group relative rounded-3xl p-8 bg-[#050505]/90 backdrop-blur-xl border border-white/10 hover:border-transparent shadow-[0_0_30px_rgba(0,0,0,0.8)] transition-all h-full overflow-visible">
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
                <div className="w-12 h-12 rounded-2xl bg-white/[0.06] border border-white/20 flex items-center justify-center text-white mb-6 group-hover:scale-105 group-hover:border-white/50 group-hover:bg-white/12 shadow-[0_0_20px_rgba(255,255,255,0.12)] transition-all">
                  <Film className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-heading font-bold text-white mb-2">4. 100% After Effects</h3>
                <p className="text-sm text-white/65 leading-relaxed font-normal">
                  Edited exclusively in After Effects. Custom motion graphics, surgical speed ramping, keyframe curves, and 3D camera sweeps.
                </p>
              </div>
            </div>
          </RevealOnScroll>

          <RevealOnScroll delay={400}>
            <div className="group relative rounded-3xl p-8 bg-[#050505]/90 backdrop-blur-xl border border-white/10 hover:border-transparent shadow-[0_0_30px_rgba(0,0,0,0.8)] transition-all h-full overflow-visible">
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
                <div className="w-12 h-12 rounded-2xl bg-white/[0.06] border border-white/20 flex items-center justify-center text-white mb-6 group-hover:scale-105 group-hover:border-white/50 group-hover:bg-white/12 shadow-[0_0_20px_rgba(255,255,255,0.12)] transition-all">
                  <Zap className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-heading font-bold text-white mb-2">5. 24–48h Turnaround</h3>
                <p className="text-sm text-white/65 leading-relaxed font-normal">
                  Content calendars move fast. I deliver lightning-fast first drafts, respect deadlines, and communicate transparently through Discord.
                </p>
              </div>
            </div>
          </RevealOnScroll>

          <RevealOnScroll delay={500}>
            <div className="group relative rounded-3xl p-8 bg-[#050505]/90 backdrop-blur-xl border border-white/10 hover:border-transparent shadow-[0_0_30px_rgba(0,0,0,0.8)] transition-all h-full overflow-visible">
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
                <div className="w-12 h-12 rounded-2xl bg-white/[0.06] border border-white/20 flex items-center justify-center text-white mb-6 group-hover:scale-105 group-hover:border-white/50 group-hover:bg-white/12 shadow-[0_0_20px_rgba(255,255,255,0.12)] transition-all">
                  <Check className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-heading font-bold text-white mb-2">6. 3 Revisions Max Policy</h3>
                <p className="text-sm text-white/65 leading-relaxed font-normal">
                  Clear, structured feedback rounds via timestamped notes to finalize the cut efficiently and protect creative quality.
                </p>
              </div>
            </div>
          </RevealOnScroll>
        </div>
      </section>

      {/* SECTION 4: ABOUT RYCHR */}
      <section id="about" className="relative py-28 px-6 md:px-12 z-20 max-w-7xl mx-auto scroll-mt-24 border-t border-white/10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
          <RevealOnScroll className="md:col-span-5 relative" delay={100}>
            {/* Glowing Motion Showcase Card - Full Animation in Monochromatic Grayscale */}
            <div className="group relative rounded-3xl overflow-visible aspect-square bg-[#050505] border border-white/15 hover:border-transparent shadow-[0_0_60px_rgba(255,255,255,0.15)] transition-all">
              {/* Animated Gemini Outline & Outer Aura */}
              <AnimatedGeminiBorder
                preset="gemini"
                mode="hover-brighten"
                borderRadius="rounded-3xl"
                borderWidth="1.5px"
                auraBlur="blur-xl"
                auraOpacity={0.45}
                speedMs={18000}
                angleOffset={45}
              />

              {/* Full-Card Looping After Effects Video Animation (15 FPS, Monochromatic) */}
              <div className="relative w-full h-full rounded-3xl overflow-hidden bg-black z-10">
                <video
                  src="/assets/aistudio/export_2_-_15_fps_dc6d6217.mp4"
                  poster="/assets/aistudio/image_5a1c3c4a.png"
                  autoPlay
                  loop
                  muted
                  playsInline
                  disablePictureInPicture
                  className="w-full h-full object-cover scale-[1.01] grayscale contrast-125 pointer-events-none select-none"
                />

                {/* Noticeable Film Grain Overlay over Video */}
                <FilmGrainCardTexture intensity="standard" />

                {/* Floating "Available Now" Status Badge in Top Right */}
                <div className="absolute top-5 right-5 z-20 pointer-events-none">
                  <span className="px-3.5 py-1.5 rounded-full text-xs font-mono bg-black/80 backdrop-blur-md text-white border border-white/20 shadow-[0_4px_20px_rgba(0,0,0,0.8)]">
                    Available Now
                  </span>
                </div>

                {/* Floating "Taking on Select Creators" Glass Pill in Bottom Left */}
                <div className="absolute bottom-5 left-5 z-20 pointer-events-none">
                  <div className="px-3.5 py-1.5 rounded-full bg-black/80 backdrop-blur-md border border-white/20 text-[11px] font-mono text-white flex items-center gap-1.5 shadow-[0_4px_20px_rgba(0,0,0,0.8)]">
                    <Check className="w-3.5 h-3.5 text-white" />
                    <span>Taking on Select Creators</span>
                  </div>
                </div>
              </div>
            </div>
          </RevealOnScroll>

          <RevealOnScroll className="md:col-span-7" delay={200}>
            {/* Passage Glass Card with Animated Gemini Outline */}
            <div className="group relative rounded-3xl p-7 sm:p-9 md:p-10 bg-[#050505]/95 border border-white/10 hover:border-transparent backdrop-blur-xl shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-visible transition-all flex flex-col justify-between">
              <AnimatedGeminiBorder
                preset="cyan-purple"
                mode="hover-brighten"
                borderRadius="rounded-3xl"
                borderWidth="1.5px"
                auraBlur="blur-xl"
                auraOpacity={0.35}
                speedMs={20000}
                angleOffset={135}
              />

              <div className="relative z-10">
                <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-[0.2em] text-transparent bg-clip-text bg-gradient-to-r from-white via-neutral-200 to-neutral-400 mb-3">
                  <span>About the editor</span>
                </div>

                <div className="flex flex-wrap items-baseline gap-2.5 sm:gap-3 mb-5">
                  <h2 className="text-4xl sm:text-5xl font-mazzard font-bold text-white tracking-tight">
                    I'm Ray.
                  </h2>
                  <span className="font-brand-rychr text-2xl sm:text-3xl text-transparent bg-clip-text bg-gradient-to-r from-white via-neutral-200 to-neutral-400 font-bold">
                    (Rychr)
                  </span>
                </div>

                <div className="space-y-4 text-sm sm:text-base text-white/70 leading-relaxed font-normal">
                  <p>
                    I’ve spent the last 3+ years deep in <strong className="text-white">Adobe After Effects</strong>, engineering and cutting 50+ high-retention videos for creators across YouTube, Reels, and TikTok. Video editing isn't just trimming fat—it's pacing mathematics, auditory immersion, and keeping a viewer hooked from frame zero.
                  </p>
                  <p>
                    Whether your channel runs on fast-paced gaming cuts, documentary storytelling, clean talking-head essays, or viral vertical hooks: <strong className="text-white">I adapt completely to your exact style and brand voice.</strong> No generic cookie-cutter templates—every cut is built from scratch to match your channel rhythm.
                  </p>
                  <p>
                    From surgical keyframing, whip zooms, and kinetic captions to 5-layer sound design with atmospheric risers and sub-drops: you bring the vision and raw footage, I engineer the cut that turns casual scrollers into loyal subscribers.
                  </p>
                </div>

                {/* 3 Small Stat Cards with Animated Gemini Outlines */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mt-8 pt-7 border-t border-white/10">
                  {/* Card 1: 3+ years experience */}
                  <div className="group/stat relative rounded-2xl p-4 bg-black/90 border border-white/10 hover:border-transparent transition-all overflow-visible shadow-lg flex flex-col justify-between">
                    <AnimatedGeminiBorder
                      preset="discord"
                      mode="hover-brighten"
                      borderRadius="rounded-2xl"
                      borderWidth="1.2px"
                      auraBlur="blur-md"
                      auraOpacity={0.65}
                      speedMs={14000}
                      angleOffset={30}
                    />
                    <div className="relative z-10">
                      <div className="text-xl sm:text-2xl font-mazzard font-bold text-white tracking-tight group-hover/stat:text-white transition-colors">
                        3+ Years
                      </div>
                      <div className="text-xs font-mono text-white/55 mt-1 tracking-wider uppercase">
                        Experience
                      </div>
                    </div>
                  </div>

                  {/* Card 2: 50+ videos edited */}
                  <div className="group/stat relative rounded-2xl p-4 bg-black/90 border border-white/10 hover:border-transparent transition-all overflow-visible shadow-lg flex flex-col justify-between">
                    <AnimatedGeminiBorder
                      preset="instagram"
                      mode="hover-brighten"
                      borderRadius="rounded-2xl"
                      borderWidth="1.2px"
                      auraBlur="blur-md"
                      auraOpacity={0.65}
                      speedMs={14000}
                      angleOffset={150}
                    />
                    <div className="relative z-10">
                      <div className="text-xl sm:text-2xl font-mazzard font-bold text-white tracking-tight group-hover/stat:text-white transition-colors">
                        50+ Videos
                      </div>
                      <div className="text-xs font-mono text-white/55 mt-1 tracking-wider uppercase">
                        Edited
                      </div>
                    </div>
                  </div>

                  {/* Card 3: turnaround time-depends on project */}
                  <div className="group/stat relative rounded-2xl p-4 bg-black/90 border border-white/10 hover:border-transparent transition-all overflow-visible shadow-lg flex flex-col justify-between">
                    <AnimatedGeminiBorder
                      preset="gmail"
                      mode="hover-brighten"
                      borderRadius="rounded-2xl"
                      borderWidth="1.2px"
                      auraBlur="blur-md"
                      auraOpacity={0.65}
                      speedMs={14000}
                      angleOffset={270}
                    />
                    <div className="relative z-10">
                      <div className="text-xs font-mono text-white/50 tracking-wider uppercase mb-1">
                        Turnaround Time
                      </div>
                      <div className="text-sm sm:text-[15px] font-mazzard font-semibold text-white leading-snug group-hover/stat:text-white transition-colors">
                        Depends on project
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </RevealOnScroll>
        </div>
      </section>

      {/* SECTION 5: FAQ */}
      <section id="faq" className="relative py-28 px-6 md:px-12 z-20 max-w-5xl mx-auto scroll-mt-24 border-t border-white/10">
        <RevealOnScroll className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-[0.2em] text-transparent bg-clip-text bg-gradient-to-r from-white via-neutral-200 to-neutral-400 mb-3">
            <span>Got Questions?</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-mazzard tracking-tight text-white">
            Frequently Asked Questions
          </h2>
          <p className="text-white/60 text-base mt-3 font-normal">
            Everything you need to know about turnaround times, revisions, software, and payment terms.
          </p>
        </RevealOnScroll>

        {/* Glass Accordions in neutral dark glass */}
        <div className="space-y-4">
          {FAQS.map((faq, index) => {
            const isOpen = activeFaq === index;
            return (
              <RevealOnScroll key={index} delay={index * 70}>
                <div
                  className="group relative rounded-2xl bg-[#050505]/90 backdrop-blur-xl border border-white/10 hover:border-transparent transition-all overflow-visible shadow-lg"
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
                      onClick={() => setActiveFaq(isOpen ? null : index)}
                      className="w-full px-6 py-5 flex items-center justify-between text-left gap-4 cursor-pointer"
                    >
                      <span className="text-base md:text-lg font-mazzard text-white">
                        {faq.question}
                      </span>
                      <div className={`w-8 h-8 rounded-full bg-white/[0.05] border border-white/15 flex items-center justify-center shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180 bg-white/20' : ''}`}>
                        <ChevronDown className="w-4 h-4 text-white" />
                      </div>
                    </button>

                    {isOpen && (
                      <div className="px-6 pb-6 pt-1 text-sm md:text-base text-white/70 leading-relaxed border-t border-white/10 font-normal">
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
          <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-[0.2em] text-transparent bg-clip-text bg-gradient-to-r from-white via-neutral-200 to-neutral-400 mb-3">
            <span>Direct Channels</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-mazzard tracking-tight text-white">
            Let's Make High-Retention Edits
          </h2>
          <p className="text-white/60 text-base mt-3 font-normal">
            Ready to upgrade your videos? Reach out directly via Gmail, Discord, or Instagram to discuss your vision, rates, and test edits.
          </p>
        </RevealOnScroll>

        {/* 3 Explicit Social Cards with Asymmetric Animated Gemini Outlines */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {/* Discord: @ray_christo (Monochromatic Pure White & Silver) */}
          <RevealOnScroll delay={0}>
            <div className="relative rounded-3xl p-6 bg-[#050505]/95 backdrop-blur-xl border border-white/10 shadow-[0_0_35px_rgba(0,0,0,0.8)] overflow-visible flex flex-col justify-between h-full group">
              {/* Animated Gemini Outline on Card */}
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
                <div className="w-12 h-12 rounded-2xl bg-white/[0.06] border border-white/20 flex items-center justify-center text-white mb-5 shadow-[0_0_20px_rgba(255,255,255,0.12)] group-hover:scale-105 transition-transform">
                  <MessageSquare className="w-6 h-6 text-white" />
                </div>
                <h4 className="text-lg font-mazzard text-white mb-1">Discord</h4>
                <p className="text-xs text-white/50 mb-4">Fast messaging & file reviews</p>
                <div className="p-3 rounded-xl bg-black border border-white/20 font-mono text-sm text-white break-all select-all font-semibold shadow-[inset_0_1px_12px_rgba(255,255,255,0.06)]">
                  @ray_christo
                </div>
              </div>

              <div className="relative z-10 mt-6 flex gap-2">
                <button
                  onClick={() => handleCopy('@ray_christo', 'discord')}
                  className="relative flex-1 py-3 px-4 rounded-xl bg-black/90 hover:bg-black text-white font-mazzard text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-[0_0_25px_rgba(255,255,255,0.2)] hover:shadow-[0_0_35px_rgba(255,255,255,0.45)] group/btn overflow-visible active:scale-[0.98]"
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

          {/* Instagram: rychr.prod (Monochromatic Pure White & Silver) */}
          <RevealOnScroll delay={120}>
            <div className="relative rounded-3xl p-6 bg-[#050505]/95 backdrop-blur-xl border border-white/10 shadow-[0_0_35px_rgba(0,0,0,0.8)] overflow-visible flex flex-col justify-between h-full group">
              {/* Animated Gemini Outline on Card */}
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
                <div className="w-12 h-12 rounded-2xl bg-white/[0.06] border border-white/20 flex items-center justify-center text-white mb-5 shadow-[0_0_20px_rgba(255,255,255,0.12)] group-hover:scale-105 transition-transform">
                  <Instagram className="w-6 h-6 text-white" />
                </div>
                <h4 className="text-lg font-mazzard text-white mb-1">Instagram</h4>
                <p className="text-xs text-white/50 mb-4">Direct messages & reel edits</p>
                <div className="p-3 rounded-xl bg-black border border-white/20 font-mono text-sm text-white break-all select-all font-semibold shadow-[inset_0_1px_12px_rgba(255,255,255,0.06)]">
                  rychr.prod
                </div>
              </div>

              <div className="relative z-10 mt-6 flex gap-2">
                <a
                  href="https://instagram.com/rychr.prod"
                  target="_blank"
                  rel="noreferrer"
                  className="relative flex-1 py-3 px-4 rounded-xl bg-black/90 hover:bg-black text-white font-mazzard text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-[0_0_25px_rgba(255,255,255,0.2)] hover:shadow-[0_0_35px_rgba(255,255,255,0.45)] group/btn overflow-visible active:scale-[0.98]"
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
                  onClick={() => handleCopy('rychr.prod', 'instagram')}
                  className="relative p-3 rounded-xl bg-black/85 hover:bg-black text-white border border-white/15 hover:border-white/40 transition-all cursor-pointer hover:shadow-[0_0_20px_rgba(255,255,255,0.2)] active:scale-95"
                  title="Copy Instagram Handle"
                >
                  {copiedSocial === 'instagram' ? <Check className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4 text-white/70" />}
                </button>
              </div>
            </div>
          </RevealOnScroll>

          {/* Gmail: rychr.edits@gmail.com (Monochromatic Pure White & Silver) */}
          <RevealOnScroll delay={240}>
            <div className="relative rounded-3xl p-6 bg-[#050505]/95 backdrop-blur-xl border border-white/10 shadow-[0_0_35px_rgba(0,0,0,0.8)] overflow-visible flex flex-col justify-between h-full group">
              {/* Animated Gemini Outline on Card */}
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
                <div className="w-12 h-12 rounded-2xl bg-white/[0.06] border border-white/20 flex items-center justify-center text-white mb-5 shadow-[0_0_20px_rgba(255,255,255,0.12)] group-hover:scale-105 transition-transform">
                  <Mail className="w-6 h-6 text-white" />
                </div>
                <h4 className="text-lg font-mazzard text-white mb-1">Gmail</h4>
                <p className="text-xs text-white/50 mb-4">Official business inquiries</p>
                <div className="p-3 rounded-xl bg-black border border-white/20 font-mono text-xs text-white break-all select-all font-semibold shadow-[inset_0_1px_12px_rgba(255,255,255,0.06)]">
                  rychr.edits@gmail.com
                </div>
              </div>

              <div className="relative z-10 mt-6 flex gap-2">
                <a
                  href="https://mail.google.com/mail/?view=cm&fs=1&to=rychr.edits@gmail.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative flex-1 py-3 px-4 rounded-xl bg-black/90 hover:bg-black text-white font-mazzard text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-[0_0_25px_rgba(255,255,255,0.2)] hover:shadow-[0_0_35px_rgba(255,255,255,0.45)] group/btn overflow-visible active:scale-[0.98]"
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
                  onClick={() => handleCopy('rychr.edits@gmail.com', 'email')}
                  className="relative p-3 rounded-xl bg-black/85 hover:bg-black text-white border border-white/15 hover:border-white/40 transition-all cursor-pointer hover:shadow-[0_0_20px_rgba(255,255,255,0.2)] active:scale-95"
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
          <div className="group relative rounded-3xl p-7 sm:p-9 md:p-10 bg-[#050505]/95 backdrop-blur-xl border border-white/15 shadow-[0_0_50px_rgba(0,0,0,0.85)] overflow-visible">
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
                <div>
                  <div className="text-xs uppercase font-mono tracking-[0.2em] text-transparent bg-clip-text bg-gradient-to-r from-white via-neutral-200 to-neutral-400 mb-1">
                    Send Direct Message
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-mazzard font-bold text-white tracking-tight">
                    Project Inquiry & Booking
                  </h3>
                </div>
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/20 text-xs font-mono text-white/80 shrink-0 self-start sm:self-auto">
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
                    onClick={() => setFormStatus('idle')}
                    className="px-6 py-2.5 rounded-xl bg-white text-black font-semibold text-xs hover:bg-neutral-200 transition-all cursor-pointer shadow-md"
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
                    onClick={() => setFormStatus('idle')}
                    className="px-6 py-2.5 rounded-xl bg-white text-black font-semibold text-xs hover:bg-neutral-200 transition-all cursor-pointer shadow-md"
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
                        className="px-3 py-1.5 rounded-lg bg-white text-black text-xs font-semibold hover:bg-neutral-200 transition-all shrink-0"
                      >
                        Open Gmail
                      </a>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-mono uppercase tracking-wider text-white/70 mb-2">
                        Your Name / Channel Name <span className="text-white">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Liam | Apex Creator"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-3.5 rounded-xl bg-black border border-white/20 text-white placeholder-white/30 text-sm focus:outline-none focus:border-white focus:ring-1 focus:ring-white/40 transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-mono uppercase tracking-wider text-white/70 mb-2">
                        Your Email or Discord Tag <span className="text-white">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. you@creator.com or @discord_tag"
                        value={formData.contact}
                        onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                        className="w-full px-4 py-3.5 rounded-xl bg-black border border-white/20 text-white placeholder-white/30 text-sm focus:outline-none focus:border-white focus:ring-1 focus:ring-white/40 transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-white/70 mb-2">
                      What type of video editing do you need?
                    </label>
                    <select
                      value={formData.service}
                      onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                      className="w-full px-4 py-3.5 rounded-xl bg-black border border-white/20 text-white text-sm focus:outline-none focus:border-white focus:ring-1 focus:ring-white/40 transition-all"
                    >
                      <option value="YouTube Long-form (Talking Head / Documentary / Storytelling)">
                        YouTube Long-form (Talking Head / Documentary / Gaming)
                      </option>
                      <option value="Shorts & Reels High-Retention Batch (9:16)">
                        Shorts & Reels High-Retention Batch (9:16)
                      </option>
                      <option value="Commercial / SaaS / Product Launch Edit">
                        Commercial / SaaS / Product Launch Edit
                      </option>
                      <option value="Full-Time Dedicated Monthly Retainer">
                        Full-Time Dedicated Monthly Retainer
                      </option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-white/70 mb-2">
                      Project Details, Footage Links & Deadlines <span className="text-white">*</span>
                    </label>
                    <textarea
                      rows={4}
                      required
                      placeholder="Share your raw footage length, turnaround deadline, channel link, and any reference editing styles you want me to match..."
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full px-4 py-3.5 rounded-xl bg-black border border-white/20 text-white placeholder-white/30 text-sm focus:outline-none focus:border-white focus:ring-1 focus:ring-white/40 transition-all resize-none font-normal"
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={formStatus === 'submitting'}
                      className="relative w-full py-4 rounded-xl bg-black/90 hover:bg-black text-white font-semibold text-sm transition-all duration-300 shadow-[0_0_30px_rgba(255,255,255,0.25)] hover:shadow-[0_0_45px_rgba(255,255,255,0.5)] cursor-pointer overflow-visible active:scale-[0.99] group/btn disabled:opacity-60 disabled:cursor-not-allowed"
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
          <div className="group relative rounded-3xl p-7 sm:p-9 md:p-10 bg-[#050505]/95 backdrop-blur-xl border border-white/15 shadow-[0_0_50px_rgba(0,0,0,0.85)] overflow-visible">
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
                <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/25 flex items-center justify-center text-white shadow-[0_0_20px_rgba(255,255,255,0.2)] shrink-0">
                  <CreditCard className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="text-xs uppercase font-mono tracking-[0.2em] text-transparent bg-clip-text bg-gradient-to-r from-white via-neutral-200 to-neutral-400">
                    Payment Terms & Invoicing
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-mazzard font-bold text-white tracking-tight mt-0.5">
                    Accepted Payment Channels
                  </h3>
                </div>
              </div>

              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/20 text-xs font-mono text-white/90 shadow-sm shrink-0">
                <ShieldCheck className="w-4 h-4 text-white" />
                <span>Verified Creator Invoicing</span>
              </div>
            </div>

            {/* Payment Method Cards */}
            <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
              {/* Method 1: Direct Bank Transfer */}
              <div className="p-5 sm:p-6 rounded-2xl bg-black/85 border border-white/15 shadow-inner flex flex-col justify-between group/pm hover:border-white/40 transition-colors">
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
              <div className="p-5 sm:p-6 rounded-2xl bg-black/85 border border-white/15 shadow-inner flex flex-col justify-between group/pm hover:border-white/40 transition-colors">
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
              <p>
                Need custom milestones, PayPal, international escrow, or alternative payment options? Let's discuss directly.
              </p>
              <a
                href="https://mail.google.com/mail/?view=cm&fs=1&to=rychr.edits@gmail.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:underline font-mono text-xs font-semibold shrink-0"
              >
                rychr.edits@gmail.com →
              </a>
            </div>
          </div>
        </RevealOnScroll>
      </section>

      {/* FOOTER */}
      <footer className="relative py-12 px-6 border-t border-white/10 z-20 text-center text-xs text-white/40 font-mono">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
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
            <a href="#work" className="hover:text-white transition-colors">Work</a>
            <a href="#shorts" className="hover:text-white transition-colors">Shorts</a>
            <a href="#whyme" className="hover:text-white transition-colors">Why me</a>
            <a href="#about" className="hover:text-white transition-colors">About</a>
            <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
            <a href="#contact" className="hover:text-white transition-colors">Contact</a>
          </div>

          <span>© {new Date().getFullYear()} <span className="font-brand-rychr font-bold text-white/70">Rychr</span>. All rights reserved.</span>
        </div>
      </footer>

      {/* VIDEO PREVIEW MODAL */}
      {activeVideoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-10 bg-black/90 backdrop-blur-2xl">
          <div className="relative w-full max-w-4xl rounded-3xl p-6 bg-[#050505] border border-white/15 shadow-[0_0_100px_rgba(0,0,0,0.9)] overflow-hidden">
            <button
              onClick={() => setActiveVideoModal(null)}
              className="absolute top-5 right-5 z-20 p-2.5 rounded-full bg-black/60 hover:bg-white hover:text-black text-white border border-white/20 transition-all cursor-pointer"
            >
              ✕
            </button>

            <div className="relative w-full rounded-2xl overflow-hidden bg-black mb-6 aspect-video">
              <FilmGrainCardTexture intensity="heavy" />
              <div className={`relative z-20 w-full h-full flex flex-col items-center justify-center bg-gradient-to-br ${activeVideoModal.gradient} p-6 text-center`}>
                <div className="w-20 h-20 rounded-full bg-white/10 border border-white/25 backdrop-blur-md flex items-center justify-center mb-4 text-white shadow-[0_0_35px_rgba(255,255,255,0.35)]">
                  <Play className="w-8 h-8 fill-current ml-1 text-white" />
                </div>
                <h4 className="text-2xl font-heading font-bold text-white mb-2">
                  {activeVideoModal.title}
                </h4>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-4 border-t border-white/10">
              <div>
                <h3 className="text-xl font-heading font-bold text-white">
                  {activeVideoModal.title}
                </h3>
              </div>

              <a
                href="#contact"
                onClick={() => setActiveVideoModal(null)}
                className="relative px-6 py-3 rounded-xl bg-black/90 hover:bg-black text-white font-semibold text-xs transition-all shrink-0 shadow-[0_0_25px_rgba(255,255,255,0.25)] hover:shadow-[0_0_35px_rgba(255,255,255,0.5)] overflow-visible group/btn active:scale-95"
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
                  Hire <span className="font-brand-rychr font-bold text-white">Rychr</span> for Similar Edit
                </span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
