import React, { useState, useEffect } from 'react';
import { CosmicHorizonBackground } from './CosmicHorizonBackground.tsx';
import { RevealOnScroll } from './RevealOnScroll.tsx';
import { CalmNavbarBorder } from './CalmNavbarBorder.tsx';
import { AnimatedGeminiBorder, GeminiColorPreset } from './AnimatedGeminiBorder.tsx';
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
    gradient: 'from-[#14121b] via-[#09080d] to-[#000000]',
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
    gradient: 'from-[#161320] via-[#09080f] to-[#000000]',
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
    gradient: 'from-[#13111c] via-[#08070e] to-[#000000]',
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
    gradient: 'from-[#161222] via-[#090810] to-[#000000]',
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
    <div className="relative min-h-screen bg-black text-white font-['Inter',sans-serif] selection:bg-pink-500/35 overflow-x-hidden">
      {/* PROCEDURAL PLANET HORIZON BACKGROUND (Top horizon + Underside on scroll to bottom + Glowing Cursor with Stars) */}
      <CosmicHorizonBackground scrollY={scrollY} />

      {/* PERSISTENT HEADER NAVBAR */}
      <header className="fixed top-0 left-0 right-0 z-50 px-4 md:px-10 py-5 transition-all duration-300">
        <div className="relative max-w-6xl mx-auto flex items-center justify-between px-6 py-3.5 rounded-2xl bg-black/85 backdrop-blur-xl border border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.9)]">
          {/* Calm, slow subtle dual parallel glowing border covering all sides of the rounded tab */}
          <CalmNavbarBorder />

          {/* Top Left: Animated Crescent Moon & Brand Video Playing as GIF (15 FPS) */}
          <a href="#" className="flex items-center gap-3 group">
            <div className="relative w-9 h-9 rounded-xl overflow-hidden border border-white/20 bg-black flex items-center justify-center shadow-[0_0_18px_rgba(236,72,153,0.35)] group-hover:shadow-[0_0_26px_rgba(244,63,94,0.55)] group-hover:border-pink-400/40 transition-all shrink-0">
              <video
                src="/assets/aistudio/export_2_-_15_fps_dc6d6217.mp4"
                poster="/assets/aistudio/image_5a1c3c4a.png"
                autoPlay
                loop
                muted
                playsInline
                disablePictureInPicture
                className="w-full h-full object-cover scale-[1.03] pointer-events-none select-none"
              />
            </div>
            <span className="font-brand-rychr text-xl tracking-tight text-white group-hover:text-pink-200 transition-colors">
              Rychr
            </span>
          </a>

          {/* Center Tabs: Work, Shorts, Why me, About, FAQ */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-white/70">
            <a href="#work" className="hover:text-pink-300 transition-colors">
              Work
            </a>
            <a href="#shorts" className="hover:text-pink-300 transition-colors">
              Shorts
            </a>
            <a href="#whyme" className="hover:text-pink-300 transition-colors">
              Why me
            </a>
            <a href="#about" className="hover:text-pink-300 transition-colors">
              About
            </a>
            <a href="#faq" className="hover:text-pink-300 transition-colors">
              FAQ
            </a>
          </nav>

          {/* Right Action: Let's Talk CTA with Sunset Magenta Outline */}
          <div className="flex items-center gap-3">
            <a
              href="#contact"
              className="relative px-4 py-2 rounded-xl text-xs md:text-sm font-semibold bg-black/90 hover:bg-black text-white shadow-[0_0_20px_rgba(236,72,153,0.35)] hover:shadow-[0_0_30px_rgba(244,63,94,0.55)] transition-all active:scale-95 cursor-pointer overflow-visible group/btn"
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
              <span className="relative z-10 group-hover/btn:text-pink-200 transition-colors">
                Let's Talk
              </span>
            </a>
          </div>
        </div>
      </header>

      {/* HERO SECTION (Text floats cleanly above the planet horizon; description is NEVER hidden!) */}
      <section className="relative min-h-[95vh] flex flex-col justify-center items-center px-6 pt-32 pb-20 z-20 pointer-events-auto">
        <div className="max-w-4xl mx-auto text-center flex flex-col items-center">
          {/* Status Badge in signature crisp style with Sunset Magenta rim */}
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/[0.04] border border-white/15 backdrop-blur-md mb-8 text-xs font-mono text-pink-200 shadow-[0_0_20px_rgba(236,72,153,0.3)]">
            <span className="w-2 h-2 rounded-full bg-gradient-to-r from-pink-400 to-rose-400 shadow-[0_0_8px_#ec4899]" />
            <span className="tracking-wide">Available for New Projects</span>
          </div>

          {/* Main Title: Rychr strictly in Mazzard M Black with deep sunset magenta aura */}
          <h1 className="text-7xl sm:text-8xl md:text-9xl font-brand-rychr tracking-tight mb-4 text-white drop-shadow-[0_10px_45px_rgba(236,72,153,0.35)]">
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
              className="px-8 py-4 rounded-xl font-semibold text-sm md:text-base bg-white text-black hover:bg-gradient-to-r hover:from-pink-300 hover:via-rose-300 hover:to-purple-300 hover:text-black shadow-[0_0_35px_rgba(236,72,153,0.3)] hover:shadow-[0_0_45px_rgba(244,63,94,0.55)] transition-all duration-300 flex items-center gap-2 group cursor-pointer"
            >
              <span>Explore My Work</span>
              <ChevronDown className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
            </a>

            <a
              href="#contact"
              className="relative px-7 py-4 rounded-xl font-semibold text-sm md:text-base bg-black/90 hover:bg-black text-white hover:text-pink-200 transition-all duration-300 shadow-[0_0_25px_rgba(236,72,153,0.3)] hover:shadow-[0_0_35px_rgba(244,63,94,0.55)] overflow-visible group/btn active:scale-95"
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

          {/* Indicator: text "scroll" and glowing line that animates downward */}
          <div className="mt-14 flex flex-col items-center gap-2 select-none pointer-events-none">
            <span className="text-[11px] uppercase tracking-[0.35em] font-mono text-pink-300/70 font-medium">
              scroll
            </span>
            <div className="w-[1.5px] h-12 bg-pink-500/20 relative overflow-hidden rounded-full">
              <div className="absolute top-0 left-0 w-full h-5 bg-gradient-to-b from-transparent via-pink-400 to-purple-400 shadow-[0_0_10px_#ec4899] animate-scrollIndicator" />
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 1: WORK (EXACT ASYMMETRICAL 4-CARD LAYOUT WITH CELESTIAL CYAN & PURPLE HARMONY) */}
      <section id="work" className="relative py-28 px-6 md:px-12 z-20 max-w-7xl mx-auto scroll-mt-24">
        {/* Subtle grid texture overlay with faint cosmic magenta touch */}
        <div className="absolute inset-0 bg-[radial-gradient(rgba(236,72,153,0.08)_1px,transparent_1px)] [background-size:28px_28px] pointer-events-none rounded-3xl" />

        <RevealOnScroll className="mb-14 relative z-10">
          <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-[0.2em] text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-rose-300 to-purple-400 mb-3">
            <Film className="w-3.5 h-3.5 text-pink-400" />
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
                className="group relative rounded-[28px] md:rounded-[34px] bg-black/90 border border-white/10 hover:border-transparent p-5 sm:p-6 md:p-7 backdrop-blur-md shadow-[0_0_40px_rgba(0,0,0,0.8)] hover:shadow-[0_0_60px_rgba(236,72,153,0.3)] transition-all duration-500 flex flex-col justify-between cursor-pointer h-full overflow-visible"
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
                    className={`relative aspect-video w-full rounded-2xl md:rounded-3xl overflow-hidden bg-gradient-to-br ${project.gradient} border border-white/10 flex items-center justify-center p-4 shadow-inner mb-5 group-hover:border-pink-400/40 transition-all duration-500`}
                  >
                    {/* Numeral inside top-left */}
                    <span className="absolute top-4 left-4 text-xs font-mono font-medium text-pink-200/90 tracking-wider">
                      {project.num}
                    </span>

                    {/* Central Glowing Play Button */}
                    <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-white/10 border border-white/25 backdrop-blur-md flex items-center justify-center text-white group-hover:scale-110 group-hover:bg-gradient-to-r group-hover:from-pink-500 group-hover:via-rose-500 group-hover:to-purple-500 group-hover:text-white transition-all shadow-[0_0_25px_rgba(236,72,153,0.4)] group-hover:shadow-[0_0_35px_rgba(244,63,94,0.7)]">
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

                    {/* Sunset Magenta Accent Tag */}
                    <div className="text-xs font-mono font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-rose-300 to-purple-400 uppercase mb-1.5">
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
            <div className="text-xs font-mono tracking-[0.2em] text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-rose-300 to-purple-400 uppercase mb-4">
              02 / SHORTS & REELS
            </div>
            <h2 className="text-5xl sm:text-6xl md:text-7xl font-mazzard tracking-tight text-white leading-[0.95]">
              Small screen.<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-rose-300 to-purple-400 drop-shadow-[0_0_30px_rgba(236,72,153,0.35)]">
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
            <div className="group relative rounded-[32px] p-3.5 bg-black/90 border border-white/10 hover:border-transparent shadow-[0_0_35px_rgba(0,0,0,0.8)] hover:shadow-[0_0_60px_rgba(236,72,153,0.3)] transition-all duration-500 cursor-pointer flex flex-col justify-between overflow-visible">
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
                <div className="relative w-full aspect-[9/16] rounded-[24px] overflow-hidden bg-gradient-to-b from-[#181524] via-[#09080f] to-[#000000] border border-white/10 p-6 flex flex-col justify-between shadow-inner group-hover:scale-[1.01] transition-transform duration-500">
                  <span className="text-xs font-mono text-pink-300 font-semibold drop-shadow-[0_0_8px_rgba(236,72,153,0.5)]">01</span>

                  <h4 className="text-2xl sm:text-3xl font-mazzard text-white tracking-tight uppercase leading-snug">
                    FAST / FUN / REPLAYABLE
                  </h4>

                  <div className="flex justify-end">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-[0_0_18px_rgba(236,72,153,0.65)] flex items-center justify-center group-hover:scale-110 group-hover:shadow-[0_0_24px_rgba(244,63,94,0.85)] transition-all">
                      <Play className="w-3.5 h-3.5 fill-current ml-0.5 text-white" />
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
            <div className="group relative rounded-[32px] p-3.5 bg-black/90 border border-white/10 hover:border-transparent shadow-[0_0_35px_rgba(0,0,0,0.8)] hover:shadow-[0_0_60px_rgba(236,72,153,0.35)] transition-all duration-500 cursor-pointer flex flex-col justify-between md:translate-y-8 overflow-visible">
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
                <div className="relative w-full aspect-[9/16] rounded-[24px] overflow-hidden bg-gradient-to-b from-[#1c172a] via-[#0b0914] to-[#000000] border border-white/10 p-6 flex flex-col justify-between shadow-inner group-hover:scale-[1.01] transition-transform duration-500">
                  <span className="text-xs font-mono text-pink-300 font-semibold drop-shadow-[0_0_8px_rgba(236,72,153,0.5)]">02</span>

                  <h4 className="text-2xl sm:text-3xl font-mazzard text-white tracking-tight uppercase leading-snug">
                    THE HOOK IS EVERYTHING
                  </h4>

                  <div className="flex justify-end">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-[0_0_18px_rgba(236,72,153,0.65)] flex items-center justify-center group-hover:scale-110 group-hover:shadow-[0_0_24px_rgba(244,63,94,0.85)] transition-all">
                      <Play className="w-3.5 h-3.5 fill-current ml-0.5 text-white" />
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
            <div className="group relative rounded-[32px] p-3.5 bg-black/90 border border-white/10 hover:border-transparent shadow-[0_0_35px_rgba(0,0,0,0.8)] hover:shadow-[0_0_60px_rgba(236,72,153,0.3)] transition-all duration-500 cursor-pointer flex flex-col justify-between overflow-visible">
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
                <div className="relative w-full aspect-[9/16] rounded-[24px] overflow-hidden bg-gradient-to-b from-[#181524] via-[#09080f] to-[#000000] border border-white/10 p-6 flex flex-col justify-between shadow-inner group-hover:scale-[1.01] transition-transform duration-500">
                  <span className="text-xs font-mono text-pink-300 font-semibold drop-shadow-[0_0_8px_rgba(236,72,153,0.5)]">03</span>

                  <h4 className="text-2xl sm:text-3xl font-mazzard text-white tracking-tight uppercase leading-snug">
                    CUT FOR THE FEED
                  </h4>

                  <div className="flex justify-end">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-[0_0_18px_rgba(236,72,153,0.65)] flex items-center justify-center group-hover:scale-110 group-hover:shadow-[0_0_24px_rgba(244,63,94,0.85)] transition-all">
                      <Play className="w-3.5 h-3.5 fill-current ml-0.5 text-white" />
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
          <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-[0.2em] text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-rose-300 to-purple-400 mb-3">
            <Zap className="w-3.5 h-3.5 text-pink-400" />
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
                <div className="w-12 h-12 rounded-2xl bg-pink-500/[0.08] border border-pink-400/25 flex items-center justify-center text-pink-300 mb-6 group-hover:scale-105 group-hover:border-pink-400/50 shadow-[0_0_15px_rgba(236,72,153,0.2)] transition-all">
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
                <div className="w-12 h-12 rounded-2xl bg-pink-500/[0.08] border border-pink-400/25 flex items-center justify-center text-pink-300 mb-6 group-hover:scale-105 group-hover:border-pink-400/50 shadow-[0_0_15px_rgba(236,72,153,0.2)] transition-all">
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
                <div className="w-12 h-12 rounded-2xl bg-pink-500/[0.08] border border-pink-400/25 flex items-center justify-center text-pink-300 mb-6 group-hover:scale-105 group-hover:border-pink-400/50 shadow-[0_0_15px_rgba(236,72,153,0.2)] transition-all">
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
                <div className="w-12 h-12 rounded-2xl bg-pink-500/[0.08] border border-pink-400/25 flex items-center justify-center text-pink-300 mb-6 group-hover:scale-105 group-hover:border-pink-400/50 shadow-[0_0_15px_rgba(236,72,153,0.2)] transition-all">
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
                <div className="w-12 h-12 rounded-2xl bg-pink-500/[0.08] border border-pink-400/25 flex items-center justify-center text-pink-300 mb-6 group-hover:scale-105 group-hover:border-pink-400/50 shadow-[0_0_15px_rgba(236,72,153,0.2)] transition-all">
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
                <div className="w-12 h-12 rounded-2xl bg-pink-500/[0.08] border border-pink-400/25 flex items-center justify-center text-pink-300 mb-6 group-hover:scale-105 group-hover:border-pink-400/50 shadow-[0_0_15px_rgba(236,72,153,0.2)] transition-all">
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
            {/* Glowing Motion Showcase Card - Full Animation */}
            <div className="group relative rounded-3xl overflow-visible aspect-square bg-[#050505] border border-white/15 hover:border-transparent shadow-[0_0_60px_rgba(236,72,153,0.3)] transition-all">
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

              {/* Full-Card Looping After Effects Video Animation (15 FPS) */}
              <div className="relative w-full h-full rounded-3xl overflow-hidden bg-black z-10">
                <video
                  src="/assets/aistudio/export_2_-_15_fps_dc6d6217.mp4"
                  poster="/assets/aistudio/image_5a1c3c4a.png"
                  autoPlay
                  loop
                  muted
                  playsInline
                  disablePictureInPicture
                  className="w-full h-full object-cover scale-[1.01] pointer-events-none select-none"
                />

                {/* Floating "Available Now" Status Badge in Top Right */}
                <div className="absolute top-5 right-5 z-20 pointer-events-none">
                  <span className="px-3.5 py-1.5 rounded-full text-xs font-mono bg-black/75 backdrop-blur-md text-pink-300 border border-pink-400/30 shadow-[0_4px_20px_rgba(0,0,0,0.6)]">
                    Available Now
                  </span>
                </div>

                {/* Floating "Taking on Select Creators" Glass Pill in Bottom Left */}
                <div className="absolute bottom-5 left-5 z-20 pointer-events-none">
                  <div className="px-3.5 py-1.5 rounded-full bg-black/75 backdrop-blur-md border border-white/15 text-[11px] font-mono text-pink-300 flex items-center gap-1.5 shadow-[0_4px_20px_rgba(0,0,0,0.6)]">
                    <Check className="w-3.5 h-3.5 text-pink-400" />
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
                <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-[0.2em] text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-rose-300 to-purple-400 mb-3">
                  <span>About the editor</span>
                </div>

                <div className="flex flex-wrap items-baseline gap-2.5 sm:gap-3 mb-5">
                  <h2 className="text-4xl sm:text-5xl font-mazzard font-bold text-white tracking-tight">
                    I'm Ray.
                  </h2>
                  <span className="font-brand-rychr text-2xl sm:text-3xl text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-rose-300 to-purple-400 font-bold">
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
                      <div className="text-xl sm:text-2xl font-mazzard font-bold text-white tracking-tight group-hover/stat:text-pink-200 transition-colors">
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
                      <div className="text-xl sm:text-2xl font-mazzard font-bold text-white tracking-tight group-hover/stat:text-pink-200 transition-colors">
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
                      <div className="text-sm sm:text-[15px] font-mazzard font-semibold text-white leading-snug group-hover/stat:text-rose-200 transition-colors">
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
          <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-[0.2em] text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-rose-300 to-purple-400 mb-3">
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
                        <ChevronDown className="w-4 h-4 text-pink-400" />
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
          <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-[0.2em] text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-rose-300 to-purple-400 mb-3">
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
          {/* Discord: @ray_christo (Sunset Magenta & Royal Orchid) */}
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
                <div className="w-12 h-12 rounded-2xl bg-white/[0.04] border border-pink-500/30 flex items-center justify-center text-pink-300 mb-5 shadow-[0_0_20px_rgba(236,72,153,0.3)] group-hover:scale-105 transition-transform">
                  <MessageSquare className="w-6 h-6 text-pink-400" />
                </div>
                <h4 className="text-lg font-mazzard text-white mb-1">Discord</h4>
                <p className="text-xs text-white/50 mb-4">Fast messaging & file reviews</p>
                <div className="p-3 rounded-xl bg-black border border-white/15 font-mono text-sm text-transparent bg-clip-text bg-gradient-to-r from-pink-300 via-rose-300 to-purple-300 break-all select-all font-semibold shadow-[inset_0_1px_12px_rgba(236,72,153,0.15)]">
                  @ray_christo
                </div>
              </div>

              <div className="relative z-10 mt-6 flex gap-2">
                <button
                  onClick={() => handleCopy('@ray_christo', 'discord')}
                  className="relative flex-1 py-3 px-4 rounded-xl bg-black/90 hover:bg-black text-white font-mazzard text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-[0_0_25px_rgba(236,72,153,0.3)] hover:shadow-[0_0_35px_rgba(244,63,94,0.55)] group/btn overflow-visible active:scale-[0.98]"
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
                  <span className="relative z-10 flex items-center gap-1.5 group-hover/btn:text-pink-200 transition-colors">
                    <span>{copiedSocial === 'discord' ? 'Copied @ray_christo!' : 'Copy Discord ID'}</span>
                    {copiedSocial === 'discord' ? <Check className="w-3.5 h-3.5 text-pink-400" /> : <Copy className="w-3.5 h-3.5 text-pink-300" />}
                  </span>
                </button>
              </div>
            </div>
          </RevealOnScroll>

          {/* Instagram: rychr.prod (Sunset Magenta, Orchid & Violet) */}
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
                <div className="w-12 h-12 rounded-2xl bg-white/[0.04] border border-[#ec4899]/30 flex items-center justify-center text-[#ec4899] mb-5 shadow-[0_0_20px_rgba(236,72,153,0.3)] group-hover:scale-105 transition-transform">
                  <Instagram className="w-6 h-6 text-[#ec4899]" />
                </div>
                <h4 className="text-lg font-mazzard text-white mb-1">Instagram</h4>
                <p className="text-xs text-white/50 mb-4">Direct messages & reel edits</p>
                <div className="p-3 rounded-xl bg-black border border-white/15 font-mono text-sm text-transparent bg-clip-text bg-gradient-to-r from-pink-300 via-rose-300 to-purple-300 break-all select-all font-semibold shadow-[inset_0_1px_12px_rgba(236,72,153,0.12)]">
                  rychr.prod
                </div>
              </div>

              <div className="relative z-10 mt-6 flex gap-2">
                <a
                  href="https://instagram.com/rychr.prod"
                  target="_blank"
                  rel="noreferrer"
                  className="relative flex-1 py-3 px-4 rounded-xl bg-black/90 hover:bg-black text-white font-mazzard text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-[0_0_25px_rgba(236,72,153,0.3)] hover:shadow-[0_0_35px_rgba(236,72,153,0.55)] group/btn overflow-visible active:scale-[0.98]"
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
                  <span className="relative z-10 flex items-center gap-1.5 group-hover/btn:text-pink-200 transition-colors">
                    <span>Open Profile</span>
                    <ExternalLink className="w-3.5 h-3.5 text-pink-300" />
                  </span>
                </a>
                <button
                  onClick={() => handleCopy('rychr.prod', 'instagram')}
                  className="relative p-3 rounded-xl bg-black/85 hover:bg-black text-white border border-white/15 hover:border-pink-400/40 transition-all cursor-pointer hover:shadow-[0_0_20px_rgba(236,72,153,0.3)] active:scale-95"
                  title="Copy Instagram Handle"
                >
                  {copiedSocial === 'instagram' ? <Check className="w-4 h-4 text-pink-400" /> : <Copy className="w-4 h-4 text-white/70" />}
                </button>
              </div>
            </div>
          </RevealOnScroll>

          {/* Gmail: rychr.edits@gmail.com (Sunset Magenta & Rose) */}
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
                <div className="w-12 h-12 rounded-2xl bg-white/[0.04] border border-[#ec4899]/30 flex items-center justify-center text-[#ec4899] mb-5 shadow-[0_0_20px_rgba(236,72,153,0.3)] group-hover:scale-105 transition-transform">
                  <Mail className="w-6 h-6 text-[#ec4899]" />
                </div>
                <h4 className="text-lg font-mazzard text-white mb-1">Gmail</h4>
                <p className="text-xs text-white/50 mb-4">Official business inquiries</p>
                <div className="p-3 rounded-xl bg-black border border-white/15 font-mono text-xs text-transparent bg-clip-text bg-gradient-to-r from-pink-300 via-rose-300 to-purple-300 break-all select-all font-semibold shadow-[inset_0_1px_12px_rgba(236,72,153,0.15)]">
                  rychr.edits@gmail.com
                </div>
              </div>

              <div className="relative z-10 mt-6 flex gap-2">
                <a
                  href="mailto:rychr.edits@gmail.com"
                  className="relative flex-1 py-3 px-4 rounded-xl bg-black/90 hover:bg-black text-white font-mazzard text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-[0_0_25px_rgba(236,72,153,0.3)] hover:shadow-[0_0_35px_rgba(244,63,94,0.55)] group/btn overflow-visible active:scale-[0.98]"
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
                  <span className="relative z-10 flex items-center gap-1.5 group-hover/btn:text-pink-200 transition-colors">
                    <span>Send Email</span>
                    <ExternalLink className="w-3.5 h-3.5 text-pink-300" />
                  </span>
                </a>
                <button
                  onClick={() => handleCopy('rychr.edits@gmail.com', 'email')}
                  className="relative p-3 rounded-xl bg-black/85 hover:bg-black text-white border border-white/15 hover:border-pink-400/40 transition-all cursor-pointer hover:shadow-[0_0_20px_rgba(236,72,153,0.3)] active:scale-95"
                  title="Copy Email"
                >
                  {copiedSocial === 'email' ? <Check className="w-4 h-4 text-pink-400" /> : <Copy className="w-4 h-4 text-white/70" />}
                </button>
              </div>
            </div>
          </RevealOnScroll>
        </div>

        {/* Payments Notice Box */}
        <RevealOnScroll delay={150}>
          <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-md mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs uppercase font-mono tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-rose-300 to-purple-400 block mb-1">
                Accepted Payment Channels
              </span>
              <p className="text-sm text-white/80 font-medium">
                Direct <strong className="text-white">Bank Transfer</strong> and <strong className="text-white">UPI</strong>. For any other payment methods, contact directly.
              </p>
            </div>
            <span className="px-3 py-1.5 rounded-lg bg-pink-500/15 border border-pink-400/30 text-pink-300 text-xs font-mono shrink-0">
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
              <div className="p-6 rounded-2xl bg-white/[0.06] border border-pink-400/30 text-center">
                <Check className="w-10 h-10 text-pink-400 mx-auto mb-2" />
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
                      className="w-full px-4 py-3 rounded-xl bg-black border border-white/15 text-white placeholder-white/30 text-sm focus:outline-none focus:border-pink-400 focus:ring-1 focus:ring-pink-400/30"
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
                      className="w-full px-4 py-3 rounded-xl bg-black border border-white/15 text-white placeholder-white/30 text-sm focus:outline-none focus:border-pink-400 focus:ring-1 focus:ring-pink-400/30"
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
                    className="w-full px-4 py-3 rounded-xl bg-[#0a0a0c] border border-white/15 text-white text-sm focus:outline-none focus:border-pink-400"
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
                    className="w-full px-4 py-3 rounded-xl bg-black border border-white/15 text-white placeholder-white/30 text-sm focus:outline-none focus:border-pink-400 focus:ring-1 focus:ring-pink-400/30 resize-none font-normal"
                  />
                </div>

                <button
                  type="submit"
                  className="relative w-full py-4 rounded-xl bg-black/95 hover:bg-black text-white font-semibold text-sm transition-all duration-300 shadow-[0_0_30px_rgba(236,72,153,0.35)] hover:shadow-[0_0_40px_rgba(244,63,94,0.6)] cursor-pointer overflow-visible active:scale-[0.99] group/btn"
                >
                  <AnimatedGeminiBorder
                    preset="gemini"
                    borderRadius="rounded-xl"
                    borderWidth="1.5px"
                    auraBlur="blur-md"
                    auraOpacity={0.65}
                    speedMs={14000}
                    angleOffset={180}
                  />
                  <span className="relative z-10 flex items-center justify-center gap-2 group-hover/btn:text-pink-200 transition-colors">
                    <span>Send Message to <span className="font-brand-rychr font-bold text-white">Rychr</span> →</span>
                  </span>
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
            <div className="w-5 h-5 rounded-md overflow-hidden bg-black border border-white/20 shrink-0 flex items-center justify-center">
              <video
                src="/assets/aistudio/export_2_-_15_fps_dc6d6217.mp4"
                poster="/assets/aistudio/image_5a1c3c4a.png"
                autoPlay
                loop
                muted
                playsInline
                disablePictureInPicture
                className="w-full h-full object-cover pointer-events-none select-none"
              />
            </div>
            <span className="text-white/90 font-brand-rychr text-base">Rychr</span>
            <span>— Creative Video Editor & Motion Designer (After Effects)</span>
          </div>

          <div className="flex items-center gap-6 font-medium text-xs text-white/70">
            <a href="#work" className="hover:text-pink-300 transition-colors">Work</a>
            <a href="#shorts" className="hover:text-pink-300 transition-colors">Shorts</a>
            <a href="#whyme" className="hover:text-pink-300 transition-colors">Why me</a>
            <a href="#about" className="hover:text-pink-300 transition-colors">About</a>
            <a href="#faq" className="hover:text-pink-300 transition-colors">FAQ</a>
            <a href="#contact" className="hover:text-pink-300 transition-colors">Contact</a>
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
              className="absolute top-5 right-5 z-20 p-2.5 rounded-full bg-black/60 hover:bg-gradient-to-r hover:from-pink-500 hover:to-rose-500 hover:text-white text-white border border-white/20 transition-all cursor-pointer"
            >
              ✕
            </button>

            <div className="relative w-full rounded-2xl overflow-hidden bg-black mb-6 aspect-video">
              <div className={`w-full h-full flex flex-col items-center justify-center bg-gradient-to-br ${activeVideoModal.gradient} p-6 text-center`}>
                <div className="w-20 h-20 rounded-full bg-pink-500/20 border border-pink-400/40 backdrop-blur-md flex items-center justify-center mb-4 text-white shadow-[0_0_35px_rgba(236,72,153,0.55)]">
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
                className="relative px-6 py-3 rounded-xl bg-black/90 hover:bg-black text-white font-semibold text-xs transition-all shrink-0 shadow-[0_0_25px_rgba(236,72,153,0.35)] hover:shadow-[0_0_35px_rgba(244,63,94,0.6)] overflow-visible group/btn active:scale-95"
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
                <span className="relative z-10 group-hover/btn:text-pink-200 transition-colors">
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
