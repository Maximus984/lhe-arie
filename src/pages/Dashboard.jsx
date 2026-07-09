import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import DynamicIsland from '../components/DynamicIsland.jsx';
import AIChatSystem from '../components/AIChatSystem.jsx';
import FormsCenter from '../components/FormsCenter.jsx';
import CalendarPanel from '../components/CalendarPanel.jsx';
import SettingsPanel from '../components/SettingsPanel.jsx';
import BotChallenge from '../components/BotChallenge.jsx';
import { shouldShowBotChallenge, startDiagnosticScheduler } from '../data/security.js';
import AriesPyArcade from '../components/AriesPyArcade.jsx';
import LottiePlayer from '../components/LottiePlayer.jsx';
import { AriesCloudStorageNode, AriesLiveAiFlow, DjemKaleidoscopeVisual, GameDevFallingShapes } from '../components/EcosystemAnimations.jsx';
import { getActiveHeadliner, HEADLINERS } from '../data/headliners.js';
import { subscribe } from '../data/realtime.js';
import { isLiveModeActive, getLiveModeConfig } from '../data/liveMode.js';
import { getDocs, saveDoc } from '../data/workspace.js';
import { 
  Play, 
  Pause, 
  SkipForward, 
  SkipBack, 
  Volume2, 
  VolumeX, 
  Home, 
  Disc, 
  Zap, 
  Cpu, 
  Gamepad2, 
  User, 
  Copy, 
  Check, 
  Send, 
  Terminal, 
  Heart, 
  X, 
  Eye,
  ExternalLink, 
  Sliders, 
  Flame, 
  MessageSquare,
  FileText,
  ChevronRight,
  Sparkles,
  Link,
  Laptop,
  Radio,
  List,
  ChevronDown,
  ChevronUp,
  Maximize2,
  Shield,
  Download,
  Menu,
  PlusCircle
} from 'lucide-react';


// Actual physical audio files from public directory
const PLAYLIST = [
  {
    id: 1,
    title: 'Adrenaline Rush',
    artist: 'Maxx Forge',
    src: '/audio/album_dj_em/Adrenaline Rush.mp3',
    duration: '4:03'
  },
  {
    id: 2,
    title: 'Applied Physics',
    artist: 'Maxx Forge',
    src: '/audio/album_dj_em/Applied Physics.mp3',
    duration: '3:48'
  },
  {
    id: 3,
    title: 'Dark Queen',
    artist: 'Maxx Forge',
    src: '/audio/album_dj_em/Dark Queen.mp3',
    duration: '4:58'
  },
  {
    id: 4,
    title: 'Electric Whisper',
    artist: 'Maxx Forge',
    src: '/audio/album_dj_em/Electric Whisper.mp3',
    duration: '4:07'
  },
  {
    id: 5,
    title: 'Shadow Dance',
    artist: 'audio/album_dj_em/Shadow Dance (1).mp3', // checking fallback formatting
    duration: '4:37'
  },
  {
    id: 6,
    title: 'Off The Record',
    artist: 'Maxx Forge',
    src: '/audio/album_dj_em/Off_the_Record_20260121_1331.mp3',
    duration: '5:23'
  },
  {
    id: 7,
    title: 'User Error',
    artist: 'Maxx Forge',
    src: '/audio/album_dj_em/USER_ERROR_20260121_1228.mp3',
    duration: '3:39'
  }
];

// Clean path alignment helper
PLAYLIST[4].src = '/audio/album_dj_em/Shadow Dance (1).mp3';

