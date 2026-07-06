import React, { useRef, useEffect, useState, Suspense, useMemo } from 'react';
import { Canvas, useFrame, useThree, extend } from '@react-three/fiber';
import { Text, Float, Sphere, MeshDistortMaterial, Stars, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';

// =====================================================
// MAXX FORGE STUDIO™ — Enhanced 3D Intro Sequence
// Neon brick wall background texture + seasonal FX
// =====================================================

// ---- Neon Brick Wall 3D Plane ----
function NeonBrickWall() {
  const texture = useTexture('/brand/neon-brick.jpg');
  const meshRef = useRef();
  const leftLightRef = useRef();
  const rightLightRef = useRef();
  const shimmerRef = useRef();

  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;

  useFrame(({ clock, mouse }) => {
    const t = clock.getElapsedTime();

    // Slow parallax with mouse
    if (meshRef.current) {
      meshRef.current.rotation.x = THREE.MathUtils.lerp(meshRef.current.rotation.x, mouse.y * 0.04, 0.05);
      meshRef.current.rotation.y = THREE.MathUtils.lerp(meshRef.current.rotation.y, mouse.x * 0.06, 0.05);
    }

    // Neon tube flicker (red left)
    if (leftLightRef.current) {
      const flicker = 0.8 + Math.sin(t * 8.3) * 0.08 + (Math.random() < 0.01 ? Math.random() * 0.4 : 0);
      leftLightRef.current.intensity = 3.5 * flicker;
    }

    // Neon tube pulse (blue right)
    if (rightLightRef.current) {
      rightLightRef.current.intensity = 2.8 + Math.sin(t * 1.4) * 0.7;
    }

    // Shimmer
    if (shimmerRef.current) {
      shimmerRef.current.position.x = -12 + ((t * 0.3) % 24);
      shimmerRef.current.material.opacity = 0.06 + Math.sin(t * 2.1) * 0.04;
    }
  });

  return (
    <group>
      {/* Main brick wall plane */}
      <mesh ref={meshRef} position={[0, 0, -6]}>
        <planeGeometry args={[28, 16]} />
        <meshStandardMaterial
          map={texture}
          roughness={0.85}
          metalness={0.05}
          emissiveMap={texture}
          emissive={new THREE.Color(0.06, 0.03, 0.03)}
          emissiveIntensity={0.3}
        />
      </mesh>

      {/* Left neon tube (red) — top of wall */}
      <mesh position={[-5.5, 6.5, -5.5]}>
        <boxGeometry args={[6, 0.12, 0.12]} />
        <meshStandardMaterial color="#ff3333" emissive="#ff2222" emissiveIntensity={4} />
      </mesh>
      <pointLight ref={leftLightRef} position={[-5.5, 6.2, -4.8]} color="#ff4444" intensity={3.5} distance={18} decay={2} />

      {/* Middle neon tube (white/pink) */}
      <mesh position={[0, 6.5, -5.5]}>
        <boxGeometry args={[4, 0.12, 0.12]} />
        <meshStandardMaterial color="#ff88cc" emissive="#ff66bb" emissiveIntensity={3} />
      </mesh>
      <pointLight position={[0, 6.2, -4.8]} color="#ff88cc" intensity={2} distance={14} decay={2} />

      {/* Right neon tube (blue) */}
      <mesh position={[5.5, 6.5, -5.5]}>
        <boxGeometry args={[5, 0.12, 0.12]} />
        <meshStandardMaterial color="#3399ff" emissive="#2288ff" emissiveIntensity={4} />
      </mesh>
      <pointLight ref={rightLightRef} position={[5.5, 6.2, -4.8]} color="#3399ff" intensity={2.8} distance={18} decay={2} />

      {/* Volumetric light ray (red, left) */}
      <mesh position={[-5.5, 0, -5.5]}>
        <planeGeometry args={[4, 12]} />
        <meshBasicMaterial color="#ff2222" transparent opacity={0.03} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>

      {/* Volumetric light ray (blue, right) */}
      <mesh position={[5.5, 0, -5.5]}>
        <planeGeometry args={[4, 12]} />
        <meshBasicMaterial color="#2255ff" transparent opacity={0.03} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>

      {/* Moving shimmer highlight */}
      <mesh ref={shimmerRef} position={[-12, 0, -5.45]} rotation={[0, 0, Math.PI / 12]}>
        <planeGeometry args={[2, 16]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.06} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>

      {/* Soft floor reflection glow */}
      <mesh position={[0, -7, -4]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[20, 4]} />
        <meshBasicMaterial
          color="#552200"
          transparent
          opacity={0.15}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

// ---- Floating geometric forge particles ----
function ForgeParticle({ position, color, speed, size }) {
  const meshRef = useRef();
  const geomType = useMemo(() => Math.random() > 0.5, []);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const t = clock.getElapsedTime() * speed;
    meshRef.current.position.y = position[1] + Math.sin(t) * 0.35;
    meshRef.current.rotation.x = t * 0.5;
    meshRef.current.rotation.z = t * 0.35;
    meshRef.current.rotation.y = t * 0.25;
  });
  return (
    <mesh ref={meshRef} position={position}>
      {geomType ? <octahedronGeometry args={[size]} /> : <tetrahedronGeometry args={[size]} />}
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={0.8}
        wireframe={Math.random() > 0.4}
        transparent
        opacity={0.75}
      />
    </mesh>
  );
}

// ---- Central forge orb ----
function ForgeLogo({ onClick }) {
  const meshRef = useRef();
  const ringRef1 = useRef();
  const ringRef2 = useRef();
  const [hovered, setHovered] = useState(false);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (meshRef.current) meshRef.current.rotation.y = t * 0.15;
    if (ringRef1.current) ringRef1.current.rotation.z = t * 0.35;
    if (ringRef2.current) ringRef2.current.rotation.x = t * 0.2;
  });

  return (
    <group>
      <mesh ref={ringRef1} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[2.2, 0.025, 8, 120]} />
        <meshStandardMaterial color="#10B981" emissive="#10B981" emissiveIntensity={2.5} />
      </mesh>
      <mesh ref={ringRef2} rotation={[Math.PI / 2.4, 0, 0]}>
        <torusGeometry args={[2.85, 0.012, 8, 120]} />
        <meshStandardMaterial color="#00E5FF" emissive="#00E5FF" emissiveIntensity={2} transparent opacity={0.7} />
      </mesh>
      <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.55}>
        <mesh
          ref={meshRef}
          onClick={onClick}
          onPointerEnter={() => setHovered(true)}
          onPointerLeave={() => setHovered(false)}
          scale={hovered ? 1.1 : 1}
        >
          <Sphere args={[1.65, 64, 64]}>
            <MeshDistortMaterial
              color="#050510"
              emissive="#10B981"
              emissiveIntensity={0.2}
              distort={0.35}
              speed={1.4}
              roughness={0.08}
              metalness={0.92}
            />
          </Sphere>
        </mesh>
      </Float>
      <pointLight color="#10B981" intensity={hovered ? 5 : 2.5} distance={9} />
      <pointLight color="#00E5FF" intensity={1.5} distance={14} position={[3, 2, 2]} />
    </group>
  );
}

