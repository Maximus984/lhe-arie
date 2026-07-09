import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, VolumeX, Sparkles, SkipForward, Play, Pause } from 'lucide-react';

export default function PageTransitionLoader({ onComplete, duration = 1800 }) {
  const [progress, setProgress] = useState(0);
  const [clicks, setClicks] = useState(0);
  const [floatingParticles, setFloatingParticles] = useState([]);
  
  // Audio state
  const [isPlayingMusic, setIsPlayingMusic] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  
  // Extended Slow Mode state (toggle slow loading to play game and listen to music)
  const [isSlowMode, setIsSlowMode] = useState(false);

  const audioRef = useRef(null);
  const clickSynthRef = useRef(null);

  // Initialize Web Audio oscillator synth for click sound
  const playClickSynth = () => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      
      const ctx = clickSynthRef.current || new AudioContext();
      if (!clickSynthRef.current) clickSynthRef.current = ctx;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      // Play a short synth beep
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(220 + clicks * 15, ctx.currentTime); // Pitch increases with clicks!
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);

      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } catch (_) {}
  };

  useEffect(() => {
    // Determine loading speed
    const loadTime = isSlowMode ? 25000 : duration;
    const intervalTime = 50;
    const step = (intervalTime / loadTime) * 100;

    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          onComplete();
          return 100;
        }
        return prev + step;
      });
    }, intervalTime);

    return () => clearInterval(interval);
  }, [isSlowMode, duration, onComplete]);

  // Audio setup
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.muted = isMuted;
    }
  }, [isMuted]);

  const handleMusicPlayToggle = () => {
    if (!audioRef.current) return;
    if (isPlayingMusic) {
      audioRef.current.pause();
      setIsPlayingMusic(false);
    } else {
      setIsMuted(false);
      audioRef.current.play().then(() => {
        setIsPlayingMusic(true);
      }).catch(() => {
        setIsPlayingMusic(false);
      });
    }
  };

  const handleEmblemClick = (e) => {
    setClicks(prev => prev + 1);
    playClickSynth();

    // Create floating score animation particle
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const newParticle = {
      id: Date.now() + Math.random(),
      x, y,
      value: `+${Math.floor(Math.random() * 5) + 1} Code Power`
    };

    setFloatingParticles(prev => [...prev, newParticle].slice(-8)); // Limit to last 8
  };

  // Clean particles after animation
  useEffect(() => {
    if (floatingParticles.length > 0) {
      const t = setTimeout(() => {
        setFloatingParticles([]);
      }, 1000);
      return () => clearTimeout(t);
    }
  }, [floatingParticles]);

  return (
    <div style={styles.container}>
      <div style={styles.noise} />
      
      {/* Background loop audio */}
      <audio
        ref={audioRef}
        src="/audio/album_dj_em/Shadow Dance (1).mp3"
        loop
      />

      <div style={styles.gridOverlay} />

      <div style={styles.content}>
        {/* Header info */}
        <div style={styles.headerBlock}>
          <div style={styles.badgeRow}>
            <span style={styles.badge}>ARIES OS ENGINE v4.0</span>
            <span style={styles.liveIndicator}>SYSTEM LOADING</span>
          </div>
          <h2 style={styles.title}>MAXX FORGE STUDIO</h2>
        </div>

        {/* Forge Clicker Game Box */}
        <div style={styles.gameCard}>
          <p style={styles.gameHint}>
            Interactive Forge Node: Click the Core to generate compiled data particles while loading.
          </p>

          {/* Core Interactive Button */}
          <div style={{ position: 'relative', width: '130px', height: '130px', margin: '15px auto' }}>
            <motion.button
              type="button"
              onClick={handleEmblemClick}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={styles.emblemBtn}
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
                style={styles.emblemRing}
              />
              <div style={styles.emblemInner}>
                <span style={{ fontSize: '26px' }}>✦</span>
              </div>
            </motion.button>

            {/* Click Particles float up */}
            <AnimatePresence>
              {floatingParticles.map(p => (
                <motion.span
                  key={p.id}
                  initial={{ opacity: 1, y: p.y - 40, x: p.x - 50, scale: 0.8 }}
                  animate={{ opacity: 0, y: p.y - 120, x: p.x - 50 + (Math.random() * 40 - 20), scale: 1.1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.8 }}
                  style={styles.particle}
                >
                  {p.value}
                </motion.span>
              ))}
            </AnimatePresence>
          </div>

          {/* Click score display */}
          <div style={styles.scoreRow}>
            <span style={styles.scoreLabel}>Forge Code Power Gathered</span>
            <span style={styles.scoreValue}>{clicks * 10} particles</span>
          </div>
        </div>

        {/* Audio / Soundtrack controller during loads */}
        <div style={styles.audioControls}>
          <button 
            type="button"
            onClick={handleMusicPlayToggle}
            style={{
              ...styles.playBtn,
              background: isPlayingMusic ? 'rgba(16,185,129,0.1)' : 'rgba(255,255,255,0.05)',
              borderColor: isPlayingMusic ? 'rgba(16,185,129,0.3)' : 'rgba(255,255,255,0.1)'
            }}
          >
            {isPlayingMusic ? <Pause size={12} color="#10B981" /> : <Play size={12} />}
            <span style={{ fontSize: '9px', fontFamily: 'monospace' }}>
              {isPlayingMusic ? 'PAUSE STUDIO RADIO' : 'PLAY LOADING TRACK'}
            </span>
          </button>
          
          <button
            type="button"
            onClick={() => setIsMuted(!isMuted)}
            disabled={!isPlayingMusic}
            style={{
              ...styles.muteBtn,
              opacity: isPlayingMusic ? 1 : 0.4,
              cursor: isPlayingMusic ? 'pointer' : 'not-allowed'
            }}
          >
            {isMuted ? <VolumeX size={12} /> : <Volume2 size={12} color="#00E5FF" />}
          </button>

          {/* Waveform indicator */}
          {isPlayingMusic && !isMuted && (
            <div style={styles.waveContainer}>
              <span style={{ ...styles.waveBar, animationDelay: '0.1s' }} />
              <span style={{ ...styles.waveBar, animationDelay: '0.3s' }} />
              <span style={{ ...styles.waveBar, animationDelay: '0.5s' }} />
            </div>
          )}
        </div>

        {/* Options Row */}
        <div style={styles.optionsRow}>
          <button
            type="button"
            onClick={() => {
              setIsSlowMode(!isSlowMode);
              setProgress(0);
            }}
            style={{
              ...styles.slowToggle,
              color: isSlowMode ? '#FBBF24' : 'rgba(255,255,255,0.3)',
              borderColor: isSlowMode ? 'rgba(251,191,36,0.3)' : 'rgba(255,255,255,0.08)',
              background: isSlowMode ? 'rgba(251,191,36,0.05)' : 'transparent'
            }}
          >
            <Sparkles size={11} /> {isSlowMode ? 'SLOW MODE ENABLED' : 'SLOW MODE FOR MINI-GAME'}
          </button>
          
          <button
            type="button"
            onClick={onComplete}
            style={styles.skipBtn}
          >
            <SkipForward size={11} /> SKIP LOAD
          </button>
        </div>

        {/* Progress Bar Container */}
        <div style={styles.progressBox}>
          <div style={styles.progressBg}>
            <motion.div
              style={{ ...styles.progressFill, width: `${progress}%` }}
              transition={{ duration: 0.08 }}
            />
          </div>
          <div style={styles.progressLabels}>
            <span>COMPILED METRICS: {Math.round(progress)}%</span>
            <span>TARGET SECTOR: SECURE CONNECT</span>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    position: 'fixed', inset: 0, zIndex: 99999,
    backgroundColor: '#0a0a0c',
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    fontFamily: "'Inter', sans-serif",
    overflow: 'hidden'
  },
  noise: {
    position: 'absolute', inset: 0, opacity: 0.04, pointerEvents: 'none',
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`
  },
  gridOverlay: {
    position: 'absolute', inset: 0, opacity: 0.03, pointerEvents: 'none',
    backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
    backgroundSize: '24px 24px'
  },
  content: {
    position: 'relative', zIndex: 1,
    width: '100%', maxWidth: '380px',
    display: 'flex', flexDirection: 'column', gap: '20px',
    padding: '24px', boxSizing: 'border-box'
  },
  headerBlock: { display: 'flex', flexDirection: 'column', gap: '6px', textAlign: 'center' },
  badgeRow: { display: 'flex', justifyContent: 'center', gap: '6px', alignItems: 'center' },
  badge: { padding: '3px 8px', borderRadius: '4px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', fontSize: '8px', fontFamily: 'monospace', color: 'rgba(255,255,255,0.4)', fontWeight: 'bold' },
  liveIndicator: { padding: '3px 8px', borderRadius: '4px', background: 'rgba(0, 229, 255, 0.08)', border: '1px solid rgba(0, 229, 255, 0.25)', fontSize: '8px', fontFamily: 'monospace', color: '#00E5FF', fontWeight: 'bold', animation: 'pulse 2s infinite' },
  title: { fontSize: '18px', fontWeight: '900', tracking: '0.15em', color: '#fff', margin: 0, textTransform: 'uppercase' },
  
  // Game Styles
  gameCard: {
    backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)',
    borderRadius: '16px', padding: '16px 14px', textAlign: 'center',
    display: 'flex', flexDirection: 'column', gap: '12px'
  },
  gameHint: { fontSize: '10px', color: 'rgba(255,255,255,0.4)', margin: 0, lineHeight: '1.4' },
  emblemBtn: {
    position: 'absolute', inset: 0, border: 'none', background: 'none', cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center', outline: 'none'
  },
  emblemRing: {
    position: 'absolute', inset: 0, borderRadius: '50%',
    border: '1.5px dashed rgba(0, 229, 255, 0.3)',
    boxShadow: '0 0 15px rgba(0, 229, 255, 0.1)'
  },
  emblemInner: {
    width: '74px', height: '74px', borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(16,16,24,0.95) 0%, rgba(26,26,36,0.98) 100%)',
    border: '1.5px solid rgba(0, 229, 255, 0.45)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: '#00E5FF', boxShadow: '0 0 25px rgba(0, 229, 255, 0.2), inset 0 0 10px rgba(0, 229, 255, 0.15)'
  },
  particle: {
    position: 'absolute', pointerEvents: 'none',
    fontSize: '9px', fontFamily: 'monospace', fontWeight: 'bold',
    color: '#00E5FF', textShadow: '0 0 6px rgba(0,229,255,0.8)'
  },
  scoreRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' },
  scoreLabel: { fontSize: '9px', fontFamily: 'monospace', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase' },
  scoreValue: { fontSize: '11px', fontFamily: 'monospace', color: '#00E5FF', fontWeight: 'bold' },
  
  // Audio Box Styles
  audioControls: {
    display: 'flex', gap: '8px', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)',
    borderRadius: '12px', padding: '10px 14px'
  },
  playBtn: {
    flex: 1, display: 'flex', gap: '6px', alignItems: 'center', justifyContent: 'center',
    padding: '8px 12px', borderRadius: '8px', border: '1px solid',
    color: '#ccc', cursor: 'pointer', transition: 'all 0.15s'
  },
  muteBtn: {
    width: '32px', height: '32px', borderRadius: '8px',
    background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: 'rgba(255,255,255,0.5)', transition: 'all 0.15s'
  },
  waveContainer: { display: 'flex', alignItems: 'end', gap: '2px', height: '10px', paddingLeft: '4px' },
  waveBar: {
    width: '1.5px', height: '100%', backgroundColor: '#00E5FF', borderRadius: '1px',
    transformOrigin: 'bottom', animation: 'spin 0.8s linear infinite', // fallback mapping, wait let's use custom animation
  },

  // Options row
  optionsRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  slowToggle: {
    display: 'flex', gap: '4px', alignItems: 'center',
    background: 'transparent', border: '1px solid',
    borderRadius: '6px', padding: '5px 8px', fontSize: '8px', fontFamily: 'monospace',
    fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.15s'
  },
  skipBtn: {
    display: 'flex', gap: '4px', alignItems: 'center',
    background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '6px', padding: '5px 10px', fontSize: '8px', fontFamily: 'monospace',
    color: 'rgba(255,255,255,0.4)', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.15s'
  },

  // Progress Bar Styles
  progressBox: { display: 'flex', flexDirection: 'column', gap: '6px' },
  progressBg: { width: '100%', height: '3px', borderRadius: '4px', background: 'rgba(255,255,255,0.06)', overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: '4px', background: 'linear-gradient(90deg, #00E5FF, #6366F1)' },
  progressLabels: { display: 'flex', justifyContent: 'space-between', fontSize: '8px', fontFamily: 'monospace', color: 'rgba(255,255,255,0.3)' }
};

// Inject custom keyframes for loading wave indicator
if (typeof document !== 'undefined' && !document.getElementById('loader-wave-styles')) {
  const s = document.createElement('style');
  s.id = 'loader-wave-styles';
  s.textContent = `
    @keyframes wavePulse {
      0%, 100% { transform: scaleY(0.3); }
      50% { transform: scaleY(1); }
    }
    @keyframes pulse {
      0%, 100% { opacity: 0.6; }
      50% { opacity: 1; }
    }
  `;
  document.head.appendChild(s);
  
  // Update waveBar style dynamically via keyframe mapping
  styles.waveBar.animation = 'wavePulse 0.8s ease-in-out infinite';
}
