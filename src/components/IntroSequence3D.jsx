import React, { useRef, useEffect, useState, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Text, Float, Sphere, MeshDistortMaterial, Stars, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';

// ---- Floating geometric forge particles ----
function ForgeParticle({ position, color, speed, size }) {
  const meshRef = useRef();
  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const t = clock.getElapsedTime() * speed;
    meshRef.current.position.y = position[1] + Math.sin(t) * 0.3;
    meshRef.current.rotation.x = t * 0.4;
    meshRef.current.rotation.z = t * 0.3;
  });
  return (
    <mesh ref={meshRef} position={position}>
      {Math.random() > 0.5 ? <octahedronGeometry args={[size]} /> : <tetrahedronGeometry args={[size]} />}
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={0.6}
        wireframe={Math.random() > 0.5}
        transparent
        opacity={0.7}
      />
    </mesh>
  );
}

// ---- Central forge orb / logo sphere ----
function ForgeLogo({ onClick }) {
  const meshRef = useRef();
  const ringRef = useRef();
  const [hovered, setHovered] = useState(false);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.y = clock.getElapsedTime() * 0.15;
    if (ringRef.current) {
      ringRef.current.rotation.z = clock.getElapsedTime() * 0.3;
    }
  });

  return (
    <group>
      {/* Outer glow ring */}
      <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[2.2, 0.02, 8, 100]} />
        <meshStandardMaterial color="#10B981" emissive="#10B981" emissiveIntensity={2} />
      </mesh>
      <mesh rotation={[Math.PI / 2.5, 0, 0]}>
        <torusGeometry args={[2.8, 0.01, 8, 100]} />
        <meshStandardMaterial color="#00E5FF" emissive="#00E5FF" emissiveIntensity={1.5} transparent opacity={0.6} />
      </mesh>

      {/* Core sphere */}
      <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.5}>
        <mesh
          ref={meshRef}
          onClick={onClick}
          onPointerEnter={() => setHovered(true)}
          onPointerLeave={() => setHovered(false)}
          scale={hovered ? 1.08 : 1}
        >
          <Sphere args={[1.6, 64, 64]}>
            <MeshDistortMaterial
              color="#050510"
              emissive="#10B981"
              emissiveIntensity={0.15}
              distort={0.3}
              speed={1.2}
              roughness={0.1}
              metalness={0.9}
            />
          </Sphere>
        </mesh>
      </Float>

      {/* Inner pulsing core light */}
      <pointLight color="#10B981" intensity={hovered ? 4 : 2} distance={8} />
      <pointLight color="#00E5FF" intensity={1} distance={12} position={[3, 2, 2]} />
    </group>
  );
}

// ---- Floating particle field ----
function ParticleField() {
  const count = 200;
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 30;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 30;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 30;
  }
  const geoRef = useRef();
  useFrame(({ clock }) => {
    if (geoRef.current) geoRef.current.rotation.y = clock.getElapsedTime() * 0.02;
  });
  return (
    <points ref={geoRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" array={positions} count={count} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial color="#10B981" size={0.06} transparent opacity={0.5} sizeAttenuation />
    </points>
  );
}

// ---- Geometric forge particles ----
const PARTICLES = [
  { position: [-4, 1.5, -2], color: '#10B981', speed: 0.8, size: 0.15 },
  { position: [4, -1, -1], color: '#00E5FF', speed: 1.1, size: 0.12 },
  { position: [-3, -2, 1], color: '#10B981', speed: 0.6, size: 0.18 },
  { position: [3.5, 2, 0.5], color: '#00E5FF', speed: 1.3, size: 0.10 },
  { position: [-2, 3, -1.5], color: '#6366F1', speed: 0.9, size: 0.14 },
  { position: [2, -3, 0], color: '#6366F1', speed: 1.0, size: 0.11 },
  { position: [0.5, 3.5, 1], color: '#10B981', speed: 1.2, size: 0.09 },
  { position: [-4.5, 0, 0], color: '#00E5FF', speed: 0.7, size: 0.16 },
];

// ---- Spatial audio via Web Audio API ----
function initSpatialAudio() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator1 = ctx.createOscillator();
    const oscillator2 = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator1.type = 'sine';
    oscillator1.frequency.setValueAtTime(55, ctx.currentTime);
    oscillator1.frequency.exponentialRampToValueAtTime(110, ctx.currentTime + 4);

    oscillator2.type = 'triangle';
    oscillator2.frequency.setValueAtTime(82.5, ctx.currentTime);
    oscillator2.frequency.exponentialRampToValueAtTime(165, ctx.currentTime + 4);

    gainNode.gain.setValueAtTime(0.001, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.04, ctx.currentTime + 2);
    gainNode.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 5);

    oscillator1.connect(gainNode);
    oscillator2.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator1.start();
    oscillator2.start();
    oscillator1.stop(ctx.currentTime + 5.5);
    oscillator2.stop(ctx.currentTime + 5.5);

    return ctx;
  } catch (e) {
    return null;
  }
}

