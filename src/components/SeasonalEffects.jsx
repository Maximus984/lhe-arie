import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getCurrentSeason } from '../data/collectibles.js';
import toast from 'react-hot-toast';

// =====================================================
// ENHANCED SEASONAL & HOLIDAY EFFECTS
// Rich physics-based particles, season-specific
// lighting, Christmas snow + gift chest teaser
// =====================================================

const SEASON_THEMES = {
  christmas: {
    particles: ['❄️', '❅', '❆', '🎄', '⭐', '🎁', '✨', '🔔'],
    colors: ['#FF4444', '#22BB22', '#FFD700', '#FFFFFF'],
    count: 40,
    speed: { min: 8, max: 20 },
    sway: true,
    ambientColor: 'rgba(200, 20, 20, 0.03)',
    label: 'Merry Forge-mas 🎄',
    bgAccent: 'radial-gradient(ellipse at top left, rgba(220,38,38,0.1) 0%, transparent 60%), radial-gradient(ellipse at bottom right, rgba(22,163,74,0.08) 0%, transparent 60%)',
  },
  winter: {
    particles: ['❄️', '❅', '❆', '✦', '·'],
    colors: ['#E0F0FF', '#B0D4F1', '#FFFFFF', '#A8D8FF'],
    count: 35,
    speed: { min: 12, max: 26 },
    sway: true,
    ambientColor: 'rgba(0, 100, 200, 0.02)',
    label: 'Winter vibes ❄️',
    bgAccent: 'radial-gradient(ellipse at top left, rgba(6,182,212,0.08) 0%, transparent 60%), radial-gradient(ellipse at bottom right, rgba(59,130,246,0.06) 0%, transparent 60%)',
  },
  newyear: {
    particles: ['🎆', '🎇', '✨', '🥂', '🎊', '🎉', '⭐'],
    colors: ['#FFD700', '#FF6B6B', '#00E5FF', '#FFFFFF', '#FF1493'],
    count: 25,
    speed: { min: 4, max: 10 },
    sway: false,
    ambientColor: 'rgba(255, 215, 0, 0.03)',
    label: 'Happy New Year! 🎆',
    bgAccent: 'radial-gradient(ellipse at center, rgba(255,215,0,0.1) 0%, transparent 60%)',
  },
  halloween: {
    particles: ['🎃', '👻', '🦇', '💀', '🕷️', '🌙', '🕸️'],
    colors: ['#FF6600', '#8B00FF', '#00FF00', '#FF4500'],
    count: 22,
    speed: { min: 6, max: 15 },
    sway: true,
    ambientColor: 'rgba(139, 0, 139, 0.03)',
    label: 'Halloween 🎃',
    bgAccent: 'radial-gradient(ellipse at top left, rgba(217,70,239,0.1) 0%, transparent 60%), radial-gradient(ellipse at bottom right, rgba(249,115,22,0.1) 0%, transparent 60%)',
  },
  valentines: {
    particles: ['❤️', '💕', '💖', '💗', '🌹', '💝', '✨'],
    colors: ['#FF69B4', '#FF1493', '#DC143C', '#FFB6C1'],
    count: 25,
    speed: { min: 7, max: 16 },
    sway: true,
    ambientColor: 'rgba(255, 20, 147, 0.02)',
    label: 'Valentine\'s Day 💖',
    bgAccent: 'radial-gradient(ellipse at center, rgba(255,20,147,0.08) 0%, transparent 60%)',
  },
  july4th: {
    particles: ['🎆', '⭐', '✨', '🎇', '🇺🇸'],
    colors: ['#FF0000', '#FFFFFF', '#0000FF', '#FFD700'],
    count: 20,
    speed: { min: 4, max: 11 },
    sway: false,
    ambientColor: 'rgba(0, 0, 200, 0.02)',
    label: '4th of July 🎆',
    bgAccent: 'radial-gradient(ellipse at center, rgba(200,0,0,0.06) 0%, transparent 50%)',
  },
  stpatricks: {
    particles: ['🍀', '☘️', '💚', '✨', '🌿'],
    colors: ['#00FF00', '#228B22', '#32CD32', '#90EE90'],
    count: 22,
    speed: { min: 8, max: 17 },
    sway: true,
    ambientColor: 'rgba(0, 150, 0, 0.03)',
    label: 'St. Patrick\'s Day ☘️',
    bgAccent: 'radial-gradient(ellipse at center, rgba(0,150,0,0.08) 0%, transparent 60%)',
  },
  spring: {
    particles: ['🌸', '🌺', '🌼', '🦋', '🌷', '🌻', '🌱'],
    colors: ['#FFB7C5', '#FF69B4', '#98FB98', '#FFD700', '#DDA0DD'],
    count: 20,
    speed: { min: 10, max: 22 },
    sway: true,
    ambientColor: 'rgba(255, 182, 193, 0.02)',
    label: 'Spring is here 🌸',
    bgAccent: 'radial-gradient(ellipse at top, rgba(236,72,153,0.08) 0%, transparent 60%), radial-gradient(ellipse at bottom, rgba(34,197,94,0.06) 0%, transparent 60%)',
  },
  summer: {
    particles: ['☀️', '🌊', '🌴', '⭐', '🏄', '🌅'],
    colors: ['#FFD700', '#00CED1', '#FF6347', '#FFA500'],
    count: 14,
    speed: { min: 14, max: 28 },
    sway: false,
    ambientColor: 'rgba(255, 215, 0, 0.02)',
    label: 'Summer vibes ☀️',
    bgAccent: 'radial-gradient(ellipse at top, rgba(245,158,11,0.08) 0%, transparent 60%), radial-gradient(ellipse at bottom, rgba(20,184,166,0.08) 0%, transparent 60%)',
  },
  autumn: {
    particles: ['🍂', '🍁', '🍃', '🌾', '🍄', '🌰'],
    colors: ['#FF8C00', '#CD853F', '#DAA520', '#8B4513', '#D2691E'],
    count: 26,
    speed: { min: 8, max: 18 },
    sway: true,
    ambientColor: 'rgba(180, 90, 0, 0.03)',
    label: 'Autumn vibes 🍂',
    bgAccent: 'radial-gradient(ellipse at top, rgba(217,119,6,0.1) 0%, transparent 60%), radial-gradient(ellipse at bottom, rgba(120,53,4,0.08) 0%, transparent 60%)',
  },
};

