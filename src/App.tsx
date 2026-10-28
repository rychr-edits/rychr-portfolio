import React, { useState, useEffect } from 'react';
import { CosmicHorizonBackground } from './CosmicHorizonBackground.tsx';
import { RevealOnScroll } from './RevealOnScroll.tsx';
import { CalmNavbarBorder } from './CalmNavbarBorder.tsx';
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
    gradient: 'from-[#141417] via-[#0a0a0c] to-[#000000]',
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
    gradient: 'from-[#161619] via-[#0a0a0d] to-[#000000]',
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
    gradient: 'from-[#141418] via-[#09090c] to-[#000000]',
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
    gradient: 'from-[#16161a] via-[#0a0a0e] to-[#000000]',
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
  const [contactSubmitted, setContactSubmitted] = useState(false);
  const [contactForm, setContactForm] = useState({
    name: '',
    emailOrDiscord: '',
    service: 'YouTube Long-form',
    message: '',
  });

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
    <div className="relative min-h-screen bg-black text-white font-['Inter',sans-serif] selection:bg-blue-500/30 overflow-x-hidden">
      {/* PROCEDURAL PLANET HORIZON BACKGROUND (Top horizon + Underside on scroll to bottom + Glowing Cursor with Stars) */}
      <CosmicHorizonBackground scrollY={scrollY} />

      {/* PERSISTENT HEADER NAVBAR */}
      <header className="fixed top-0 left-0 right-0 z-50 px-4 md:px-10 py-5 transition-all duration-300">
        <div className="relative max-w-6xl mx-auto flex items-center justify-between px-6 py-3.5 rounded-2xl bg-black/85 backdrop-blur-xl border border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.9)]">
          {/* Calm, slow subtle dual parallel glowing border covering all sides of the rounded tab */}
          <CalmNavbarBorder />

          {/* Top Left: Crescent Moon Logo */}
          <a href="#" className="flex items-center gap-3 group">
            <div className="relative w-8 h-8 rounded-lg overflow-hidden border border-white/15 bg-black flex items-center justify-center shadow-[0_0_15px_rgba(56,189,248,0.2)] group-hover:shadow-[0_0_22px_rgba(56,189,248,0.4)] transition-all">
              <img
                src="/assets/aistudio/image_5a1c3c4a.png"
                alt="Crescent Moon"
                className="w-full h-full object-cover scale-110"
              />
            </div>
            <span className="font-brand-rychr text-xl tracking-tight text-white group-hover:text-sky-300 transition-colors">
              Rychr
            </span>
          </a>

          {/* Center Tabs: Work, Shorts, Why me, About, FAQ */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-white/70">
            <a href="#work" className="hover:text-sky-400 transition-colors">
              Work
            </a>
            <a href="#shorts" className="hover:text-sky-400 transition-colors">
              Shorts
            </a>
            <a href="#whyme" className="hover:text-sky-400 transition-colors">
              Why me
            </a>
            <a href="#about" className="hover:text-sky-400 transition-colors">
              About
            </a>
            <a href="#faq" className="hover:text-sky-400 transition-colors">
              FAQ
            </a>
          </nav>

          {/* Right Action: Let's Talk CTA */}
          <div className="flex items-center gap-3">
            <a
              href="#contact"
              className="px-4 py-2 rounded-xl text-xs md:text-sm font-semibold bg-white text-black hover:bg-sky-400 hover:text-black shadow-[0_0_25px_rgba(56,189,248,0.25)] hover:shadow-[0_0_35px_rgba(56,189,248,0.5)] transition-all active:scale-95"
            >
              Let's Talk
            </a>
          </div>
        </div>
      </header>

      {/* HERO SECTION (Text floats cleanly above the planet horizon; description is NEVER hidden!) */}
      <section className="relative min-h-[95vh] flex flex-col justify-center items-center px-6 pt-32 pb-20 z-20 pointer-events-auto">
        <div className="max-w-4xl mx-auto text-center flex flex-col items-center">
          {/* Status Badge in signature crisp style */}
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/[0.04] border border-white/15 backdrop-blur-md mb-8 text-xs font-mono text-sky-200 shadow-[0_0_20px_rgba(56,189,248,0.15)]">
            <span className="w-2 h-2 rounded-full bg-sky-400 shadow-[0_0_8px_#38bdf8]" />
            <span className="tracking-wide">Available for New Projects</span>
          </div>

          {/* Main Title: Rychr strictly in Mazzard M Black */}
          <h1 className="text-7xl sm:text-8xl md:text-9xl font-brand-rychr tracking-tight mb-4 text-white drop-shadow-[0_10px_40px_rgba(56,189,248,0.25)]">
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
              className="px-8 py-4 rounded-xl font-semibold text-sm md:text-base bg-white text-black hover:bg-sky-400 hover:text-black shadow-[0_0_35px_rgba(56,189,248,0.3)] hover:shadow-[0_0_45px_rgba(56,189,248,0.6)] transition-all duration-300 flex items-center gap-2 group cursor-pointer"
            >
              <span>Explore My Work</span>
              <ChevronDown className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
            </a>

            <a
              href="#contact"
              className="px-7 py-4 rounded-xl font-semibold text-sm md:text-base bg-black/80 border border-white/20 text-white hover:text-sky-300 hover:border-sky-400/50 backdrop-blur-md transition-all duration-300 hover:shadow-[0_0_25px_rgba(56,189,248,0.2)]"
            >
              Let's Talk
            </a>
          </div>

          {/* Indicator: text "scroll" and glowing line that animates downward */}
          <div className="mt-14 flex flex-col items-center gap-2 select-none pointer-events-none">
            <span className="text-[11px] uppercase tracking-[0.35em] font-mono text-sky-400/60 font-medium">
              scroll
            </span>
            <div className="w-[1.5px] h-12 bg-blue-500/20 relative overflow-hidden rounded-full">
              <div className="absolute top-0 left-0 w-full h-5 bg-gradient-to-b from-transparent via-sky-400 to-transparent shadow-[0_0_8px_#38bdf8] animate-scrollIndicator" />
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 1: WORK (EXACT ASYMMETRICAL 4-CARD LAYOUT FROM SCREENSHOT, EXCLUSIVELY IN COSMIC BLUE) */}
      <section id="work" className="relative py-28 px-6 md:px-12 z-20 max-w-7xl mx-auto scroll-mt-24">
        {/* Subtle grid texture overlay matching reference layout */}
        <div className="absolute inset-0 bg-[radial-gradient(rgba(56,189,248,0.06)_1px,transparent_1px)] [background-size:28px_28px] pointer-events-none rounded-3xl" />

        <RevealOnScroll className="mb-14 relative z-10">
          <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-[0.2em] text-sky-400 mb-3">
            <Film className="w-3.5 h-3.5" />
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
                className="group relative rounded-[28px] md:rounded-[34px] bg-black/90 border border-white/10 hover:border-sky-400/50 p-5 sm:p-6 md:p-7 backdrop-blur-md shadow-[0_0_40px_rgba(0,0,0,0.8)] hover:shadow-[0_0_60px_rgba(56,189,248,0.28)] transition-all duration-500 flex flex-col justify-between cursor-pointer h-full"
              >
                {/* Inner 16:9 Video Box with Numeral & Centered Play Button */}
                <div
                  className={`relative aspect-video w-full rounded-2xl md:rounded-3xl overflow-hidden bg-gradient-to-br ${project.gradient} border border-white/10 flex items-center justify-center p-4 shadow-inner mb-5 group-hover:border-sky-400/35 transition-all duration-500`}
                >
                  {/* Numeral inside top-left */}
                  <span className="absolute top-4 left-4 text-xs font-mono font-medium text-sky-200/70 tracking-wider">
                    {project.num}
                  </span>

                  {/* Central Glowing Play Button */}
                  <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-white/10 border border-white/25 backdrop-blur-md flex items-center justify-center text-white group-hover:scale-110 group-hover:bg-white group-hover:text-black transition-all shadow-[0_0_25px_rgba(56,189,248,0.25)]">
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

                  {/* Blue / Cyan Accent Tag */}
                  <div className="text-xs font-mono font-bold tracking-wider text-sky-400 uppercase mb-1.5">
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
            </RevealOnScroll>
          ))}
        </div>
      </section>

      {/* SECTION 2: SHORTS / VERTICAL REELS (EXACT LAYOUT FROM IMAGE_B2BF8C7B.PNG WITH STAGGERED 3-CARD COMPOSITION) */}
      <section id="shorts" className="relative py-28 px-6 md:px-12 z-20 max-w-7xl mx-auto scroll-mt-24 border-t border-white/10">
        {/* Header from image_b2bf8c7b.png: Left tag + Split headline, Right description */}
        <RevealOnScroll className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-16">
          <div>
            <div className="text-xs font-mono tracking-[0.2em] text-sky-400 uppercase mb-4">
              02 / SHORTS & REELS
            </div>
            <h2 className="text-5xl sm:text-6xl md:text-7xl font-mazzard tracking-tight text-white leading-[0.95]">
              Small screen.<br />
              <span className="text-sky-400 drop-shadow-[0_0_30px_rgba(56,189,248,0.35)]">
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
            <div className="group relative rounded-[32px] p-3.5 bg-black/90 border border-white/10 hover:border-sky-400/50 shadow-[0_0_35px_rgba(0,0,0,0.8)] hover:shadow-[0_0_60px_rgba(56,189,248,0.35)] transition-all duration-500 cursor-pointer flex flex-col justify-between">
              {/* Inner 9:16 Screen Frame */}
              <div className="relative w-full aspect-[9/16] rounded-[24px] overflow-hidden bg-gradient-to-b from-[#161619] via-[#09090b] to-[#000000] border border-white/10 p-6 flex flex-col justify-between shadow-inner group-hover:scale-[1.01] transition-transform duration-500">
                <span className="text-xs font-mono text-sky-300 font-semibold">01</span>

                <h4 className="text-2xl sm:text-3xl font-mazzard text-white tracking-tight uppercase leading-snug">
                  FAST / FUN / REPLAYABLE
                </h4>

                <div className="flex justify-end">
                  <div className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white group-hover:bg-white group-hover:text-black transition-all">
                    <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                  </div>
                </div>
              </div>

              {/* Bottom Tag Outside Screen */}
              <div className="px-3 pt-3 pb-1 text-[11px] font-mono text-white/50 tracking-wider">
                SHORTS • 9:16
              </div>
            </div>
          </RevealOnScroll>

          {/* Card 02 (Middle card staggered down as in reference image!) */}
          <RevealOnScroll delay={150}>
            <div className="group relative rounded-[32px] p-3.5 bg-black/90 border border-white/10 hover:border-sky-400/50 shadow-[0_0_35px_rgba(0,0,0,0.8)] hover:shadow-[0_0_60px_rgba(56,189,248,0.35)] transition-all duration-500 cursor-pointer flex flex-col justify-between md:translate-y-8">
              {/* Inner 9:16 Screen Frame */}
              <div className="relative w-full aspect-[9/16] rounded-[24px] overflow-hidden bg-gradient-to-b from-[#1a1a1e] via-[#0b0b0d] to-[#000000] border border-white/10 p-6 flex flex-col justify-between shadow-inner group-hover:scale-[1.01] transition-transform duration-500">
                <span className="text-xs font-mono text-sky-300 font-semibold">02</span>

                <h4 className="text-2xl sm:text-3xl font-mazzard text-white tracking-tight uppercase leading-snug">
                  THE HOOK IS EVERYTHING
                </h4>

                <div className="flex justify-end">
                  <div className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white group-hover:bg-white group-hover:text-black transition-all">
                    <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                  </div>
                </div>
              </div>

              {/* Bottom Tag Outside Screen */}
              <div className="px-3 pt-3 pb-1 text-[11px] font-mono text-white/50 tracking-wider">
                REEL • 9:16
              </div>
            </div>
          </RevealOnScroll>

          {/* Card 03 */}
          <RevealOnScroll delay={300}>
            <div className="group relative rounded-[32px] p-3.5 bg-black/90 border border-white/10 hover:border-sky-400/50 shadow-[0_0_35px_rgba(0,0,0,0.8)] hover:shadow-[0_0_60px_rgba(56,189,248,0.35)] transition-all duration-500 cursor-pointer flex flex-col justify-between">
              {/* Inner 9:16 Screen Frame */}
              <div className="relative w-full aspect-[9/16] rounded-[24px] overflow-hidden bg-gradient-to-b from-[#161619] via-[#09090b] to-[#000000] border border-white/10 p-6 flex flex-col justify-between shadow-inner group-hover:scale-[1.01] transition-transform duration-500">
                <span className="text-xs font-mono text-sky-300 font-semibold">03</span>

                <h4 className="text-2xl sm:text-3xl font-mazzard text-white tracking-tight uppercase leading-snug">
                  CUT FOR THE FEED
                </h4>

                <div className="flex justify-end">
                  <div className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white group-hover:bg-white group-hover:text-black transition-all">
                    <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                  </div>
                </div>
              </div>

              {/* Bottom Tag Outside Screen */}
              <div className="px-3 pt-3 pb-1 text-[11px] font-mono text-white/50 tracking-wider">
                TIKTOK • 9:16
              </div>
            </div>
          </RevealOnScroll>
        </div>
      </section>

      {/* SECTION 3: WHY ME */}
      <section id="whyme" className="relative py-28 px-6 md:px-12 z-20 max-w-7xl mx-auto scroll-mt-24 border-t border-white/10">
        <RevealOnScroll className="max-w-3xl mb-16">
          <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-[0.2em] text-sky-400 mb-3">
            <Zap className="w-3.5 h-3.5" />
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
            <div className="rounded-3xl p-8 bg-[#050505]/90 backdrop-blur-xl border border-white/10 shadow-[0_0_30px_rgba(0,0,0,0.8)] hover:border-sky-400/40 transition-all h-full">
              <div className="w-12 h-12 rounded-2xl bg-white/[0.05] border border-white/15 flex items-center justify-center text-sky-400 mb-6">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-heading font-bold text-white mb-2">1. The 1.8s Hook Formula</h3>
              <p className="text-sm text-white/65 leading-relaxed font-normal">
                Every video dies or thrives in the first 3 seconds. I engineer curiosity loops, sound stingers, and visual anchors so your viewers never scroll away.
              </p>
            </div>
          </RevealOnScroll>

          <RevealOnScroll delay={100}>
            <div className="rounded-3xl p-8 bg-[#050505]/90 backdrop-blur-xl border border-white/10 shadow-[0_0_30px_rgba(0,0,0,0.8)] hover:border-sky-400/40 transition-all h-full">
              <div className="w-12 h-12 rounded-2xl bg-white/[0.05] border border-white/15 flex items-center justify-center text-sky-400 mb-6">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-heading font-bold text-white mb-2">2. Adaptable to Any Style</h3>
              <p className="text-sm text-white/65 leading-relaxed font-normal">
                Talking head, documentary, SaaS commercial, or gaming: I match your channel tone, brand voice, and pacing rhythm flawlessly.
              </p>
            </div>
          </RevealOnScroll>

          <RevealOnScroll delay={200}>
            <div className="rounded-3xl p-8 bg-[#050505]/90 backdrop-blur-xl border border-white/10 shadow-[0_0_30px_rgba(0,0,0,0.8)] hover:border-sky-400/40 transition-all h-full">
              <div className="w-12 h-12 rounded-2xl bg-white/[0.05] border border-white/15 flex items-center justify-center text-sky-400 mb-6">
                <Volume2 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-heading font-bold text-white mb-2">3. 5-Layer Soundscapes</h3>
              <p className="text-sm text-white/65 leading-relaxed font-normal">
                70% of perceived quality is audio. Every cut is paired with custom risers, whooshes, sub-drops, and atmospheric foley to deliver high-impact punch.
              </p>
            </div>
          </RevealOnScroll>

          <RevealOnScroll delay={300}>
            <div className="rounded-3xl p-8 bg-[#050505]/90 backdrop-blur-xl border border-white/10 shadow-[0_0_30px_rgba(0,0,0,0.8)] hover:border-sky-400/40 transition-all h-full">
              <div className="w-12 h-12 rounded-2xl bg-white/[0.05] border border-white/15 flex items-center justify-center text-sky-400 mb-6">
                <Film className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-heading font-bold text-white mb-2">4. 100% After Effects</h3>
              <p className="text-sm text-white/65 leading-relaxed font-normal">
                Edited exclusively in After Effects. Custom motion graphics, surgical speed ramping, keyframe curves, and 3D camera sweeps.
              </p>
            </div>
          </RevealOnScroll>

          <RevealOnScroll delay={400}>
            <div className="rounded-3xl p-8 bg-[#050505]/90 backdrop-blur-xl border border-white/10 shadow-[0_0_30px_rgba(0,0,0,0.8)] hover:border-sky-400/40 transition-all h-full">
              <div className="w-12 h-12 rounded-2xl bg-white/[0.05] border border-white/15 flex items-center justify-center text-sky-400 mb-6">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-heading font-bold text-white mb-2">5. 24–48h Turnaround</h3>
              <p className="text-sm text-white/65 leading-relaxed font-normal">
                Content calendars move fast. I deliver lightning-fast first drafts, respect deadlines, and communicate transparently through Discord.
              </p>
            </div>
          </RevealOnScroll>

          <RevealOnScroll delay={500}>
            <div className="rounded-3xl p-8 bg-[#050505]/90 backdrop-blur-xl border border-white/10 shadow-[0_0_30px_rgba(0,0,0,0.8)] hover:border-sky-400/40 transition-all h-full">
              <div className="w-12 h-12 rounded-2xl bg-white/[0.05] border border-white/15 flex items-center justify-center text-sky-400 mb-6">
                <Check className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-heading font-bold text-white mb-2">6. 3 Revisions Max Policy</h3>
              <p className="text-sm text-white/65 leading-relaxed font-normal">
                Clear, structured feedback rounds via timestamped notes to finalize the cut efficiently and protect creative quality.
              </p>
            </div>
          </RevealOnScroll>
        </div>
      </section>

      {/* SECTION 4: ABOUT RYCHR */}
      <section id="about" className="relative py-28 px-6 md:px-12 z-20 max-w-7xl mx-auto scroll-mt-24 border-t border-white/10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
          <RevealOnScroll className="md:col-span-5 relative" delay={100}>
            {/* Glowing Avatar Glass Card */}
            <div className="relative rounded-3xl overflow-hidden aspect-square bg-[#050505]/95 border border-white/15 p-8 flex flex-col justify-between shadow-[0_0_60px_rgba(0,0,0,0.8)]">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-black border border-white/20 p-2 flex items-center justify-center">
                  <img
                    src="/assets/aistudio/image_5a1c3c4a.png"
                    alt="Crescent Logo"
                    className="w-full h-full object-contain"
                  />
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-mono bg-white/[0.06] text-sky-300 border border-white/15">
                  Available Now
                </span>
              </div>

              <div>
                <h3 className="text-4xl font-brand-rychr text-white">
                  Rychr
                </h3>
                <p className="text-sm text-white/60 mt-1 font-normal">
                  Creative Video Editor & Motion Designer
                </p>
                <div className="mt-4 flex items-center gap-2 text-xs font-mono text-sky-400">
                  <Check className="w-4 h-4" />
                  <span>Taking on Select Creators</span>
                </div>
              </div>
            </div>
          </RevealOnScroll>

          <RevealOnScroll className="md:col-span-7" delay={200}>
            <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-[0.2em] text-sky-400 mb-3">
              <span>no corporate yap</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-mazzard tracking-tight text-white mb-6">
              i edit in after effects. you get the views.
            </h2>
            <div className="space-y-4 text-base text-white/70 leading-relaxed font-normal">
              <p>
                ngl most video editing out here is painfully mid. dead air everywhere, lifeless stock footage, and fonts straight out of 2017. your viewers swipe in 2 seconds and your retention graph tanks.
              </p>
              <p>
                i don't do that. i put the time in <strong className="text-white">Adobe After Effects</strong> keyframing whip zooms, speed ramps, kinetic captions, and sound design that keeps your audience glued to the screen.
              </p>
              <p>
                high-energy talking heads, documentary deep-dives, or fast-paced vertical shorts that loop on the feed: <strong className="text-white">i adapt to your exact style.</strong> you hit record, i turn it into a high-retention video.
              </p>
            </div>

            {/* Clean Badges without Emojis */}
            <div className="mt-8 pt-8 border-t border-blue-500/15 flex flex-wrap items-center gap-3">
              <span className="px-4 py-2 rounded-xl bg-blue-500/15 border border-blue-500/30 text-sky-300 font-mono text-xs font-bold">
                100% After Effects Workflow
              </span>
              <span className="px-4 py-2 rounded-xl bg-white/[0.05] border border-white/10 text-white/80 font-mono text-xs">
                3 Revisions Max
              </span>
              <span className="px-4 py-2 rounded-xl bg-white/[0.05] border border-white/10 text-white/80 font-mono text-xs">
                Any Style Adaptive • Clean Retention Cuts
              </span>
            </div>
          </RevealOnScroll>
        </div>
      </section>

      {/* SECTION 5: FAQ */}
      <section id="faq" className="relative py-28 px-6 md:px-12 z-20 max-w-5xl mx-auto scroll-mt-24 border-t border-white/10">
        <RevealOnScroll className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-[0.2em] text-sky-400 mb-3">
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
                  className="rounded-2xl bg-[#050505]/90 backdrop-blur-xl border border-white/10 hover:border-sky-400/40 transition-all overflow-hidden shadow-lg"
                >
                  <button
                    onClick={() => setActiveFaq(isOpen ? null : index)}
                    className="w-full px-6 py-5 flex items-center justify-between text-left gap-4 cursor-pointer"
                  >
                    <span className="text-base md:text-lg font-mazzard text-white">
                      {faq.question}
                    </span>
                    <div className={`w-8 h-8 rounded-full bg-white/[0.05] border border-white/15 flex items-center justify-center shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180 bg-white/20' : ''}`}>
                      <ChevronDown className="w-4 h-4 text-sky-400" />
                    </div>
                  </button>

                  {isOpen && (
                    <div className="px-6 pb-6 pt-1 text-sm md:text-base text-white/70 leading-relaxed border-t border-white/10 font-normal">
                      {faq.answer}
                    </div>
                  )}
                </div>
              </RevealOnScroll>
            );
          })}
        </div>
      </section>

      {/* SECTION 6: CONTACT & SOCIALS */}
      <section id="contact" className="relative py-28 px-6 md:px-12 z-20 max-w-5xl mx-auto scroll-mt-24 border-t border-white/10">
        <RevealOnScroll className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-[0.2em] text-sky-400 mb-3">
            <span>Direct Channels</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-mazzard tracking-tight text-white">
            Let's Make High-Retention Edits
          </h2>
          <p className="text-white/60 text-base mt-3 font-normal">
            Ready to upgrade your videos? Reach out directly via Gmail, Discord, or Instagram to discuss your vision, rates, and test edits.
          </p>
        </RevealOnScroll>

        {/* 3 Explicit Social Cards in Deep Obsidian Glass */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {/* Discord: @ray_christo */}
          <RevealOnScroll delay={0}>
            <div className="rounded-3xl p-6 bg-[#050505]/90 backdrop-blur-xl border border-white/10 hover:border-sky-400/50 shadow-[0_0_35px_rgba(0,0,0,0.8)] hover:shadow-[0_0_50px_rgba(56,189,248,0.3)] transition-all flex flex-col justify-between h-full">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-white/[0.05] border border-white/15 flex items-center justify-center text-sky-400 mb-5">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <h4 className="text-lg font-mazzard text-white mb-1">Discord</h4>
                <p className="text-xs text-white/50 mb-4">Fast messaging & file reviews</p>
                <div className="p-3 rounded-xl bg-black border border-white/15 font-mono text-sm text-sky-300 break-all select-all font-semibold">
                  @ray_christo
                </div>
              </div>

              <div className="mt-6 flex gap-2">
                <button
                  onClick={() => handleCopy('@ray_christo', 'discord')}
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-sky-500 text-white font-mazzard text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span>{copiedSocial === 'discord' ? 'Copied @ray_christo!' : 'Copy Discord ID'}</span>
                  {copiedSocial === 'discord' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </RevealOnScroll>

          {/* Instagram: rychr.prod */}
          <RevealOnScroll delay={120}>
            <div className="rounded-3xl p-6 bg-[#050505]/90 backdrop-blur-xl border border-white/10 hover:border-sky-400/50 shadow-[0_0_35px_rgba(0,0,0,0.8)] hover:shadow-[0_0_50px_rgba(56,189,248,0.3)] transition-all flex flex-col justify-between h-full">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-white/[0.05] border border-white/15 flex items-center justify-center text-sky-400 mb-5">
                  <Instagram className="w-6 h-6" />
                </div>
                <h4 className="text-lg font-mazzard text-white mb-1">Instagram</h4>
                <p className="text-xs text-white/50 mb-4">Direct messages & reel edits</p>
                <div className="p-3 rounded-xl bg-black border border-white/15 font-mono text-sm text-sky-300 break-all select-all font-semibold">
                  rychr.prod
                </div>
              </div>

              <div className="mt-6 flex gap-2">
                <a
                  href="https://instagram.com/rychr.prod"
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-sky-500 text-white font-mazzard text-xs flex items-center justify-center gap-1.5 transition-all"
                >
                  <span>Open Profile</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
                <button
                  onClick={() => handleCopy('rychr.prod', 'instagram')}
                  className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
                  title="Copy Instagram Handle"
                >
                  {copiedSocial === 'instagram' ? <Check className="w-4 h-4 text-sky-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </RevealOnScroll>

          {/* Gmail */}
          <RevealOnScroll delay={240}>
            <div className="rounded-3xl p-6 bg-[#050505]/90 backdrop-blur-xl border border-white/10 hover:border-sky-400/50 shadow-[0_0_35px_rgba(0,0,0,0.8)] hover:shadow-[0_0_50px_rgba(56,189,248,0.3)] transition-all flex flex-col justify-between h-full">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-white/[0.05] border border-white/15 flex items-center justify-center text-sky-400 mb-5">
                  <Mail className="w-6 h-6" />
                </div>
                <h4 className="text-lg font-mazzard text-white mb-1">Gmail</h4>
                <p className="text-xs text-white/50 mb-4">Official business inquiries</p>
                <div className="p-3 rounded-xl bg-black border border-white/15 font-mono text-xs text-sky-300 break-all select-all">
                  rychr.edits@gmail.com
                </div>
              </div>

              <div className="mt-6 flex gap-2">
                <a
                  href="mailto:rychr.edits@gmail.com"
                  className="flex-1 py-2.5 rounded-xl bg-white text-black font-mazzard text-xs flex items-center justify-center gap-1.5 hover:bg-sky-400 transition-colors"
                >
                  <span>Send Email</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
                <button
                  onClick={() => handleCopy('rychr.edits@gmail.com', 'email')}
                  className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
                  title="Copy Email"
                >
                  {copiedSocial === 'email' ? <Check className="w-4 h-4 text-sky-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </RevealOnScroll>
        </div>

        {/* Payments Notice Box */}
        <RevealOnScroll delay={150}>
          <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-md mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs uppercase font-mono tracking-wider text-sky-400 block mb-1">
                Accepted Payment Channels
              </span>
              <p className="text-sm text-white/80 font-medium">
                Direct <strong className="text-white">Bank Transfer</strong> and <strong className="text-white">UPI</strong>. For any other payment methods, contact directly.
              </p>
            </div>
            <span className="px-3 py-1.5 rounded-lg bg-white/[0.06] border border-white/15 text-sky-300 text-xs font-mono shrink-0">
              Secure Onboarding
            </span>
          </div>
        </RevealOnScroll>

        {/* Quick Project Inquiry Box */}
        <RevealOnScroll delay={250}>
          <div className="rounded-3xl p-8 bg-[#050505]/95 backdrop-blur-xl border border-white/10 shadow-2xl">
            <h3 className="text-2xl font-mazzard text-white mb-2">
              Direct Inquiry Form
            </h3>
            <p className="text-sm text-white/60 mb-6 font-normal">
              Tell me about your channel, video goals, and desired schedule.
            </p>

            {contactSubmitted ? (
              <div className="p-6 rounded-2xl bg-white/[0.06] border border-sky-400/30 text-center">
                <Check className="w-10 h-10 text-sky-400 mx-auto mb-2" />
                <h4 className="text-lg font-mazzard text-white">Inquiry Sent Successfully!</h4>
                <p className="text-sm text-white/70 mt-1 font-normal">
                  Thank you! I will review your project details and reach out within 24 hours via Discord (@ray_christo) or email.
                </p>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setContactSubmitted(true);
                }}
                className="space-y-4"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono text-white/60 mb-1.5">
                      Your Name / Channel
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Blyvs Media"
                      value={contactForm.name}
                      onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-black border border-white/15 text-white placeholder-white/30 text-sm focus:outline-none focus:border-sky-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono text-white/60 mb-1.5">
                      Discord (@username) or Email
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. @your_discord or you@gmail.com"
                      value={contactForm.emailOrDiscord}
                      onChange={(e) => setContactForm({ ...contactForm, emailOrDiscord: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-black border border-white/15 text-white placeholder-white/30 text-sm focus:outline-none focus:border-sky-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono text-white/60 mb-1.5">
                    Content Style & Type
                  </label>
                  <select
                    value={contactForm.service}
                    onChange={(e) => setContactForm({ ...contactForm, service: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-[#0a0a0c] border border-white/15 text-white text-sm focus:outline-none focus:border-sky-400"
                  >
                    <option value="YouTube Long-form">YouTube Long-form (Talking Head / Documentary / Gaming)</option>
                    <option value="Shorts / Reels Batch">Shorts / Reels Batch</option>
                    <option value="Commercial / SaaS">Commercial / SaaS Launch Video</option>
                    <option value="Monthly Dedicated Editing">Monthly Dedicated Retainer</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono text-white/60 mb-1.5">
                    Project Details & Video Links
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Share your channel link, what editing style you need, and any reference videos..."
                    value={contactForm.message}
                    onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-black border border-white/15 text-white placeholder-white/30 text-sm focus:outline-none focus:border-sky-400 resize-none font-normal"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-4 rounded-xl bg-white hover:bg-sky-400 hover:text-black text-black font-semibold text-sm transition-all duration-300 shadow-[0_0_30px_rgba(56,189,248,0.25)] hover:shadow-[0_0_40px_rgba(56,189,248,0.5)] cursor-pointer"
                >
                  Send Message to <span className="font-brand-rychr font-bold">Rychr</span> →
                </button>
              </form>
            )}
          </div>
        </RevealOnScroll>
      </section>

      {/* FOOTER */}
      <footer className="relative py-12 px-6 border-t border-white/10 z-20 text-center text-xs text-white/40 font-mono">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <img
              src="/assets/aistudio/image_5a1c3c4a.png"
              alt="Logo"
              className="w-5 h-5 rounded-md object-contain"
            />
            <span className="text-white/90 font-brand-rychr text-base">Rychr</span>
            <span>— Creative Video Editor & Motion Designer (After Effects)</span>
          </div>

          <div className="flex items-center gap-6 font-medium text-xs text-white/70">
            <a href="#work" className="hover:text-sky-400 transition-colors">Work</a>
            <a href="#shorts" className="hover:text-sky-400 transition-colors">Shorts</a>
            <a href="#whyme" className="hover:text-sky-400 transition-colors">Why me</a>
            <a href="#about" className="hover:text-sky-400 transition-colors">About</a>
            <a href="#faq" className="hover:text-sky-400 transition-colors">FAQ</a>
            <a href="#contact" className="hover:text-sky-400 transition-colors">Contact</a>
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
              className="absolute top-5 right-5 z-20 p-2.5 rounded-full bg-black/60 hover:bg-sky-400 hover:text-black text-white border border-white/20 transition-all cursor-pointer"
            >
              ✕
            </button>

            <div className="relative w-full rounded-2xl overflow-hidden bg-black mb-6 aspect-video">
              <div className={`w-full h-full flex flex-col items-center justify-center bg-gradient-to-br ${activeVideoModal.gradient} p-6 text-center`}>
                <div className="w-20 h-20 rounded-full bg-white/10 border border-white/20 backdrop-blur-md flex items-center justify-center mb-4 text-white">
                  <Play className="w-8 h-8 fill-current ml-1" />
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
                className="px-6 py-3 rounded-xl bg-white hover:bg-sky-400 text-black font-semibold text-xs transition-colors shrink-0"
              >
                Hire <span className="font-brand-rychr font-bold">Rychr</span> for Similar Edit
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