// ---- Particle field ----
function ParticleField() {
  const count = 300;
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3]     = (Math.random() - 0.5) * 28;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 28;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 15;
    }
    return arr;
  }, []);

  const geoRef = useRef();
  useFrame(({ clock }) => {
    if (geoRef.current) geoRef.current.rotation.y = clock.getElapsedTime() * 0.018;
  });

  return (
    <points ref={geoRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" array={positions} count={count} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial color="#10B981" size={0.05} transparent opacity={0.45} sizeAttenuation />
    </points>
  );
}

// ---- Forge particles data ----
const PARTICLES = [
  { position: [-4, 1.5, -1.5], color: '#10B981', speed: 0.8,  size: 0.15 },
  { position: [4, -1, -1],     color: '#00E5FF', speed: 1.1,  size: 0.12 },
  { position: [-3, -2, 0.5],   color: '#10B981', speed: 0.65, size: 0.18 },
  { position: [3.5, 2, 0.5],   color: '#00E5FF', speed: 1.3,  size: 0.10 },
  { position: [-2, 3, -1],     color: '#6366F1', speed: 0.9,  size: 0.14 },
  { position: [2.5, -3, 0],    color: '#6366F1', speed: 1.0,  size: 0.11 },
  { position: [0.5, 3.5, 1],   color: '#10B981', speed: 1.2,  size: 0.09 },
  { position: [-4.5, 0, 0.5],  color: '#00E5FF', speed: 0.7,  size: 0.16 },
  { position: [4.5, 1, -0.5],  color: '#FF6B6B', speed: 0.85, size: 0.10 },
  { position: [-1.5, -3.5, 0], color: '#FBBF24', speed: 1.15, size: 0.13 },
];

// ---- Spatial audio ----
function initSpatialAudio() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const o1 = ctx.createOscillator();
    const o2 = ctx.createOscillator();
    const gain = ctx.createGain();
    o1.type = 'sine'; o1.frequency.setValueAtTime(55, ctx.currentTime);
    o1.frequency.exponentialRampToValueAtTime(110, ctx.currentTime + 4);
    o2.type = 'triangle'; o2.frequency.setValueAtTime(82.5, ctx.currentTime);
    o2.frequency.exponentialRampToValueAtTime(165, ctx.currentTime + 4);
    gain.gain.setValueAtTime(0.001, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.04, ctx.currentTime + 2);
    gain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 5);
    o1.connect(gain); o2.connect(gain); gain.connect(ctx.destination);
    o1.start(); o2.start();
    o1.stop(ctx.currentTime + 5.5); o2.stop(ctx.currentTime + 5.5);
    return ctx;
  } catch { return null; }
}

