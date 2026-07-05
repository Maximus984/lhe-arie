import React, { useState, useEffect, useRef, Suspense } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import { Stars, Float, Sphere, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';
import IntroSequence3D from '../components/IntroSequence3D.jsx';
import AIChatSystem from '../components/AIChatSystem.jsx';
import { Disc, Zap, Cpu, Gamepad2, ArrowRight, Music, Star, Globe, Users, Award, ChevronDown } from 'lucide-react';
import LiveViewerCounter from '../components/LiveViewerCounter.jsx';

// ---- Hero 3D background ----
function HeroParticle({ pos, color }) {
  const ref = useRef();
  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.position.y = pos[1] + Math.sin(clock.getElapsedTime() * 0.5 + pos[0]) * 0.4;
      ref.current.rotation.x = clock.getElapsedTime() * 0.3;
    }
  });
  return (
    <mesh ref={ref} position={pos}>
      <octahedronGeometry args={[0.08]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1} />
    </mesh>
  );
}

function HeroOrb() {
  const ref = useRef();
  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.y = clock.getElapsedTime() * 0.08;
  });
  return (
    <Float speed={1.2} floatIntensity={0.5} rotationIntensity={0.2}>
      <mesh ref={ref}>
        <Sphere args={[2.2, 64, 64]}>
          <MeshDistortMaterial color="#050510" emissive="#10B981" emissiveIntensity={0.12} distort={0.4} speed={1} metalness={0.95} roughness={0.05} />
        </Sphere>
      </mesh>
      <pointLight color="#10B981" intensity={3} distance={10} />
      <pointLight color="#00E5FF" intensity={1.5} distance={12} position={[4, 2, 2]} />
    </Float>
  );
}

function HeroScene() {
  const particles = [
    [-5, 1, -2], [5, -1, -1], [-4, -2, 1], [4, 2, 0.5],
    [-3, 3, -1.5], [3, -3, 0], [0.5, 4, 1], [-5.5, 0, 0],
  ].map((p, i) => ({ pos: p, color: i % 2 === 0 ? '#10B981' : '#00E5FF' }));

  return (
    <>
      <Stars radius={80} depth={50} count={2000} factor={2} saturation={0} fade speed={0.5} />
      <ambientLight intensity={0.05} />
      <HeroOrb />
      {particles.map((p, i) => <HeroParticle key={i} {...p} />)}
    </>
  );
}

// ---- Section reveal animation ----
function RevealSection({ children, delay = 0 }) {
  const ref = useRef();
  const inView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}

// ---- Fact cards ----
const FORGE_FACTS = [
  { icon: '🎵', stat: '50+', label: 'Tracks Produced', color: '#00E5FF' },
  { icon: '⚡', stat: '100+', label: 'Live Events Visualized', color: '#10B981' },
  { icon: '🤖', stat: '4.7B', label: 'AI Context Tokens/Cycle', color: '#6366F1' },
  { icon: '🎮', stat: '2026', label: 'Game Launch Target', color: '#EF4444' },
  { icon: '🌍', stat: '12+', label: 'Countries Reached', color: '#F59E0B' },
  { icon: '🔥', stat: '1', label: 'Visionary Founder', color: '#EC4899' },
];

const PILLARS = [
  {
    key: 'records',
    icon: <Disc size={28} />,
    title: 'Prime Records',
    subtitle: 'Music Division',
    color: '#00E5FF',
    desc: 'High-energy remasters, original productions, and exclusive artist collaborations. Available on Spotify, Apple Music, BandLab, and SoundCloud.',
    facts: ['50+ original tracks', 'Multi-genre catalog', 'Collaboration network', 'Studio-grade mastering'],
  },
  {
    key: 'djem',
    icon: <Zap size={28} />,
    title: 'DJ Em',
    subtitle: 'Live Events & Visuals',
    color: '#10B981',
    desc: 'Professional stage lighting design using TouchDesigner and DMX automation. Full live visual rigs for concerts, festivals, and private events.',
    facts: ['100+ events performed', 'TouchDesigner visuals', 'DMX automation', 'Custom light rigs'],
  },
  {
    key: 'aries',
    icon: <Cpu size={28} />,
    title: 'Aries Technology',
    subtitle: 'AI & Software Division',
    color: '#6366F1',
    desc: 'Local LLM infrastructure built on Ollama. Zero cloud dependency. The Aries AI Core v4.0 launches September 2026 with custom API and Python SDK.',
    facts: ['Local LLM architecture', 'Custom API endpoints', 'Python SDK', 'Sep 2026 rollout'],
  },
  {
    key: 'gamedev',
    icon: <Gamepad2 size={28} />,
    title: 'Game Development',
    subtitle: 'Interactive Media',
    color: '#EF4444',
    desc: 'Atmospheric survival horror built in Unity. Navigate bio-concrete Japanese environments, solve cybernetic grid puzzles, and survive AI-driven stalkers.',
    facts: ['Unity game engine', 'Survival horror genre', 'Japanese architecture', 'Playable demo live'],
  },
];

