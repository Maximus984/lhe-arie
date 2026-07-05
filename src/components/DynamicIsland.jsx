import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cpu, Music, Zap, Disc, User, Bell, ChevronDown, Wifi, Battery, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

export default function DynamicIsland({ activeSection, isPlaying, currentTrack, onNavigate }) {
  const { currentUser } = useAuth();
  const [expanded, setExpanded] = useState(false);
  const [time, setTime] = useState(new Date());
  const [notifications, setNotifications] = useState(2);
  const [theme, setTheme] = useState('fiber'); // 'fiber' | 'nature'

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (d) =>
    d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

  const sectionIcons = {
    matrix: <Cpu size={14} />,
    records: <Disc size={14} />,
    djem: <Zap size={14} />,
    aries: <Cpu size={14} />,
    gamedev: <span className="text-[10px]">🎮</span>,
  };

  const sectionColors = {
    matrix: '#10B981',
    records: '#00E5FF',
    djem: '#10B981',
    aries: '#00E5FF',
    gamedev: '#EF4444',
  };

  const color = sectionColors[activeSection] || '#10B981';

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] flex flex-col items-center">
      {/* The Island Pill */}
      <motion.div
        layout
        transition={{ type: 'spring', stiffness: 350, damping: 30 }}
        onClick={() => setExpanded(e => !e)}
        className="relative cursor-pointer overflow-hidden"
        style={{
          background: 'rgba(5,5,8,0.95)',
          border: `1px solid ${color}25`,
          borderRadius: expanded ? '24px' : '999px',
          boxShadow: `0 0 ${expanded ? '40px' : '15px'} ${color}20, inset 0 1px 1px rgba(255,255,255,0.06)`,
          backdropFilter: 'blur(24px)',
        }}
      >
        {/* Collapsed state */}
        <motion.div layout className="flex items-center gap-3 px-4 py-2.5">
          {/* Live status dot */}
          <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: color, boxShadow: `0 0 6px ${color}` }} />

          {/* Active section indicator */}
          <div className="flex items-center gap-1.5" style={{ color }}>
            {sectionIcons[activeSection]}
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider hidden sm:block">
              {activeSection === 'matrix' ? 'Core Matrix' :
               activeSection === 'records' ? 'Prime Records' :
               activeSection === 'djem' ? 'DJ Em' :
               activeSection === 'aries' ? 'Aries AI' : 'Game Dev'}
            </span>
          </div>

          {/* Divider */}
          <span className="w-px h-3 bg-white/10" />

          {/* Now playing mini indicator */}
          {isPlaying && (
            <div className="flex items-center gap-1.5">
              <div className="flex gap-0.5 items-end h-3">
                {[1,2,3].map(i => (
                  <motion.div
                    key={i}
                    className="w-[2px] rounded-full"
                    style={{ background: '#00E5FF' }}
                    animate={{ height: ['6px','12px','4px','10px','6px'] }}
                    transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
                  />
                ))}
              </div>
              <span className="text-[9px] font-mono text-cyan-400/80 hidden sm:block max-w-[80px] truncate">
                {currentTrack?.title}
              </span>
            </div>
          )}

          {/* Divider */}
          <span className="w-px h-3 bg-white/10" />

          {/* Time */}
          <span className="text-[10px] font-mono text-white/40">{formatTime(time)}</span>

          {/* User badge */}
          {currentUser && (
            <div className="flex items-center gap-1.5">
              <div
                className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold"
                style={{ background: `${color}20`, color, border: `1px solid ${color}40` }}
              >
                {currentUser.avatar}
              </div>
            </div>
          )}

          {/* Notification badge */}
          {notifications > 0 && (
            <div className="relative">
              <Bell size={12} className="text-white/30" />
              <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-red-500 text-white text-[7px] font-bold flex items-center justify-center">
                {notifications}
              </span>
            </div>
          )}
        </motion.div>

        {/* Expanded panel */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="px-5 pb-5 flex flex-col gap-4 min-w-[320px]">
                <div className="h-px bg-white/5 mt-1" />

                {/* Welcome message */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-display font-bold text-white">
                      {currentUser ? `Welcome back, ${currentUser.name}` : 'Welcome to Maxx Forge Studio™'}
                    </p>
                    <p className="text-[10px] font-mono mt-0.5" style={{ color: `${color}` }}>
                      {currentUser?.badge || 'System Core v3.0 — Online'}
                    </p>
                  </div>
                  {/* Theme toggle */}
                  <button
                    onClick={(e) => { e.stopPropagation(); setTheme(t => t === 'fiber' ? 'nature' : 'fiber'); }}
                    className="px-2 py-1 text-[9px] font-mono rounded border border-white/10 text-white/40 hover:text-white/80 hover:border-white/20 transition"
                  >
                    {theme === 'fiber' ? '🌿 Nature' : '⚡ Fiber'}
                  </button>
                </div>

                {/* Section quick-nav */}
                <div className="grid grid-cols-5 gap-1.5">
                  {[
                    { key: 'matrix', label: 'Core', icon: <Cpu size={12} /> },
                    { key: 'records', label: 'Music', icon: <Disc size={12} /> },
                    { key: 'djem', label: 'DJ Em', icon: <Zap size={12} /> },
                    { key: 'aries', label: 'AI', icon: <Cpu size={12} /> },
                    { key: 'gamedev', label: 'Game', icon: <span className="text-[10px]">🎮</span> },
                  ].map(({ key, label, icon }) => (
                    <button
                      key={key}
                      onClick={(e) => { e.stopPropagation(); onNavigate(key); setExpanded(false); }}
                      className={`flex flex-col items-center gap-1 py-2 px-1 rounded-lg text-[9px] font-mono font-bold transition border ${
                        activeSection === key
                          ? 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10'
                          : 'border-white/5 text-white/30 hover:text-white/60 hover:border-white/10'
                      }`}
                    >
                      {icon}
                      {label}
                    </button>
                  ))}
                </div>

                {/* Now playing row */}
                {isPlaying && (
                  <div className="flex items-center gap-3 p-2.5 bg-white/5 rounded-xl border border-white/5">
                    <div className="flex gap-0.5 items-end h-4">
                      {[1,2,3,4].map(i => (
                        <motion.div
                          key={i}
                          className="w-[2px] rounded-full bg-cyan-400"
                          animate={{ height: ['4px','14px','6px','12px'] }}
                          transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.1 }}
                        />
                      ))}
                    </div>
                    <div className="flex-grow min-w-0">
                      <p className="text-[10px] font-semibold text-white truncate">{currentTrack?.title}</p>
                      <p className="text-[9px] font-mono text-white/40">{currentTrack?.artist}</p>
                    </div>
                    <span className="text-[9px] font-mono text-cyan-400 bg-cyan-400/10 px-2 py-0.5 rounded">LIVE</span>
                  </div>
                )}

                {/* System status */}
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-white/5 rounded-lg p-2 border border-white/5">
                    <Wifi size={12} className="mx-auto mb-1 text-emerald-400" />
                    <span className="text-[8px] font-mono text-white/40 block">ONLINE</span>
                  </div>
                  <div className="bg-white/5 rounded-lg p-2 border border-white/5">
                    <Battery size={12} className="mx-auto mb-1 text-cyan-400" />
                    <span className="text-[8px] font-mono text-white/40 block">SECURE</span>
                  </div>
                  <div className="bg-white/5 rounded-lg p-2 border border-white/5">
                    <Clock size={12} className="mx-auto mb-1 text-indigo-400" />
                    <span className="text-[8px] font-mono text-white/40 block">{formatTime(time)}</span>
                  </div>
                </div>

                {/* Aries AI fact */}
                <div
                  className="p-2.5 rounded-xl border text-[9px] font-mono leading-relaxed"
                  style={{
                    borderColor: `${color}20`,
                    background: `${color}08`,
                    color: `${color}CC`,
                  }}
                >
                  {theme === 'fiber'
                    ? '⚡ Aries AI processes over 4.7B context tokens per inference cycle via local Ollama architecture — zero cloud dependency.'
                    : '🌿 Designed with wabi-sabi philosophy: imperfection as beauty. Every Maxx Forge project breathes between structure and nature.'}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