// ---- Full 3D Scene ----
function Scene3D({ onEnter }) {
  return (
    <>
      <Stars radius={55} depth={45} count={2500} factor={2.5} saturation={0} fade speed={0.8} />
      <ambientLight intensity={0.06} />
      <NeonBrickWall />
      <ParticleField />
      {PARTICLES.map((p, i) => <ForgeParticle key={i} {...p} />)}
      <ForgeLogo onClick={onEnter} />
    </>
  );
}

// ---- Neon tube CSS lights (HTML layer) ----
function NeonTubeOverlay() {
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 12 }}>
      {/* Red tube glow */}
      <div style={{
        position: 'absolute',
        top: '8%',
        left: '5%',
        width: '28%',
        height: '3px',
        background: 'linear-gradient(90deg, transparent, #ff3333, #ff5555, #ff3333, transparent)',
        animation: 'neon-red-glow 2s ease-in-out infinite alternate',
        borderRadius: '2px',
      }} />
      {/* White/pink center tube */}
      <div style={{
        position: 'absolute',
        top: '8%',
        left: '37%',
        width: '18%',
        height: '3px',
        background: 'linear-gradient(90deg, transparent, #ff88cc, #ffaadd, #ff88cc, transparent)',
        boxShadow: '0 0 10px #ff88cc, 0 0 30px #ff4499',
        borderRadius: '2px',
      }} />
      {/* Blue tube glow */}
      <div style={{
        position: 'absolute',
        top: '8%',
        right: '5%',
        width: '26%',
        height: '3px',
        background: 'linear-gradient(90deg, transparent, #3399ff, #55aaff, #3399ff, transparent)',
        animation: 'neon-blue-glow 2.4s ease-in-out infinite alternate',
        borderRadius: '2px',
      }} />
      {/* Red light wash from top-left */}
      <div style={{
        position: 'absolute',
        top: 0, left: 0,
        width: '45%', height: '55%',
        background: 'radial-gradient(ellipse at top left, rgba(255,50,50,0.12) 0%, transparent 65%)',
        pointerEvents: 'none',
      }} />
      {/* Blue light wash from top-right */}
      <div style={{
        position: 'absolute',
        top: 0, right: 0,
        width: '45%', height: '55%',
        background: 'radial-gradient(ellipse at top right, rgba(30,120,255,0.12) 0%, transparent 65%)',
        pointerEvents: 'none',
      }} />
    </div>
  );
}

