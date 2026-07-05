import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext.jsx';
import { Eye, EyeOff, Lock, Mail, User, ArrowLeft, Shield, AlertCircle, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

function RotatingRing() {
  const ref = useRef();
  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.rotation.x = Math.sin(clock.getElapsedTime() * 0.3) * 0.4;
      ref.current.rotation.y = clock.getElapsedTime() * 0.25;
    }
  });
  return (
    <group ref={ref}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[2, 0.025, 8, 80]} />
        <meshStandardMaterial color="#10B981" emissive="#10B981" emissiveIntensity={2} />
      </mesh>
      <mesh rotation={[Math.PI / 3, 0.5, 0]}>
        <torusGeometry args={[2.6, 0.015, 8, 80]} />
        <meshStandardMaterial color="#00E5FF" emissive="#00E5FF" emissiveIntensity={1.5} transparent opacity={0.7} />
      </mesh>
      <mesh rotation={[Math.PI / 6, -0.3, 0]}>
        <torusGeometry args={[3.2, 0.01, 8, 80]} />
        <meshStandardMaterial color="#6366F1" emissive="#6366F1" emissiveIntensity={1} transparent opacity={0.4} />
      </mesh>
      <pointLight color="#10B981" intensity={3} distance={8} />
      <pointLight color="#00E5FF" intensity={2} distance={10} position={[2, 1, 1]} />
    </group>
  );
}

function LoginScene() {
  return (
    <>
      <ambientLight intensity={0.05} />
      <RotatingRing />
    </>
  );
}

