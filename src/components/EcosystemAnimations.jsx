import React from 'react';
import LottiePlayer from './LottiePlayer.jsx';
import { Cpu, Cloud, Sparkles, Sliders, Gamepad2 } from 'lucide-react';

// =====================================================
// MAXX FORGE STUDIO™ — Ecosystem Animations
// Syncs and displays custom Lottie animations uploaded by user
// =====================================================

// 1. Google Cloud Storage Node Widget (with cloud-storage/google-cloud-icon animation)
export function AriesCloudStorageNode() {
  return (
    <div className="glass-panel rounded-3xl p-6 flex flex-col md:flex-row items-center gap-5 border border-cyan-500/15"
      style={{ background: 'linear-gradient(135deg, rgba(6,182,212,0.06) 0%, rgba(8,8,12,0.95) 100%)' }}>
      <div className="w-24 h-24 flex-shrink-0 bg-cyan-950/20 rounded-2xl border border-cyan-500/20 overflow-hidden flex items-center justify-center">
        <LottiePlayer
          src="/animations/new-google-cloud-icon/animations/new-google-cloud-icon.json"
          assetsPath="/animations/new-google-cloud-icon/images/"
          className="w-full h-full"
        />
      </div>
      <div className="flex-grow flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Cloud size={14} className="text-cyan-400 animate-pulse" />
          <span className="text-[9px] font-mono tracking-widest text-cyan-400 font-bold uppercase">Aries OS v4.1-Delta Node</span>
        </div>
        <h3 className="text-lg font-display font-black text-white leading-tight uppercase">Digital Storage Node Live</h3>
        <p className="text-xs text-white/50 leading-relaxed font-light">
          Cloud storage is now operational! Save your custom profile configurations, collectible badges, and script files securely. More cloud backup options coming in the next update.
        </p>
      </div>
    </div>
  );
}

// 2. Aries Live AI Flow Vector Widget (with AI flow animation)
export function AriesLiveAiFlow() {
  return (
    <div className="glass-panel rounded-3xl p-6 flex flex-col gap-4 border border-indigo-500/15"
      style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.05) 0%, rgba(8,8,12,0.95) 100%)' }}>
      <div className="flex items-center justify-between border-b border-white/5 pb-2">
        <div className="flex items-center gap-2">
          <Cpu size={14} className="text-indigo-400" />
          <span className="text-[9px] font-mono tracking-widest text-indigo-400 font-bold uppercase">Context Vector stream</span>
        </div>
        <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
      </div>
      
      <div className="h-28 w-full bg-neutral-950/40 rounded-2xl border border-white/5 overflow-hidden flex items-center justify-center relative">
        <LottiePlayer
          src="/animations/ai-animation-flow-1.json"
          className="w-full h-full object-cover scale-110"
        />
      </div>

      <div className="flex flex-col gap-1 text-center md:text-left">
        <span className="text-[10px] font-mono text-white/40 uppercase">LLM Stream State</span>
        <span className="text-xs font-semibold text-white/80 font-mono">Syncing local llama context telemetry...</span>
      </div>
    </div>
  );
}

// 3. DJ Em Kaleidoscope Visualizer (with kaleidoscope animation)
export function DjemKaleidoscopeVisual() {
  return (
    <div className="glass-panel rounded-3xl p-6 flex flex-col gap-5 border border-emerald-500/15"
      style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.05) 0%, rgba(8,8,12,0.95) 100%)' }}>
      <div className="flex justify-between items-center border-b border-white/5 pb-3">
        <div className="flex items-center gap-2">
          <Sliders size={14} className="text-emerald-400" />
          <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-bold">TouchDesigner Visual Output</span>
        </div>
        <span className="px-2.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-[9px] font-mono text-emerald-400 font-bold animate-pulse">
          RESOLVING 60FPS
        </span>
      </div>

      <div className="h-48 w-full bg-neutral-950/50 rounded-2xl border border-white/10 overflow-hidden flex items-center justify-center relative">
        <LottiePlayer
          src="/animations/kaleidoscope.json"
          className="w-full h-full scale-125"
        />
      </div>

      <div>
        <h4 className="text-sm font-display font-extrabold uppercase tracking-wider text-white">Live Feedback Module</h4>
        <p className="text-[10px] font-mono text-white/40 mt-1 leading-relaxed">
          Dynamic matrix math generating kaleidoscope visuals synchronized with DMX midi signals.
        </p>
      </div>
    </div>
  );
}

// 4. Game Dev Falling Shapes Showcase (with falling shapes animation)
export function GameDevFallingShapes() {
  return (
    <div className="glass-panel rounded-3xl p-6 flex flex-col gap-5 border border-red-500/15"
      style={{ background: 'linear-gradient(135deg, rgba(239,68,68,0.05) 0%, rgba(8,8,12,0.95) 100%)' }}>
      <div className="flex justify-between items-center border-b border-white/5 pb-3">
        <div className="flex items-center gap-2">
          <Gamepad2 size={14} className="text-red-400" />
          <span className="text-[10px] font-mono uppercase tracking-wider text-red-400 font-bold">Physics Engine Sandbox</span>
        </div>
        <span className="px-2.5 py-0.5 rounded bg-red-500/10 border border-red-500/20 text-[9px] font-mono text-red-500 font-bold">
          COLLISION ENGAGED
        </span>
      </div>

      <div className="h-48 w-full bg-neutral-950/50 rounded-2xl border border-white/10 overflow-hidden flex items-center justify-center relative">
        <LottiePlayer
          src="/animations/falling-shapes/a/Main Scene.json"
          assetsPath="/animations/falling-shapes/i/"
          className="w-full h-full object-cover"
        />
      </div>

      <div>
        <h4 className="text-sm font-display font-extrabold uppercase tracking-wider text-white">Bio Forge Object Sandbox</h4>
        <p className="text-[10px] font-mono text-white/40 mt-1 leading-relaxed">
          Testing geometric collision physics and gravity modifiers inside the Unity environment.
        </p>
      </div>
    </div>
  );
}

// 5. Glowing Fish Loader (with fish loading animation)
export function GlowingFishLoader({ className = "w-24 h-24" }) {
  return (
    <LottiePlayer
      src="/animations/glowing-fish-loader.json"
      className={className}
      loop={true}
      autoplay={true}
    />
  );
}