const OUR_WORK = [
  { title: 'Adrenaline Rush', cat: 'Music Production', color: '#00E5FF', emoji: '🎵' },
  { title: 'Dark Queen', cat: 'Music Production', color: '#00E5FF', emoji: '👑' },
  { title: 'The Bio Forge Stage', cat: 'Live Event Rig', color: '#10B981', emoji: '💡' },
  { title: 'Echoes of the Forge', cat: 'Game Development', color: '#EF4444', emoji: '🎮' },
  { title: 'Aries Coder LLM', cat: 'AI Development', color: '#6366F1', emoji: '🤖' },
  { title: 'Electric Whisper', cat: 'Music Production', color: '#00E5FF', emoji: '🎶' },
];

const TESTIMONIALS = [
  { name: 'DJ Zeppelin', role: 'Collaborator & Tech Lead', text: 'The Aries AI pipeline is unlike anything I\'ve worked with — completely local, blazing fast, and tailored to creative workflows.', avatar: 'ZL', color: '#6366F1' },
  { name: 'Scene Magazine', role: 'Press Feature', text: 'Maxx Forge Studio is one of the few outfits operating at the true intersection of music technology, visual arts, and AI engineering.', avatar: 'SM', color: '#F59E0B' },
  { name: 'Luna V.', role: 'Event Client', text: 'DJ Em\'s lighting setup transformed our venue entirely. The DMX automation was seamless and the TouchDesigner visuals were jaw-dropping.', avatar: 'LV', color: '#10B981' },
];

