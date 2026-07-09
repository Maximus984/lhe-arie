import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, VolumeX, Sparkles, Terminal } from 'lucide-react';

export default function HeadlinerLoadingScreen({ onComplete }) {
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState([]);
  const [muted, setMuted] = useState(true);
  const [isReady, setIsReady] = useState(false);
  const videoRef = useRef(null);

  // Simulated wabi-sabi console loading steps
  const logSteps = [
    { threshold: 5, text: '[SYSTEM] Bootstrapping Aries AI Engine & media enclaves...' },
    { threshold: 18, text: '[STORAGE] Hydrating local SQLite schema details...' },
    { threshold: 35, text: '[AUDIO] Connecting to Prime Records high-fidelity vault...' },
    { threshold: 52, text: '[CONFIG] Lock theme target: Liquid Glass (moss/cyan accents)...' },
    { threshold: 68, text: '[MEDIA] Default Spotlight: Ariana Grande — eternal sunshine deluxe...' },
    { threshold: 82, text: '[DMX] Sweep stage laser configurations... OK' },
    { threshold: 95, text: '[SUCCESS] Core environment loaded. All-Star Hub ready.' }
  ];

  useEffect(() => {
    // Attempt audio context warmup to allow sound if unmuted
    if (videoRef.current) {
      videoRef.current.muted = muted;
    }
  }, [muted]);

  useEffect(() => {
    // Set up progress counter ticking slowly for atmospheric suspense
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsReady(true);
          return 100;
        }
        // Random small increments
        const increment = Math.floor(Math.random() * 8) + 3;
        const next = Math.min(prev + increment, 100);
        
        // Push log messages as progress passes thresholds
        logSteps.forEach(step => {
          if (next >= step.threshold && prev < step.threshold) {
            setLogs(l => [...l, { text: step.text, id: step.threshold }]);
          }
        });

        return next;
      });
    }, 150);

    return () => clearInterval(interval);
  }, []);

  const handleEnter = () => {
    // Pause video, disable sound completely to "cancel out"
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.src = "";
      videoRef.current.load();
    }
    // Set default headliner in localStorage explicitly to Ariana
    localStorage.setItem('mfs_active_headliner', '0');
    onComplete();
  };

  return (
    <div className="fixed inset-0 z-[99999] bg-[#030305] flex flex-col items-center justify-between font-sans overflow-hidden">
      {/* Background Loop Video */}
      <video
        ref={videoRef}
        src="/video/headliner.mp4"
        autoPlay
        loop
        muted={muted}
        playsInline
        className="absolute inset-0 w-full h-full object-cover z-0 filter brightness-50 contrast-125"
      />

      {/* Cybernetic Scanlines */}
      <div 
        className="absolute inset-0 z-10 pointer-events-none"
        style={{
          background: 'repeating-linear-gradient(0deg, rgba(0, 0, 0, 0.15), rgba(0, 0, 0, 0.15) 1px, transparent 1px, transparent 3px)',
          backgroundSize: '100% 3px'
        }}
      />

      {/* CRT Vignette Overlay */}
      <div className="absolute inset-0 z-10 pointer-events-none bg-radial-gradient from-transparent via-black/30 to-black/85" />

      {/* Top Bar: Telemetry & Volume */}
      <div className="relative z-20 w-full px-6 md:px-12 py-6 flex items-center justify-between pointer-events-auto">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          <span className="text-[10px] font-mono tracking-widest text-cyan-400 uppercase font-bold">
            INITIALIZING LHE-ARIES MEDIA ENV // 2026
          </span>
        </div>
        
        <button
          onClick={() => setMuted(!muted)}
          className="p-3 bg-black/60 border border-white/10 rounded-2xl text-white/70 hover:text-white hover:border-cyan-400/40 transition backdrop-blur-md flex items-center gap-2"
          id="btn-loading-mute"
        >
          {muted ? <VolumeX size={14} className="text-red-400" /> : <Volume2 size={14} className="text-cyan-400" />}
          <span className="text-[9px] font-mono tracking-wider uppercase">
            {muted ? 'Sound Muted' : 'Sound Active'}
          </span>
        </button>
      </div>

      {/* Center Box: Console Telemetry */}
      <div className="relative z-20 w-full max-w-xl px-6 flex flex-col gap-6 text-center">
        <div className="flex flex-col gap-2">
          <motion.h1 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-display font-black tracking-tighter text-white"
          >
            LHE ALL-STAR <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400">HUB</span>
          </motion.h1>
          <p className="text-[11px] font-mono text-white/40 tracking-widest uppercase">
            Pacific Media Systems & Collaborations
          </p>
        </div>

        {/* Console Box */}
        <div className="glass-panel-heavy rounded-2xl border border-white/10 p-5 text-left h-52 overflow-y-auto flex flex-col gap-1.5 scrollbar-thin">
          <div className="flex items-center gap-1.5 text-[10px] font-mono text-cyan-400/70 border-b border-white/5 pb-2 mb-2">
            <Terminal size={12} />
            <span>HYDRATION CONSOLE LOG // ARI-ENV</span>
          </div>
          {logs.map(log => (
            <motion.div
              key={log.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-[11px] font-mono text-white/75 break-words leading-relaxed"
            >
              {log.text}
            </motion.div>
          ))}
          {/* Cursor flicker */}
          <div className="text-[11px] font-mono text-cyan-400 animate-pulse mt-0.5">
            _
          </div>
        </div>

        {/* Progress Bar */}
        <div className="flex flex-col gap-2">
          <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden border border-white/5">
            <motion.div 
              className="h-full bg-gradient-to-r from-cyan-400 via-indigo-500 to-pink-500"
              style={{ width: `${progress}%` }}
              transition={{ duration: 0.1 }}
            />
          </div>
          <div className="flex justify-between items-center text-[10px] font-mono text-white/30">
            <span>READY STATE: {progress}%</span>
            <span>TARGET FEATURE: ARIANA GRANDE</span>
          </div>
        </div>
      </div>

      {/* Bottom Button: Enter Matrix */}
      <div className="relative z-20 pb-12 w-full flex justify-center pointer-events-auto">
        <AnimatePresence mode="wait">
          {isReady ? (
            <motion.button
              key="enter-btn"
              initial={{ opacity: 0, y: 15, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10 }}
              onClick={handleEnter}
              className="px-10 py-4 bg-gradient-to-r from-cyan-500 to-indigo-500 text-neutral-950 rounded-2xl text-xs font-mono font-bold tracking-widest hover:scale-105 active:scale-95 transition-all shadow-[0_0_35px_rgba(0,229,255,0.4)] flex items-center gap-2 uppercase"
              id="btn-loading-enter"
            >
              <Sparkles size={14} className="animate-pulse" />
              Enter The All-Star Hub
            </motion.button>
          ) : (
            <motion.div
              key="loading-label"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              className="text-[10px] font-mono tracking-widest text-white/30 uppercase animate-pulse"
            >
              Decompressing studio matrices...
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
