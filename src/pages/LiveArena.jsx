import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext.jsx';
import { ArrowLeft, Send, Radio, Users, CheckCircle, Shield, Sparkles, Volume2, Maximize, Play, Pause } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

// =====================================================
// MAXX FORGE STUDIO™ — Live Theater Watch Arena
// Interactive high-fidelity viewer layout with live chat overlays
// =====================================================

export default function LiveArena() {
  const { currentUser, can } = useAuth();
  const [streamConfig, setStreamConfig] = useState({
    active: false,
    type: 'preset',
    url: '',
    filter: 'none',
    showGoal: true,
    goalTitle: 'Sub Goal',
    goalTarget: 100,
    goalCurrent: 76,
    viewerCount: 142
  });

  const [chatList, setChatList] = useState([]);
  const [newMsg, setNewMsg] = useState('');
  const chatBottomRef = useRef(null);
  
  // Audio context for sound effects
  const playBeep = () => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } catch (e) {}
  };

  // Sync state from localStorage
  const syncState = () => {
    try {
      // 1. Stream configs
      const localConfig = localStorage.getItem('mfs_live_stream_config');
      if (localConfig) {
        setStreamConfig(JSON.parse(localConfig));
      } else {
        // Fallback default
        const defaultConfig = {
          active: true,
          type: 'preset',
          url: '',
          filter: 'neon',
          showGoal: true,
          goalTitle: 'Upgrade Target',
          goalTarget: 100,
          goalCurrent: 82,
          viewerCount: 142
        };
        localStorage.setItem('mfs_live_stream_config', JSON.stringify(defaultConfig));
        setStreamConfig(defaultConfig);
      }

      // 2. Chats
      const localChat = localStorage.getItem('mfs_live_chat_logs');
      if (localChat) {
        setChatList(JSON.parse(localChat));
      } else {
        const defaultChats = [
          { id: '1', author: 'Aries_Node', role: 'staff', text: 'Welcome to the Maxx Forge Live Stream Arena.', timestamp: new Date().toISOString() },
          { id: '2', author: 'LoverBoy_1939', role: 'member', text: 'Visuals look crazy tonight! Is that TouchDesigner running?', timestamp: new Date().toISOString() }
        ];
        localStorage.setItem('mfs_live_chat_logs', JSON.stringify(defaultChats));
        setChatList(defaultChats);
      }
    } catch (e) {}
  };

  useEffect(() => {
    syncState();
    const interval = setInterval(syncState, 2000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatList]);

  const handleSendChat = (e) => {
    e.preventDefault();
    if (!newMsg.trim()) return;

    if (!currentUser) {
      toast.error('Guests must register to participate in live chat.');
      return;
    }

    const newMessage = {
      id: `chat_${Date.now()}`,
      author: currentUser.displayName || currentUser.name,
      role: currentUser.role,
      text: newMsg.trim(),
      timestamp: new Date().toISOString()
    };

    const updatedChats = [...chatList, newMessage].slice(-80); // cap at 80 messages
    localStorage.setItem('mfs_live_chat_logs', JSON.stringify(updatedChats));
    setChatList(updatedChats);
    setNewMsg('');
    playBeep();
  };

  // Switch filter overlays
  const getFilterStyle = () => {
    switch (streamConfig.filter) {
      case 'neon':
        return { filter: 'hue-rotate(90deg) saturate(1.8)', mixBlendMode: 'screen' };
      case 'christmas':
        return { filter: 'sepia(0.2) contrast(1.2)', borderColor: 'rgba(239, 68, 68, 0.4)' };
      case 'halloween':
        return { filter: 'hue-rotate(270deg) contrast(1.5)', border: '2px solid rgba(249, 115, 22, 0.3)' };
      default:
        return {};
    }
  };

  return (
    <div className="min-h-screen bg-[#050508] text-white p-4 md:p-8 flex flex-col gap-6 selection:bg-cyan-500/20">
      {/* Header Bar */}
      <div className="flex items-center justify-between border-b border-white/5 pb-4">
        <div className="flex items-center gap-3">
          <Link to="/dashboard" className="p-2 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition">
            <ArrowLeft size={16} />
          </Link>
          <div className="flex items-center gap-2">
            <Radio className="text-red-500 animate-pulse" size={18} />
            <h1 className="text-lg font-display font-black uppercase tracking-wider">LIVE THEATER</h1>
          </div>
        </div>

        {streamConfig.active ? (
          <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            <span className="text-[10px] font-mono font-bold text-red-500 uppercase tracking-widest">LIVE BROADCAST</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-white/40">
            <span className="text-[10px] font-mono uppercase tracking-widest font-bold">OFFLINE</span>
          </div>
        )}
      </div>

      {/* Main Broadcast Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-grow">
        {/* Left Column: Player (8 cols) */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          <div className="relative aspect-video w-full bg-black rounded-3xl border border-white/10 overflow-hidden shadow-2xl flex items-center justify-center">
            
            {/* 1. Live stream display */}
            {streamConfig.active ? (
              streamConfig.type === 'webcam' ? (
                // Webcam simulated feed or active camera
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-950 font-mono text-cyan-400 gap-3" style={getFilterStyle()}>
                  <div className="relative w-full h-full">
                    {/* Simulated tech scanning grid lines */}
                    <div className="absolute inset-0 bg-scanlines opacity-20 pointer-events-none" />
                    <video className="w-full h-full object-cover" autoPlay loop muted playsInline src="/brand/webcam_loop.mp4" 
                      onError={(e) => {
                        // If no camera assets, show custom abstract placeholder
                        e.target.style.display = 'none';
                      }}
                    />
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-gradient-to-t from-black/80 to-transparent">
                      <span className="text-[40px]">🎥</span>
                      <span className="text-xs uppercase tracking-widest font-bold animate-pulse text-glow-blue">DIRECT CAMERA LINK ENGAGED</span>
                      <span className="text-[9px] text-white/40">Aries low-latency webcam codec active</span>
                    </div>
                  </div>
                </div>
              ) : streamConfig.type === 'youtube' && streamConfig.url ? (
                // YouTube embed
                <iframe
                  title="YouTube Live Feed"
                  src={`https://www.youtube.com/embed/${streamConfig.url}?autoplay=1&mute=1&controls=0&modestbranding=1`}
                  className="absolute inset-0 w-full h-full border-0"
                  style={getFilterStyle()}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                // Default custom visual loop
                <div className="absolute inset-0 bg-neutral-950 flex flex-col items-center justify-center" style={getFilterStyle()}>
                  <div className="absolute inset-0 bg-scanlines opacity-10 pointer-events-none" />
                  {/* We display a premium neon brick audio visualizer canvas here */}
                  <div className="flex flex-col items-center gap-3 text-cyan-400 font-mono text-center">
                    <Sparkles className="animate-spin text-cyber-blue" size={32} style={{ animationDuration: '6s' }} />
                    <span className="text-xs uppercase tracking-[0.2em] font-bold text-glow-blue">Maxx Forge Visual Stream</span>
                    <span className="text-[9px] font-mono text-white/40">Auto-synced TouchDesigner feed</span>
                  </div>
                </div>
              )
            ) : (
              // Offline State Card
              <div className="flex flex-col items-center gap-4 font-mono text-center text-white/40">
                <span className="text-4xl">📡</span>
                <div>
                  <h3 className="font-display font-black text-white text-base">NO LIVE BROADCAST DETECTED</h3>
                  <p className="text-[10px] text-white/30 mt-1">Check the studio calendar for upcoming DJ sets and launches.</p>
                </div>
              </div>
            )}

            {/* Overlays */}
            {/* Viewer Count Badge */}
            {streamConfig.active && (
              <div className="absolute top-4 left-4 z-20 flex items-center gap-2 bg-red-600/90 border border-red-500/30 rounded-lg px-2.5 py-1 text-[10px] font-mono font-bold tracking-wider">
                <Users size={12} />
                {streamConfig.viewerCount} VIEWERS
              </div>
            )}

            {/* Christmas/Halloween visual overlay decoration */}
            {streamConfig.active && streamConfig.filter === 'christmas' && (
              <div className="absolute inset-0 pointer-events-none z-10 bg-christmas-frame animate-pulse" />
            )}

            {/* Sub Goal Progress Bar */}
            {streamConfig.active && streamConfig.showGoal && (
              <div className="absolute bottom-4 left-4 right-4 z-20 bg-neutral-950/80 border border-white/10 p-3 rounded-xl flex items-center justify-between gap-4 backdrop-blur-md">
                <div className="flex flex-col gap-0.5 min-w-[120px]">
                  <span className="text-[9px] font-mono text-white/40 uppercase tracking-wider">{streamConfig.goalTitle}</span>
                  <span className="text-xs font-bold font-mono text-white">{streamConfig.goalCurrent} / {streamConfig.goalTarget}</span>
                </div>
                <div className="flex-grow h-2 bg-white/5 rounded-full overflow-hidden border border-white/5 relative">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(streamConfig.goalCurrent / streamConfig.goalTarget) * 100}%` }}
                    className="h-full bg-gradient-to-r from-cyan-400 to-indigo-500 rounded-full"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Video Metadata / Info */}
          <div className="glass-panel p-6 rounded-3xl flex flex-col gap-2">
            <span className="px-2 py-0.5 bg-cyan-500/10 border border-cyan-500/20 text-[9px] font-mono text-cyan-400 font-bold uppercase w-fit rounded">
              Channel Feed
            </span>
            <h2 className="text-xl font-display font-black text-white uppercase tracking-tight">
              {streamConfig.active ? 'Aries Studio Broadcast Session' : 'Offline Sandbox Portal'}
            </h2>
            <p className="text-xs text-white/50 leading-relaxed font-light">
              Welcome to the main visual streaming node of Maxx Forge Studio. When live, staff broadcast MIDI tests, synth designs, local LLM telemetry reviews, and raw game-engine captures directly here.
            </p>
          </div>
        </div>

        {/* Right Column: Chat (4 cols) */}
        <div className="lg:col-span-4 flex flex-col bg-white/3 border border-white/5 rounded-3xl overflow-hidden h-[500px] lg:h-auto">
          {/* Chat Header */}
          <div className="p-4 border-b border-white/5 bg-white/2 flex items-center justify-between">
            <span className="text-xs font-mono font-bold uppercase text-white/60 tracking-wider">Live Chat</span>
            <span className="text-[9px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 font-bold uppercase tracking-wider">Online</span>
          </div>

          {/* Message List */}
          <div className="flex-grow overflow-y-auto p-4 flex flex-col gap-3">
            {chatList.map(chat => (
              <div key={chat.id} className="flex flex-col gap-1 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className={`px-1.5 py-0.5 rounded-[4px] text-[8px] font-mono uppercase font-bold ${
                    chat.role === 'founder' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                    chat.role === 'staff' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' :
                    'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  }`}>
                    {chat.role}
                  </span>
                  <span className="font-bold text-white/80 font-mono">{chat.author}</span>
                </div>
                <p className="text-white/60 font-light leading-relaxed pl-1">{chat.text}</p>
              </div>
            ))}
            <div ref={chatBottomRef} />
          </div>

          {/* Chat Input */}
          <form onSubmit={handleSendChat} className="p-3 border-t border-white/5 bg-neutral-950 flex gap-2">
            <input
              type="text"
              value={newMsg}
              onChange={e => setNewMsg(e.target.value)}
              disabled={!currentUser}
              placeholder={currentUser ? "Type message..." : "Register account to chat"}
              className="flex-grow px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-xs focus:outline-none focus:border-cyan-500 text-white placeholder-white/20"
            />
            <button
              type="submit"
              disabled={!newMsg.trim() || !currentUser}
              className="p-2 bg-cyan-500 hover:bg-cyan-400 text-neutral-950 rounded-xl transition flex items-center justify-center disabled:opacity-50"
            >
              <Send size={14} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