export default function Landing() {
  const [introComplete, setIntroComplete] = useState(() => {
    return sessionStorage.getItem('mfs_intro_done') === 'true';
  });
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleIntroComplete = () => {
    sessionStorage.setItem('mfs_intro_done', 'true');
    setIntroComplete(true);
  };

  if (!introComplete) {
    return <IntroSequence3D onComplete={handleIntroComplete} />;
  }

  return (
    <div className="min-h-screen bg-[#020204] text-white overflow-x-hidden">
      {/* Top nav */}
      <nav className={`fixed top-0 left-0 right-0 z-40 px-6 md:px-12 py-4 flex items-center justify-between transition-all duration-500 ${scrolled ? 'bg-[#050508]/90 backdrop-blur-xl border-b border-white/5' : 'bg-transparent'}`}>
        <div className="flex items-center gap-2.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#10B981]" />
          <span className="font-display font-black text-lg tracking-widest text-white">MAXX FORGE <span className="text-emerald-400">STUDIO™</span></span>
        </div>
        <div className="flex items-center gap-3">
          <a href="#pillars" className="hidden md:block text-xs font-mono text-white/40 hover:text-white/80 tracking-wider uppercase transition">Divisions</a>
          <a href="#work" className="hidden md:block text-xs font-mono text-white/40 hover:text-white/80 tracking-wider uppercase transition">Our Work</a>
          <a href="#about" className="hidden md:block text-xs font-mono text-white/40 hover:text-white/80 tracking-wider uppercase transition">About</a>
          <Link
            to="/login"
            className="px-5 py-2.5 bg-emerald-500 text-neutral-950 rounded-xl text-xs font-bold tracking-wide hover:bg-emerald-400 transition shadow-[0_0_15px_rgba(16,185,129,0.3)]"
          >
            Enter the Forge →
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* 3D canvas background */}
        <div className="absolute inset-0 z-0">
          <Canvas camera={{ position: [0, 0, 10], fov: 55 }} gl={{ antialias: true, alpha: false }}>
            <Suspense fallback={null}>
              <HeroScene />
            </Suspense>
          </Canvas>
        </div>

        {/* Vignette */}
        <div className="absolute inset-0 z-1 pointer-events-none" style={{ background: 'radial-gradient(ellipse at center, transparent 30%, rgba(2,2,4,0.85) 100%)' }} />
        <div className="absolute inset-x-0 bottom-0 h-40 z-1 pointer-events-none" style={{ background: 'linear-gradient(to top, #020204, transparent)' }} />

        {/* Hero text */}
        <div className="relative z-10 text-center flex flex-col items-center gap-8 px-6 max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="flex items-center justify-center gap-2 mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-mono text-emerald-400 tracking-[0.25em] uppercase">Interconnected Digital Ecosystem</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <h1 className="text-5xl sm:text-7xl md:text-8xl font-display font-black tracking-tighter leading-none">
              WHERE MUSIC,<br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-cyan-400 to-indigo-400">TECH & ART</span><br/>
              COLLIDE.
            </h1>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-base sm:text-lg font-light text-white/50 leading-relaxed max-w-2xl"
          >
            Maxx Forge Studio™ is a multi-division creative technology company spanning music production, live event visuals, AI software development, and gaming.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            <LiveViewerCounter style="badge" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row items-center gap-4"
          >
            <Link
              to="/login"
              className="group px-8 py-4 bg-gradient-to-r from-emerald-500 to-cyan-500 text-neutral-950 rounded-2xl font-bold text-sm hover:from-emerald-400 hover:to-cyan-400 transition-all duration-300 shadow-[0_0_30px_rgba(16,185,129,0.4)] flex items-center gap-2"
            >
              Enter the Ecosystem
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <a
              href="#pillars"
              className="px-8 py-4 bg-white/5 border border-white/10 text-white rounded-2xl font-semibold text-sm hover:bg-white/10 hover:border-white/20 transition flex items-center gap-2"
            >
              Explore Divisions
              <ChevronDown size={16} />
            </a>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <span className="text-[9px] font-mono text-white/20 uppercase tracking-widest">Scroll</span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-px h-8 bg-gradient-to-b from-white/20 to-transparent"
          />
        </motion.div>
      </section>

      {/* Stats Bar */}
      <section className="py-16 px-6 border-y border-white/5 bg-white/[0.02]">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {FORGE_FACTS.map((fact, i) => (
            <RevealSection key={i} delay={i * 0.08}>
              <div className="flex flex-col items-center text-center gap-2">
                <span className="text-2xl">{fact.icon}</span>
                <span className="text-2xl font-display font-black" style={{ color: fact.color }}>{fact.stat}</span>
                <span className="text-[10px] font-mono text-white/30 uppercase tracking-wider">{fact.label}</span>
              </div>
            </RevealSection>
          ))}
        </div>
      </section>

      {/* Four Pillars */}
      <section id="pillars" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <RevealSection>
            <div className="flex flex-col items-center text-center gap-4 mb-16">
              <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-[10px] font-mono text-emerald-400 uppercase tracking-wider">Four Pillars</span>
              <h2 className="text-4xl md:text-5xl font-display font-black tracking-tight">THE CORE DIVISIONS</h2>
              <p className="text-sm text-white/40 max-w-xl leading-relaxed font-mono">Four interconnected branches. One unified vision. Seamlessly integrated like an operating system for creativity.</p>
            </div>
          </RevealSection>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {PILLARS.map((pillar, i) => (
              <RevealSection key={pillar.key} delay={i * 0.1}>
                <motion.div
                  whileHover={{ y: -6, scale: 1.01 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                  className="group relative p-7 rounded-3xl overflow-hidden border transition-all duration-500"
                  style={{
                    background: `${pillar.color}06`,
                    borderColor: `${pillar.color}15`,
                  }}
                >
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: `radial-gradient(circle at top left, ${pillar.color}10, transparent 60%)` }} />
                  
                  <div className="relative z-10 flex flex-col gap-5">
                    <div className="flex items-start justify-between">
                      <div className="p-3 rounded-2xl" style={{ background: `${pillar.color}15`, color: pillar.color }}>
                        {pillar.icon}
                      </div>
                      <span className="text-[10px] font-mono text-white/20 uppercase">{pillar.subtitle}</span>
                    </div>

                    <div>
                      <h3 className="text-2xl font-display font-bold mb-2 group-hover:text-white transition" style={{ color: `${pillar.color}CC` }}>{pillar.title}</h3>
                      <p className="text-sm text-white/50 leading-relaxed">{pillar.desc}</p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {pillar.facts.map((fact, fi) => (
                        <span key={fi} className="px-2.5 py-1 text-[10px] font-mono rounded-lg border" style={{ borderColor: `${pillar.color}25`, color: `${pillar.color}90`, background: `${pillar.color}08` }}>
                          {fact}
                        </span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              </RevealSection>
            ))}
          </div>
        </div>
      </section>

      {/* Our Work */}
      <section id="work" className="py-24 px-6 bg-white/[0.02] border-y border-white/5">
        <div className="max-w-6xl mx-auto">
          <RevealSection>
            <div className="flex flex-col items-center text-center gap-4 mb-14">
              <span className="px-3 py-1 bg-cyan-500/10 border border-cyan-500/20 rounded-full text-[10px] font-mono text-cyan-400 uppercase tracking-wider">Portfolio</span>
              <h2 className="text-4xl md:text-5xl font-display font-black tracking-tight">OUR WORK</h2>
            </div>
          </RevealSection>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {OUR_WORK.map((item, i) => (
              <RevealSection key={i} delay={i * 0.07}>
                <motion.div
                  whileHover={{ scale: 1.03, y: -4 }}
                  className="group relative p-6 rounded-2xl border border-white/5 bg-white/3 overflow-hidden cursor-pointer"
                  style={{ background: `${item.color}05` }}
                >
                  <div className="absolute top-0 right-0 text-6xl opacity-5 translate-x-4 -translate-y-2 group-hover:opacity-10 transition-opacity duration-500">{item.emoji}</div>
                  <div className="relative z-10">
                    <span className="text-3xl mb-3 block">{item.emoji}</span>
                    <h4 className="font-display font-bold text-white text-lg mb-1">{item.title}</h4>
                    <p className="text-[11px] font-mono uppercase tracking-wider" style={{ color: `${item.color}80` }}>{item.cat}</p>
                  </div>
                </motion.div>
              </RevealSection>
            ))}
          </div>
        </div>
      </section>

      {/* About the Founder & Mission Statement */}
      <section id="about" className="py-28 px-6 relative overflow-hidden">
        {/* Glow background decoration */}
        <div className="absolute right-0 top-1/4 w-[500px] h-[500px] rounded-full bg-emerald-500/[0.03] blur-[120px] pointer-events-none" />
        <div className="absolute left-0 bottom-1/4 w-[400px] h-[400px] rounded-full bg-cyan-500/[0.02] blur-[100px] pointer-events-none" />

        <div className="max-w-5xl mx-auto">
          <RevealSection>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              {/* Left Column: Meet Maximus (7 cols) */}
              <div className="lg:col-span-7 flex flex-col gap-6">
                <span className="px-3.5 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-[10px] font-mono text-emerald-400 uppercase tracking-widest w-fit font-bold">
                  The Founder
                </span>
                <h2 className="text-4xl md:text-5xl font-display font-black tracking-tight leading-none text-white">
                  MEET<br/>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-cyan-400 to-indigo-400">MAXIMUS.</span>
                </h2>
                
                <div className="flex flex-col gap-4 text-base text-white/50 leading-relaxed font-light">
                  <p>
                    Maximus is the founder and creative director of Maxx Forge Studio™ — a multi-discipline creative technology house built on the intersection of audio engineering, interactive software, live event automation, and artificial intelligence.
                  </p>
                  <p>
                    By merging a modular ecosystem design with state-of-the-art developer pipelines, the studio serves as a playground for clean, premium interfaces that enable artists to design the future of digital art and live stage design.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2 mt-2">
                  {['Music Producer', 'Creative Director', 'AI Architect', 'Wabi-Sabi Systems', 'Studio Founder'].map(tag => (
                    <span key={tag} className="px-3.5 py-1.5 bg-white/[0.03] border border-white/5 rounded-xl text-[10px] font-mono text-white/40 tracking-wider">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Right Column: Mission Statement Card & Photo Placeholder (5 cols) */}
              <div className="lg:col-span-5 flex flex-col gap-6">
                {/* Mission Statement Card */}
                <div className="relative glass-panel rounded-2xl p-6 overflow-hidden border border-white/10"
                  style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.04) 0%, rgba(0,229,255,0.02) 100%)' }}>
                  <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl pointer-events-none" />
                  
                  <span className="text-xs font-mono text-emerald-400 font-bold uppercase tracking-widest block mb-2">✦ Our Mission</span>
                  <h3 className="text-xl font-display font-bold text-white mb-3">Imagination first. Always.</h3>
                  <p className="text-xs text-white/60 leading-relaxed font-light">
                    "This company was built entirely on <strong className="text-emerald-400 font-bold">imagination</strong>, and we value your imagination like a lot. Every line of code, every track produced, and every visual cue is a blank canvas for creative expression. We keep things clean, premium, and focused so your ideas can fly."
                  </p>
                </div>

                {/* Profile Card / Photo slot */}
                <div className="flex items-center gap-4 p-4 rounded-2xl border border-white/5 bg-white/[0.02]">
                  <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border border-emerald-500/20 flex-shrink-0 flex items-center justify-center">
                    {/* Placeholder slot — swap with <img src="/brand/maximus.jpg" alt="Maximus" className="w-full h-full object-cover" /> when added */}
                    <span className="text-xl font-black text-emerald-400 font-display">MX</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white leading-tight">Maximus</h4>
                    <p className="text-xs text-white/30 font-mono mt-0.5">Founder & Systems Architect</p>
                    <span className="inline-block mt-1 text-[9px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-mono font-bold uppercase border border-emerald-500/20">
                      🔥 Founder
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </RevealSection>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-6 bg-white/[0.02] border-y border-white/5">
        <div className="max-w-5xl mx-auto">
          <RevealSection>
            <div className="flex flex-col items-center text-center gap-4 mb-14">
              <span className="px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full text-[10px] font-mono text-amber-400 uppercase tracking-wider">Testimonials</span>
              <h2 className="text-3xl md:text-4xl font-display font-black tracking-tight">WHAT THEY SAY</h2>
            </div>
          </RevealSection>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <RevealSection key={i} delay={i * 0.1}>
                <div className="flex flex-col gap-4 p-6 rounded-2xl border border-white/5 bg-white/3">
                  <div className="flex gap-1">{[...Array(5)].map((_, s) => <Star key={s} size={12} fill="#F59E0B" className="text-amber-400" />)}</div>
                  <p className="text-sm text-white/60 leading-relaxed italic">"{t.text}"</p>
                  <div className="flex items-center gap-3 pt-2 border-t border-white/5">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold" style={{ background: `${t.color}15`, color: t.color, border: `1px solid ${t.color}30` }}>
                      {t.avatar}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{t.name}</p>
                      <p className="text-[10px] font-mono text-white/30">{t.role}</p>
                    </div>
                  </div>
                </div>
              </RevealSection>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center flex flex-col items-center gap-8">
          <RevealSection>
            <div className="flex flex-col items-center gap-6">
              <span className="text-5xl">🔥</span>
              <h2 className="text-4xl md:text-5xl font-display font-black tracking-tight">
                READY TO ENTER<br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">THE FORGE?</span>
              </h2>
              <p className="text-sm text-white/40 leading-relaxed max-w-lg">
                Create your Forge Account today. Access the full ecosystem — music player, AI terminal, event calendar, staff tools, and more.
              </p>
              <Link
                to="/login"
                className="group px-10 py-4 bg-gradient-to-r from-emerald-500 to-cyan-500 text-neutral-950 rounded-2xl font-black text-base hover:from-emerald-400 hover:to-cyan-400 transition-all duration-300 shadow-[0_0_40px_rgba(16,185,129,0.4)] flex items-center gap-3"
              >
                Enter the Matrix
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </RevealSection>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-10">
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-display font-black text-sm text-white">MAXX FORGE STUDIO™</span>
              </div>
              <p className="text-[11px] font-mono text-white/30 leading-relaxed">The interconnected digital ecosystem for creative technology.</p>
            </div>
            {[
              { title: 'Divisions', links: ['Prime Records', 'DJ Em Events', 'Aries AI', 'Game Dev'] },
              { title: 'Platform', links: ['Dashboard', 'AI Assistant', 'Calendar', 'Forms'] },
              { title: 'Company', links: ['About', 'Careers', 'Press', 'Contact'] },
            ].map(col => (
              <div key={col.title} className="flex flex-col gap-3">
                <p className="text-[10px] font-mono text-white/20 uppercase tracking-widest font-bold">{col.title}</p>
                {col.links.map(l => (
                  <Link key={l} to="/login" className="text-xs text-white/40 hover:text-white/70 transition">{l}</Link>
                ))}
              </div>
            ))}
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 border-t border-white/5">
            <span className="text-[10px] font-mono text-white/20">© 2026 Maxx Forge Studio™. All rights reserved.</span>
            <div className="flex gap-4 text-[10px] font-mono text-white/20">
              <span className="hover:text-white/40 cursor-pointer transition">Privacy Policy</span>
              <span className="hover:text-white/40 cursor-pointer transition">Terms of Service</span>
              <span className="hover:text-white/40 cursor-pointer transition">Cookie Policy</span>
            </div>
          </div>
        </div>
      </footer>

      {/* AI Chat available on landing */}
      <AIChatSystem />
    </div>
  );
}