// ---- Main export ----
export default function IntroSequence3D({ onComplete }) {
  const [phase, setPhase] = useState('loading');
  const overlayRef = useRef();
  const audioCtxRef = useRef();

  useEffect(() => {
    const tl = gsap.timeline();
    tl.to({}, { duration: 0.8 })
      .call(() => setPhase('reveal'))
      .to({}, { duration: 1.2 })
      .call(() => setPhase('ready'));
    return () => tl.kill();
  }, []);

  const handleEnter = () => {
    audioCtxRef.current = initSpatialAudio();
    setPhase('exiting');
    gsap.to(overlayRef.current, {
      opacity: 0, duration: 1.2, ease: 'power2.inOut', onComplete,
    });
  };

  const handleSkip = () => { setPhase('exiting'); onComplete(); };

  return (
    <div
      ref={overlayRef}
      style={{ position: 'fixed', inset: 0, zIndex: 9999, background: '#080608', display: 'flex', flexDirection: 'column', cursor: phase === 'ready' ? 'pointer' : 'default' }}
    >
      {/* 3D Canvas */}
      <div style={{ position: 'absolute', inset: 0 }}>
        <Canvas camera={{ position: [0, 0, 8], fov: 56 }} gl={{ antialias: true, alpha: false }} dpr={[1, 2]}>
          <Suspense fallback={null}>
            <Scene3D onEnter={phase === 'ready' ? handleEnter : undefined} />
          </Suspense>
        </Canvas>
      </div>

      {/* HTML Neon tube overlay */}
      <NeonTubeOverlay />

      {/* Scanline effect */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 11,
        background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.025) 2px, rgba(0,0,0,0.025) 4px)',
      }} />

      {/* Vignette */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 11,
        background: 'radial-gradient(ellipse at center, transparent 35%, rgba(4,2,6,0.75) 100%)',
      }} />

      {/* UI Overlay */}
      <div style={{ position: 'relative', zIndex: 20, display: 'flex', flexDirection: 'column', height: '100%', alignItems: 'center', justifyContent: 'space-between', padding: '48px 32px', pointerEvents: 'none' }}>

        {/* Top brand */}
        <AnimatePresence>
          {phase !== 'loading' && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.2 }}
              style={{ display: 'flex', alignItems: 'center', gap: '10px' }}
            >
              <motion.span animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 2, repeat: Infinity }} style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10B981', boxShadow: '0 0 10px #10B981', display: 'inline-block' }} />
              <span style={{ fontSize: '11px', fontFamily: 'monospace', letterSpacing: '0.32em', color: '#10B981', textTransform: 'uppercase', fontWeight: '700' }}>
                Maxx Forge Studio™ — System Core v3.0
              </span>
              <motion.span animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 2, repeat: Infinity, delay: 1 }} style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10B981', boxShadow: '0 0 10px #10B981', display: 'inline-block' }} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Center content */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '28px', textAlign: 'center' }}>
          <AnimatePresence>
            {(phase === 'reveal' || phase === 'ready' || phase === 'exiting') && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, filter: 'blur(14px)' }}
                animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}
              >
                <h1 style={{
                  fontSize: 'clamp(44px, 9vw, 88px)',
                  fontWeight: '900',
                  letterSpacing: '-0.03em',
                  lineHeight: 0.95,
                  color: '#fff',
                  margin: 0,
                  fontFamily: '"Outfit", sans-serif',
                  textShadow: '0 0 60px rgba(255,100,50,0.15)',
                }}>
                  MAXX FORGE<br />
                  <span style={{
                    background: 'linear-gradient(135deg, #10B981 0%, #00E5FF 40%, #6366F1 80%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}>STUDIO™</span>
                </h1>
                <p style={{ fontSize: 'clamp(11px, 1.5vw, 14px)', fontFamily: 'monospace', color: 'rgba(255,255,255,0.38)', letterSpacing: '0.22em', textTransform: 'uppercase', margin: 0 }}>
                  Music · Visuals · Intelligence · Gaming
                </p>
                {/* Neon divider */}
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 0.5, duration: 1 }}
                  style={{ width: '200px', height: '1px', background: 'linear-gradient(90deg, transparent, #ff4444 30%, #3399ff 70%, transparent)', transformOrigin: 'center' }}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Enter CTA */}
          <AnimatePresence>
            {phase === 'ready' && (
              <motion.div
                initial={{ opacity: 0, y: 22 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', pointerEvents: 'auto' }}
              >
                <button
                  id="intro-enter-btn"
                  onClick={handleEnter}
                  style={{
                    position: 'relative',
                    padding: '16px 42px',
                    background: 'transparent',
                    border: '1px solid rgba(16,185,129,0.55)',
                    borderRadius: '16px',
                    color: '#10B981',
                    fontFamily: 'monospace',
                    fontWeight: '700',
                    letterSpacing: '0.22em',
                    fontSize: '13px',
                    textTransform: 'uppercase',
                    cursor: 'pointer',
                    overflow: 'hidden',
                    transition: 'all 0.4s',
                    boxShadow: '0 0 20px rgba(16,185,129,0.15)',
                  }}
                  onMouseEnter={e => { e.target.style.background = 'rgba(16,185,129,0.1)'; e.target.style.boxShadow = '0 0 40px rgba(16,185,129,0.35)'; }}
                  onMouseLeave={e => { e.target.style.background = 'transparent'; e.target.style.boxShadow = '0 0 20px rgba(16,185,129,0.15)'; }}
                >
                  [ ENTER THE MATRIX ]
                </button>
                <span style={{ fontSize: '11px', fontFamily: 'monospace', color: 'rgba(255,255,255,0.2)', letterSpacing: '0.12em' }}>
                  — or click the forge sphere above —
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Bottom row */}
        <AnimatePresence>
          {phase !== 'loading' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.7 }}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', maxWidth: '700px', pointerEvents: 'auto' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'inline-block' }} />
                <span style={{ fontSize: '10px', fontFamily: 'monospace', color: 'rgba(255,255,255,0.22)', letterSpacing: '0.2em', textTransform: 'uppercase' }}>maxxforgestudio.com</span>
              </div>
              <div style={{ display: 'flex', gap: '16px', fontSize: '10px', fontFamily: 'monospace', color: 'rgba(255,255,255,0.18)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                <span>3D Engine: Three.js</span>
                <span>·</span>
                <span>Aries AI v4.0</span>
              </div>
              <button
                id="intro-skip-btn"
                onClick={handleSkip}
                style={{ fontSize: '10px', fontFamily: 'monospace', color: 'rgba(255,255,255,0.22)', background: 'none', border: 'none', cursor: 'pointer', letterSpacing: '0.18em', textTransform: 'uppercase', transition: 'color 0.2s' }}
                onMouseEnter={e => e.target.style.color = 'rgba(255,255,255,0.55)'}
                onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.22)'}
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