export default function Login() {
  const { login, registerMember } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) { setError('Please fill in all fields.'); return; }
    setLoading(true);
    setError('');
    const result = await login(email, password);
    setLoading(false);
    if (result.success) {
      toast.success(`Welcome back, ${result.user.name}! 🔥`);
      navigate('/dashboard');
    } else {
      setError(result.error);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) { setError('Please fill in all fields.'); return; }
    if (password !== confirmPass) { setError('Passwords do not match.'); return; }
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    setLoading(true);
    setError('');
    const result = await registerMember(name, email, password);
    setLoading(false);
    if (result.success) {
      toast.success('Account created! Please sign in.');
      setMode('login');
      setPassword('');
    } else {
      setError(result.error);
    }
  };

  // Quick-fill for demo credentials
  const fillCredentials = (email, pass) => {
    setEmail(email);
    setPassword(pass);
    toast.success('Demo credentials filled — click Sign In!');
  };

  return (
    <div className="min-h-screen bg-[#020204] flex">
      {/* Left: 3D scene */}
      <div className="hidden lg:flex flex-1 relative items-center justify-center">
        <div className="absolute inset-0">
          <Canvas camera={{ position: [0, 0, 7], fov: 60 }} gl={{ antialias: true, alpha: true }}>
            <LoginScene />
          </Canvas>
        </div>
        {/* Brand overlay */}
        <div className="relative z-10 flex flex-col items-center gap-6 text-center pointer-events-none">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#10B981] animate-pulse" />
            <span className="text-xs font-mono text-emerald-400 tracking-widest uppercase">System Core v3.0</span>
          </div>
          <h1 className="text-5xl font-display font-black tracking-tight text-white leading-tight">
            MAXX FORGE<br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">STUDIO™</span>
          </h1>
          <p className="text-sm font-mono text-white/30 max-w-xs leading-relaxed">
            The interconnected digital ecosystem for music, visuals, AI, and gaming.
          </p>
          {/* Demo credential cards */}
          <div className="mt-4 flex flex-col gap-2 w-full max-w-xs">
            <p className="text-[10px] font-mono text-white/20 uppercase tracking-wider mb-1">Demo Accounts</p>
            {[
              { label: '🔥 Founder', email: 'maximus@maxxforgestudio.com', pass: 'ForgeFounder2026!', color: '#10B981' },
              { label: '⚡ Staff – Em', email: 'em@maxxforgestudio.com', pass: 'StaffForge2026!', color: '#00E5FF' },
              { label: '🤖 Staff – Zeppelin', email: 'zeppelin@maxxforgestudio.com', pass: 'AriesDev2026!', color: '#6366F1' },
            ].map(cred => (
              <button
                key={cred.email}
                onClick={() => fillCredentials(cred.email, cred.pass)}
                className="flex items-center justify-between p-2.5 rounded-xl border text-left transition hover:scale-[1.02] pointer-events-auto"
                style={{ borderColor: `${cred.color}25`, background: `${cred.color}08` }}
              >
                <span className="text-[11px] font-semibold" style={{ color: cred.color }}>{cred.label}</span>
                <span className="text-[9px] font-mono text-white/30">click to fill</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Right: Auth form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:max-w-md">
        <div className="w-full max-w-sm">
          <Link to="/" className="flex items-center gap-2 text-white/30 hover:text-white/60 text-xs font-mono mb-8 transition">
            <ArrowLeft size={14} />
            Back to Home
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-6"
          >
            {/* Title */}
            <div>
              <h2 className="text-2xl font-display font-black text-white">
                {mode === 'login' ? 'Sign In' : 'Create Account'}
              </h2>
              <p className="text-xs font-mono text-white/30 mt-1">
                {mode === 'login' ? 'Access your Forge Account' : 'Join the Maxx Forge ecosystem'}
              </p>
            </div>

            {/* Security badge */}
            <div className="flex items-center gap-2 p-2.5 bg-emerald-500/5 border border-emerald-500/15 rounded-xl">
              <Shield size={12} className="text-emerald-400 flex-shrink-0" />
              <span className="text-[10px] font-mono text-emerald-400/80">End-to-end secured · Session encrypted · IP logged</span>
            </div>

            {/* Error display */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl"
                >
                  <AlertCircle size={14} className="text-red-400 flex-shrink-0 mt-0.5" />
                  <span className="text-xs text-red-300 leading-relaxed">{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Form */}
            <form onSubmit={mode === 'login' ? handleLogin : handleRegister} className="flex flex-col gap-4">
              {mode === 'register' && (
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-mono text-white/40 uppercase font-bold tracking-wider">Display Name *</label>
                  <div className="relative">
                    <User size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/20" />
                    <input
                      type="text"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="Your name"
                      className="w-full pl-9 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-white/20 focus:outline-none focus:border-emerald-500/50 transition"
                    />
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-mono text-white/40 uppercase font-bold tracking-wider">Email Address *</label>
                <div className="relative">
                  <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/20" />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="you@email.com"
                    autoComplete="email"
                    className="w-full pl-9 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-white/20 focus:outline-none focus:border-emerald-500/50 transition"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-mono text-white/40 uppercase font-bold tracking-wider">Password *</label>
                <div className="relative">
                  <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/20" />
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Your password"
                    autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                    className="w-full pl-9 pr-10 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-white/20 focus:outline-none focus:border-emerald-500/50 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(v => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/50 transition"
                  >
                    {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              {mode === 'register' && (
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-mono text-white/40 uppercase font-bold tracking-wider">Confirm Password *</label>
                  <div className="relative">
                    <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/20" />
                    <input
                      type="password"
                      value={confirmPass}
                      onChange={e => setConfirmPass(e.target.value)}
                      placeholder="Re-enter password"
                      className="w-full pl-9 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-white/20 focus:outline-none focus:border-emerald-500/50 transition"
                    />
                    {confirmPass && password && (
                      <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
                        {confirmPass === password
                          ? <Check size={14} className="text-emerald-400" />
                          : <AlertCircle size={14} className="text-red-400" />}
                      </div>
                    )}
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-cyan-500 text-neutral-950 rounded-xl font-bold text-sm hover:from-emerald-400 hover:to-cyan-400 transition-all duration-300 shadow-[0_0_20px_rgba(16,185,129,0.3)] disabled:opacity-50 flex items-center justify-center gap-2 mt-1"
              >
                {loading
                  ? <div className="w-5 h-5 border-2 border-neutral-950 border-t-transparent rounded-full animate-spin" />
                  : mode === 'login' ? 'Sign In to Forge' : 'Create Forge Account'}
              </button>
            </form>

            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-white/5" />
              <span className="text-[10px] font-mono text-white/20">or</span>
              <div className="flex-1 h-px bg-white/5" />
            </div>

            <button
              onClick={() => { setMode(m => m === 'login' ? 'register' : 'login'); setError(''); }}
              className="text-center text-xs font-mono text-white/30 hover:text-white/60 transition"
            >
              {mode === 'login' ? "Don't have an account? → Register" : "Already have an account? → Sign In"}
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