export default function App() {
  const { currentUser, can } = useAuth();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('matrix'); // matrix, records, djem, aries, gamedev
  const [accountOpen, setAccountOpen] = useState(false);
  const [favorites, setFavorites] = useState([2]); // Holds indices of tracks marked as favorite
  const [formsOpen, setFormsOpen] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [viewport, setViewport] = useState({ width: window.innerWidth, height: window.innerHeight });

  useEffect(() => {
    const handleResize = () => {
      setViewport({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const getBreakpoint = (width) => {
    if (width < 640) return 'xs (Mobile)';
    if (width < 768) return 'sm (Large Mobile)';
    if (width < 1024) return 'md (Tablet)';
    if (width < 1280) return 'lg (Laptop)';
    return 'xl (Desktop)';
  };
  
  // Audio Player State
  const [selectedHeadliner, setSelectedHeadliner] = useState(HEADLINERS[0]);
  const [activePlaylist, setActivePlaylist] = useState(HEADLINERS[0].tracks);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [visualizerStyle, setVisualizerStyle] = useState('ripples');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.85);
  const [isMuted, setIsMuted] = useState(false);

  // Live Mode state
  const [liveModeConfig, setLiveModeConfig] = useState(getLiveModeConfig);

  // Records fullscreen video: randomize between two videos on each visit
  const [playlistOpen, setPlaylistOpen] = useState(false);
  const DESKTOP_VIDEOS = [
    '/video/headliner_canvases/square_animated_artwork_desktop.mp4',
    '/video/headliner_canvases/square_animated_artwork_alt.mp4',
  ];
  const MOBILE_VIDEOS = [
    '/video/headliner_canvases/tall_animated_artwork_mobile.mp4',
    '/video/headliner_canvases/tall_animated_artwork_mobile_alt.mp4',
  ];
  const isMobile = window.innerWidth < 768;
  const [videoSrc] = useState(() => {
    const pool = isMobile ? MOBILE_VIDEOS : DESKTOP_VIDEOS;
    return pool[Math.floor(Math.random() * pool.length)];
  });

  const audioRef = useRef(null);
  const canvasRef = useRef(null);
  const [botModal, setBotModal] = useState(false);

  const [announcements, setAnnouncements] = useState(() => {
    try {
      const raw = localStorage.getItem('mfs_announcements');
      if (raw) return JSON.parse(raw);
    } catch (_) {}
    return [
      {
        id: 'ann_1',
        author: 'Maxx — Founder',
        role: 'founder',
        text: 'Welcome to the Liquid Glass Ecosystem! Staff can post real-time updates and notes here.',
        timestamp: new Date().toISOString(),
      }
    ];
  });
  const [newAnnText, setNewAnnText] = useState('');
  const [dashboardDocs, setDashboardDocs] = useState([]);

  useEffect(() => {
    const unsub = subscribe(['announcement_added', 'announcement_deleted'], (event, data) => {
      if (event === 'announcement_added') {
        setAnnouncements(prev => {
          if (prev.find(a => a.id === data.id)) return prev;
          const updated = [data, ...prev];
          localStorage.setItem('mfs_announcements', JSON.stringify(updated));
          return updated;
        });
      } else if (event === 'announcement_deleted') {
        setAnnouncements(prev => {
          const updated = prev.filter(a => a.id !== data.id);
          localStorage.setItem('mfs_announcements', JSON.stringify(updated));
          return updated;
        });
      }
    });
    return () => unsub();
  }, []);

  // Poll live mode + subscribe to instant BroadcastChannel updates
  useEffect(() => {
    const refresh = () => setLiveModeConfig(getLiveModeConfig());
    refresh();
    const poll = setInterval(refresh, 3000);
    const unsub = (typeof BroadcastChannel !== 'undefined')
      ? (() => {
          const bc = new BroadcastChannel('mfs_realtime');
          bc.onmessage = (e) => { if (e.data?.event === 'live_mode_changed') refresh(); };
          return () => bc.close();
        })()
      : () => {};
    return () => { clearInterval(poll); unsub(); };
  }, []);

  useEffect(() => {
    // Run diagnostics scheduler in the background of active users
    const stopScheduler = startDiagnosticScheduler((report) => {
      console.log('Ecosystem Auto-Diagnostic sweep completed:', report);
    });

    // Check if user triggers bot challenge
    const checkBot = () => {
      if (shouldShowBotChallenge()) {
        setBotModal(true);
      }
    };
    const botCheckTimer = setTimeout(checkBot, 8000); // Check after 8 seconds

    // Set initial active headliner
    const headliner = getActiveHeadliner();
    setSelectedHeadliner(headliner);
    setActivePlaylist(headliner.tracks);

    return () => {
      stopScheduler();
      clearTimeout(botCheckTimer);
    };
  }, []);

  useEffect(() => {
    if (activeSection === 'matrix') {
      setDashboardDocs(getDocs());
    }
  }, [activeSection]);

  const currentTrack = (activePlaylist && activePlaylist.length > 0)
    ? (activePlaylist[currentTrackIndex] || activePlaylist[0])
    : null;

  // =====================================================
  // AUDIO CONTROLS EFFECT
  // =====================================================
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  useEffect(() => {
    const styles = ['ripples', 'bars', 'particles', 'wave', 'orbit'];
    const nextStyle = styles[Math.floor(Math.random() * styles.length)];
    setVisualizerStyle(nextStyle);

    if (audioRef.current) {
      audioRef.current.load();
      if (isPlaying) {
        audioRef.current.play()
          .catch(() => setIsPlaying(false));
      }
    }
  }, [currentTrackIndex]);

  const handlePlayPause = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play()
        .then(() => setIsPlaying(true))
        .catch((err) => console.warn("Playback interrupted:", err));
    }
  };

  const handleAudioEnded = () => {
    // Full album radio loop — auto-advance and loop back to track 0
    const nextIndex = (currentTrackIndex + 1) % activePlaylist.length;
    setCurrentTrackIndex(nextIndex);
    setIsPlaying(true);
    if (nextIndex === 0) {
      toast('🔁 Radio loop — restarting album from top!', { icon: '📻' });
    }
  }; 
  
  const handleSkipForward = () => {
    setCurrentTrackIndex((prev) => (prev + 1) % activePlaylist.length);
  };

  const handleSkipBackward = () => {
    setCurrentTrackIndex((prev) => (prev - 1 + activePlaylist.length) % activePlaylist.length);
  };

  // ── Quest progress tracker ──────────────────────────
  const trackQuestProgress = (trackId, artist) => {
    if (artist !== 'Ariana Grande') return;
    try {
      const listenedStr = localStorage.getItem('mfs_listened_tracks') || '[]';
      const listenedList = JSON.parse(listenedStr);
      if (!listenedList.includes(trackId)) {
        listenedList.push(trackId);
        localStorage.setItem('mfs_listened_tracks', JSON.stringify(listenedList));

        if (listenedList.length === 1 && localStorage.getItem('mfs_unlock_saturn') !== 'true') {
          localStorage.setItem('mfs_unlock_saturn', 'true');
          toast.success('🔓 UNLOCKED: "Saturn Returns" track added to your lobby playlist!');
        }
        if (listenedList.length >= 5 && localStorage.getItem('mfs_unlock_banner') !== 'true') {
          localStorage.setItem('mfs_unlock_banner', 'true');
          toast.success('☀️ UNLOCKED: Once-in-a-lifetime Eternal Sunshine Sky Banner! Equip it in your profile.');
        }
        if (listenedList.length >= 19 && localStorage.getItem('mfs_unlock_ariana_badge') !== 'true') {
          localStorage.setItem('mfs_unlock_ariana_badge', 'true');
          const claimed = JSON.parse(localStorage.getItem('mfs_claimed_badges') || '[]');
          if (!claimed.includes('legendary_ariana_sunshine')) {
            claimed.push('legendary_ariana_sunshine');
            localStorage.setItem('mfs_claimed_badges', JSON.stringify(claimed));
          }
          toast.success('👑 LEGENDARY UNLOCKED: Eternal Sunshine badge tied to your account forever!');
        }
      }
    } catch (e) {}
  };

  const handleAudioTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      // Count track as listened after 15 seconds of playback
      if (audioRef.current.currentTime > 15 && currentTrack) {
        trackQuestProgress(currentTrack.id, currentTrack.artist);
      }

    }
  };

  const handleAudioLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration || 0);
    }
  };


  const handleScrubChange = (e) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  const toggleFavorite = (trackId) => {
    if (favorites.includes(trackId)) {
      setFavorites(favorites.filter(id => id !== trackId));
    } else {
      setFavorites([...favorites, trackId]);
    }
  };

  const formatTime = (timeInSeconds) => {
    if (isNaN(timeInSeconds)) return '0:00';
    const mins = Math.floor(timeInSeconds / 60);
    const secs = Math.floor(timeInSeconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // =====================================================
  // DYNAMIC CANVAS BACKGROUND SYSTEM
  // =====================================================
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Particle Classes depending on Active Section
    class Particle {
      constructor() {
        this.reset();
      }

      reset() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = (Math.random() - 0.5) * 0.35;
        this.vy = (Math.random() - 0.5) * 0.35;
        this.size = Math.random() * 2 + 1;
        this.color = 'rgba(16, 185, 129, 0.25)'; // Moss Green default
        this.life = Math.random() * 200 + 100;
        this.maxLife = this.life;
      }

      update(mode) {
        if (mode === 'matrix') {
          // Floating bio cells
          this.y -= 0.15;
          this.x += Math.sin(this.y / 30) * 0.1;
          this.color = `rgba(16, 185, 129, ${0.1 + (this.life / this.maxLife) * 0.15})`;
        } else if (mode === 'records') {
          // Circular orbits or sound ripples
          const dx = this.x - width / 2;
          const dy = this.y - height / 2;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const angle = Math.atan2(dy, dx);
          
          this.x = width / 2 + Math.cos(angle + 0.002) * (dist - 0.2);
          this.y = height / 2 + Math.sin(angle + 0.002) * (dist - 0.2);
          this.color = `rgba(0, 229, 255, ${0.08 + Math.random() * 0.05})`;
          if (dist < 40) this.reset();
        } else if (mode === 'djem') {
          // Sound reactive grid sweep
          this.x += this.vx * 3;
          this.y += this.vy * 3;
          this.color = `rgba(16, 185, 129, 0.3)`;
        } else if (mode === 'aries') {
          // Connection vertices
          this.x += this.vx * 0.8;
          this.y += this.vy * 0.8;
          this.color = 'rgba(0, 229, 255, 0.25)';
        } else if (mode === 'gamedev') {
          // Ash embers floating up
          this.y -= Math.random() * 0.8 + 0.2;
          this.x += (Math.random() - 0.5) * 0.4;
          this.color = `rgba(239, 68, 68, ${0.1 + (this.life / this.maxLife) * 0.35})`;
        }

        this.life--;
        if (this.life <= 0 || this.x < 0 || this.x > width || this.y < 0 || this.y > height) {
          this.reset();
          if (mode === 'gamedev') {
            this.y = height + 10; // Start at bottom for embers
          }
        }
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
      }
    }

    const particles = Array.from({ length: 90 }, () => new Particle());

    // Laser sweeps for DJ Em
    let laserAngle = 0;
    
    // Ripple array for Music Division
    let ripples = [];

    const drawGridLines = (color, opacity) => {
      ctx.strokeStyle = color;
      ctx.lineWidth = 0.5;
      
      // Vertical lines
      const step = 40;
      for (let x = 0; x < width; x += step) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      
      // Horizontal lines
      for (let y = 0; y < height; y += step) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
    };

    const render = () => {
      // Background clear
      ctx.fillStyle = '#050508';
      ctx.fillRect(0, 0, width, height);

      // Render mode styles
      if (activeSection === 'matrix') {
        // Slow ambient gradient
        const grad = ctx.createRadialGradient(width / 2, height / 2, 10, width / 2, height / 2, Math.max(width, height));
        grad.addColorStop(0, '#0a1a12'); // moss green tint
        grad.addColorStop(1, '#050508');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);
      } 
      else if (activeSection === 'records') {
        const timeFactor = Date.now() * 0.003;
        const soundAmp = isPlaying ? 1 : 0;

        if (visualizerStyle === 'ripples') {
          // Core music visualization ring
          ctx.beginPath();
          ctx.arc(width / 2, height / 2, 160, 0, Math.PI * 2);
          ctx.strokeStyle = 'rgba(0, 229, 255, 0.04)';
          ctx.lineWidth = 2;
          ctx.stroke();

          // Pulsing active concentric circles
          if (isPlaying && Math.random() < 0.08) {
            ripples.push({ r: 160, maxR: Math.max(width, height) * 0.7, opacity: 0.4 });
          }
          
          ripples.forEach((rip, idx) => {
            rip.r += 2.5;
            rip.opacity -= 0.005;
            ctx.beginPath();
            ctx.arc(width / 2, height / 2, rip.r, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(0, 229, 255, ${rip.opacity})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          });
          ripples = ripples.filter(rip => rip.opacity > 0);
        }
        else if (visualizerStyle === 'bars') {
          // Equalizer Bars style
          const barWidth = 10;
          const gap = 8;
          const numBars = Math.floor(width / (barWidth + gap));
          ctx.fillStyle = 'rgba(0, 229, 255, 0.12)';
          for (let i = 0; i < numBars; i++) {
            const value = Math.abs(Math.sin(timeFactor + i * 0.18)) * (0.3 + Math.random() * 0.3) * soundAmp;
            const barHeight = Math.max(8, value * height * 0.5);
            ctx.fillRect(i * (barWidth + gap), height - barHeight, barWidth, barHeight);
          }
        }
        else if (visualizerStyle === 'particles') {
          // Particle burst from center
          if (isPlaying && Math.random() < 0.25) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 2 + 1;
            ripples.push({
              type: 'particle',
              x: width / 2,
              y: height / 2,
              vx: Math.cos(angle) * speed,
              vy: Math.sin(angle) * speed,
              size: Math.random() * 3 + 1,
              alpha: 1
            });
          }
          
          ripples.forEach(p => {
            if (p.type === 'particle') {
              p.x += p.vx;
              p.y += p.vy;
              p.alpha -= 0.015;
              ctx.beginPath();
              ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
              ctx.fillStyle = `rgba(0, 229, 255, ${p.alpha})`;
              ctx.fill();
            }
          });
          ripples = ripples.filter(p => p.type !== 'particle' || p.alpha > 0);
        }
        else if (visualizerStyle === 'wave') {
          // Wave style
          ctx.strokeStyle = 'rgba(0, 229, 255, 0.15)';
          ctx.lineWidth = 3;
          ctx.beginPath();
          const sliceWidth = width / 50;
          for (let i = 0; i < 50; i++) {
            const val = Math.sin(timeFactor * 1.5 + i * 0.25) * 0.35 * soundAmp;
            const y = height / 2 + val * height * 0.3;
            if (i === 0) ctx.moveTo(0, y);
            else ctx.lineTo(i * sliceWidth, y);
          }
          ctx.stroke();
        }
        else if (visualizerStyle === 'orbit') {
          // Planet orbits style
          const centerX = width / 2;
          const centerY = height / 2;
          const orbits = [
            { r: 100, speed: 0.015, color: 'rgba(0, 229, 255, 0.2)', size: 8 },
            { r: 180, speed: 0.009, color: 'rgba(168, 85, 247, 0.2)', size: 11 }
          ];

          orbits.forEach((orb) => {
            const angle = Date.now() * orb.speed;
            const rx = centerX + Math.cos(angle) * orb.r;
            const ry = centerY + Math.sin(angle) * orb.r;

            ctx.strokeStyle = 'rgba(255, 255, 255, 0.02)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(centerX, centerY, orb.r, 0, Math.PI * 2);
            ctx.stroke();

            ctx.fillStyle = orb.color;
            ctx.beginPath();
            ctx.arc(rx, ry, orb.size, 0, Math.PI * 2);
            ctx.fill();
          });
        }
      } 
      else if (activeSection === 'djem') {
        // Grid overlay
        ctx.fillStyle = 'rgba(10, 10, 15, 0.5)';
        ctx.fillRect(0, 0, width, height);
        drawGridLines('rgba(16, 185, 129, 0.015)', 0.015);

        // Laser Simulation
        laserAngle += 0.005;
        ctx.strokeStyle = 'rgba(0, 229, 255, 0.12)';
        ctx.lineWidth = 1.5;
        
        const centerX = width / 2;
        const startY = 0;
        
        // Sweep left laser
        ctx.beginPath();
        ctx.moveTo(centerX - 300, startY);
        ctx.lineTo(centerX - 300 + Math.sin(laserAngle) * 400, height);
        ctx.stroke();

        // Sweep right laser
        ctx.beginPath();
        ctx.moveTo(centerX + 300, startY);
        ctx.lineTo(centerX + 300 - Math.sin(laserAngle * 1.2) * 400, height);
        ctx.stroke();
      } 
      else if (activeSection === 'aries') {
        // Geometric node connections
        particles.forEach((p, idx) => {
          for (let j = idx + 1; j < particles.length; j++) {
            const p2 = particles[j];
            const dx = p.x - p2.x;
            const dy = p.y - p2.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 100) {
              ctx.strokeStyle = `rgba(0, 229, 255, ${0.08 * (1 - dist / 100)})`;
              ctx.lineWidth = 0.5;
              ctx.beginPath();
              ctx.moveTo(p.x, p.y);
              ctx.lineTo(p2.x, p2.y);
              ctx.stroke();
            }
          }
        });
      } 
      else if (activeSection === 'gamedev') {
        // Cinematic darkness vignette
        const grad = ctx.createRadialGradient(width / 2, height / 2, 100, width / 2, height / 2, Math.max(width, height) * 0.8);
        grad.addColorStop(0, 'transparent');
        grad.addColorStop(1, '#020204');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);
      }

      // Draw all general particles
      particles.forEach(p => {
        p.update(activeSection);
        p.draw();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [activeSection, isPlaying, visualizerStyle]);

  return (
    <div className="relative min-h-screen text-paper-white wabi-sabi-paper overflow-hidden flex flex-col font-sans selection:bg-moss-green/20 selection:text-paper-white">
      {/* Dynamic Island Overlay */}
      <DynamicIsland activeSection={activeSection} isPlaying={isPlaying} currentTrack={currentTrack} onNavigate={setActiveSection} />

      {/* Hidden Audio Controller */}
      <audio
        ref={audioRef}
        src={currentTrack?.src || ''}
        onTimeUpdate={handleAudioTimeUpdate}
        onLoadedMetadata={handleAudioLoadedMetadata}
        onEnded={handleAudioEnded}
      />

      {/* Global Background Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none z-0"
      />

      {/* Header bar */}
      <header className="relative z-50 w-full px-6 md:px-12 py-4 flex justify-between items-center bg-obsidian-void/60 backdrop-blur-md border-b border-white/5">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setActiveSection('matrix')}
            className="flex items-center gap-3 font-display font-extrabold tracking-widest text-lg md:text-xl text-paper-white hover:text-moss-green transition duration-300"
            id="btn-nav-home"
          >
            <img 
              src="/brand/logo.png" 
              alt="Logo" 
              className="w-10 h-10 object-contain rounded-lg border border-white/10 p-0.5 bg-white/5" 
            />
            <span className="hidden sm:inline">MAXX FORGE STUDIO</span>
          </button>

          {/* Aries Constellation/Horns ("Ears") SVG */}
          <div className="text-white/20 hover:text-emerald-400/80 transition duration-300 flex items-center justify-center" title="Aries Core">
            <svg viewBox="0 0 100 100" width="24" height="24" className="fill-none stroke-current" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round">
              {/* Aries horns */}
              <path d="M 50,85 C 50,60 40,30 20,30 C 10,30 10,45 20,45 C 30,45 40,15 50,15 C 60,15 70,45 80,45 C 90,45 90,30 80,30 C 60,30 50,60 50,85 Z" />
            </svg>
          </div>
        </div>

        {/* Center: Pulsing Mixer Visualizer when playing */}
        <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-full border border-white/10 text-xs font-mono">
          <div className="flex items-end gap-0.5 w-4 h-3.5 pb-0.5">
            <span className={`w-[2px] bg-cyber-blue rounded-full origin-bottom ${isPlaying ? 'bar-animation' : 'h-1.5'}`} style={{ height: '100%', animationDelay: '0.1s' }}></span>
            <span className={`w-[2px] bg-cyber-blue rounded-full origin-bottom ${isPlaying ? 'bar-animation' : 'h-1'}`} style={{ height: '70%', animationDelay: '0.3s' }}></span>
            <span className={`w-[2px] bg-cyber-blue rounded-full origin-bottom ${isPlaying ? 'bar-animation' : 'h-2'}`} style={{ height: '85%', animationDelay: '0.5s' }}></span>
          </div>
          <span className="text-[10px] text-white/30 hidden md:inline uppercase tracking-wider">Mixer:</span>
          <span className="text-cyber-blue font-bold text-[10px] truncate max-w-[120px]">
            {isPlaying ? (currentTrack?.title || 'Loading...') : 'OFFLINE'}

          </span>
        </div>

        {/* Right Nav buttons — Desktop only */}
        <div className="hidden lg:flex items-center gap-2 md:gap-3">
          {/* Main workspace navigation */}
          {can('use_workspace') && (
            <RouterLink 
              to="/workspace" 
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full text-xs font-semibold hover:bg-emerald-500/25 transition"
            >
              <FileText size={12} />
              <span className="hidden md:inline">Workspace</span>
            </RouterLink>
          )}

          <RouterLink 
            to="/feed" 
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-full text-xs font-semibold hover:bg-indigo-500/25 transition"
          >
            <MessageSquare size={12} />
            <span className="hidden md:inline">Forge Feed</span>
          </RouterLink>

          <RouterLink 
            to="/live" 
            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-full text-xs font-semibold hover:bg-red-500/25 transition"
          >
            <Radio size={12} className="animate-pulse" />
            <span className="hidden md:inline">Live Theater</span>
          </RouterLink>

          <button
            onClick={() => setCalendarOpen(true)}
            className="px-3.5 py-1.5 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 rounded-full text-xs font-mono font-bold hover:bg-cyan-500/20 transition"
          >
            Calendar
          </button>

          <button
            onClick={() => setFormsOpen(true)}
            className="px-3.5 py-1.5 bg-pink-500/10 border border-pink-500/20 text-pink-400 rounded-full text-xs font-mono font-bold hover:bg-pink-500/20 transition"
          >
            Forms
          </button>

          {can('view_staff_portal') && (
            <RouterLink 
              to="/staff" 
              className="flex items-center gap-1.5 px-3 py-1.5 bg-pink-500/10 border border-pink-500/20 text-pink-400 rounded-full text-xs font-semibold hover:bg-pink-500/25 transition"
            >
              <Sliders size={12} />
              <span className="hidden md:inline">Staff Portal</span>
            </RouterLink>
          )}

          {can('view_admin') && (
            <RouterLink 
              to="/admin" 
              className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-500/10 border border-violet-500/20 text-violet-400 rounded-full text-xs font-semibold hover:bg-violet-500/25 transition"
            >
              <Shield size={12} />
              <span className="hidden md:inline">Admin Panel</span>
            </RouterLink>
          )}

          {/* Settings Trigger Icon */}
          <button
            onClick={() => setSettingsOpen(true)}
            className="p-2 bg-neutral-900/60 border border-white/10 rounded-full hover:border-moss-green hover:bg-neutral-900 transition duration-300 text-white/60 hover:text-white"
            title="Settings"
          >
            <Sliders size={14} />
          </button>
        </div>

        {/* Mobile Menu trigger (hidden on desktop) */}
        <div className="lg:hidden flex items-center gap-2">
          {isPlaying && (
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_6px_#00e5ff] mr-1" />
          )}
          
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="p-2 bg-neutral-900/60 border border-white/10 rounded-xl hover:border-moss-green hover:bg-neutral-900 transition duration-300 text-white/70 flex items-center gap-1.5"
            title="Menu"
          >
            <Menu size={15} />
            <span className="text-[9px] font-mono font-bold tracking-wider">MENU</span>
          </button>
        </div>
      </header>

      {/* Primary Display Portal */}
      <main className="relative z-10 flex-grow w-full max-w-7xl mx-auto px-6 md:px-12 py-10 md:py-16 flex flex-col justify-center pb-28">
        <AnimatePresence mode="wait">
          {activeSection === 'matrix' && (
            <motion.div
              key="matrix"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col gap-10 md:gap-14 animate-ink-bleed"
            >
              {/* Live Mode Banner — staff-activated LIVE NOW takeover */}
              <AnimatePresence>
                {liveModeConfig.active && (
                  <motion.div
                    initial={{ opacity: 0, y: -16, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -12, scale: 0.97 }}
                    transition={{ type: 'spring', stiffness: 280, damping: 24 }}
                    className="w-full rounded-2xl overflow-hidden"
                    style={{
                      background: 'linear-gradient(110deg, rgba(127,0,0,0.55) 0%, rgba(80,0,0,0.35) 40%, rgba(127,0,0,0.55) 100%)',
                      border: '1px solid rgba(239,68,68,0.35)',
                      boxShadow: '0 0 60px rgba(239,68,68,0.2), inset 0 1px 0 rgba(255,255,255,0.06)',
                    }}
                  >
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-5 md:p-6">
                      <div className="flex items-center gap-4">
                        <div className="relative flex-shrink-0">
                          <span className="absolute inline-flex w-4 h-4 rounded-full bg-red-500 animate-ping opacity-75" />
                          <span className="relative inline-flex w-4 h-4 rounded-full bg-red-500 shadow-[0_0_12px_#ef4444]" />
                        </div>
                        <div>
                          <p className="text-base md:text-lg font-display font-black text-white uppercase tracking-wide">
                            {liveModeConfig.title || 'WE ARE LIVE'}
                          </p>
                          <p className="text-xs text-red-200/70 font-light mt-0.5">
                            {liveModeConfig.subtitle || 'Maxx Forge Studio is streaming now. Click to watch.'}
                          </p>
                        </div>
                      </div>
                      <RouterLink
                        to="/live"
                        className="flex-shrink-0 flex items-center gap-2 px-6 py-3 bg-red-500 hover:bg-red-400 text-white font-bold text-sm rounded-xl transition shadow-[0_0_20px_rgba(239,68,68,0.4)] hover:shadow-[0_0_30px_rgba(239,68,68,0.6)]"
                      >
                        <Radio size={15} className="animate-pulse" />
                        WATCH LIVE →
                      </RouterLink>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-10 text-left">
                {/* Left Column: Statements + Division Cards (8 cols) */}
                <div className="lg:col-span-8 flex flex-col gap-8 md:gap-10">
                  
                  {/* Brand Statement Banner */}
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 text-[9px] font-mono tracking-widest bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 rounded uppercase font-bold">
                        System Core v3.0
                      </span>
                      <span className="w-1.5 h-1.5 rounded-full bg-white/20"></span>
                      <span className="text-xs font-mono text-paper-white-muted uppercase tracking-wider">Liquid Glass Interface Node</span>
                    </div>
                    <h1 className="text-4xl sm:text-5xl md:text-6xl font-display font-black tracking-tighter leading-none">
                      THE MATRIX <br/>
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400">ECOSYSTEM.</span>
                    </h1>
                    <p className="text-sm md:text-base text-paper-white-muted font-light leading-relaxed max-w-xl">
                      Welcome to the centralized digital matrix of Maxx Forge Studio. Discover, interact, and automate across our interconnected nodes of music synthesis, lighting design, software tools, and gaming systems.
                    </p>
                  </div>

                  {/* Portal Grid — Roomy 2-column layout */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                    {/* Portal 1: Records */}
                    <div 
                      onClick={() => setActiveSection('records')}
                      className="group relative glass-panel rounded-3xl p-6 flex flex-col gap-6 justify-between cursor-pointer hover:border-cyan-400/40 hover:translate-y-[-4px] transition duration-300 shadow-lg overflow-hidden"
                      id="portal-records"
                    >
                      <div className="absolute inset-0 bg-gradient-to-b from-cyan-400/5 to-transparent opacity-0 group-hover:opacity-100 transition duration-300" />
                      
                      <div className="flex justify-between items-start">
                        <div className="p-3 bg-cyan-500/15 border border-cyan-500/30 rounded-2xl text-cyan-400 group-hover:scale-110 transition duration-300">
                          <Disc size={20} className="animate-spin-slow" />
                        </div>
                        <span className="text-[10px] font-mono text-cyan-400/60 font-bold tracking-widest uppercase">Node 01</span>
                      </div>

                      {/* Animation Preview */}
                      <div className="h-28 w-full bg-neutral-950/40 rounded-2xl border border-white/5 overflow-hidden flex items-center justify-center relative">
                        <LottiePlayer
                          src="/animations/glowing-fish-loader.json"
                          className="w-20 h-20 opacity-80 group-hover:scale-110 transition duration-300"
                          loop
                          autoplay
                        />
                        <div className="absolute bottom-2 left-3 text-[8px] font-mono text-white/30 uppercase tracking-widest">Master audio stream</div>
                      </div>

                      <div>
                        <h3 className="text-lg font-display font-bold group-hover:text-cyan-300 transition duration-300 mb-1">The All-Star Hub</h3>
                        <p className="text-xs text-white/50 leading-relaxed font-light">
                          Sleek music visualizer and digital dashboard featuring the 2026 track archives.
                        </p>
                      </div>
                    </div>

                    {/* Portal 2: DJ Em */}
                    <div 
                      onClick={() => setActiveSection('djem')}
                      className="group relative glass-panel rounded-3xl p-6 flex flex-col gap-6 justify-between cursor-pointer hover:border-emerald-400/40 hover:translate-y-[-4px] transition duration-300 shadow-lg overflow-hidden"
                      id="portal-djem"
                    >
                      <div className="absolute inset-0 bg-gradient-to-b from-emerald-400/5 to-transparent opacity-0 group-hover:opacity-100 transition duration-300" />
                      
                      <div className="flex justify-between items-start">
                        <div className="p-3 bg-emerald-500/15 border border-emerald-500/30 rounded-2xl text-emerald-400 group-hover:scale-110 transition duration-300">
                          <Zap size={20} />
                        </div>
                        <span className="text-[10px] font-mono text-emerald-400/60 font-bold tracking-widest uppercase">Node 02</span>
                      </div>

                      {/* Animation Preview */}
                      <div className="h-28 w-full bg-neutral-950/40 rounded-2xl border border-white/5 overflow-hidden flex items-center justify-center relative">
                        <LottiePlayer
                          src="/animations/kaleidoscope.json"
                          className="w-full h-full object-cover opacity-80 group-hover:scale-110 transition duration-300"
                          loop
                          autoplay
                        />
                        <div className="absolute bottom-2 left-3 text-[8px] font-mono text-white/30 uppercase tracking-widest">TouchDesigner matrix</div>
                      </div>

                      <div>
                        <h3 className="text-lg font-display font-bold group-hover:text-emerald-300 transition duration-300 mb-1">DJ Em Live Events</h3>
                        <p className="text-xs text-white/50 leading-relaxed font-light">
                          Dynamic stage light rig mixers, DMX controller simulations, and event booking.
                        </p>
                      </div>
                    </div>

                    {/* Portal 3: Aries Tech */}
                    <div 
                      onClick={() => setActiveSection('aries')}
                      className="group relative glass-panel rounded-3xl p-6 flex flex-col gap-6 justify-between cursor-pointer hover:border-indigo-400/40 hover:translate-y-[-4px] transition duration-300 shadow-lg overflow-hidden"
                      id="portal-aries"
                    >
                      <div className="absolute inset-0 bg-gradient-to-b from-indigo-400/5 to-transparent opacity-0 group-hover:opacity-100 transition duration-300" />
                      
                      <div className="flex justify-between items-start">
                        <div className="p-3 bg-indigo-500/15 border border-indigo-500/30 rounded-2xl text-indigo-400 group-hover:scale-110 transition duration-300">
                          <Cpu size={20} />
                        </div>
                        <span className="text-[10px] font-mono text-indigo-400/60 font-bold tracking-widest uppercase">Node 03</span>
                      </div>

                      {/* Animation Preview */}
                      <div className="h-28 w-full bg-neutral-950/40 rounded-2xl border border-white/5 overflow-hidden flex items-center justify-center relative">
                        <LottiePlayer
                          src="/animations/ai-animation-flow-1.json"
                          className="w-full h-full object-cover opacity-80 group-hover:scale-110 transition duration-300"
                          loop
                          autoplay
                        />
                        <div className="absolute bottom-2 left-3 text-[8px] font-mono text-white/30 uppercase tracking-widest">Ollama context stream</div>
                      </div>

                      <div>
                        <h3 className="text-lg font-display font-bold group-hover:text-indigo-300 transition duration-300 mb-1">Aries AI & Software</h3>
                        <p className="text-xs text-white/50 leading-relaxed font-light">
                          Local Ollama LLM terminal consoles and the September 2026 rollout node.
                        </p>
                      </div>
                    </div>

                    {/* Portal 4: Game Dev */}
                    <div 
                      onClick={() => setActiveSection('gamedev')}
                      className="group relative glass-panel rounded-3xl p-6 flex flex-col gap-6 justify-between cursor-pointer hover:border-red-400/40 hover:translate-y-[-4px] transition duration-300 shadow-lg overflow-hidden"
                      id="portal-gamedev"
                    >
                      <div className="absolute inset-0 bg-gradient-to-b from-red-400/5 to-transparent opacity-0 group-hover:opacity-100 transition duration-300" />
                      
                      <div className="flex justify-between items-start">
                        <div className="p-3 bg-red-500/15 border border-red-500/30 rounded-2xl text-red-400 group-hover:scale-110 transition duration-300">
                          <Gamepad2 size={20} />
                        </div>
                        <span className="text-[10px] font-mono text-red-400/60 font-bold tracking-widest uppercase">Node 04</span>
                      </div>

                      {/* Animation Preview */}
                      <div className="h-28 w-full bg-neutral-950/40 rounded-2xl border border-white/5 overflow-hidden flex items-center justify-center relative">
                        <LottiePlayer
                          src="/animations/falling-shapes/a/Main Scene.json"
                          assetsPath="/animations/falling-shapes/i/"
                          className="w-full h-full object-cover opacity-80 group-hover:scale-110 transition duration-300"
                          loop
                          autoplay
                        />
                        <div className="absolute bottom-2 left-3 text-[8px] font-mono text-white/30 uppercase tracking-widest">Physics engine sandbox</div>
                      </div>

                      <div>
                        <h3 className="text-lg font-display font-bold group-hover:text-red-300 transition duration-300 mb-1">Game Development</h3>
                        <p className="text-xs text-white/50 leading-relaxed font-light">
                          Survival horror cinematic visuals, media grids, and interactive demo runs.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Workspace Documents Quick Launcher */}
                  <div className="glass-panel rounded-3xl p-6 border border-white/10 flex flex-col gap-5">
                    <div className="flex items-center justify-between border-b border-white/5 pb-3">
                      <div className="flex items-center gap-2">
                        <FileText className="text-emerald-400" size={18} />
                        <h3 className="text-sm font-display font-bold uppercase text-white">Workspace Documents</h3>
                      </div>
                      {can('create_docs') && (
                        <button
                          onClick={() => {
                            const newDoc = { title: 'Untitled Document', body: '', author: currentUser?.displayName || currentUser?.name || 'Maxx' };
                            const updated = saveDoc(newDoc);
                            const created = updated[0];
                            toast.success('Document created!');
                            navigate(`/workspace?docId=${created.id}`);
                          }}
                          className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs rounded-xl transition flex items-center gap-1.5"
                        >
                          <PlusCircle size={12} /> Create Doc
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {dashboardDocs.slice(0, 3).map(doc => (
                        <div
                          key={doc.id}
                          onClick={() => navigate(`/workspace?docId=${doc.id}`)}
                          className="p-3.5 bg-white/3 border border-white/5 hover:border-emerald-500/30 rounded-2xl cursor-pointer hover:bg-white/5 transition flex flex-col gap-2 justify-between"
                        >
                          <div className="flex items-start gap-2">
                            <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-400 font-bold">
                              <FileText size={16} />
                            </div>
                            <div className="text-left">
                              <p className="text-xs font-bold text-white truncate max-w-[130px]">{doc.title}</p>
                              <p className="text-[9px] font-mono text-white/30 mt-0.5">Updated {new Date(doc.updatedAt).toLocaleDateString()}</p>
                            </div>
                          </div>
                          <span className="text-[8px] font-mono text-white/40 uppercase tracking-widest text-right">Edit →</span>
                        </div>
                      ))}
                      {dashboardDocs.length === 0 && (
                        <p className="col-span-full text-center text-xs font-mono text-white/20 py-6">No documents found. Create one above!</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Column: Announcements & Notes Bulletin (4 cols) */}
                <div className="lg:col-span-4 flex flex-col gap-6">
                  <div className="glass-panel rounded-3xl p-6 flex flex-col gap-5 border border-white/10" style={{ minHeight: '480px' }}>
                    <div className="flex items-center justify-between border-b border-white/5 pb-3">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_#a5f3fc]" />
                        <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white">Ecosystem Bulletin</h3>
                      </div>
                      <span className="text-[9px] font-mono text-cyan-400 bg-cyan-400/10 px-2 py-0.5 rounded border border-cyan-400/20 uppercase font-bold tracking-widest">Notes</span>
                    </div>

                    {/* Announcement input for staff/founder */}
                    {currentUser && (can('view_staff_portal') || can('toggle_maintenance')) && (
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          if (!newAnnText.trim()) return;
                          const newAnn = {
                            id: `ann_${Date.now()}`,
                            author: currentUser.displayName || currentUser.name,
                            role: currentUser.role,
                            text: newAnnText.trim(),
                            timestamp: new Date().toISOString()
                          };
                          const updated = [newAnn, ...announcements];
                          setAnnouncements(updated);
                          localStorage.setItem('mfs_announcements', JSON.stringify(updated));
                          publish('announcement_added', newAnn);
                          setNewAnnText('');
                          toast.success('Announcement broadcasted!');
                        }}
                        className="flex flex-col gap-2 p-3 bg-white/5 rounded-2xl border border-white/5 text-left"
                      >
                        <span className="text-[9px] font-mono text-white/30 uppercase tracking-widest">Create Announcement</span>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={newAnnText}
                            onChange={(e) => setNewAnnText(e.target.value)}
                            placeholder="Add a notes update..."
                            className="flex-grow px-3 py-2 bg-neutral-900 border border-white/10 rounded-xl text-xs text-white placeholder-white/20 focus:outline-none focus:border-cyan-500/50"
                          />
                          <button
                            type="submit"
                            disabled={!newAnnText.trim()}
                            className="px-3 bg-cyan-400 hover:bg-cyan-300 disabled:opacity-40 disabled:hover:bg-cyan-400 text-neutral-950 font-bold rounded-xl text-xs flex items-center justify-center transition"
                          >
                            Post
                          </button>
                        </div>
                      </form>
                    )}

                    {/* Announcements List */}
                    <div className="flex-grow overflow-y-auto flex flex-col gap-3 max-h-[360px] pr-1">
                      {announcements.length === 0 ? (
                        <p className="text-center text-xs font-mono text-white/25 py-8">No announcements at the moment.</p>
                      ) : (
                        announcements.map((ann) => {
                          const isStaff = ann.role === 'staff' || ann.role === 'founder';
                          return (
                            <motion.div
                              key={ann.id}
                              initial={{ opacity: 0, y: 5 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="p-3 bg-white/3 border border-white/5 rounded-2xl flex flex-col gap-1.5 hover:bg-white/5 transition"
                            >
                              <div className="flex items-center gap-1.5">
                                <span className={`px-1.5 py-0.5 rounded-[4px] text-[8px] font-mono uppercase font-bold border ${
                                  ann.role === 'founder' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                                  ann.role === 'staff' ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' :
                                  'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                }`}>
                                  {ann.role}
                                </span>
                                <span className="font-bold text-white/80 font-mono text-[10px]">{ann.author}</span>
                                <span className="text-[8px] text-white/25 font-mono ml-auto">
                                  {new Date(ann.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                                
                                {/* Delete button for authorized staff */}
                                {currentUser && (can('view_staff_portal') || can('toggle_maintenance')) && (
                                  <button
                                    onClick={() => {
                                      const updated = announcements.filter(a => a.id !== ann.id);
                                      setAnnouncements(updated);
                                      localStorage.setItem('mfs_announcements', JSON.stringify(updated));
                                      publish('announcement_deleted', { id: ann.id });
                                      toast.success('Announcement deleted');
                                    }}
                                    className="p-1 hover:text-red-400 transition"
                                    title="Delete announcement"
                                  >
                                    <X size={10} />
                                  </button>
                                )}
                              </div>
                              <p className="text-[11px] text-white/60 leading-relaxed font-light break-words">{ann.text}</p>
                            </motion.div>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeSection === 'records' && (
            <motion.div
              key="records"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-10"
            >
              {/* Music Player Panel — Fullscreen Video */}
              <div className="lg:col-span-7 relative rounded-3xl overflow-hidden glow-blue" style={{ minHeight: '520px' }}>
                {/* Fullscreen background video */}
                <video
                  key={videoSrc}
                  src={videoSrc}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="absolute inset-0 w-full h-full object-cover"
                  style={{
                    filter: isPlaying ? 'brightness(0.9)' : 'brightness(0.65)',
                    transition: 'filter 0.6s ease',
                  }}
                />

                {/* Dark gradient overlay at bottom for readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent pointer-events-none" />

                {/* Playing glow pulse when active */}
                {isPlaying && (
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      boxShadow: `inset 0 0 60px ${selectedHeadliner.accentColor}30`,
                      transition: 'box-shadow 0.6s ease',
                    }}
                  />
                )}

                {/* Top bar: Section label + playlist toggle */}
                <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between z-10">
                  <div className="flex items-center gap-3">
                    <Disc className={`text-cyber-blue ${isPlaying ? 'animate-spin' : ''}`} size={18} style={{ animationDuration: '4s' }} />
                    <span className="text-sm font-display font-bold tracking-wider uppercase text-cyber-blue">The All-Star Hub</span>
                    <span className="px-2.5 py-1 rounded bg-cyber-blue/10 border border-cyber-blue/20 text-[9px] font-mono text-cyber-blue font-bold">
                      AUDIO MASTER STREAM
                    </span>
                  </div>
                  <button
                    onClick={() => setPlaylistOpen(o => !o)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/50 border border-white/10 text-xs font-mono text-white/70 hover:text-white hover:border-cyber-blue/50 transition backdrop-blur-sm"
                    title="Toggle playlist"
                  >
                    <List size={13} />
                    {playlistOpen ? 'Hide' : 'Tracks'}
                    {playlistOpen ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                  </button>
                </div>

                {/* Floating Playlist Drawer */}
                <AnimatePresence>
                  {playlistOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 20 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 28 }}
                      className="absolute top-14 right-4 w-72 max-h-64 overflow-y-auto z-20 rounded-2xl border border-white/10 backdrop-blur-2xl"
                      style={{ background: 'rgba(5,5,8,0.92)' }}
                    >
                      <div className="p-3 flex flex-col gap-1.5">
                        <p className="text-[9px] font-mono text-white/40 uppercase tracking-wider px-1 mb-1">
                          {selectedHeadliner.album} — Playlist
                        </p>
                        {activePlaylist.map((track, index) => {
                          const isCurrent = index === currentTrackIndex;
                          return (
                            <button
                              key={track.id}
                              onClick={() => { setCurrentTrackIndex(index); setIsPlaying(true); setPlaylistOpen(false); }}
                              className={`flex items-center gap-2 p-2.5 rounded-xl border text-left w-full transition text-xs ${
                                isCurrent
                                  ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-400'
                                  : 'bg-white/3 border-white/5 text-white/60 hover:bg-white/8 hover:text-white hover:border-white/10'
                              }`}
                            >
                              <span className="font-mono text-[9px] w-4 flex-shrink-0 text-white/30">{(index + 1).toString().padStart(2, '0')}</span>
                              <span className="truncate font-semibold">{track.title}</span>
                              {isCurrent && isPlaying && (
                                <span className="ml-auto flex gap-px items-end h-3">
                                  {[1,2,3].map(i => (
                                    <motion.span
                                      key={i}
                                      className="w-[2px] rounded-full bg-cyan-400"
                                      animate={{ height: ['4px','10px','4px'] }}
                                      transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                                    />
                                  ))}
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Bottom: Track info + controls floating over video */}
                <div className="absolute bottom-0 left-0 right-0 z-10 p-5 flex flex-col gap-3">
                  {/* Track info */}
                  <div className="flex items-end justify-between gap-3">
                    <div className="flex flex-col gap-1">
                      <h2 className="text-xl md:text-2xl font-display font-bold text-white tracking-tight leading-tight drop-shadow">
                        {currentTrack?.title || '—'}
                      </h2>
                      <span className="text-sm font-mono font-semibold drop-shadow" style={{ color: selectedHeadliner.accentColor }}>
                        {currentTrack?.artist || '—'}
                      </span>
                      <div className="flex items-center gap-2 mt-0.5">
                        <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg border border-white/5 bg-black/40 text-[9px] font-mono text-white/40 backdrop-blur-sm">
                          <span>🎧</span>
                          <span>LISTEN TO UNLOCK BADGES · TIED TO YOUR ACCOUNT</span>
                        </div>
                        <button
                          onClick={() => toggleFavorite(currentTrack?.id)}
                          className={`p-1.5 rounded-full border transition duration-300 ${favorites.includes(currentTrack?.id) ? 'bg-red-500/15 border-red-500/40 text-red-400' : 'bg-black/40 border-white/10 text-white/40 hover:text-red-400 hover:border-red-500/40'}`}
                          title="Save to favorites"
                          id="btn-audio-fav"
                        >
                          <Heart size={13} fill={favorites.includes(currentTrack?.id) ? 'currentColor' : 'none'} />
                        </button>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-white/30">Track {currentTrackIndex + 1}/{activePlaylist.length}</span>
                  </div>

                  {/* Progress bar */}
                  <div className="flex flex-col gap-1.5">
                    <input
                      type="range"
                      min="0"
                      max={duration || 100}
                      value={currentTime}
                      onChange={handleScrubChange}
                      className="w-full h-1 bg-white/15 rounded-lg appearance-none cursor-pointer accent-cyber-blue"
                      id="slider-audio-progress"
                    />
                    <div className="flex justify-between text-[10px] font-mono text-white/30">
                      <span>{formatTime(currentTime)}</span>
                      <span>{formatTime(duration)}</span>
                    </div>
                  </div>

                  {/* Player controls row */}
                  <div className="flex items-center justify-between gap-3 bg-black/50 backdrop-blur-xl p-3 rounded-2xl border border-white/8">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleSkipBackward}
                        className="p-2.5 bg-white/5 border border-white/8 rounded-xl hover:bg-white/10 hover:text-cyber-blue transition"
                        title="Previous Track"
                        id="btn-audio-prev"
                      >
                        <SkipBack size={16} />
                      </button>
                      <button
                        onClick={handlePlayPause}
                        className="p-3 bg-cyber-blue text-neutral-950 rounded-xl hover:bg-cyan-300 transition hover:scale-105 active:scale-95 shadow-[0_0_15px_rgba(0,229,255,0.5)]"
                        title={isPlaying ? "Pause" : "Play"}
                        id="btn-audio-play"
                      >
                        {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}
                      </button>
                      <button
                        onClick={handleSkipForward}
                        className="p-2.5 bg-white/5 border border-white/8 rounded-xl hover:bg-white/10 hover:text-cyber-blue transition"
                        title="Next Track"
                        id="btn-audio-next"
                      >
                        <SkipForward size={16} />
                      </button>
                    </div>

                    {/* Volume */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setIsMuted(!isMuted)}
                        className="text-white/50 hover:text-cyber-blue transition"
                        id="btn-audio-mute"
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
                        className="w-20 h-1 bg-white/15 rounded-lg appearance-none cursor-pointer accent-cyber-blue"
                        id="slider-audio-volume"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Playlist & Headliners Selector Section */}
              <div className="lg:col-span-5 flex flex-col gap-6">
                
                {/* Dynamic Headliners Spotlight Switcher */}
                <div className="glass-panel rounded-3xl p-5 flex flex-col gap-3 text-left">
                  <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-widest flex items-center gap-1.5">
                    <Sparkles size={11} className="text-cyan-400" /> Featured Headliners Spotlight
                  </span>
                  
                  <div className="flex gap-2">
                    {HEADLINERS.map(hl => (
                      <button
                        key={hl.id}
                        onClick={() => {
                          setSelectedHeadliner(hl);
                          setActivePlaylist(hl.tracks);
                          setCurrentTrackIndex(0);
                          setIsPlaying(false);
                          toast.success(`Active Spotlight: ${hl.artist}`);
                        }}
                        className={`flex-1 py-2 px-3 text-xs font-bold rounded-xl border transition ${
                          selectedHeadliner.id === hl.id
                            ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400'
                            : 'bg-white/5 border-white/5 text-white/50 hover:bg-white/10'
                        }`}
                      >
                        {hl.artist}
                      </button>
                    ))}
                  </div>

                  <p className="text-[10px] text-white/40 leading-relaxed mt-1">
                    {selectedHeadliner.desc}
                  </p>
                </div>

                <div className="glass-panel rounded-3xl p-6 flex flex-col gap-4 max-h-[380px] overflow-y-auto">
                  <h3 className="text-xs font-display font-bold uppercase tracking-wider text-paper-white-muted">
                    {selectedHeadliner.album.toUpperCase()} — PLAYLIST
                  </h3>
                  
                  <div className="flex flex-col gap-2">
                    {activePlaylist.map((track, index) => {
                      const isCurrent = index === currentTrackIndex;
                      return (
                        <div
                          key={track.id}
                          onClick={() => {
                            setCurrentTrackIndex(index);
                            setIsPlaying(true);
                          }}
                          className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition duration-300 ${isCurrent ? 'bg-cyan-500/10 border-cyan-500/40 text-cyan-400' : 'bg-neutral-950/40 border-white/5 text-paper-white-muted hover:bg-neutral-900/60 hover:border-white/10 hover:text-paper-white'}`}
                          id={`playlist-item-${track.id}`}
                        >
                          <div className="flex items-center gap-3 truncate">
                            <span className="text-[10px] font-mono w-4 text-paper-white-dim">{(index + 1).toString().padStart(2, '0')}</span>
                            <div className="truncate">
                              <p className="text-xs font-semibold truncate leading-tight">{track.title}</p>
                              <span className="text-[9px] font-mono text-paper-white-dim uppercase">{track.artist}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            {isCurrent && isPlaying ? (
                              <div className="flex items-center gap-0.5 w-3 h-2.5">
                                <span className="w-[1.5px] bg-cyan-400 h-full origin-bottom bar-animation animate-pulse"></span>
                                <span className="w-[1.5px] bg-cyan-400 h-2/3 origin-bottom bar-animation animate-pulse" style={{ animationDelay: '0.1s' }}></span>
                                <span className="w-[1.5px] bg-cyan-400 h-1/2 origin-bottom bar-animation animate-pulse" style={{ animationDelay: '0.3s' }}></span>
                              </div>
                            ) : (
                              <span className="text-[9px] font-mono text-paper-white-dim">{track.duration}</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* External Streaming Card */}
                <div className="glass-panel rounded-3xl p-5 border border-cyber-blue/20 bg-gradient-to-r from-neutral-950 via-neutral-950 to-cyan-950/20 flex flex-col gap-4">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-mono uppercase text-cyber-blue/80 tracking-widest font-bold">Streaming Portals</span>
                    <ExternalLink size={14} className="text-cyber-blue/40" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <a href="https://spotify.com" target="_blank" rel="noreferrer" className="flex items-center justify-center py-2.5 bg-neutral-900 border border-white/5 rounded-xl text-xs font-semibold hover:border-cyber-blue hover:text-cyber-blue transition duration-300">Spotify</a>
                    <a href="https://apple.com" target="_blank" rel="noreferrer" className="flex items-center justify-center py-2.5 bg-neutral-900 border border-white/5 rounded-xl text-xs font-semibold hover:border-cyber-blue hover:text-cyber-blue transition duration-300">Apple Music</a>
                    <a href="https://bandlab.com" target="_blank" rel="noreferrer" className="flex items-center justify-center py-2.5 bg-neutral-900 border border-white/5 rounded-xl text-xs font-semibold hover:border-cyber-blue hover:text-cyber-blue transition duration-300">BandLab</a>
                    <a href="https://soundcloud.com" target="_blank" rel="noreferrer" className="flex items-center justify-center py-2.5 bg-neutral-900 border border-white/5 rounded-xl text-xs font-semibold hover:border-cyber-blue hover:text-cyber-blue transition duration-300">SoundCloud</a>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeSection === 'djem' && (
            <motion.div
              key="djem"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-10"
            >
              {/* Left Column: Stage Console Simulator */}
              <div className="lg:col-span-7 flex flex-col gap-6">
                <DjemStageSimulator />
              </div>

              {/* Right Column: Booking Inquiry Form */}
              <div className="lg:col-span-5 flex flex-col gap-6">
                <DjemBookingForm />
                <DjemKaleidoscopeVisual />
              </div>
            </motion.div>
          )}

          {activeSection === 'aries' && (
            <motion.div
              key="aries"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-10"
            >
              {/* Countdown Banner / Core Status */}
              <div className="lg:col-span-12">
                <AriesCountdownHeader />
              </div>

              {/* Interactive Python game runner console */}
              <div className="lg:col-span-12">
                <AriesPyArcade />
              </div>

              {/* Cloud Storage & AI Flow widgets */}
              <div className="lg:col-span-7">
                <AriesCloudStorageNode />
              </div>
              <div className="lg:col-span-5">
                <AriesLiveAiFlow />
              </div>
            </motion.div>
          )}

          {activeSection === 'gamedev' && (
            <motion.div
              key="gamedev"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-10"
            >
              {/* Game Introduction and terminal gameplay */}
              <div className="lg:col-span-7 flex flex-col gap-6">
                <GameIntroAndPlayShell />
              </div>

              {/* Art Grid & Media Gallery */}
              <div className="lg:col-span-5 flex flex-col gap-6">
                <GameMediaGallery />
                <GameDevFallingShapes />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Floating macOS Dock Navigator */}
      <nav className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 rounded-2xl glass-dock flex items-center gap-4 md:gap-6 shadow-2xl">
        <DockIcon 
          label="Core Matrix" 
          active={activeSection === 'matrix'} 
          onClick={() => setActiveSection('matrix')}
          id="dock-home"
        >
          <Home size={20} />
        </DockIcon>
        
        <div className="w-[1px] h-6 bg-white/10"></div>

        <DockIcon 
          label="The All-Star Hub" 
          active={activeSection === 'records'} 
          onClick={() => setActiveSection('records')}
          id="dock-records"
        >
          <Disc size={20} className={isPlaying && activeSection === 'records' ? 'animate-spin' : ''} style={{ animationDuration: '4s' }} />
        </DockIcon>

        <DockIcon 
          label="DJ Em Events" 
          active={activeSection === 'djem'} 
          onClick={() => setActiveSection('djem')}
          id="dock-djem"
        >
          <Zap size={20} />
        </DockIcon>

        <DockIcon 
          label="Aries AI Console" 
          active={activeSection === 'aries'} 
          onClick={() => setActiveSection('aries')}
          id="dock-aries"
        >
          <Cpu size={20} />
        </DockIcon>

        <DockIcon 
          label="Game Dev Studio" 
          active={activeSection === 'gamedev'} 
          onClick={() => setActiveSection('gamedev')}
          id="dock-gamedev"
        >
          <Gamepad2 size={20} />
        </DockIcon>

        <div className="w-[1px] h-6 bg-white/10"></div>

        <DockIcon 
          label="Forge Profile" 
          active={accountOpen} 
          onClick={() => setAccountOpen(true)}
          id="dock-profile"
        >
          <User size={20} className="text-moss-green" />
        </DockIcon>
      </nav>

      {/* Forge Account Sliding Side Panel (Drawer) */}
      <AnimatePresence>
        {accountOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-55 bg-black/60 backdrop-blur-sm flex justify-end"
            onClick={() => setAccountOpen(false)}
            id="drawer-backdrop"
          >
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="w-full max-w-md h-full bg-obsidian-surface/95 border-l border-white/10 glass-panel-heavy p-6 flex flex-col gap-6 shadow-2xl overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center border-b border-white/10 pb-4">
                <div className="flex items-center gap-2">
                  <User className="text-moss-green" size={20} />
                  <h2 className="text-lg font-display font-bold uppercase tracking-wider">Forge Profile Drawer</h2>
                </div>
                <button
                  onClick={() => setAccountOpen(false)}
                  className="p-1.5 rounded-lg bg-white/5 border border-white/10 hover:border-moss-green hover:text-moss-green transition"
                  id="btn-drawer-close"
                >
                  <X size={16} />
                </button>
              </div>

              <AccountProfileModule favorites={favorites} setAccountOpen={setAccountOpen} setActiveSection={setActiveSection} setCurrentTrackIndex={setCurrentTrackIndex} setIsPlaying={setIsPlaying} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Forms Center Modal */}
      <FormsCenter isOpen={formsOpen} onClose={() => setFormsOpen(false)} />

      {/* Calendar Panel Modal */}
      <CalendarPanel isOpen={calendarOpen} onClose={() => setCalendarOpen(false)} />

      {/* Settings Drawer Panel */}
      <AnimatePresence>
        {settingsOpen && (
          <SettingsPanel onClose={() => setSettingsOpen(false)} />
        )}
      </AnimatePresence>

      {/* AI Chat System Overlay */}
      <AIChatSystem />

      {/* Bot Verification Challenge */}
      <BotChallenge isOpen={botModal} onSuccess={() => setBotModal(false)} />

      {/* Mobile Menu Overlay Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-md z-[900]"
            />
            {/* Drawer */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed top-0 right-0 bottom-0 w-full max-w-xs bg-obsidian-void/95 border-l border-white/10 z-[950] p-6 flex flex-col justify-between"
              style={{ background: 'rgba(8, 8, 12, 0.98)', backdropFilter: 'blur(30px)' }}
            >
              <div className="flex flex-col gap-6 text-left">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-white/5 pb-4">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_#a5f3fc]" />
                    <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">NAV MATRIX</span>
                  </div>
                  <button onClick={() => setMobileMenuOpen(false)} className="p-1.5 hover:bg-white/5 rounded-lg text-white/50 hover:text-white transition">
                    <X size={16} />
                  </button>
                </div>

                {/* Navigation Links */}
                <div className="flex flex-col gap-3">
                  {can('use_workspace') && (
                    <RouterLink
                      to="/workspace"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-xs font-bold hover:bg-emerald-500/20 transition"
                    >
                      <FileText size={14} />
                      Workspace
                    </RouterLink>
                  )}
                  <RouterLink
                    to="/feed"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 p-3 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-xl text-xs font-bold hover:bg-indigo-500/20 transition"
                  >
                    <MessageSquare size={14} />
                    Forge Feed
                  </RouterLink>
                  <RouterLink
                    to="/live"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs font-bold hover:bg-red-500/20 transition"
                  >
                    <Radio size={14} className="animate-pulse" />
                    Live Theater
                  </RouterLink>

                  <button
                    onClick={() => { setMobileMenuOpen(false); setCalendarOpen(true); }}
                    className="flex items-center gap-3 p-3 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 rounded-xl text-xs font-bold text-left hover:bg-cyan-500/20 transition"
                  >
                    <Calendar size={14} />
                    Calendar
                  </button>
                  <button
                    onClick={() => { setMobileMenuOpen(false); setFormsOpen(true); }}
                    className="flex items-center gap-3 p-3 bg-pink-500/10 border border-pink-500/20 text-pink-400 rounded-xl text-xs font-bold text-left hover:bg-pink-500/20 transition"
                  >
                    <Sliders size={14} />
                    Forms Center
                  </button>

                  {can('view_staff_portal') && (
                    <RouterLink
                      to="/staff"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 p-3 bg-pink-500/10 border border-pink-500/20 text-pink-400 rounded-xl text-xs font-bold hover:bg-pink-500/20 transition"
                    >
                      <Sliders size={14} />
                      Staff Portal
                    </RouterLink>
                  )}
                  {can('view_admin') && (
                    <RouterLink
                      to="/admin"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 p-3 bg-violet-500/10 border border-violet-500/20 text-violet-400 rounded-xl text-xs font-bold hover:bg-violet-500/20 transition"
                    >
                      <Shield size={14} />
                      Admin Panel
                    </RouterLink>
                  )}
                </div>
              </div>

              {/* Settings shortcut at the bottom */}
              <button
                onClick={() => { setMobileMenuOpen(false); setSettingsOpen(true); }}
                className="flex items-center justify-between p-3.5 bg-white/5 border border-white/10 rounded-2xl text-xs font-bold hover:bg-white/10 transition mt-6 text-white/80"
              >
                <div className="flex items-center gap-2">
                  <Sliders size={14} className="text-moss-green" />
                  Settings Panel
                </div>
                <span className="text-[10px] font-mono text-white/30">Edit Profile</span>
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Viewport Dimension HUD */}
      <div 
        className="fixed bottom-24 right-6 z-40 px-3 py-1.5 rounded-full border bg-neutral-950/80 backdrop-blur border-cyan-500/30 text-cyan-400 font-mono text-[9px] flex items-center gap-2 hover:bg-neutral-950 transition cursor-pointer select-none"
        title="Responsive Viewport Helper"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_6px_#00e5ff]" />
        <span>Breakpoint: {getBreakpoint(viewport.width)}</span>
        <span className="text-white/20">|</span>
        <span>Resolution: {viewport.width}px × {viewport.height}px</span>
      </div>
    </div>
  );
}

// =====================================================
// DOCK ICON NAV HELPER
// =====================================================
function DockIcon({ children, label, active, onClick, id }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div 
      className="relative flex flex-col items-center"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Label Tooltip */}
      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: -40, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute z-60 pointer-events-none px-2.5 py-1 rounded bg-neutral-900 border border-white/10 text-[10px] font-mono tracking-wider font-semibold whitespace-nowrap text-paper-white shadow-lg"
          >
            {label}
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={onClick}
        id={id}
        className={`p-3 rounded-xl transition duration-300 ${active ? 'bg-moss-green text-neutral-950 shadow-[0_0_15px_rgba(16,185,129,0.5)] scale-110' : 'bg-white/5 border border-white/5 text-paper-white-muted hover:bg-neutral-900 hover:text-paper-white hover:scale-110'}`}
      >
        {children}
      </button>

      {/* Dock Active Light Indicator */}
      {active && (
        <span className="absolute bottom-0 w-1 h-1 rounded-full bg-moss-green shadow-[0_0_5px_#10B981]"></span>
      )}
    </div>
  );
}

// =====================================================
// DJ EM: LIVE STAGE LIGHT CONSOLE
// =====================================================
function DjemStageSimulator() {
  const [dmxRed, setDmxRed] = useState(16);
  const [dmxGreen, setDmxGreen] = useState(185);
  const [dmxBlue, setDmxBlue] = useState(129);

  const [laserOn, setLaserOn] = useState(true);
  const [strobeOn, setStrobeOn] = useState(false);
  const [smokeOn, setSmokeOn] = useState(false);
  const [activeWash, setActiveWash] = useState('Flood');

  // Trigger color presets
  const applyPreset = (r, g, b) => {
    setDmxRed(r);
    setDmxGreen(g);
    setDmxBlue(b);
  };

  return (
    <div className="glass-panel rounded-3xl p-6 flex flex-col gap-6 glow-moss relative overflow-hidden">
      <div className="flex justify-between items-center border-b border-white/5 pb-4">
        <div className="flex items-center gap-2">
          <Sliders className="text-moss-green" size={18} />
          <span className="text-sm font-display font-bold uppercase tracking-wider text-moss-green">DMX Stage Laser Terminal</span>
        </div>
        <span className="px-2.5 py-1 rounded bg-moss-green/10 border border-moss-green/20 text-[9px] font-mono text-moss-green font-bold">
          DMX SIGNAL: LIVE
        </span>
      </div>

      {/* Interactive Visualizer Canvas / Screen */}
      <div className={`relative w-full h-44 rounded-2xl border border-white/10 flex flex-col justify-center items-center overflow-hidden transition-all duration-500`}
        style={{
          background: `radial-gradient(circle, rgba(${dmxRed}, ${dmxGreen}, ${dmxBlue}, 0.2) 0%, #050508 100%)`,
          filter: smokeOn ? 'blur(1.5px)' : 'none'
        }}
      >
        {/* Mock Stage Frame */}
        <div className="absolute inset-x-0 top-0 h-4 border-b border-white/5 bg-neutral-900/50 flex justify-around items-center px-10">
          <div className="w-2 h-2 rounded-full bg-neutral-600"></div>
          <div className="w-2 h-2 rounded-full bg-neutral-600"></div>
          <div className="w-2 h-2 rounded-full bg-neutral-600"></div>
        </div>

        {/* Flashing Strobe Element */}
        {strobeOn && (
          <div className="absolute inset-0 bg-white/25 mix-blend-overlay animate-ping pointer-events-none" style={{ animationDuration: '0.18s' }}></div>
        )}

        {/* Simulated Lasers */}
        {laserOn && (
          <div className="absolute inset-0 flex justify-center items-center pointer-events-none overflow-hidden">
            <svg className="w-full h-full opacity-60" viewBox="0 0 400 200">
              <line x1="200" y1="0" x2="50" y2="200" stroke={`rgb(${dmxRed}, ${dmxGreen}, ${dmxBlue})`} strokeWidth="1.5" className="animate-pulse" />
              <line x1="200" y1="0" x2="150" y2="200" stroke={`rgb(${dmxRed}, ${dmxGreen}, ${dmxBlue})`} strokeWidth="1" />
              <line x1="200" y1="0" x2="250" y2="200" stroke={`rgb(${dmxRed}, ${dmxGreen}, ${dmxBlue})`} strokeWidth="1" />
              <line x1="200" y1="0" x2="350" y2="200" stroke={`rgb(${dmxRed}, ${dmxGreen}, ${dmxBlue})`} strokeWidth="1.5" className="animate-pulse" />
            </svg>
          </div>
        )}

        {/* System telemetry outputs on simulator screen */}
        <div className="absolute bottom-3 left-4 right-4 flex justify-between items-center text-[9px] font-mono text-paper-white-dim bg-black/60 px-3 py-1.5 rounded-lg border border-white/5">
          <span className="text-moss-green uppercase">DMX: R-{dmxRed} G-{dmxGreen} B-{dmxBlue}</span>
          <span>WASH: {activeWash.toUpperCase()}</span>
          <span>LASER: {laserOn ? 'ON' : 'OFF'}</span>
        </div>

        <span className="text-[10px] font-mono text-paper-white-muted tracking-widest font-bold z-10 uppercase bg-black/30 px-3 py-1 rounded-full border border-white/5">
          Virtual stage test environment
        </span>
      </div>

      {/* RGB Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white/5 p-4 rounded-2xl border border-white/5">
        <div className="flex flex-col gap-3">
          <span className="text-xs font-mono text-paper-white-muted uppercase font-semibold">Stage color parameters</span>
          
          {/* Slider R */}
          <div className="flex items-center justify-between gap-4">
            <span className="text-xs font-mono text-red-500 w-8">RED</span>
            <input
              type="range"
              min="0"
              max="255"
              value={dmxRed}
              onChange={(e) => setDmxRed(parseInt(e.target.value))}
              className="flex-grow h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-red-500"
              id="slider-dmx-r"
            />
            <span className="text-xs font-mono w-8 text-right">{dmxRed}</span>
          </div>

          {/* Slider G */}
          <div className="flex items-center justify-between gap-4">
            <span className="text-xs font-mono text-green-500 w-8">GRN</span>
            <input
              type="range"
              min="0"
              max="255"
              value={dmxGreen}
              onChange={(e) => setDmxGreen(parseInt(e.target.value))}
              className="flex-grow h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-green-500"
              id="slider-dmx-g"
            />
            <span className="text-xs font-mono w-8 text-right">{dmxGreen}</span>
          </div>

          {/* Slider B */}
          <div className="flex items-center justify-between gap-4">
            <span className="text-xs font-mono text-blue-500 w-8">BLU</span>
            <input
              type="range"
              min="0"
              max="255"
              value={dmxBlue}
              onChange={(e) => setDmxBlue(parseInt(e.target.value))}
              className="flex-grow h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-blue-500"
              id="slider-dmx-b"
            />
            <span className="text-xs font-mono w-8 text-right">{dmxBlue}</span>
          </div>
        </div>

        {/* Scene Presets & Wash types */}
        <div className="flex flex-col justify-between gap-3 border-t md:border-t-0 md:border-l border-white/10 pt-4 md:pt-0 md:pl-6">
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-mono text-paper-white-muted uppercase font-semibold">Preset Macros</span>
            <div className="flex flex-wrap gap-2">
              <button 
                onClick={() => applyPreset(16, 185, 129)} // Moss green
                className="px-2.5 py-1 rounded bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-mono hover:bg-emerald-500/20 transition"
              >
                Moss Green
              </button>
              <button 
                onClick={() => applyPreset(0, 229, 255)} // Cyber blue
                className="px-2.5 py-1 rounded bg-cyan-500/10 border border-cyan-500/20 text-[10px] font-mono hover:bg-cyan-500/20 transition"
              >
                Cyber Blue
              </button>
              <button 
                onClick={() => applyPreset(155, 77, 255)} // Violet
                className="px-2.5 py-1 rounded bg-purple-500/10 border border-purple-500/20 text-[10px] font-mono hover:bg-purple-500/20 transition"
              >
                Neon Violet
              </button>
              <button 
                onClick={() => applyPreset(239, 68, 68)} // Red Alert
                className="px-2.5 py-1 rounded bg-red-500/10 border border-red-500/20 text-[10px] font-mono hover:bg-red-500/20 transition"
              >
                Red Alert
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-mono text-paper-white-muted uppercase font-semibold">Wash Mode</span>
            <div className="flex gap-2">
              {['Flood', 'Spot', 'Beam'].map(mode => (
                <button
                  key={mode}
                  onClick={() => setActiveWash(mode)}
                  className={`flex-grow py-1 rounded text-[10px] font-mono border transition duration-300 ${activeWash === mode ? 'bg-moss-green text-neutral-950 border-moss-green font-bold' : 'bg-neutral-900 border-white/5 text-paper-white-muted hover:border-white/10'}`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* DMX Hardware simulation parameters */}
      <div className="grid grid-cols-3 gap-3">
        <button
          onClick={() => setLaserOn(!laserOn)}
          className={`py-2 rounded-xl text-xs font-semibold border transition duration-300 ${laserOn ? 'bg-cyan-950/40 border-cyber-blue text-cyber-blue font-bold shadow-[0_0_10px_rgba(0,229,255,0.2)]' : 'bg-neutral-900/60 border-white/5 text-paper-white-muted hover:border-white/15'}`}
          id="btn-dmx-laser"
        >
          Lasers: {laserOn ? 'ON' : 'OFF'}
        </button>
        <button
          onClick={() => setStrobeOn(!strobeOn)}
          className={`py-2 rounded-xl text-xs font-semibold border transition duration-300 ${strobeOn ? 'bg-amber-950/40 border-amber-500 text-amber-500 font-bold shadow-[0_0_10px_rgba(245,158,11,0.2)]' : 'bg-neutral-900/60 border-white/5 text-paper-white-muted hover:border-white/15'}`}
          id="btn-dmx-strobe"
        >
          Strobe: {strobeOn ? 'ON' : 'OFF'}
        </button>
        <button
          onClick={() => setSmokeOn(!smokeOn)}
          className={`py-2 rounded-xl text-xs font-semibold border transition duration-300 ${smokeOn ? 'bg-emerald-950/40 border-moss-green text-moss-green font-bold shadow-[0_0_10px_rgba(16,185,129,0.2)]' : 'bg-neutral-900/60 border-white/5 text-paper-white-muted hover:border-white/15'}`}
          id="btn-dmx-smoke"
        >
          Fog: {smokeOn ? 'ON' : 'OFF'}
        </button>
      </div>
    </div>
  );
}

function DjemBookingForm() {
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    eventType: 'Concert Visual Rigging',
    message: ''
  });

  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleBookingSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email) return;

    setSending(true);
    // Simulate API connection
    setTimeout(() => {
      setSending(false);
      setFormSubmitted(true);
    }, 1500);
  };

  return (
    <div className="glass-panel rounded-3xl p-6 flex flex-col gap-6 relative overflow-hidden">
      <h3 className="text-base font-display font-bold uppercase tracking-wider text-paper-white-muted">
        Stage Booking Inquiry
      </h3>

      <AnimatePresence mode="wait">
        {!formSubmitted ? (
          <motion.form 
            key="booking-form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onSubmit={handleBookingSubmit} 
            className="flex flex-col gap-4"
            id="form-booking"
          >
            {/* Input Name */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-mono text-paper-white-dim uppercase font-bold tracking-wider">Your Name</label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleFormChange}
                placeholder="e.g. DJ Zeppelin"
                className="px-4 py-2.5 bg-neutral-950/60 border border-white/5 rounded-xl focus:border-moss-green focus:outline-none text-sm transition duration-300"
                id="input-booking-name"
              />
            </div>

            {/* Input Email */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-mono text-paper-white-dim uppercase font-bold tracking-wider">Email Address</label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleFormChange}
                placeholder="zepp@prime-agency.com"
                className="px-4 py-2.5 bg-neutral-950/60 border border-white/5 rounded-xl focus:border-moss-green focus:outline-none text-sm transition duration-300"
                id="input-booking-email"
              />
            </div>

            {/* Input Event Type */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-mono text-paper-white-dim uppercase font-bold tracking-wider">Ecosystem Need</label>
              <select
                name="eventType"
                value={formData.eventType}
                onChange={handleFormChange}
                className="px-4 py-2.5 bg-neutral-950/60 border border-white/5 rounded-xl focus:border-moss-green focus:outline-none text-sm text-paper-white-muted transition duration-300"
                id="select-booking-type"
              >
                <option value="Concert Visual Rigging">Concert Visual Rigging (TouchDesigner)</option>
                <option value="DMX System Design">DMX System Automation Logic</option>
                <option value="Audio Collaboration Remix">Prime Records Remix/Collab</option>
                <option value="Aries AI Local Integration">Aries Tech Local Setup</option>
              </select>
            </div>

            {/* Input Message */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-mono text-paper-white-dim uppercase font-bold tracking-wider">Rig Details / Requirements</label>
              <textarea
                name="message"
                rows="3"
                value={formData.message}
                onChange={handleFormChange}
                placeholder="Include stage sizes, lighting outputs, custom requirements..."
                className="px-4 py-2.5 bg-neutral-950/60 border border-white/5 rounded-xl focus:border-moss-green focus:outline-none text-sm transition duration-300 resize-none"
                id="input-booking-msg"
              />
            </div>

            <button
              type="submit"
              disabled={sending}
              className="mt-2 w-full py-3 bg-moss-green text-neutral-950 rounded-xl hover:bg-emerald-400 font-semibold text-sm transition duration-300 flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(16,185,129,0.3)] disabled:opacity-50"
              id="btn-booking-submit"
            >
              {sending ? (
                <div className="w-5 h-5 border-2 border-neutral-950 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Send size={15} />
                  <span>Transmit DMX Telemetry</span>
                </>
              )}
            </button>
          </motion.form>
        ) : (
          <motion.div 
            key="booking-success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center text-center py-10 bg-moss-green/5 border border-moss-green/20 rounded-2xl"
          >
            <div className="w-12 h-12 bg-moss-green/10 border border-moss-green/30 rounded-full flex items-center justify-center text-moss-green mb-4 animate-bounce">
              <Check size={24} />
            </div>
            <h4 className="text-lg font-display font-bold text-moss-green">Transmission Successful</h4>
            <p className="text-xs text-paper-white-muted max-w-[280px] mt-2 leading-relaxed">
              Booking inquiry received on local node. Our DMX technicians will sync via email within 24 hours.
            </p>
            <button
              onClick={() => {
                setFormSubmitted(false);
                setFormData({ name: '', email: '', eventType: 'Concert Visual Rigging', message: '' });
              }}
              className="mt-6 px-5 py-2 bg-neutral-950 border border-white/10 hover:border-moss-green hover:text-moss-green text-xs font-semibold rounded-lg transition"
              id="btn-booking-reset"
            >
              Compose New Transmission
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// =====================================================
// ARIES AI & TECH SECTION: COUNTDOWN
// =====================================================
function AriesCountdownHeader() {
  const [timeLeft, setTimeLeft] = useState({
    months: 0,
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    // September 1, 2026 Rollout Target
    const targetDate = new Date('2026-09-01T00:00:00-07:00').getTime();

    const calculateTime = () => {
      const now = new Date().getTime();
      const diff = targetDate - now;

      if (diff <= 0) {
        setTimeLeft({ months: 0, days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      const totalSecs = Math.floor(diff / 1000);
      const totalMins = Math.floor(totalSecs / 60);
      const totalHours = Math.floor(totalMins / 60);
      const totalDays = Math.floor(totalHours / 24);

      // Rough month calculation
      const months = Math.floor(totalDays / 30.4);
      const days = Math.floor(totalDays % 30.4);
      const hours = totalHours % 24;
      const minutes = totalMins % 60;
      const seconds = totalSecs % 60;

      setTimeLeft({ months, days, hours, minutes, seconds });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="glass-panel rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 bg-gradient-to-r from-neutral-950 via-neutral-950 to-cyan-950/20 border-cyan-500/20 glow-blue">
      <div className="flex flex-col gap-1.5 text-center md:text-left">
        <div className="flex items-center justify-center md:justify-start gap-2">
          <Cpu className="text-cyber-blue animate-pulse" size={16} />
          <span className="text-[10px] font-mono tracking-widest text-cyber-blue font-bold uppercase">Aries Deployment Node</span>
        </div>
        <h2 className="text-xl md:text-2xl font-display font-black tracking-tight">ARIES AI CORE v4.0 ROLLOUT</h2>
        <p className="text-xs text-paper-white-muted max-w-sm">
          Local LLM integration, custom developer API plugins, and secure context vector grids deploying in Autumn 2026.
        </p>
      </div>

      {/* Countdown Clock Grid */}
      <div className="flex items-center gap-3 bg-neutral-900/60 p-4 rounded-2xl border border-white/5 font-mono shadow-inner">
        {/* Month */}
        <div className="flex flex-col items-center min-w-[50px]">
          <span className="text-xl md:text-2xl font-extrabold text-cyber-blue text-glow-blue">{timeLeft.months.toString().padStart(2, '0')}</span>
          <span className="text-[8px] text-paper-white-dim font-bold uppercase tracking-wider mt-1">MONTH</span>
        </div>
        <span className="text-white/20 pb-4 font-bold">:</span>
        {/* Days */}
        <div className="flex flex-col items-center min-w-[50px]">
          <span className="text-xl md:text-2xl font-extrabold text-cyber-blue text-glow-blue">{timeLeft.days.toString().padStart(2, '0')}</span>
          <span className="text-[8px] text-paper-white-dim font-bold uppercase tracking-wider mt-1">DAYS</span>
        </div>
        <span className="text-white/20 pb-4 font-bold">:</span>
        {/* Hours */}
        <div className="flex flex-col items-center min-w-[50px]">
          <span className="text-xl md:text-2xl font-extrabold text-paper-white">{timeLeft.hours.toString().padStart(2, '0')}</span>
          <span className="text-[8px] text-paper-white-dim font-bold uppercase tracking-wider mt-1">HOURS</span>
        </div>
        <span className="text-white/20 pb-4 font-bold">:</span>
        {/* Mins */}
        <div className="flex flex-col items-center min-w-[50px]">
          <span className="text-xl md:text-2xl font-extrabold text-paper-white">{timeLeft.minutes.toString().padStart(2, '0')}</span>
          <span className="text-[8px] text-paper-white-dim font-bold uppercase tracking-wider mt-1">MINS</span>
        </div>
        <span className="text-white/20 pb-4 font-bold">:</span>
        {/* Secs */}
        <div className="flex flex-col items-center min-w-[50px]">
          <span className="text-xl md:text-2xl font-extrabold text-moss-green text-glow-moss">{timeLeft.seconds.toString().padStart(2, '0')}</span>
          <span className="text-[8px] text-paper-white-dim font-bold uppercase tracking-wider mt-1">SECS</span>
        </div>
      </div>
    </div>
  );
}

// =====================================================
// ARIES AI & TECH SECTION: TERMINAL CONSOLE
// =====================================================
function AriesTerminalConsole() {
  const [history, setHistory] = useState([
    { text: 'Aries OS Node Console [Version 4.0.12-beta]', type: 'system' },
    { text: 'Connecting local context tunnels over Ollama API...', type: 'system' },
    { text: 'Type "help" for a list of available local diagnostics.', type: 'prompt' }
  ]);
  const [inputVal, setInputVal] = useState('');
  const consoleBottomRef = useRef(null);

  useEffect(() => {
    if (consoleBottomRef.current) {
      consoleBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [history]);

  const handleCommandSubmit = (e) => {
    e.preventDefault();
    const cmd = inputVal.trim();
    if (!cmd) return;

    // Log the user prompt
    const newHistory = [...history, { text: `guest@aries-node:~$ ${cmd}`, type: 'user' }];
    setHistory(newHistory);
    setInputVal('');

    // Process output
    setTimeout(() => {
      const lowerCmd = cmd.toLowerCase();
      if (lowerCmd === 'help') {
        setHistory(prev => [
          ...prev,
          { text: 'Available Node Telemetry commands:', type: 'system' },
          { text: '  help           Display diagnostic menu options', type: 'info' },
          { text: '  ollama list    Verify local LLM active model list', type: 'info' },
          { text: '  ollama run aries   Launch LLM parameter testing suite', type: 'info' },
          { text: '  system info    Check hardware telemetry data', type: 'info' },
          { text: '  clear          Wipe console session cache', type: 'info' }
        ]);
      } else if (lowerCmd === 'clear') {
        setHistory([]);
      } else if (lowerCmd === 'ollama list') {
        setHistory(prev => [
          ...prev,
          { text: 'NAME                         ID             SIZE      MODIFIED', type: 'info' },
          { text: 'aries-coder:latest           c8f42d91901b   4.7 GB    2 days ago', type: 'info' },
          { text: 'aries-reasoner-70b:latest   19dfb830d1c0   42 GB     5 days ago', type: 'info' },
          { text: 'llama3.1:latest              8f2d9e110b98   4.7 GB    1 week ago', type: 'info' }
        ]);
      } else if (lowerCmd === 'ollama run aries') {
        setHistory(prev => [...prev, { text: '>>> Initializing model context weights (8.6GB VRAM reserved)...', type: 'system' }]);
        
        setTimeout(() => {
          setHistory(prev => [
            ...prev,
            { text: '>>> Connected to Aries-Coder Core. Stream output live:', type: 'system' },
            { text: '[Aries] Connection confirmed. System status operational. I am Aries, a specialized coding assistant built to interface with your lighting matrix, audio visualizer, and local environment endpoints. Let\'s forge something today.', type: 'aries' }
          ]);
        }, 1200);
      } else if (lowerCmd === 'system info') {
        setHistory(prev => [
          ...prev,
          { text: 'SYSTEM STATUS: OPERATIONAL', type: 'info' },
          { text: '  CPU Uptime:    72h 45m 12s', type: 'info' },
          { text: '  Local GPU:     NVIDIA GeForce RTX 5090 (24GB VRAM)', type: 'info' },
          { text: '  VRAM Usage:    8.6GB / 24GB (Active AI Context)', type: 'info' },
          { text: '  Server Node:   maxxforgestudio.com/api/v4 (Ping: 14ms)', type: 'info' }
        ]);
      } else {
        setHistory(prev => [
          ...prev,
          { text: `bash: command not found: ${cmd}. Type "help" for a list of endpoints.`, type: 'error' }
        ]);
      }
    }, 200);
  };

  return (
    <div className="glass-panel rounded-3xl p-6 flex flex-col gap-4 border-cyan-500/20 bg-neutral-950/70 shadow-2xl h-[380px] overflow-hidden">
      <div className="flex justify-between items-center border-b border-white/10 pb-3 flex-shrink-0">
        <div className="flex items-center gap-2">
          <Terminal className="text-cyber-blue" size={16} />
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-cyber-blue">Interactive Diagnostic Terminal</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500/30"></span>
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500/30"></span>
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/30"></span>
        </div>
      </div>

      {/* Terminal History Box */}
      <div className="flex-grow overflow-y-auto font-mono text-xs flex flex-col gap-2.5 pr-2 custom-scrollbar">
        {history.map((line, idx) => {
          let colorClass = 'text-paper-white-muted';
          if (line.type === 'system') colorClass = 'text-cyber-blue-dark font-semibold';
          if (line.type === 'user') colorClass = 'text-paper-white font-bold';
          if (line.type === 'error') colorClass = 'text-red-500';
          if (line.type === 'aries') colorClass = 'text-moss-green bg-emerald-500/5 px-2 py-1.5 rounded border border-emerald-500/10';
          if (line.type === 'prompt') colorClass = 'text-cyber-blue font-semibold';

          return (
            <div key={idx} className={`leading-relaxed whitespace-pre-wrap ${colorClass}`}>
              {line.text}
            </div>
          );
        })}
        <div ref={consoleBottomRef} />
      </div>

      {/* Input Shell Form */}
      <form onSubmit={handleCommandSubmit} className="flex items-center gap-2 border-t border-white/5 pt-3 flex-shrink-0" id="form-terminal">
        <span className="text-xs font-mono text-cyber-blue font-bold">guest@aries-node:~$</span>
        <input
          type="text"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          placeholder="Type 'help' or 'system info'..."
          className="flex-grow bg-transparent border-none outline-none font-mono text-xs text-paper-white caret-cyber-blue focus:ring-0 p-0"
          autoFocus
          autoComplete="off"
          id="input-terminal-cmd"
        />
        <button type="submit" className="hidden">Enter</button>
      </form>
    </div>
  );
}

// =====================================================
// ARIES AI & TECH SECTION: CODE SNIPPET WIDGET
// =====================================================
function AriesCodeSnippet() {
  const [copied, setCopied] = useState(false);
  const codeStr = `import requests

# Connection to local Aries API endpoints
client = requests.Session()
client.headers.update({
    "Authorization": "Bearer mfs_live_9a2f1b0b98",
    "Content-Type": "application/json"
})

def generate_dmx_prompt(concept):
    response = client.post(
        "http://localhost:11434/api/v4/generate",
        json={
            "model": "aries-coder:latest",
            "prompt": f"Convert to DMX lighting triggers: {concept}",
            "stream": False
        }
    )
    return response.json()["response"]

# Stream light layout triggers
print(generate_dmx_prompt("Strobe blue lasers on beat pulse"))`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(codeStr);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="glass-panel rounded-3xl p-6 flex flex-col gap-4 border-cyan-500/20 bg-neutral-950/40">
      <div className="flex justify-between items-center border-b border-white/5 pb-3">
        <span className="text-xs font-mono uppercase tracking-wider text-paper-white-muted font-bold">Python SDK Integration</span>
        <button
          onClick={copyToClipboard}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-900 border border-white/10 hover:border-cyber-blue hover:text-cyber-blue text-[10px] font-mono rounded-lg transition"
          id="btn-code-copy"
        >
          {copied ? (
            <>
              <Check size={12} className="text-cyber-blue" />
              <span>COPIED</span>
            </>
          ) : (
            <>
              <Copy size={12} />
              <span>COPY API RAW</span>
            </>
          )}
        </button>
      </div>

      <pre className="p-4 bg-black/60 rounded-2xl border border-white/5 text-[11px] font-mono overflow-x-auto text-paper-white-muted leading-relaxed max-h-[300px]">
        <code>
          <span className="text-cyan-400">import</span> requests<br/><br/>
          <span className="text-emerald-500"># Connection to local Aries API endpoints</span><br/>
          client = requests.Session()<br/>
          client.headers.update(&#123;<br/>
          &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-purple-400">"Authorization"</span>: <span className="text-amber-300">"Bearer mfs_live_9a2f1b0b98"</span>,<br/>
          &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-purple-400">"Content-Type"</span>: <span className="text-amber-300">"application/json"</span><br/>
          &#125;)<br/><br/>
          <span className="text-cyan-400">def</span> <span className="text-emerald-400">generate_dmx_prompt</span>(concept):<br/>
          &nbsp;&nbsp;&nbsp;&nbsp;response = client.post(<br/>
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-amber-300">"http://localhost:11434/api/v4/generate"</span>,<br/>
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;json=&#123;<br/>
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-purple-400">"model"</span>: <span className="text-amber-300">"aries-coder:latest"</span>,<br/>
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-purple-400">"prompt"</span>: f<span className="text-amber-300">"Convert to DMX lighting triggers: &#123;concept&#125;"</span>,<br/>
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-purple-400">"stream"</span>: <span className="text-purple-400">False</span><br/>
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&#125;<br/>
          &nbsp;&nbsp;&nbsp;&nbsp;)<br/>
          &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-cyan-400">return</span> response.json()[<span className="text-amber-300">"response"</span>]<br/><br/>
          <span className="text-emerald-500"># Stream light layout triggers</span><br/>
          <span className="text-cyan-400">print</span>(generate_dmx_prompt(<span className="text-amber-300">"Strobe blue lasers on beat pulse"</span>))
        </code>
      </pre>
    </div>
  );
}

// =====================================================
// GAME DEV: GAME INTRO & PLAYABLE DEMO CONSOLE
// =====================================================
function GameIntroAndPlayShell() {
  const [gameState, setGameState] = useState('start'); // start, gate, console, input_code, escape, darkness, death
  const [consoleLog, setConsoleLog] = useState([
    'ECHOES OF THE FORGE SYSTEM v0.80',
    'Unity Standalone Engine: Boot sequence active...',
    '--------------------------------------------------'
  ]);

  const addLog = (lines) => {
    setConsoleLog(prev => [...prev, ...lines]);
  };

  const handleAction = (action) => {
    if (action === 'gate') {
      setGameState('gate');
      addLog([
        '> Action: Shake iron gate',
        'You grab the heavy concrete-encrusted iron bars. They rattle loudly but do not budge.',
        'A chilling metallic screech echoes from the dark corridors behind you. Something heard you.',
        'You have limited time before the darkness closes in.'
      ]);
    } else if (action === 'console') {
      setGameState('console');
      addLog([
        '> Action: Check control console',
        'You approach the terminal. The screen flicker casts a faint blue glow on the dust.',
        'A blinking prompt asks for a 4-character BYPASS HEX CODE.',
        'Next to the keyboard, someone scratched a note in the concrete: "MOSS IS GOLD".'
      ]);
    } else if (action === 'room') {
      setGameState('darkness');
      addLog([
        '> Action: Inspect dark corners',
        'You slide along the rough concrete wall into the pitch darkness.',
        'Your foot kicks a metal toolbox. Inside, you find a piece of tape with letters: "10B9" scribbled in marker.',
        'Suddenly, you feel a drop in temperature. Red glowing nodes activate on the ceiling. You must act fast.'
      ]);
    } else if (action === 'solve') {
      setGameState('escape');
      addLog([
        '> Action: Enter code "10B9"',
        'You type in the hex code. The keyboard keys clack heavily.',
        'The screen flashes bright green. A hydraulic hiss sounds overhead.',
        'The concrete support locks release, and the heavy iron gate swings slowly open.',
        'You sprint through as the lights in the main sector shut down completely.',
        'Congratulations. You survived the initial level.'
      ]);
    } else if (action === 'die') {
      setGameState('death');
      addLog([
        '> Action: Back away',
        'You back away from the console in panic, stumbling over wires.',
        'The cold air envelopes you as two glowing crimson nodes emerge from the dark hallway.',
        'The connection fails. Diagnostics terminated.'
      ]);
    } else if (action === 'reset') {
      setGameState('start');
      setConsoleLog([
        'ECHOES OF THE FORGE SYSTEM v0.80',
        'Unity Standalone Engine: Boot sequence active...',
        '--------------------------------------------------'
      ]);
    }
  };

  return (
    <div className="glass-panel rounded-3xl p-6 flex flex-col gap-6 bg-neutral-950/60 border-red-500/10">
      <div className="flex flex-col gap-1 text-left">
        <div className="flex items-center gap-2">
          <Flame className="text-red-500 animate-pulse" size={16} />
          <span className="text-[10px] font-mono tracking-widest text-red-500 font-bold uppercase">Survival Horror Project</span>
        </div>
        <h2 className="text-2xl font-display font-black tracking-tight">ECHOES OF THE FORGE</h2>
        <p className="text-sm text-paper-white-muted font-light leading-relaxed max-w-xl">
          An atmospheric third-person survival horror game built on Unity. Navigate cold geometric Japanese structures, automate system grids to escape stalkers, and master wabi-sabi concrete environments.
        </p>
      </div>

      {/* Mini-Game Console */}
      <div className="flex flex-col gap-4 bg-black/80 rounded-2xl border border-white/5 p-5 font-mono text-[11px] shadow-inner h-[280px]">
        {/* Terminal Screen log */}
        <div className="flex-grow overflow-y-auto flex flex-col gap-2 text-paper-white-muted pr-2 custom-scrollbar">
          {consoleLog.map((line, idx) => (
            <div 
              key={idx} 
              className={line.startsWith('>') ? 'text-red-500 font-bold' : line.startsWith('Congrat') ? 'text-moss-green font-bold' : ''}
            >
              {line}
            </div>
          ))}
          {gameState === 'start' && (
            <div className="text-paper-white font-semibold mt-2">
              You awaken inside a concrete cell. Bioluminescent moss grows on the walls, providing faint light. A locked iron gate blocks your exit. What is your path?
            </div>
          )}
        </div>

        {/* Options Input buttons */}
        <div className="flex-shrink-0 border-t border-white/5 pt-4 flex flex-wrap gap-2.5">
          {gameState === 'start' && (
            <>
              <button 
                onClick={() => handleAction('gate')}
                className="px-3.5 py-2 bg-neutral-900 border border-white/10 hover:border-red-500 hover:text-red-500 rounded-lg transition"
                id="btn-game-choice-gate"
              >
                1. Shake the iron gate
              </button>
              <button 
                onClick={() => handleAction('console')}
                className="px-3.5 py-2 bg-neutral-900 border border-white/10 hover:border-cyber-blue hover:text-cyber-blue rounded-lg transition"
                id="btn-game-choice-console"
              >
                2. Search the console
              </button>
              <button 
                onClick={() => handleAction('room')}
                className="px-3.5 py-2 bg-neutral-900 border border-white/10 hover:border-moss-green hover:text-moss-green rounded-lg transition"
                id="btn-game-choice-room"
              >
                3. Inspect the dark corner
              </button>
            </>
          )}

          {gameState === 'gate' && (
            <>
              <button 
                onClick={() => handleAction('console')}
                className="px-3.5 py-2 bg-neutral-900 border border-white/10 hover:border-cyber-blue hover:text-cyber-blue rounded-lg transition"
              >
                Go to the control console
              </button>
              <button 
                onClick={() => handleAction('room')}
                className="px-3.5 py-2 bg-neutral-900 border border-white/10 hover:border-moss-green hover:text-moss-green rounded-lg transition"
              >
                Retreat to the dark corner
              </button>
            </>
          )}

          {gameState === 'console' && (
            <>
              <button 
                onClick={() => handleAction('die')}
                className="px-3.5 py-2 bg-neutral-900 border border-white/10 hover:border-red-500 hover:text-red-500 rounded-lg transition"
              >
                Guess random hex code
              </button>
              <button 
                onClick={() => handleAction('room')}
                className="px-3.5 py-2 bg-neutral-900 border border-white/10 hover:border-moss-green hover:text-moss-green rounded-lg transition"
              >
                Search the dark corner for clues
              </button>
            </>
          )}

          {gameState === 'darkness' && (
            <>
              <button 
                onClick={() => handleAction('solve')}
                className="px-3.5 py-2 bg-neutral-900 border border-white/10 hover:border-moss-green hover:text-moss-green rounded-lg transition"
                id="btn-game-solve"
              >
                Enter code "10B9" in the console
              </button>
              <button 
                onClick={() => handleAction('die')}
                className="px-3.5 py-2 bg-neutral-900 border border-white/10 hover:border-red-500 hover:text-red-500 rounded-lg transition"
              >
                Attempt escape in pitch blackness
              </button>
            </>
          )}

          {(gameState === 'escape' || gameState === 'death' || gameState === 'die') && (
            <button 
              onClick={() => handleAction('reset')}
              className="px-5 py-2 bg-red-500/10 border border-red-500/30 text-red-500 font-bold rounded-lg hover:bg-red-500/20 transition flex items-center gap-1.5"
              id="btn-game-reset"
            >
              <span>Initialize Reload Matrix</span>
              <ChevronRight size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// =====================================================
// GAME DEV: GAME MEDIA GRID GALLERY
// =====================================================
function GameMediaGallery() {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  return (
    <div className="glass-panel rounded-3xl p-6 flex flex-col gap-5 border-red-500/10">
      <div className="flex justify-between items-center border-b border-white/5 pb-3">
        <span className="text-xs font-mono uppercase tracking-wider text-paper-white-muted font-bold">Concept Art Showcase</span>
        <span className="px-2.5 py-0.5 rounded bg-red-500/10 border border-red-500/20 text-[9px] font-mono text-red-500 font-bold">
          4K RENDER
        </span>
      </div>

      {/* Main Art Card */}
      <div 
        onClick={() => setLightboxOpen(true)}
        className="group relative h-48 rounded-2xl border border-white/10 overflow-hidden cursor-pointer shadow-xl"
        id="card-game-media"
      >
        <div className="absolute inset-0 bg-neutral-950/40 group-hover:bg-neutral-950/10 transition duration-300 z-10" />
        <img 
          src="/survival_horror_concept.jpg" 
          alt="Unity survival horror game environment design concept"
          className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
        />
        <div className="absolute bottom-4 left-4 z-20 flex flex-col gap-0.5">
          <span className="text-xs font-display font-extrabold uppercase tracking-wider text-paper-white group-hover:text-red-500 transition duration-300">Level 1 - The Bio Forge</span>
          <span className="text-[9px] font-mono text-paper-white-dim">Moss Concrete & Cyber-Blue Grid Nodes</span>
        </div>
        <div className="absolute top-4 right-4 bg-black/60 p-2 rounded-lg border border-white/10 text-paper-white opacity-0 group-hover:opacity-100 transition duration-300 z-20">
          <Eye size={14} />
        </div>
      </div>

      {/* Thumbnail grids */}
      <div className="grid grid-cols-3 gap-3">
        <div className="h-16 rounded-xl border border-white/5 bg-neutral-950/60 overflow-hidden opacity-60 hover:opacity-100 cursor-pointer transition">
          <img src="/survival_horror_concept.jpg" className="w-full h-full object-cover filter saturate-50" alt="thumbnail 1" />
        </div>
        <div className="h-16 rounded-xl border border-white/5 bg-neutral-900 flex items-center justify-center text-paper-white-dim text-[10px] font-mono uppercase font-bold text-center">
          Sector <br/> Map
        </div>
        <div className="h-16 rounded-xl border border-white/5 bg-neutral-900 flex items-center justify-center text-paper-white-dim text-[10px] font-mono uppercase font-bold text-center">
          Visual <br/> Reels
        </div>
      </div>

      {/* Fullscreen Lightbox Modal */}
      <AnimatePresence>
        {lightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-60 bg-black/90 backdrop-blur-md flex items-center justify-center p-6"
            onClick={() => setLightboxOpen(false)}
            id="lightbox-backdrop"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-4xl glass-panel-heavy rounded-2xl overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setLightboxOpen(false)}
                className="absolute top-4 right-4 z-70 p-2 rounded-lg bg-black/60 border border-white/10 text-white hover:text-red-500 hover:border-red-500/50 transition"
                id="btn-lightbox-close"
              >
                <X size={18} />
              </button>
              
              <img 
                src="/survival_horror_concept.jpg" 
                alt="Level 1 Bio Forge Concept Rendering" 
                className="w-full max-h-[70vh] object-contain"
              />
              
              <div className="p-5 border-t border-white/5 bg-neutral-950 flex justify-between items-center text-xs">
                <div className="flex flex-col gap-1">
                  <span className="font-display font-bold text-paper-white">ECHOES OF THE FORGE - Concept Rendition 01</span>
                  <span className="font-mono text-paper-white-muted">Environment details: 3D concrete geometries, integrated fiber cables, native botanical systems.</span>
                </div>
                <span className="px-2.5 py-1 bg-red-500/10 border border-red-500/30 text-red-500 font-mono text-[10px] font-bold rounded">
                  STAGE-DRAFT-2026
                </span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// =====================================================
// FORGE PROFILE DRAWER COMPONENT
// =====================================================
function AccountProfileModule({ favorites, setAccountOpen, setActiveSection, setCurrentTrackIndex, setIsPlaying }) {
  const { currentUser, logout, updateUserProfile } = useAuth();
  const navigate = useNavigate();
  const [profileTab, setProfileTab] = useState('customize'); // 'customize' | 'activity' | 'sync' | 'quests' | 'security'
  
  // Customization States
  const [discordLinked, setDiscordLinked] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [revealKey, setRevealKey] = useState(false);
  
  // Profile Music States
  const [profilePlaying, setProfilePlaying] = useState(false);
  const [profileProgress, setProfileProgress] = useState(0);
  const profileAudioRef = useRef(null);

  // Load quest states
  const listenedStr = localStorage.getItem('mfs_listened_tracks') || '[]';
  const listenedTracks = JSON.parse(listenedStr);
  const isBannerUnlocked = localStorage.getItem('mfs_unlock_banner') === 'true';
  const isBadgeUnlocked = localStorage.getItem('mfs_unlock_ariana_badge') === 'true';
  const isSaturnUnlocked = localStorage.getItem('mfs_unlock_saturn') === 'true';
  
  const equippedBanner = currentUser?.profileBanner || 'default';
  const profileAccent = currentUser?.profileAccent || '#10B981';

  // Audio Playback
  const featuredTrackIndex = PLAYLIST.findIndex(t => t.id === (currentUser?.featuredTrackId || 1));
  const featuredTrack = PLAYLIST[featuredTrackIndex !== -1 ? featuredTrackIndex : 0];

  const handleAudioTimeUpdate = () => {
    if (profileAudioRef.current) {
      const current = profileAudioRef.current.currentTime;
      const duration = profileAudioRef.current.duration || 1;
      setProfileProgress((current / duration) * 100);
    }
  };

  const toggleProfilePlayback = () => {
    if (!profileAudioRef.current) return;
    if (profilePlaying) {
      profileAudioRef.current.pause();
      setProfilePlaying(false);
    } else {
      // Pause parent dashboard player if it exists
      setIsPlaying(false);
      profileAudioRef.current.play().then(() => {
        setProfilePlaying(true);
      }).catch(() => {
        toast.error('Autoplay blocked. Tap again.');
      });
    }
  };

  const handleTrackSelectChange = (trackId) => {
    if (profileAudioRef.current) {
      profileAudioRef.current.pause();
      setProfilePlaying(false);
      setProfileProgress(0);
    }
    updateUserProfile({ featuredTrackId: Number(trackId) });
    toast.success(`Featured track updated!`);
  };

  const handleAccentChange = (color) => {
    updateUserProfile({ profileAccent: color });
    toast.success(`Profile accent customized!`);
  };

  const handleProfileThemeChange = (themeId) => {
    updateUserProfile({ profileTheme: themeId });
    localStorage.setItem('mfs_theme', themeId);
    document.documentElement.setAttribute('data-theme', themeId);
    window.dispatchEvent(new Event('storage'));
    toast.success(`Theme loaded across ecosystem!`);
  };

  const triggerDiscordLink = () => {
    if (discordLinked) return;
    setSyncing(true);
    setTimeout(() => {
      setSyncing(false);
      setDiscordLinked(true);
    }, 1500);
  };

  // Activity calculation
  const myPosts = (() => {
    try {
      const posts = JSON.parse(localStorage.getItem('mfs_feed_posts') || '[]');
      return posts.filter(p => p.authorId === currentUser?.id);
    } catch (_) {
      return [];
    }
  })();

  const myComments = (() => {
    try {
      const allShowcasePosts = JSON.parse(localStorage.getItem('mfs_allstar_hub_posts') || '[]');
      const list = [];
      allShowcasePosts.forEach(post => {
        if (post.comments) {
          post.comments.forEach(c => {
            if (c.authorId === currentUser?.id || c.author === 'You (Member)' || c.author === currentUser?.name || c.author === currentUser?.displayName) {
              list.push({
                postId: post.id,
                postCaption: post.caption,
                postMedia: post.mediaUrl,
                commentText: c.text,
                timestamp: c.timestamp || new Date().toISOString()
              });
            }
          });
        }
      });
      return list;
    } catch (_) {
      return [];
    }
  })();

  // Download key
  const downloadBackupKey = () => {
    const element = document.createElement("a");
    const file = new Blob([
      `=====================================================\n`,
      `MAXX FORGE STUDIO™ — SECURITY BACKUP RECOVERY KEY\n`,
      `=====================================================\n`,
      `Email: ${currentUser.email}\n`,
      `Display Name: ${currentUser.displayName}\n`,
      `Date Backup: ${new Date().toLocaleDateString()}\n\n`,
      `Your 12-word mnemonic recovery phrase:\n`,
      `-----------------------------------------------------\n`,
      `${currentUser.recoveryKey || 'No recovery key set'}\n`,
      `-----------------------------------------------------\n\n`,
      `WARNING: Keep this key safe. Do not share it with anyone.\n`,
      `Use it to reset your passcode at login.\n`,
      `=====================================================\n`
    ], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `maxx-forge-backup-key-${currentUser.name.toLowerCase().replace(/\s+/g, '-')}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.success('Backup file saved successfully!');
  };

  const getBannerStyle = () => {
    if (equippedBanner === 'eternal_sunshine') {
      return {
        background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.25) 0%, rgba(139, 92, 246, 0.25) 50%, rgba(6, 182, 212, 0.25) 100%)',
        border: `1.5px solid ${profileAccent}`,
        boxShadow: `0 0 15px ${profileAccent}40`
      };
    }
    return { background: 'rgba(255,255,255,0.05)', border: `1px solid ${profileAccent}30` };
  };

  if (!currentUser) return null;

  const ACCENTS = [
    { value: '#10B981', label: 'Emerald' },
    { value: '#00E5FF', label: 'Cyan' },
    { value: '#EC4899', label: 'Pink' },
    { value: '#EF4444', label: 'Red' },
    { value: '#A855F7', label: 'Purple' },
    { value: '#FBBF24', label: 'Gold' }
  ];

  const PROFILE_THEMES = [
    { id: 'obsidian', label: 'Obsidian' },
    { id: 'forge-red', label: 'Forge Red' },
    { id: 'deep-navy', label: 'Navy' },
    { id: 'chrome', label: 'Chrome' },
    { id: 'liquid-glass', label: 'Glass' }
  ];

  return (
    <div className="flex flex-col gap-5 text-left font-sans">
      {/* Dynamic Profile Header Card */}
      <div className="flex items-center gap-4 p-5 rounded-3xl transition-all duration-500 relative overflow-hidden" style={getBannerStyle()}>
        {equippedBanner === 'eternal_sunshine' && (
          <div className="absolute inset-0 bg-scanlines opacity-10 pointer-events-none animate-pulse" />
        )}
        <div className="relative w-16 h-16 flex-shrink-0">
          <div className="absolute inset-0 rounded-2xl animate-pulse-slow opacity-60" style={{ background: `linear-gradient(135deg, ${profileAccent}, #a855f7)` }} />
          <div className="relative w-full h-full bg-neutral-950 rounded-2xl border border-white/10 flex items-center justify-center font-display font-black text-xl shadow-inner" style={{ color: profileAccent }}>
            {currentUser.avatar}
          </div>
          <span className="absolute bottom-[-2px] right-[-2px] w-4.5 h-4.5 rounded-full border-2 border-neutral-950 flex items-center justify-center bg-emerald-500" title="Active Core Node">
            <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
          </span>
        </div>

        <div className="flex-grow min-w-0">
          <div className="flex items-center gap-1.5">
            <h3 className="text-base font-display font-extrabold text-white truncate">{currentUser.displayName || currentUser.name}</h3>
            {currentUser.role === 'founder' && <span className="text-[8px] font-mono font-bold bg-yellow-500/20 text-yellow-400 border border-yellow-500/35 px-1.5 py-0.2 rounded uppercase">Founder</span>}
          </div>
          <span className="text-[10px] font-mono text-white/40 truncate block mt-0.5">{currentUser.email}</span>
          
          <div className="flex items-center gap-1 mt-2.5 px-2 py-0.5 rounded border text-[8px] font-mono font-bold w-max" style={{ borderColor: `${profileAccent}40`, color: profileAccent, background: `${profileAccent}10` }}>
            <Sparkles size={8} />
            <span>{isBadgeUnlocked ? '☀️ ETERNAL SUNSHINE' : currentUser.badge}</span>
          </div>
        </div>
      </div>

      {/* Tab Row Navigation */}
      <div className="flex gap-1 border-b border-white/5 pb-2 overflow-x-auto flex-shrink-0">
        {[
          { id: 'customize', label: 'Media Hub', icon: Sliders },
          { id: 'activity', label: 'Activity Hub', icon: MessageSquare },
          { id: 'sync', label: 'Sync Library', icon: Disc },
          { id: 'quests', label: 'Achievements', icon: Sparkles },
          { id: 'security', label: 'Security & Backup', icon: Shield }
        ].map(t => {
          const Icon = t.icon;
          const isSelected = profileTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setProfileTab(t.id)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-mono font-bold whitespace-nowrap transition cursor-pointer"
              style={{
                background: isSelected ? `${profileAccent}15` : 'transparent',
                border: isSelected ? `1px solid ${profileAccent}30` : '1px solid transparent',
                color: isSelected ? '#fff' : 'rgba(255,255,255,0.4)'
              }}
            >
              <Icon size={11} style={{ color: isSelected ? profileAccent : 'inherit' }} />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Profile Content Router */}
      <div className="flex-1 min-h-[320px]">
        
        {/* TAB 1: MEDIA HUB & CUSTOMIZE */}
        {profileTab === 'customize' && (
          <div className="flex flex-col gap-4 animate-fade-in text-left">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-white/50 border-b border-white/5 pb-1">Media Hub Settings</h4>
            
            {/* Accent Color Picker */}
            <div className="flex flex-col gap-2 bg-white/2 border border-white/5 p-4 rounded-2xl">
              <span className="text-[10px] font-mono text-white/40 uppercase">Ecosystem Profile Accent</span>
              <div className="flex gap-3 mt-1.5 flex-wrap">
                {ACCENTS.map(acc => (
                  <button
                    key={acc.value}
                    onClick={() => handleAccentChange(acc.value)}
                    className="w-7 h-7 rounded-lg border-2 relative flex items-center justify-center transition hover:scale-110 cursor-pointer"
                    style={{
                      background: acc.value,
                      borderColor: profileAccent === acc.value ? '#fff' : 'transparent',
                      boxShadow: profileAccent === acc.value ? `0 0 10px ${acc.value}` : 'none'
                    }}
                    title={acc.label}
                  >
                    {profileAccent === acc.value && <Check size={12} className="text-white" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Local Theme Selector */}
            <div className="flex flex-col gap-2 bg-white/2 border border-white/5 p-4 rounded-2xl">
              <span className="text-[10px] font-mono text-white/40 uppercase">Ecosystem Visual Theme</span>
              <div className="grid grid-cols-3 gap-2 mt-1.5">
                {PROFILE_THEMES.map(theme => {
                  const currentTheme = localStorage.getItem('mfs_theme') || 'obsidian';
                  const active = currentTheme === theme.id;
                  return (
                    <button
                      key={theme.id}
                      onClick={() => handleProfileThemeChange(theme.id)}
                      className="py-2 rounded-xl text-[10px] font-mono font-bold border transition text-center cursor-pointer"
                      style={{
                        background: active ? `${profileAccent}15` : 'rgba(255,255,255,0.03)',
                        borderColor: active ? profileAccent : 'rgba(255,255,255,0.06)',
                        color: active ? '#fff' : 'rgba(255,255,255,0.5)'
                      }}
                    >
                      {theme.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Featured Track Media Node */}
            <div className="flex flex-col gap-2 bg-white/2 border border-white/5 p-4 rounded-2xl relative overflow-hidden">
              <span className="text-[10px] font-mono text-white/40 uppercase">Featured Track Media Node</span>
              
              <div className="flex gap-3 items-center mt-2">
                {/* Vinyl Spin Visual */}
                <div 
                  className={`w-14 h-14 rounded-full border border-white/10 flex-shrink-0 flex items-center justify-center bg-neutral-900 relative shadow-lg ${profilePlaying ? 'animate-spin' : ''}`}
                  style={{ animationDuration: '6s' }}
                >
                  <Disc size={20} className="text-white/60" />
                  <div className="absolute w-3 h-3 rounded-full bg-[#050508] border border-white/10" />
                </div>

                <div className="flex-grow min-w-0">
                  <p className="text-xs font-bold text-white truncate">{featuredTrack?.title || 'Unknown Track'}</p>
                  <span className="text-[9px] font-mono text-white/45 truncate block mt-0.5">{featuredTrack?.artist || 'Unknown Artist'}</span>
                  
                  {/* Select dropdown */}
                  <select
                    value={currentUser.featuredTrackId || 1}
                    onChange={(e) => handleTrackSelectChange(e.target.value)}
                    className="mt-2 w-full max-w-[160px] bg-neutral-900 border border-white/10 rounded-lg text-[9px] font-mono font-bold p-1 text-white/80 focus:outline-none focus:border-white/20"
                  >
                    {PLAYLIST.map(track => (
                      <option key={track.id} value={track.id}>{track.title}</option>
                    ))}
                  </select>
                </div>

                {/* Local Audio Element */}
                <audio
                  ref={profileAudioRef}
                  src={featuredTrack?.src}
                  onTimeUpdate={handleAudioTimeUpdate}
                  onEnded={() => setProfilePlaying(false)}
                />

                {/* Play/Pause trigger */}
                <button
                  onClick={toggleProfilePlayback}
                  className="p-3.5 rounded-2xl flex items-center justify-center transition border cursor-pointer hover:scale-105"
                  style={{
                    background: `${profileAccent}15`,
                    borderColor: `${profileAccent}30`,
                    color: profileAccent
                  }}
                >
                  {profilePlaying ? <Pause size={14} fill={profileAccent} /> : <Play size={14} fill={profileAccent} />}
                </button>
              </div>

              {/* Media Progress bar */}
              <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden mt-3 relative">
                <div 
                  className="h-full transition-all duration-300"
                  style={{ width: `${profileProgress}%`, background: profileAccent }}
                />
              </div>
            </div>

            {/* Profile Banners */}
            {isBannerUnlocked && (
              <div className="bg-white/2 border border-white/5 rounded-2xl p-4 flex flex-col gap-3 font-mono text-xs">
                <span className="text-[10px] text-white/40 uppercase">Sky Banner customizations ({equippedBanner === 'eternal_sunshine' ? '1 Equipped' : '0 Equipped'})</span>
                <button
                  onClick={() => {
                    const next = equippedBanner === 'eternal_sunshine' ? 'default' : 'eternal_sunshine';
                    updateUserProfile({ profileBanner: next });
                    toast.success(equippedBanner === 'eternal_sunshine' ? 'Banner unequipped' : 'Eternal Sunshine Sky Banner equipped!');
                  }}
                  className="py-2.5 px-3 text-[10px] font-bold rounded-xl border transition cursor-pointer uppercase text-center"
                  style={{
                    background: equippedBanner === 'eternal_sunshine' ? `${profileAccent}15` : 'rgba(255,255,255,0.03)',
                    borderColor: equippedBanner === 'eternal_sunshine' ? profileAccent : 'rgba(255,255,255,0.08)',
                    color: equippedBanner === 'eternal_sunshine' ? '#fff' : 'rgba(255,255,255,0.5)'
                  }}
                >
                  {equippedBanner === 'eternal_sunshine' ? 'Unequip Sunshine Banner' : 'Equip Eternal Sunshine Banner'}
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: MY ACTIVITY HUB */}
        {profileTab === 'activity' && (
          <div className="flex flex-col gap-4 animate-fade-in text-left">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-white/50 border-b border-white/5 pb-1">Activity Log</h4>
            
            {/* Feed Posts */}
            <div className="flex flex-col gap-2.5">
              <span className="text-[10px] font-mono text-white/40 uppercase">My Feed Publications ({myPosts.length})</span>
              {myPosts.length === 0 ? (
                <div className="text-center py-6 border border-dashed border-white/10 rounded-2xl text-[10px] font-mono text-white/25">
                  No post records. Visit The Forge Feed to start publishing.
                </div>
              ) : (
                <div className="flex flex-col gap-2 max-h-[160px] overflow-y-auto pr-1">
                  {myPosts.map(post => (
                    <div key={post.id} className="p-3 bg-white/2 border border-white/5 rounded-2xl">
                      <div className="flex items-center justify-between text-[8px] font-mono text-white/30">
                        <span className="flex items-center gap-1"><Hash size={8} /> channel-post</span>
                        <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                      </div>
                      <p className="text-[10px] text-white/70 leading-relaxed mt-1">{post.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Showcase Comments */}
            <div className="flex flex-col gap-2.5 mt-2">
              <span className="text-[10px] font-mono text-white/40 uppercase">My Showcase Feed Comments ({myComments.length})</span>
              {myComments.length === 0 ? (
                <div className="text-center py-6 border border-dashed border-white/10 rounded-2xl text-[10px] font-mono text-white/25">
                  No comment records. Post comments on media drops in All-Star Hub.
                </div>
              ) : (
                <div className="flex flex-col gap-2 max-h-[165px] overflow-y-auto pr-1">
                  {myComments.map((c, idx) => (
                    <div key={idx} className="p-3 bg-white/2 border border-white/5 rounded-2xl flex flex-col gap-1.5">
                      <div className="flex justify-between items-center text-[8px] font-mono text-white/30">
                        <span className="truncate max-w-[150px]">On: "{c.postCaption}"</span>
                        <span>{new Date(c.timestamp).toLocaleDateString()}</span>
                      </div>
                      <div className="p-2 bg-neutral-900/60 rounded-xl border border-white/5 text-[10px]" style={{ borderLeft: `2.5px solid ${profileAccent}` }}>
                        "{c.commentText}"
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: SYNC LIBRARY */}
        {profileTab === 'sync' && (
          <div className="flex flex-col gap-4 animate-fade-in text-left">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-white/50 border-b border-white/5 pb-1">Sync Connections</h4>

            {/* Discord Sync Button */}
            <div className="glass-panel rounded-2xl p-4 border border-indigo-500/20 bg-indigo-950/5 flex flex-col gap-3">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-mono text-indigo-400 font-bold uppercase tracking-wider">Discord Integration</span>
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-ping"></span>
              </div>
              
              {discordLinked ? (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2.5 bg-indigo-500/10 border border-indigo-500/30 p-2.5 rounded-xl text-xs text-indigo-200">
                    <Check size={14} className="text-indigo-400" />
                    <span className="font-mono text-[10px]">Synced: <strong>ForgeWeaver#9010</strong></span>
                  </div>
                  <button 
                    onClick={() => setDiscordLinked(false)}
                    className="text-[9px] font-mono text-indigo-400/60 hover:text-indigo-400 text-left underline cursor-pointer"
                  >
                    Disconnect synchronization
                  </button>
                </div>
              ) : (
                <button
                  onClick={triggerDiscordLink}
                  disabled={syncing}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition duration-300 flex items-center justify-center gap-2 shadow-[0_0_10px_rgba(99,102,241,0.2)] disabled:opacity-50 cursor-pointer"
                  id="btn-discord-sync"
                >
                  {syncing ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Laptop size={13} />
                      <span>Link Discord Account</span>
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Saved Music Nodes */}
            <div className="flex flex-col gap-3">
              <span className="text-[10px] font-mono text-white/40 uppercase">
                Saved Music Nodes ({favorites.length})
              </span>

              {favorites.length === 0 ? (
                <div className="text-center py-6 border border-dashed border-white/10 rounded-2xl text-[10px] font-mono text-white/25">
                  No saved music files. Heart tracks in All-Star Hub to sync.
                </div>
              ) : (
                <div className="flex flex-col gap-2 max-h-[180px] overflow-y-auto pr-1">
                  {favorites.map(id => {
                    const track = PLAYLIST.find(t => t.id === id);
                    if (!track) return null;
                    const trackIndex = PLAYLIST.indexOf(track);
                    return (
                      <div 
                        key={id}
                        onClick={() => {
                          setAccountOpen(false);
                          setActiveSection('records');
                          setCurrentTrackIndex(trackIndex);
                          setIsPlaying(true);
                        }}
                        className="group flex items-center justify-between p-3 bg-neutral-950/60 border border-white/5 hover:border-cyan-500/30 rounded-xl cursor-pointer transition duration-300"
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <Disc size={14} className="text-cyan-400 group-hover:animate-spin" style={{ animationDuration: '3s' }} />
                          <div className="truncate">
                            <p className="text-xs font-semibold truncate leading-tight text-white">{track.title}</p>
                            <span className="text-[8px] font-mono text-white/40">{track.artist}</span>
                          </div>
                        </div>
                        <ChevronRight size={14} className="text-white/30 group-hover:text-cyan-400 transition" />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 4: ACHIEVEMENTS & QUESTS */}
        {profileTab === 'quests' && (
          <div className="flex flex-col gap-4 animate-fade-in text-left">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-white/50 border-b border-white/5 pb-1">Telemetry & Quests</h4>

            {/* Lobby Achievement Quest Path */}
            <div className="flex flex-col gap-3 bg-neutral-950/60 p-4.5 rounded-2xl border border-white/5 font-mono text-xs">
              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <span className="text-[10px] text-white/50 uppercase font-bold tracking-wider">Lobby Quest Walker</span>
                <span className="text-[9px] text-cyan-400 font-bold bg-cyan-500/10 px-1.5 py-0.5 rounded">Spotlight</span>
              </div>

              <div className="flex flex-col gap-3.5 mt-2">
                {/* Milestone 1 */}
                <div className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center border text-[9px] font-bold ${
                      listenedTracks.length >= 1 ? 'bg-cyan-500/10 border-cyan-400 text-cyan-400' : 'bg-white/5 border-white/10 text-white/30'
                    }`}>
                      {listenedTracks.length >= 1 ? '✓' : '1'}
                    </div>
                    <div className={`w-0.5 h-5 bg-white/5 ${listenedTracks.length >= 1 ? 'bg-cyan-400/20' : ''}`} />
                  </div>
                  <div className="flex-grow">
                    <p className="text-xs font-bold text-white leading-tight">First Audition</p>
                    <p className="text-[9px] text-white/30 mt-0.5">Unlocks "Saturn Returns" track in lobby.</p>
                  </div>
                </div>

                {/* Milestone 2 */}
                <div className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center border text-[9px] font-bold ${
                      listenedTracks.length >= 5 ? 'bg-cyan-500/10 border-cyan-400 text-cyan-400' : 'bg-white/5 border-white/10 text-white/30'
                    }`}>
                      {listenedTracks.length >= 5 ? '✓' : '2'}
                    </div>
                    <div className={`w-0.5 h-5 bg-white/5 ${listenedTracks.length >= 5 ? 'bg-cyan-400/20' : ''}`} />
                  </div>
                  <div className="flex-grow">
                    <p className="text-xs font-bold text-white leading-tight">Enthusiast Sync</p>
                    <p className="text-[9px] text-white/30 mt-0.5">Unlocks customizable profile banners.</p>
                  </div>
                </div>

                {/* Milestone 3 */}
                <div className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center border text-[9px] font-bold ${
                      listenedTracks.length >= 19 ? 'bg-cyan-500/10 border-cyan-400 text-cyan-400' : 'bg-white/5 border-white/10 text-white/30'
                    }`}>
                      {listenedTracks.length >= 19 ? '✓' : '3'}
                    </div>
                  </div>
                  <div className="flex-grow">
                    <p className="text-xs font-bold text-white leading-tight">Album Loop Completion</p>
                    <p className="text-[9px] text-white/30 mt-0.5">Unlocks Legendary Badge in chest.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Ecosystem Telemetry */}
            <div className="flex flex-col gap-3 bg-neutral-950/60 p-4 rounded-2xl border border-white/5 font-mono text-xs">
              <span className="text-[10px] text-white/50 uppercase font-bold tracking-wider">Ecosystem Telemetry</span>
              
              <div className="flex justify-between items-center py-1">
                <span className="text-white/40">Node XP Points</span>
                <span className="text-white font-bold">12,450 XP</span>
              </div>
              <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full rounded-full" style={{ width: '65%', background: profileAccent }}></div>
              </div>

              <div className="flex justify-between items-center py-1 border-t border-white/5 mt-2">
                <span className="text-white/40">Connected Nodes</span>
                <span className="text-cyber-blue font-bold">04 / 04</span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: SECURITY & BACKUP */}
        {profileTab === 'security' && (
          <div className="flex flex-col gap-4 animate-fade-in text-left">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-white/50 border-b border-white/5 pb-1">Security & Recovery Keys</h4>

            <div style={{ padding: '12px', background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '12px' }}>
              <span style={{ fontSize: '10px', color: '#f87171', fontFamily: 'monospace', fontWeight: 'bold', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Shield size={12} /> Backup Mnemonic Phrase
              </span>
              <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.45)', margin: '4px 0 0 0', lineHeight: '1.4' }}>
                Your recovery key allows resetting your passcode dynamically. Never disclose this phrase to anybody, including studio staff.
              </p>
            </div>

            {/* Revealed Key Display */}
            <div className="bg-white/2 border border-white/5 p-4 rounded-2xl flex flex-col gap-3">
              {revealKey ? (
                <>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '6px',
                    background: 'rgba(0,0,0,0.3)',
                    padding: '10px',
                    borderRadius: '10px',
                    border: '1px solid rgba(255,255,255,0.06)'
                  }}>
                    {(currentUser.recoveryKey || 'maxx forge founder secret key 2026').split(' ').map((word, idx) => (
                      <div key={idx} style={{
                        padding: '6px 4px',
                        background: 'rgba(255,255,255,0.02)',
                        border: '1px solid rgba(255,255,255,0.04)',
                        borderRadius: '5px',
                        fontSize: '9px',
                        fontFamily: 'monospace',
                        color: '#e0e0e0',
                        textAlign: 'center',
                        position: 'relative'
                      }}>
                        <span style={{ fontSize: '7px', color: 'rgba(255,255,255,0.2)', position: 'absolute', top: '1px', left: '3px' }}>{idx + 1}</span>
                        {word}
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={downloadBackupKey}
                      className="flex-grow py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-[10px] font-mono font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
                    >
                      <Download size={11} /> DOWNLOAD KEY FILE
                    </button>
                    <button
                      onClick={() => setRevealKey(false)}
                      className="py-2 px-3 bg-white/5 hover:bg-white/10 text-white/60 rounded-xl text-[10px] font-mono font-bold transition cursor-pointer"
                    >
                      HIDE
                    </button>
                  </div>
                </>
              ) : (
                <button
                  onClick={() => setRevealKey(true)}
                  className="w-full py-3 bg-white/5 hover:bg-white/10 text-white/80 border border-white/8 rounded-xl text-[10px] font-mono font-bold flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  <Eye size={12} /> REVEAL ACCOUNT RECOVERY KEY
                </button>
              )}
            </div>

            {/* Login Credentials Reference Card */}
            <div className="p-4 rounded-xl border border-yellow-500/20 bg-yellow-500/5 text-left font-mono text-[9px] leading-relaxed text-yellow-500/80">
              <span className="font-bold text-yellow-400 block mb-1 uppercase tracking-wider">Account Credentials Check:</span>
              Node Identity: {currentUser.id}<br/>
              Node Clearance: {currentUser.role.toUpperCase()}<br/>
              Access Node Key: SHA-256 Verified Enclave Lock
            </div>
          </div>
        )}

      </div>

      {/* Logout Action */}
      <button
        onClick={() => {
          if (profileAudioRef.current) {
            profileAudioRef.current.pause();
          }
          logout();
          navigate('/login');
        }}
        className="w-full py-3 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 text-red-400 rounded-xl text-xs font-mono font-bold transition flex items-center justify-center gap-2 cursor-pointer"
      >
        <span>[ LOGOUT FROM MATRIX ]</span>
      </button>
    </div>
  );
}
