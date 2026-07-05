import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// =====================================================
// SEASONAL & HOLIDAY ANIMATION EFFECTS
// Automatically detects current date and renders
// thematic particle overlays with smooth animations
// =====================================================

function getSeason() {
  const now = new Date();
  const month = now.getMonth(); // 0-indexed
  const day = now.getDate();

  // Specific holidays first
  if (month === 11 && day >= 20 && day <= 31) return 'christmas';
  if (month === 0 && day === 1) return 'newyear';
  if (month === 9 && day >= 25 && day <= 31) return 'halloween';
  if (month === 1 && day >= 10 && day <= 16) return 'valentines';
  if (month === 6 && day === 4) return 'july4th';
  if (month === 2 && day === 17) return 'stpatricks';

  // Seasons
  if (month >= 2 && month <= 4) return 'spring';
  if (month >= 5 && month <= 7) return 'summer';
  if (month >= 8 && month <= 10) return 'autumn';
  return 'winter';
}

const PARTICLE_CONFIGS = {
  christmas: {
    particles: ['❄️', '🎄', '⭐', '🎁', '✨'],
    colors: ['#FF0000', '#00FF00', '#FFD700', '#FFFFFF'],
    count: 25,
    speed: { min: 8, max: 18 },
    sway: true,
  },
  winter: {
    particles: ['❄️', '❅', '❆', '✦'],
    colors: ['#E0F0FF', '#B0D4F1', '#FFFFFF'],
    count: 30,
    speed: { min: 10, max: 22 },
    sway: true,
  },
  newyear: {
    particles: ['🎆', '🎇', '✨', '🥂', '🎊'],
    colors: ['#FFD700', '#FF6B6B', '#00E5FF', '#FFFFFF'],
    count: 20,
    speed: { min: 5, max: 12 },
    sway: false,
  },
  halloween: {
    particles: ['🎃', '👻', '🦇', '🕷️', '💀'],
    colors: ['#FF6600', '#8B00FF', '#00FF00'],
    count: 18,
    speed: { min: 7, max: 15 },
    sway: true,
  },
  valentines: {
    particles: ['❤️', '💕', '💖', '💗', '🌹'],
    colors: ['#FF69B4', '#FF1493', '#DC143C'],
    count: 22,
    speed: { min: 8, max: 16 },
    sway: true,
  },
  july4th: {
    particles: ['🎆', '⭐', '🇺🇸', '✨', '🎇'],
    colors: ['#FF0000', '#FFFFFF', '#0000FF'],
    count: 20,
    speed: { min: 5, max: 12 },
    sway: false,
  },
  stpatricks: {
    particles: ['🍀', '☘️', '💚', '✨'],
    colors: ['#00FF00', '#228B22', '#32CD32'],
    count: 20,
    speed: { min: 8, max: 16 },
    sway: true,
  },
  spring: {
    particles: ['🌸', '🌺', '🌼', '🦋', '🌷'],
    colors: ['#FFB7C5', '#FF69B4', '#98FB98'],
    count: 18,
    speed: { min: 10, max: 20 },
    sway: true,
  },
  summer: {
    particles: ['☀️', '🌊', '🌴', '⭐'],
    colors: ['#FFD700', '#00CED1', '#FF6347'],
    count: 12,
    speed: { min: 12, max: 24 },
    sway: false,
  },
  autumn: {
    particles: ['🍂', '🍁', '🍃', '🌾'],
    colors: ['#FF8C00', '#CD853F', '#DAA520', '#8B4513'],
    count: 22,
    speed: { min: 9, max: 18 },
    sway: true,
  },
};

function Particle({ emoji, delay, duration, startX, sway, size }) {
  return (
    <motion.div
      initial={{ y: -60, x: startX, opacity: 0, rotate: 0, scale: 0.5 }}
      animate={{
        y: '110vh',
        x: sway
          ? [startX, startX + (Math.random() - 0.5) * 120, startX + (Math.random() - 0.5) * 80, startX]
          : startX,
        opacity: [0, 1, 1, 0.6, 0],
        rotate: [0, Math.random() * 360],
        scale: [0.5, size, size, size * 0.8],
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: 'linear',
      }}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        fontSize: `${size * 16}px`,
        zIndex: 9998,
        pointerEvents: 'none',
        willChange: 'transform',
        filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
      }}
    >
      {emoji}
    </motion.div>
  );
}

export default function SeasonalEffects() {
  const [enabled, setEnabled] = useState(true);

  useEffect(() => {
    const reduceMotion = localStorage.getItem('mfs_reduce_motion') === 'true';
    setEnabled(!reduceMotion);
  }, []);

  const season = useMemo(() => getSeason(), []);
  const config = PARTICLE_CONFIGS[season];

  const particles = useMemo(() => {
    if (!config) return [];
    return Array.from({ length: config.count }, (_, i) => ({
      id: i,
      emoji: config.particles[Math.floor(Math.random() * config.particles.length)],
      delay: Math.random() * 12,
      duration: config.speed.min + Math.random() * (config.speed.max - config.speed.min),
      startX: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1400),
      size: 0.6 + Math.random() * 0.8,
    }));
  }, [config]);

  if (!enabled || !config) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 9998 }}>
      {particles.map(p => (
        <Particle
          key={p.id}
          emoji={p.emoji}
          delay={p.delay}
          duration={p.duration}
          startX={p.startX}
          sway={config.sway}
          size={p.size}
        />
      ))}

      {/* Seasonal banner badge */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2, duration: 0.6 }}
        style={{
          position: 'fixed',
          bottom: '80px',
          left: '16px',
          zIndex: 9999,
          pointerEvents: 'auto',
        }}
      >
        <div
          style={{
            padding: '6px 14px',
            borderRadius: '12px',
            background: 'rgba(10,10,15,0.85)',
            border: '1px solid rgba(255,255,255,0.08)',
            backdropFilter: 'blur(12px)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            cursor: 'pointer',
          }}
          onClick={() => setEnabled(false)}
          title="Click to dismiss seasonal effects"
        >
          <span style={{ fontSize: '14px' }}>{config.particles[0]}</span>
          <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            {season.replace(/([A-Z])/g, ' $1').trim()} vibes
          </span>
          <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.2)' }}>✕</span>
        </div>
      </motion.div>
    </div>
  );
}
