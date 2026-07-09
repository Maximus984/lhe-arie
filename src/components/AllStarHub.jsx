import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Disc, Play, Pause, SkipForward, SkipBack, Volume2, VolumeX, Sparkles, List, Info, Sliders, Music, Radio } from 'lucide-react';
import { HEADLINERS } from '../data/headliners.js';
import AllStarFeed from './AllStarFeed.jsx';
import toast from 'react-hot-toast';

export default function AllStarHub() {
  const [activeTab, setActiveTab] = useState('music'); // 'music' | 'social' | 'about'
  const [selectedHeadliner, setSelectedHeadliner] = useState(HEADLINERS[0]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.85);
  const [isMuted, setIsMuted] = useState(false);
  const [playlistOpen, setPlaylistOpen] = useState(false);

  // Visualizer Styles State
  const VISUALIZER_STYLES = ['ripples', 'bars', 'particles', 'wave', 'orbit'];
  const [visualizerStyle, setVisualizerStyle] = useState('ripples');

  const audioRef = useRef(null);
  const canvasRef = useRef(null);
  const analyserRef = useRef(null);
  const audioCtxRef = useRef(null);
  const sourceRef = useRef(null);

  const activePlaylist = selectedHeadliner.tracks;
  const currentTrack = activePlaylist[currentTrackIndex];

  // Randomize visualizer style on track changes
  useEffect(() => {
    const nextStyle = VISUALIZER_STYLES[Math.floor(Math.random() * VISUALIZER_STYLES.length)];
    setVisualizerStyle(nextStyle);
    
    // Reset scrub status
    setCurrentTime(0);
    setDuration(0);

    if (audioRef.current) {
      audioRef.current.load();
      if (isPlaying) {
        audioRef.current.play().catch(() => setIsPlaying(false));
      }
    }
  }, [currentTrackIndex, selectedHeadliner]);

  // Handle Play/Pause
  const handlePlayPause = () => {
    if (!audioRef.current) return;
    
    // Warm up Web Audio API on first user play gesture
    initWebAudio();

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play()
        .then(() => setIsPlaying(true))
        .catch(err => {
          console.error(err);
          toast.error("Audio playback blocked. Interact with page first.");
        });
    }
  };

  // Warm up Web Audio Context & Analyser
  const initWebAudio = () => {
    if (audioCtxRef.current || !audioRef.current) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioCtx();
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 128;
      
      const source = ctx.createMediaElementSource(audioRef.current);
      source.connect(analyser);
      analyser.connect(ctx.destination);

      audioCtxRef.current = ctx;
      analyserRef.current = analyser;
      sourceRef.current = source;
    } catch (e) {
      console.warn("Web Audio Analyser setup blocked or failed (CORS or gesture):", e);
    }
  };

  // Skip tracks
  const handleSkipForward = () => {
    setCurrentTrackIndex(prev => (prev + 1) % activePlaylist.length);
    setIsPlaying(true);
  };

  const handleSkipBackward = () => {
    setCurrentTrackIndex(prev => (prev === 0 ? activePlaylist.length - 1 : prev - 1));
    setIsPlaying(true);
  };

  const handleScrubChange = (e) => {
    const val = parseFloat(e.target.value);
    setCurrentTime(val);
    if (audioRef.current) {
      audioRef.current.currentTime = val;
    }
  };

  const formatTime = (secs) => {
    if (isNaN(secs)) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // Sync volume state
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  // Audio elements event listeners
  const handleAudioTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleAudioLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleAudioEnded = () => {
    handleSkipForward();
  };

  // Canvas visualizer animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    let width = (canvas.width = canvas.parentElement.clientWidth);
    let height = (canvas.height = canvas.parentElement.clientHeight || 180);

    const handleResize = () => {
      if (canvas && canvas.parentElement) {
        width = canvas.width = canvas.parentElement.clientWidth;
        height = canvas.height = canvas.parentElement.clientHeight || 180;
      }
    };
    window.addEventListener('resize', handleResize);

    // Particle pool for visualizer
    let burstParticles = [];

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Get real analyser details if available
      let dataArray = [];
      let bufferLength = 0;
      if (analyserRef.current) {
        bufferLength = analyserRef.current.frequencyBinCount;
        dataArray = new Uint8Array(bufferLength);
        analyserRef.current.getByteFrequencyData(dataArray);
      }

      // Procedural sound speed multiplier for fallback
      const timeFactor = Date.now() * 0.003;
      const soundAmp = isPlaying ? 1 : 0;

      // Draw active visualizer style
      if (visualizerStyle === 'ripples') {
        // STYLE 1: Ripple Concentric Circles
        const maxRadius = Math.min(width, height) * 0.45;
        const centerX = width / 2;
        const centerY = height / 2;
        const baseAmp = dataArray.length > 0 ? (dataArray[10] / 255) : (0.5 + Math.sin(timeFactor) * 0.15) * soundAmp;

        ctx.strokeStyle = `rgba(0, 229, 255, ${0.05 + baseAmp * 0.15})`;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(centerX, centerY, 50 + baseAmp * 30, 0, Math.PI * 2);
        ctx.stroke();

        ctx.strokeStyle = `rgba(168, 85, 247, ${0.03 + baseAmp * 0.1})`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(centerX, centerY, 80 + baseAmp * 50, 0, Math.PI * 2);
        ctx.stroke();
      }
      else if (visualizerStyle === 'bars') {
        // STYLE 2: Equalizer Bars
        const barWidth = 6;
        const gap = 4;
        const numBars = Math.floor(width / (barWidth + gap));
        
        ctx.fillStyle = 'rgba(0, 229, 255, 0.25)';
        for (let i = 0; i < numBars; i++) {
          let value = 0;
          if (dataArray.length > 0) {
            const dataIdx = Math.floor((i / numBars) * bufferLength);
            value = dataArray[dataIdx] / 255;
          } else {
            value = Math.abs(Math.sin(timeFactor + i * 0.18)) * (0.3 + Math.random() * 0.3) * soundAmp;
          }
          const barHeight = Math.max(5, value * height * 0.85);
          ctx.fillRect(i * (barWidth + gap), height - barHeight, barWidth, barHeight);
        }
      }
      else if (visualizerStyle === 'particles') {
        // STYLE 3: Star Burst / Particles
        const centerX = width / 2;
        const centerY = height / 2;
        const burstAmp = dataArray.length > 0 ? (dataArray[20] / 255) : (0.4 + Math.sin(timeFactor * 1.5) * 0.2) * soundAmp;

        if (isPlaying && Math.random() < 0.28) {
          const angle = Math.random() * Math.PI * 2;
          const speed = Math.random() * 2 + 1.5;
          burstParticles.push({
            x: centerX,
            y: centerY,
            vx: Math.cos(angle) * speed * (1 + burstAmp),
            vy: Math.sin(angle) * speed * (1 + burstAmp),
            size: Math.random() * 3 + 1,
            alpha: 1,
            color: Math.random() > 0.5 ? '#00E5FF' : '#A855F7'
          });
        }

        burstParticles.forEach((p) => {
          p.x += p.vx;
          p.y += p.vy;
          p.alpha -= 0.015;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.globalAlpha = p.alpha;
          ctx.fill();
        });
        ctx.globalAlpha = 1.0; // reset
        burstParticles = burstParticles.filter(p => p.alpha > 0);
      }
      else if (visualizerStyle === 'wave') {
        // STYLE 4: Oscillating Sound Wave
        ctx.strokeStyle = 'rgba(168, 85, 247, 0.45)';
        ctx.lineWidth = 2.5;
        ctx.beginPath();

        const sliceWidth = width / 60;
        for (let i = 0; i < 60; i++) {
          let val = 0;
          if (dataArray.length > 0) {
            val = (dataArray[i % bufferLength] - 128) / 128; // time domain shape
          } else {
            val = Math.sin(timeFactor * 2.2 + i * 0.3) * 0.45 * soundAmp;
          }
          const y = height / 2 + val * height * 0.45;
          if (i === 0) ctx.moveTo(0, y);
          else ctx.lineTo(i * sliceWidth, y);
        }
        ctx.stroke();
      }
      else if (visualizerStyle === 'orbit') {
        // STYLE 5: Planet Orbits
        const centerX = width / 2;
        const centerY = height / 2;
        const orbitAmp = dataArray.length > 0 ? (dataArray[12] / 255) : (0.5 + Math.sin(timeFactor) * 0.1) * soundAmp;

        const orbits = [
          { r: 40, speed: 0.018, color: '#00E5FF', size: 5 },
          { r: 75, speed: 0.011, color: '#A855F7', size: 7 },
          { r: 105, speed: 0.007, color: '#10B981', size: 9 }
        ];

        orbits.forEach((orb) => {
          const angle = Date.now() * orb.speed;
          const rx = centerX + Math.cos(angle) * (orb.r + orbitAmp * 20);
          const ry = centerY + Math.sin(angle) * (orb.r + orbitAmp * 20);

          // Draw orbit track ring
          ctx.strokeStyle = 'rgba(255,255,255,0.03)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(centerX, centerY, orb.r + orbitAmp * 20, 0, Math.PI * 2);
          ctx.stroke();

          // Draw satellite node
          ctx.shadowBlur = 8;
          ctx.shadowColor = orb.color;
          ctx.fillStyle = orb.color;
          ctx.beginPath();
          ctx.arc(rx, ry, orb.size, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0; // reset
        });
      }

      animationFrameId = requestAnimationFrame(render);
    };
    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [visualizerStyle, isPlaying]);

  return (
    <div className="w-full relative glass-panel rounded-[32px] p-6 border border-white/10 bg-neutral-950/20 backdrop-blur-xl shadow-2xl flex flex-col gap-6">
      {/* Dynamic sound source tag */}
      <audio
        ref={audioRef}
        src={currentTrack?.src}
        onTimeUpdate={handleAudioTimeUpdate}
        onLoadedMetadata={handleAudioLoadedMetadata}
        onEnded={handleAudioEnded}
      />

      {/* Title Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-white/5 pb-4 gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 rounded-2xl animate-pulse">
            <Radio size={20} />
          </div>
          <div>
            <h2 className="text-2xl font-display font-black uppercase text-white tracking-tight leading-none flex items-center gap-2">
              THE ALL-STAR HUB
            </h2>
            <span className="text-[10px] font-mono text-white/30 uppercase tracking-widest mt-1 block">
              Pacific Media Business Core Platform
            </span>
          </div>
        </div>

        {/* Localized Tabs */}
        <div className="flex bg-black/40 border border-white/5 rounded-2xl p-1 gap-1 w-full md:w-auto">
          {[
            { id: 'music', label: 'Listening Vibe', icon: <Music size={13} /> },
            { id: 'social', label: 'Instagram / TikTok Feed', icon: <Sparkles size={13} /> },
            { id: 'about', label: 'Media Info', icon: <Info size={13} /> }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-grow md:flex-grow-0 px-4 py-2 rounded-xl text-xs font-mono font-bold tracking-wide uppercase transition flex items-center justify-center gap-1.5 whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-cyan-500 text-neutral-950 shadow-[0_0_15px_rgba(0,229,255,0.3)]'
                  : 'text-white/40 hover:text-white/70 hover:bg-white/3'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Tabs Container */}
      <div className="min-h-[380px] flex items-center justify-center w-full">
        <AnimatePresence mode="wait">
          {/* TAB 1: MUSIC PLAYER */}
          {activeTab === 'music' && (
            <motion.div
              key="music-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full items-start"
            >
              {/* Left Column: Visualizer & Player Box (7 cols) */}
              <div className="lg:col-span-7 flex flex-col gap-6 w-full">
                {/* Visualizer Area */}
                <div className="relative w-full h-48 rounded-2xl border border-white/8 bg-black/80 flex flex-col justify-between p-4 overflow-hidden glow-blue">
                  {/* Canvas for animations */}
                  <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-0" />

                  {/* Top: Track details overlay */}
                  <div className="relative z-10 flex justify-between items-start">
                    <span className="px-2.5 py-1 rounded bg-cyan-500/10 border border-cyan-500/20 text-[9px] font-mono text-cyan-400 font-bold uppercase tracking-wider">
                      VISUAL STYLING: {visualizerStyle.toUpperCase()}
                    </span>
                    <span className="text-[10px] font-mono text-white/30">
                      Track {currentTrackIndex + 1}/{activePlaylist.length}
                    </span>
                  </div>

                  {/* Middle: Floating Artwork Icon */}
                  <div className="relative z-10 flex flex-col items-center gap-1.5">
                    <motion.div
                      animate={isPlaying ? { rotate: 360 } : {}}
                      transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
                      className="w-16 h-16 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-3xl shadow-2xl"
                    >
                      💋
                    </motion.div>
                  </div>

                  {/* Bottom: Song Name overlay */}
                  <div className="relative z-10 flex justify-between items-end bg-black/60 backdrop-blur-sm p-3 rounded-xl border border-white/5">
                    <div className="text-left">
                      <h4 className="text-sm font-display font-bold text-white leading-tight">
                        {currentTrack?.title}
                      </h4>
                      <p className="text-[10px] font-mono text-cyan-400/80 font-bold mt-0.5">
                        {currentTrack?.artist} — {selectedHeadliner.album}
                      </p>
                    </div>
                    <span className="text-[10px] font-mono text-white/40">
                      {formatTime(currentTime)} / {formatTime(duration)}
                    </span>
                  </div>
                </div>

                {/* Progress Scrub Bar */}
                <div className="flex flex-col gap-1.5 w-full">
                  <input
                    type="range"
                    min="0"
                    max={duration || 100}
                    value={currentTime}
                    onChange={handleScrubChange}
                    className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                    id="slider-hub-progress"
                  />
                </div>

                {/* Audio controls card */}
                <div className="flex justify-between items-center bg-black/40 p-4 rounded-2xl border border-white/5 backdrop-blur-sm w-full">
                  <div className="flex gap-2">
                    <button
                      onClick={handleSkipBackward}
                      className="p-3 bg-white/5 border border-white/8 rounded-xl text-white/70 hover:text-cyan-400 hover:bg-white/10 transition"
                      title="Previous"
                    >
                      <SkipBack size={15} />
                    </button>
                    <button
                      onClick={handlePlayPause}
                      className="p-3.5 bg-cyan-400 text-neutral-950 rounded-xl hover:bg-cyan-300 transition hover:scale-105 active:scale-95 shadow-[0_0_15px_rgba(0,229,255,0.4)]"
                      title={isPlaying ? "Pause" : "Play"}
                    >
                      {isPlaying ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" />}
                    </button>
                    <button
                      onClick={handleSkipForward}
                      className="p-3 bg-white/5 border border-white/8 rounded-xl text-white/70 hover:text-cyan-400 hover:bg-white/10 transition"
                      title="Next"
                    >
                      <SkipForward size={15} />
                    </button>
                  </div>

                  {/* Volume Slider */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsMuted(!isMuted)}
                      className="text-white/40 hover:text-cyan-400 transition"
                    >
                      {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
                    </button>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.01"
                      value={volume}
                      onChange={(e) => { setVolume(parseFloat(e.target.value)); setIsMuted(false); }}
                      className="w-20 sm:w-28 h-1 bg-white/15 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                      id="slider-hub-volume"
                    />
                  </div>
                </div>
              </div>

              {/* Right Column: Playlist Selection Drawer (5 cols) */}
              <div className="lg:col-span-5 flex flex-col gap-4 w-full text-left">
                <div className="flex justify-between items-center px-1">
                  <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest flex items-center gap-1">
                    <List size={11} /> Featured Album Playlist
                  </span>
                  <span className="text-[9px] font-mono text-cyan-400 uppercase font-bold">
                    HQ FLAC STREAM
                  </span>
                </div>

                <div className="flex flex-col gap-2 max-h-[260px] overflow-y-auto pr-1 scrollbar-thin">
                  {activePlaylist.map((track, idx) => {
                    const isCurrent = idx === currentTrackIndex;
                    return (
                      <button
                        key={track.id}
                        onClick={() => { setCurrentTrackIndex(idx); setIsPlaying(true); }}
                        className={`flex items-center justify-between p-3 rounded-2xl border transition-all text-xs text-left w-full ${
                          isCurrent
                            ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-400 glow-blue'
                            : 'bg-white/3 border-white/5 text-white/60 hover:bg-white/6 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-3 truncate pr-4">
                          <span className="font-mono text-[9px] text-white/30">
                            {(idx + 1).toString().padStart(2, '0')}
                          </span>
                          <span className="font-semibold truncate">{track.title}</span>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="text-[10px] font-mono text-white/30">{track.duration}</span>
                          {isCurrent && isPlaying && (
                            <span className="flex gap-px items-end h-3">
                              {[1, 2, 3].map(i => (
                                <motion.span
                                  key={i}
                                  className="w-[2.2px] rounded-full bg-cyan-400"
                                  animate={{ height: ['4px', '11px', '4px'] }}
                                  transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                                />
                              ))}
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 2: SOCIAL UPLOAD FEEDS */}
          {activeTab === 'social' && (
            <motion.div
              key="social-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="w-full"
            >
              <AllStarFeed />
            </motion.div>
          )}

          {/* TAB 3: MEDIA SHOWCASE ABOUT INFO */}
          {activeTab === 'about' && (
            <motion.div
              key="about-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col gap-6 text-left w-full"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                <div className="flex flex-col gap-4">
                  <span className="px-3.5 py-1 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 font-mono text-[10px] uppercase font-bold tracking-widest w-fit rounded-lg">
                    ✦ Pacific Media Network
                  </span>
                  <h3 className="text-xl font-display font-black text-white uppercase">
                    Unifying sound systems and interactive stage visualizers.
                  </h3>
                  <p className="text-xs text-white/60 leading-relaxed font-light">
                    The All-Star Hub serves as the official media showcase environment of the <strong>Pacific Media Business</strong>, a creative technology division founded by Maximus.
                  </p>
                  <p className="text-xs text-white/60 leading-relaxed font-light">
                    By bridging high-fidelity album rotations (including Ariana Grande deluxe showcases) with real-time stage visual simulators built in TouchDesigner, DMX telemetry, and local AI networks, we design fully responsive ecosystems where art and code become indistinguishable.
                  </p>
                </div>

                <div className="glass-panel rounded-2xl p-5 border border-white/8 bg-white/2 flex flex-col gap-4">
                  <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-widest block">
                    ⚡ Technology Overview
                  </span>
                  
                  <div className="flex flex-col gap-3">
                    {[
                      { area: 'Music Distribution', detail: 'Rotational spotlights featuring global charts and local synthesizers.' },
                      { area: 'Dynamic Visualizers', detail: 'Procedural canvas drawing modules adapting to beat triggers.' },
                      { area: 'Stage Telemetry', detail: 'Simulated 512-channel DMX laser wash presets.' },
                      { area: 'Creator Feed enclaves', detail: 'Fully interactive photo/video upload storage modules.' }
                    ].map(item => (
                      <div key={item.area} className="flex flex-col border-b border-white/5 pb-2.5 last:border-0 last:pb-0">
                        <span className="text-xs font-bold text-white">{item.area}</span>
                        <span className="text-[11px] font-mono text-white/40 mt-0.5">{item.detail}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