// ---- Main 3D Scene ----
function Scene3D({ onEnter }) {
  return (
    <>
      <Stars radius={60} depth={50} count={3000} factor={3} saturation={0} fade speed={1} />
      <ambientLight intensity={0.1} />
      <pointLight position={[10, 10, 10]} intensity={0.5} color="#ffffff" />
      <ParticleField />
      {PARTICLES.map((p, i) => <ForgeParticle key={i} {...p} />)}
      <ForgeLogo onClick={onEnter} />
    </>
  );
}

// ---- Full Screen 3D Intro ----
export default function IntroSequence3D({ onComplete }) {
  const [phase, setPhase] = useState('loading'); // loading → reveal → ready → exiting
  const overlayRef = useRef();
  const textRef = useRef();
  const audioCtxRef = useRef();

  useEffect(() => {
    // After canvas mounts, run GSAP intro timeline
    const tl = gsap.timeline();
    tl.to({}, { duration: 0.8 }) // Initial pause
      .call(() => setPhase('reveal'))
      .to({}, { duration: 1.2 })
      .call(() => setPhase('ready'));

    return () => tl.kill();
  }, []);

  const handleEnter = () => {
    // Play spatial audio on click
    audioCtxRef.current = initSpatialAudio();
    setPhase('exiting');
    gsap.to(overlayRef.current, {
      opacity: 0,
      duration: 1.2,
      ease: 'power2.inOut',
      onComplete,
    });
  };

  const handleSkip = () => {
    setPhase('exiting');
    onComplete();
  };

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[9999] bg-[#020204] flex flex-col"
      style={{ cursor: phase === 'ready' ? 'pointer' : 'default' }}
    >
      {/* 3D Canvas Layer */}
      <div className="absolute inset-0">
        <Canvas
          camera={{ position: [0, 0, 8], fov: 55 }}
          gl={{ antialias: true, alpha: false }}
          dpr={[1, 2]}
        >
          <Suspense fallback={null}>
            <Scene3D onEnter={phase === 'ready' ? handleEnter : undefined} />
          </Suspense>
        </Canvas>
      </div>

      {/* Top scanline overlay */}
      <div className="absolute inset-0 pointer-events-none z-10" style={{
        background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px)',
      }} />

      {/* Vignette */}
      <div className="absolute inset-0 pointer-events-none z-10" style={{
        background: 'radial-gradient(ellipse at center, transparent 40%, rgba(2,2,4,0.7) 100%)',
      }} />

      {/* UI Overlay */}
      <div className="relative z-20 flex flex-col h-full items-center justify-between py-12 px-8 pointer-events-none">
        {/* Top brand tag */}
        <AnimatePresence>
          {phase !== 'loading' && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.2 }}
              className="flex items-center gap-3"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#10B981] animate-pulse" />
              <span className="text-xs font-mono tracking-[0.3em] text-emerald-400 uppercase font-bold">
                Maxx Forge Studio™ — System Core v3.0
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#10B981] animate-pulse" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Center text block */}
        <div className="flex flex-col items-center gap-6 text-center">
          <AnimatePresence>
            {phase === 'reveal' || phase === 'ready' || phase === 'exiting' ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.92, filter: 'blur(12px)' }}
                animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
                className="flex flex-col items-center gap-4"
              >
                <h1 className="text-5xl sm:text-7xl md:text-8xl font-display font-black tracking-tighter leading-none text-white">
                  MAXX FORGE
                  <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-cyan-400 to-indigo-400">
                    STUDIO™
                  </span>
                </h1>
                <p className="text-sm sm:text-base font-mono text-white/40 tracking-[0.2em] uppercase max-w-md">
                  Music · Visuals · Intelligence · Gaming
                </p>
              </motion.div>
            ) : null}
          </AnimatePresence>

          {/* Enter CTA */}
          <AnimatePresence>
            {phase === 'ready' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="flex flex-col items-center gap-3 pointer-events-auto"
              >
                <button
                  onClick={handleEnter}
                  className="group relative px-10 py-4 bg-transparent border border-emerald-500/50 rounded-2xl text-emerald-400 font-mono font-bold tracking-widest text-sm uppercase hover:bg-emerald-500/10 hover:border-emerald-400 transition-all duration-500 hover:shadow-[0_0_30px_rgba(16,185,129,0.3)] overflow-hidden"
                >
                  <span className="relative z-10">[ ENTER THE MATRIX ]</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 via-emerald-500/10 to-emerald-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                </button>
                <span className="text-xs font-mono text-white/20 tracking-wider">— or click the forge sphere above —</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Bottom info row */}
        <AnimatePresence>
          {phase !== 'loading' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.6 }}
              className="flex items-center justify-between w-full max-w-2xl pointer-events-auto"
            >
              <div className="flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-white/20" />
                <span className="text-[10px] font-mono text-white/25 tracking-widest uppercase">maxxforgestudio.com</span>
              </div>
              <div className="flex gap-4 text-[10px] font-mono text-white/20 tracking-wider uppercase">
                <span>3D Engine: Three.js</span>
                <span>·</span>
                <span>Aries AI v4.0</span>
              </div>
              <button
                onClick={handleSkip}
                className="text-[10px] font-mono text-white/25 hover:text-white/60 tracking-widest uppercase transition"
              >
                Skip intro →
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