// ---- Physics-based particle ----
function Particle({ emoji, delay, duration, startX, startY, sway, size, swayAmp }) {
  const swayPath = sway
    ? [startX, startX + swayAmp, startX - swayAmp * 0.6, startX + swayAmp * 0.3, startX]
    : startX;

  return (
    <motion.div
      initial={{ y: startY, x: startX, opacity: 0, rotate: 0, scale: 0.3 }}
      animate={{
        y: '115vh',
        x: swayPath,
        opacity: [0, 0.9, 0.9, 0.7, 0],
        rotate: [0, sway ? (Math.random() - 0.5) * 540 : 0],
        scale: [0.3, size, size, size * 0.85, 0.2],
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: [0.25, 0.46, 0.45, 0.94],
        times: [0, 0.1, 0.5, 0.85, 1],
      }}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        fontSize: `${size * 18}px`,
        zIndex: 9997,
        pointerEvents: 'none',
        willChange: 'transform, opacity',
        filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.4))',
        userSelect: 'none',
      }}
    >
      {emoji}
    </motion.div>
  );
}

// ---- Christmas gift teaser strip ----
function ChristmasGiftTeaser() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const shown = sessionStorage.getItem('mfs_xmas_toast');
    if (!shown) {
      setTimeout(() => {
        toast('🎄 Merry Forge-mas! Open the Gift Chest for exclusive collectibles!', {
          duration: 5000,
          style: {
            background: 'linear-gradient(135deg, rgba(140,10,10,0.95), rgba(10,80,10,0.95))',
            color: '#fff',
            border: '1px solid rgba(255,100,100,0.3)',
            borderRadius: '14px',
            fontSize: '13px',
            fontFamily: 'monospace',
          },
          icon: '🎅',
        });
        sessionStorage.setItem('mfs_xmas_toast', 'true');
      }, 2500);
    }
  }, []);

  if (!visible) return null;

  return (
    <motion.div
      initial={{ x: 120, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 120, opacity: 0 }}
      transition={{ delay: 3, type: 'spring', stiffness: 260, damping: 24 }}
      style={{
        position: 'fixed',
        bottom: '155px',
        right: '14px',
        zIndex: 9998,
        pointerEvents: 'auto',
      }}
    >
      <motion.div
        animate={{ rotate: [-2, 2, -2] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        onClick={() => setVisible(false)}
        title="Click to dismiss"
        style={{
          padding: '8px 12px',
          borderRadius: '14px',
          background: 'linear-gradient(135deg, rgba(160,15,15,0.9) 0%, rgba(15,90,15,0.9) 100%)',
          border: '1px solid rgba(255,100,100,0.3)',
          backdropFilter: 'blur(16px)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '7px',
          boxShadow: '0 4px 20px rgba(200,30,30,0.3)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Ribbon shine effect */}
        <motion.div
          animate={{ left: ['-60%', '160%'] }}
          transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 1.5, ease: 'easeInOut' }}
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            width: '40%',
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)',
            pointerEvents: 'none',
          }}
        />
        <span style={{ fontSize: '16px' }}>🎁</span>
        <div>
          <p style={{ margin: 0, fontSize: '10px', fontWeight: '800', color: '#fff', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Forge Gift Chest
          </p>
          <p style={{ margin: '1px 0 0', fontSize: '8px', color: 'rgba(255,255,255,0.55)', fontFamily: 'monospace' }}>
            Christmas exclusives inside ✨
          </p>
        </div>
        <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)' }}>✕</span>
      </motion.div>
    </motion.div>
  );
}

// ---- Ambient seasonal background tint ----
function SeasonalBackground({ theme }) {
  if (!theme?.bgAccent) return null;
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: theme.bgAccent,
        pointerEvents: 'none',
        zIndex: 9996,
        transition: 'background 2s ease',
      }}
    />
  );
}

// ---- Main SeasonalEffects ----
export default function SeasonalEffects() {
  const [enabled, setEnabled] = useState(true);
  const season = useMemo(() => getCurrentSeason(), []);
  const theme = SEASON_THEMES[season];
  const isChristmas = season === 'christmas';

  useEffect(() => {
    const reduceMotion = localStorage.getItem('mfs_reduce_motion') === 'true';
    setEnabled(!reduceMotion);
  }, []);

  const particles = useMemo(() => {
    if (!theme) return [];
    return Array.from({ length: theme.count }, (_, i) => ({
      id: i,
      emoji: theme.particles[Math.floor(Math.random() * theme.particles.length)],
      delay: Math.random() * 15,
      duration: theme.speed.min + Math.random() * (theme.speed.max - theme.speed.min),
      startX: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1400),
      startY: -40 - Math.random() * 100,
      size: 0.55 + Math.random() * 0.9,
      swayAmp: 30 + Math.random() * 80,
    }));
  }, [theme]);

  if (!enabled || !theme) return null;

  return (
    <>
      {/* Ambient bg tint */}
      <SeasonalBackground theme={theme} />

      {/* Particles layer */}
      <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 9997 }}>
        {particles.map(p => (
          <Particle key={p.id} {...p} sway={theme.sway} />
        ))}
      </div>

      {/* Christmas gift teaser badge */}
      {isChristmas && (
        <AnimatePresence>
          <ChristmasGiftTeaser />
        </AnimatePresence>
      )}

      {/* Season badge (dismissible) */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2.5, duration: 0.6 }}
        style={{
          position: 'fixed',
          top: '70px',
          left: '16px',
          zIndex: 9999,
          pointerEvents: 'auto',
        }}
      >
        <motion.div
          whileHover={{ scale: 1.04 }}
          onClick={() => setEnabled(false)}
          title="Click to dismiss seasonal effects"
          style={{
            padding: '5px 12px',
            borderRadius: '10px',
            background: 'rgba(8,8,12,0.88)',
            border: '1px solid rgba(255,255,255,0.07)',
            backdropFilter: 'blur(14px)',
            display: 'flex',
            alignItems: 'center',
            gap: '7px',
            cursor: 'pointer',
          }}
        >
          <motion.span
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            style={{ fontSize: '13px' }}
          >
            {theme.particles[0]}
          </motion.span>
          <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.35)', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            {theme.label}
          </span>
          <span style={{ fontSize: '8px', color: 'rgba(255,255,255,0.2)' }}>✕</span>
        </motion.div>
      </motion.div>
    </>
  );
}
