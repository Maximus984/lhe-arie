import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext.jsx';
import { Eye, EyeOff, Lock, User, AlertCircle, UserPlus, Globe, Sparkles, Fingerprint, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import LottiePlayer from '../components/LottiePlayer.jsx';

// =====================================================
// MAXX FORGE STUDIO™ — Login / Register / Guest page
// =====================================================

// ---- Animated Splash ----
function WelcomeSplash({ onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 3200);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.04 }}
      transition={{ duration: 0.6 }}
      onClick={onDone}
      style={splashStyles.page}
    >
      <div style={splashStyles.noise} />
      <motion.div
        initial={{ opacity: 0, scale: 0.7 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.4, ease: 'easeOut' }}
        style={splashStyles.glow}
      />
      <div style={splashStyles.content}>
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.85 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
        >
          <div style={splashStyles.logoRing}>
            <div style={splashStyles.logoInnerRing}>
              <LottiePlayer
                src="/animations/glowing-fish-loader.json"
                className="w-48 h-48 scale-110"
              />
            </div>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.7 }} style={splashStyles.textBlock}>
          <p style={splashStyles.welcomeTo}>WELCOME TO</p>
          <h1 style={splashStyles.studioName}>
            MAXX FORGE<br />
            <span style={splashStyles.studioNameAccent}>STUDIO</span>
            <span style={splashStyles.trademark}>™</span>
          </h1>
          <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 0.8, delay: 1.1 }} style={splashStyles.divider} />
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.4, duration: 0.6 }} style={splashStyles.tagline}>
            Built on imagination. We value yours.
          </motion.p>
        </motion.div>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: [0, 0.4, 0.4, 0] }} transition={{ delay: 2, duration: 1.2, repeat: Infinity }} style={splashStyles.tapHint}>
          Tap anywhere to continue
        </motion.p>
      </div>
    </motion.div>
  );
}

// ---- Avatar emoji picker ----
const AVATAR_EMOJIS = ['🎵','🎮','🤖','🔥','⚡','🎸','🎧','🎤','💻','🌊','⭐','🦁','🐉','🦊','👾','🎯','💎','🔮','🌙','🚀','🎨','🏆','💜','🌟','🎄','🎃'];

function AvatarPicker({ selected, onSelect }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', justifyContent: 'center' }}>
      {AVATAR_EMOJIS.map(e => (
        <motion.button
          key={e}
          type="button"
          whileHover={{ scale: 1.2 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => onSelect(e)}
          style={{
            width: '34px', height: '34px',
            borderRadius: '8px',
            border: selected === e ? '1.5px solid rgba(180,160,100,0.7)' : '1.5px solid rgba(255,255,255,0.06)',
            background: selected === e ? 'rgba(180,160,100,0.15)' : 'rgba(255,255,255,0.03)',
            fontSize: '16px',
            cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.15s',
          }}
        >
          {e}
        </motion.button>
      ))}
    </div>
  );
}

// ---- Guest banner shown on dashboard ----
export function GuestBanner({ onRegister }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 16px',
        background: 'linear-gradient(90deg, rgba(251,191,36,0.08), rgba(251,191,36,0.04))',
        border: '1px solid rgba(251,191,36,0.2)',
        borderRadius: '12px',
        marginBottom: '12px',
        gap: '12px',
        flexWrap: 'wrap',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Globe size={14} color="#FBBF24" />
        <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', fontFamily: 'monospace' }}>
          You're browsing as a <strong style={{ color: '#FBBF24' }}>Guest</strong>. Create an account to save progress and unlock all features.
        </span>
      </div>
      <button
        onClick={onRegister}
        style={{
          padding: '6px 14px', borderRadius: '8px',
          background: 'rgba(251,191,36,0.15)',
          border: '1px solid rgba(251,191,36,0.3)',
          color: '#FBBF24', fontSize: '11px', fontFamily: 'monospace',
          fontWeight: '700', letterSpacing: '0.1em', textTransform: 'uppercase',
          cursor: 'pointer', whiteSpace: 'nowrap',
        }}
      >
        Create Account →
      </button>
    </motion.div>
  );
}

// ---- Main Login Component ----
export default function Login() {
  const { login, registerMember, guestLogin } = useAuth();
  const navigate = useNavigate();
  const [showSplash, setShowSplash] = useState(true);
  const [tab, setTab] = useState('login'); // 'login' | 'register'

  // Login state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loadingLogin, setLoadingLogin] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Register state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regPassConf, setRegPassConf] = useState('');
  const [regAvatar, setRegAvatar] = useState('🎵');
  const [showRegPass, setShowRegPass] = useState(false);
  const [loadingReg, setLoadingReg] = useState(false);
  const [regError, setRegError] = useState('');
  const [regStep, setRegStep] = useState(1); // 1 = form, 2 = avatar picker

  // Biometric States
  const [biometricScan, setBiometricScan] = useState(false);
  const [biometricStatus, setBiometricStatus] = useState('READY'); // READY | SELECTING | SCANNING | SUCCESS
  const [selectedBiometricUser, setSelectedBiometricUser] = useState(null);

  const handleBiometricClick = () => {
    setBiometricScan(true);
    setBiometricStatus('SELECTING');
  };

  const triggerBiometricScan = async (userType) => {
    setSelectedBiometricUser(userType);
    setBiometricStatus('SCANNING');
    
    await new Promise(resolve => setTimeout(resolve, 1800));
    
    let result;
    if (userType === 'founder') {
      result = await login('founder@maxxforge.com', 'founder2026');
    } else if (userType === 'staff') {
      result = await login('staff@maxxforge.com', 'staff2026');
    } else {
      result = await login('member@maxxforge.com', 'member2026');
    }

    if (result.success) {
      setBiometricStatus('SUCCESS');
      await new Promise(resolve => setTimeout(resolve, 800));
      setBiometricScan(false);
      toast.success(`Biometric Signature Verified! Welcome, ${result.user.name}.`);
      navigate('/dashboard');
    } else {
      setBiometricStatus('READY');
      toast.error('Passkey signature validation error.');
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) { setLoginError('Please fill in all fields.'); return; }
    setLoadingLogin(true); setLoginError('');
    const result = await login(email, password);
    setLoadingLogin(false);
    if (result.success) {
      toast.success(`Welcome back, ${result.user.name}!`);
      navigate('/dashboard');
    } else {
      setLoginError(result.error);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (regStep === 1) {
      if (!regName.trim() || !regEmail || !regPassword) { setRegError('Please fill in all fields.'); return; }
      if (regPassword !== regPassConf) { setRegError('Passwords do not match.'); return; }
      if (regPassword.length < 6) { setRegError('Password must be at least 6 characters.'); return; }
      setRegError('');
      setRegStep(2);
      return;
    }
    // Step 2: finalize
    setLoadingReg(true); setRegError('');
    const result = await registerMember(regName, regEmail, regPassword, regAvatar);
    setLoadingReg(false);
    if (result.success) {
      toast.success(`🎉 Welcome to the Forge, ${result.user.name}!`);
      navigate('/dashboard');
    } else {
      setRegError(result.error);
      setRegStep(1);
    }
  };

  const handleGuest = () => {
    const result = guestLogin();
    if (result.success) {
      toast(`Welcome, ${result.user.name}! You have limited access as a guest.`, { icon: '🌐', duration: 5000 });
      navigate('/dashboard');
    }
  };

  return (
    <div style={styles.page}>
      <AnimatePresence mode="wait">
        {showSplash ? (
          <WelcomeSplash key="splash" onDone={() => setShowSplash(false)} />
        ) : (
          <motion.div
            key="login-layout"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            style={styles.layout}
          >
            <div style={styles.marbleOverlay} />

            {/* Left: Logo panel */}
            <div style={styles.leftPanel}>
              <motion.div
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.9, ease: 'easeOut' }}
                style={styles.logoContainer}
              >
                <div style={styles.outerRing}>
                  <div style={styles.innerRing}>
                    <img src="/brand/logo.png" alt="Maxx Forge Studio Logo" style={{ width: '260px', height: '260px', objectFit: 'contain', filter: 'drop-shadow(0 0 30px rgba(0, 229, 255, 0.45))' }} />
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Right: Form panel */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, ease: 'easeOut', delay: 0.15 }}
              style={styles.rightPanel}
            >
              {/* Brand title */}
              <div style={styles.brandBlock}>
                <h1 style={styles.brandTitle}>MAXX FORGE<br />STUDIO</h1>
                <div style={styles.brandDivider}>
                  <div style={styles.dividerLine} />
                  <span style={styles.dividerStar}>✦</span>
                  <div style={styles.dividerLine} />
                </div>
              </div>

              {/* Tab switcher */}
              <div style={styles.tabRow}>
                <button
                  id="tab-login"
                  onClick={() => { setTab('login'); setLoginError(''); }}
                  style={{ ...styles.tab, ...(tab === 'login' ? styles.tabActive : {}) }}
                >
                  <Lock size={12} /> Login
                </button>
                <button
                  id="tab-register"
                  onClick={() => { setTab('register'); setRegError(''); setRegStep(1); }}
                  style={{ ...styles.tab, ...(tab === 'register' ? styles.tabActive : {}) }}
                >
                  <UserPlus size={12} /> Create Account
                </button>
              </div>

              {/* Card */}
              <div style={styles.card}>
                <AnimatePresence mode="wait">

                  {/* ── LOGIN FORM ── */}
                  {tab === 'login' && (
                    <motion.div key="login-form" initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 15 }} transition={{ duration: 0.3 }}>
                      <div style={styles.cardHeader}>
                        <h2 style={styles.welcomeTitle}>WELCOME BACK</h2>
                        <p style={styles.welcomeSub}>Sign in to your account</p>
                      </div>

                      <AnimatePresence>
                        {loginError && (
                          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} style={styles.errorBox}>
                            <AlertCircle size={14} color="#f87171" />
                            <span style={{ color: '#fca5a5', fontSize: '12px' }}>{loginError}</span>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <form onSubmit={handleLogin} style={styles.form}>
                        <div style={styles.inputWrapper}>
                          <User size={15} color="#888" style={styles.inputIcon} />
                          <input id="login-email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email address" autoComplete="email" style={styles.input}
                            onFocus={e => e.target.style.borderColor = 'rgba(180,160,100,0.5)'}
                            onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                          />
                        </div>
                        <div style={styles.inputWrapper}>
                          <Lock size={15} color="#888" style={styles.inputIcon} />
                          <input id="login-password" type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" autoComplete="current-password" style={{ ...styles.input, paddingRight: '44px' }}
                            onFocus={e => e.target.style.borderColor = 'rgba(180,160,100,0.5)'}
                            onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                          />
                          <button type="button" onClick={() => setShowPass(v => !v)} style={styles.eyeBtn}>
                            {showPass ? <EyeOff size={15} color="#666" /> : <Eye size={15} color="#666" />}
                          </button>
                        </div>
                        <motion.button id="login-submit" type="submit" disabled={loadingLogin} whileHover={{ scale: loadingLogin ? 1 : 1.02 }} whileTap={{ scale: loadingLogin ? 1 : 0.98 }} style={styles.loginBtn}>
                          {loadingLogin ? <div style={styles.spinner} /> : <span style={styles.loginBtnText}>LOGIN</span>}
                        </motion.button>
                      </form>

                      <motion.button
                        id="biometric-login-btn"
                        type="button"
                        onClick={handleBiometricClick}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        style={{ ...styles.biometricBtn, marginTop: '8px' }}
                      >
                        <Fingerprint size={13} />
                        SIGN IN WITH BIOMETRICS / PASSKEY
                      </motion.button>

                      <div style={styles.orRow}>
                        <div style={styles.orLine} /><span style={styles.orText}>OR</span><div style={styles.orLine} />
                      </div>

                      {/* Guest button */}
                      <motion.button
                        id="guest-login-btn"
                        onClick={handleGuest}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        style={styles.guestBtn}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(251,191,36,0.3)'; e.currentTarget.style.color = 'rgba(251,191,36,0.7)'; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = 'rgba(255,255,255,0.35)'; }}
                      >
                        <Globe size={13} />
                        <span style={{ fontSize: '11px', fontWeight: '700', letterSpacing: '0.15em', textTransform: 'uppercase', fontFamily: 'monospace' }}>
                          ENTER AS GUEST
                        </span>
                      </motion.button>

                      <button id="forgot-password-btn"
                        onClick={() => toast('Contact an admin to reset your password.', { icon: '🔑' })}
                        style={styles.forgotBtn}
                        onMouseEnter={e => { e.target.style.borderColor = 'rgba(255,255,255,0.2)'; e.target.style.color = 'rgba(255,255,255,0.6)'; }}
                        onMouseLeave={e => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; e.target.style.color = 'rgba(255,255,255,0.4)'; }}
                      >
                        FORGOT PASSWORD?
                      </button>
                    </motion.div>
                  )}

                  {/* ── REGISTER FORM ── */}
                  {tab === 'register' && (
                    <motion.div key="register-form" initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -15 }} transition={{ duration: 0.3 }}>
                      <div style={styles.cardHeader}>
                        <h2 style={styles.welcomeTitle}>{regStep === 1 ? 'JOIN THE FORGE' : 'CHOOSE YOUR AVATAR'}</h2>
                        <p style={styles.welcomeSub}>{regStep === 1 ? 'Create your free account' : 'Pick an emoji to represent you'}</p>
                        {/* Step indicator */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginTop: '8px' }}>
                          {[1, 2].map(s => (
                            <div key={s} style={{ width: s === regStep ? '18px' : '6px', height: '6px', borderRadius: '3px', background: s === regStep ? 'rgba(180,160,100,0.8)' : 'rgba(255,255,255,0.15)', transition: 'all 0.3s' }} />
                          ))}
                        </div>
                      </div>

                      <AnimatePresence>
                        {regError && (
                          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} style={styles.errorBox}>
                            <AlertCircle size={14} color="#f87171" />
                            <span style={{ color: '#fca5a5', fontSize: '12px' }}>{regError}</span>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <AnimatePresence mode="wait">
                        {regStep === 1 ? (
                          <motion.form key="step1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onSubmit={handleRegister} style={styles.form}>
                            <div style={styles.inputWrapper}>
                              <User size={15} color="#888" style={styles.inputIcon} />
                              <input id="reg-name" type="text" value={regName} onChange={e => setRegName(e.target.value)} placeholder="Display Name" maxLength={32} style={styles.input}
                                onFocus={e => e.target.style.borderColor = 'rgba(180,160,100,0.5)'}
                                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                              />
                            </div>
                            <div style={styles.inputWrapper}>
                              <User size={15} color="#888" style={styles.inputIcon} />
                              <input id="reg-email" type="email" value={regEmail} onChange={e => setRegEmail(e.target.value)} placeholder="Email address" autoComplete="email" style={styles.input}
                                onFocus={e => e.target.style.borderColor = 'rgba(180,160,100,0.5)'}
                                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                              />
                            </div>
                            <div style={styles.inputWrapper}>
                              <Lock size={15} color="#888" style={styles.inputIcon} />
                              <input id="reg-password" type={showRegPass ? 'text' : 'password'} value={regPassword} onChange={e => setRegPassword(e.target.value)} placeholder="Password (min 6 chars)" style={{ ...styles.input, paddingRight: '44px' }}
                                onFocus={e => e.target.style.borderColor = 'rgba(180,160,100,0.5)'}
                                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                              />
                              <button type="button" onClick={() => setShowRegPass(v => !v)} style={styles.eyeBtn}>
                                {showRegPass ? <EyeOff size={15} color="#666" /> : <Eye size={15} color="#666" />}
                              </button>
                            </div>
                            <div style={styles.inputWrapper}>
                              <Lock size={15} color="#888" style={styles.inputIcon} />
                              <input id="reg-password-confirm" type="password" value={regPassConf} onChange={e => setRegPassConf(e.target.value)} placeholder="Confirm password" style={styles.input}
                                onFocus={e => e.target.style.borderColor = 'rgba(180,160,100,0.5)'}
                                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                              />
                            </div>
                            <motion.button id="reg-next-btn" type="submit" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} style={styles.loginBtn}>
                              <span style={{ ...styles.loginBtnText, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Sparkles size={14} /> NEXT: CHOOSE AVATAR
                              </span>
                            </motion.button>
                          </motion.form>
                        ) : (
                          <motion.form key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} onSubmit={handleRegister} style={{ ...styles.form, gap: '16px' }}>
                            {/* Preview */}
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                              <motion.div
                                animate={{ scale: [1, 1.08, 1] }}
                                transition={{ duration: 2, repeat: Infinity }}
                                style={{ width: '64px', height: '64px', borderRadius: '18px', background: 'rgba(255,255,255,0.06)', border: '1.5px solid rgba(180,160,100,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px' }}
                              >
                                {regAvatar}
                              </motion.div>
                              <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', fontFamily: 'monospace' }}>{regName}</span>
                            </div>

                            <AvatarPicker selected={regAvatar} onSelect={setRegAvatar} />

                            <div style={{ display: 'flex', gap: '8px' }}>
                              <button
                                type="button"
                                onClick={() => setRegStep(1)}
                                style={{ flex: 1, padding: '12px', borderRadius: '8px', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.4)', fontSize: '11px', fontFamily: 'monospace', fontWeight: '700', letterSpacing: '0.15em', textTransform: 'uppercase', cursor: 'pointer' }}
                              >
                                ← BACK
                              </button>
                              <motion.button
                                id="reg-submit-btn"
                                type="submit"
                                disabled={loadingReg}
                                whileHover={{ scale: loadingReg ? 1 : 1.02 }}
                                whileTap={{ scale: loadingReg ? 1 : 0.98 }}
                                style={{ ...styles.loginBtn, flex: 2 }}
                              >
                                {loadingReg ? <div style={styles.spinner} /> : <span style={styles.loginBtnText}>CREATE ACCOUNT 🔥</span>}
                              </motion.button>
                            </div>
                          </motion.form>
                        )}
                      </AnimatePresence>

                      <div style={{ marginTop: '16px', textAlign: 'center' }}>
                        <button onClick={() => setTab('login')} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', fontSize: '11px', fontFamily: 'monospace', cursor: 'pointer', letterSpacing: '0.08em' }}>
                          Already have an account? Sign in →
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
      {/* Biometric Scanning Simulation Modal Overlay */}
      <AnimatePresence>
        {biometricScan && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-xl p-4"
          >
            <motion.div
              initial={{ scale: 0.92, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.92, y: 15 }}
              className="w-full max-w-sm bg-neutral-905 border border-white/10 rounded-3xl p-6 flex flex-col items-center gap-6 text-center shadow-2xl relative overflow-hidden"
              style={{ background: 'rgba(12, 12, 16, 0.96)' }}
            >
              {/* Animated scanning rings backplate */}
              <div className="absolute inset-0 bg-radial-gradient from-cyan-500/5 to-transparent pointer-events-none" />

              {/* Close Button */}
              {biometricStatus !== 'SCANNING' && (
                <button
                  onClick={() => setBiometricScan(false)}
                  className="absolute top-4 right-4 p-1.5 hover:bg-white/5 rounded-lg text-white/40 hover:text-white transition"
                >
                  <X size={15} />
                </button>
              )}

              {/* Biometric Status Icon/Animation */}
              <div className="relative w-28 h-28 flex items-center justify-center mt-2">
                <div className="absolute inset-0 rounded-full border border-cyan-500/20 animate-ping" style={{ animationDuration: '3s' }} />
                <div className="absolute inset-2 rounded-full border border-cyan-500/10 animate-pulse" />
                
                {biometricStatus === 'SCANNING' ? (
                  <div className="text-cyan-400 animate-pulse flex flex-col items-center justify-center">
                    <Fingerprint size={48} className="animate-bounce" />
                    <div className="absolute bottom-[-15px] text-[8px] font-mono tracking-widest text-cyan-400/60 uppercase">SCANNING...</div>
                  </div>
                ) : biometricStatus === 'SUCCESS' ? (
                  <div className="text-emerald-400 scale-110 transition duration-300">
                    <CheckCircle2 size={54} />
                  </div>
                ) : (
                  <div className="text-cyan-500/80">
                    <Fingerprint size={48} />
                  </div>
                )}
              </div>

              {/* Text Context */}
              <div>
                <h3 className="text-sm font-display font-bold uppercase tracking-wider text-white">
                  {biometricStatus === 'SELECTING' ? 'Select passkey credentials' : biometricStatus === 'SCANNING' ? 'Verifying secure identity' : 'Authentication Successful'}
                </h3>
                <p className="text-[10px] font-mono text-white/40 mt-1">
                  {biometricStatus === 'SELECTING' ? 'Select a saved biometric profile simulation' : biometricStatus === 'SCANNING' ? `Simulating WebAuthn key sweep for ${selectedBiometricUser.toUpperCase()}` : 'Enclave signature verified successfully.'}
                </p>
              </div>

              {/* Option Grid */}
              {biometricStatus === 'SELECTING' && (
                <div className="flex flex-col gap-2 w-full mt-2">
                  {[
                    { id: 'founder', name: 'Founder Profile', details: 'Face ID · founder@maxxforge.com' },
                    { id: 'staff', name: 'Staff Profile', details: 'Fingerprint · staff@maxxforge.com' },
                    { id: 'member', name: 'Member Profile', details: 'Touch ID · member@maxxforge.com' }
                  ].map(user => (
                    <button
                      key={user.id}
                      onClick={() => triggerBiometricScan(user.id)}
                      className="w-full p-3 bg-white/3 border border-white/5 hover:border-cyan-500/40 rounded-2xl text-left hover:bg-white/5 transition flex justify-between items-center group"
                    >
                      <div>
                        <p className="text-xs font-bold text-white group-hover:text-cyan-300 transition">{user.name}</p>
                        <p className="text-[9px] font-mono text-white/30 mt-0.5">{user.details}</p>
                      </div>
                      <span className="text-[9px] font-mono text-cyan-400 opacity-0 group-hover:opacity-100 transition font-bold">Scan →</span>
                    </button>
                  ))}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Splash Styles ── */
const splashStyles = {
  page: { position: 'fixed', inset: 0, background: '#0a0a0c', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', overflow: 'hidden', zIndex: 100, fontFamily: "'Inter', sans-serif" },
  noise: { position: 'absolute', inset: 0, opacity: 0.05, pointerEvents: 'none', backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")` },
  glow: { position: 'absolute', width: '600px', height: '600px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(180,160,80,0.08) 0%, transparent 70%)', pointerEvents: 'none' },
  content: { position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '32px' },
  logoRing: { width: '280px', height: '280px', borderRadius: '50%', border: '1.5px solid rgba(180,160,100,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'radial-gradient(circle, rgba(25,22,18,0.9) 0%, rgba(8,8,10,0.98) 70%)', boxShadow: '0 0 60px rgba(180,160,80,0.1), inset 0 0 40px rgba(0,0,0,0.5)' },
  logoInnerRing: { width: '230px', height: '230px', borderRadius: '50%', border: '1px solid rgba(180,160,100,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  textBlock: { textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' },
  welcomeTo: { fontSize: '12px', letterSpacing: '0.35em', color: 'rgba(180,160,100,0.7)', fontWeight: '600', textTransform: 'uppercase', margin: 0 },
  studioName: { fontSize: 'clamp(36px, 8vw, 56px)', fontWeight: '800', letterSpacing: '0.12em', lineHeight: 1.1, background: 'linear-gradient(135deg, #e0e0e0 0%, #a0a0a0 40%, #c8c8c8 60%, #888 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', margin: 0 },
  studioNameAccent: { background: 'linear-gradient(135deg, #d4c080 0%, #a08040 50%, #c8a855 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' },
  trademark: { fontSize: '0.4em', verticalAlign: 'super', color: 'rgba(180,160,100,0.6)', WebkitTextFillColor: 'rgba(180,160,100,0.6)' },
  divider: { width: '120px', height: '1px', background: 'linear-gradient(90deg, transparent, rgba(180,160,100,0.5), transparent)', transformOrigin: 'left' },
  tagline: { fontSize: '13px', color: 'rgba(255,255,255,0.35)', letterSpacing: '0.05em', fontStyle: 'italic', margin: 0 },
  tapHint: { fontSize: '11px', color: 'rgba(255,255,255,0.2)', letterSpacing: '0.1em', textTransform: 'uppercase', margin: 0 },
};

/* ── Login Form Styles ── */
const styles = {
  page: { minHeight: '100vh', backgroundColor: '#0d0d0f', fontFamily: "'Inter','Helvetica Neue',sans-serif", overflow: 'hidden' },
  layout: { minHeight: '100vh', background: '#0d0d0f', backgroundImage: 'radial-gradient(ellipse at 20% 50%, rgba(30,28,26,0.8) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(20,18,16,0.6) 0%, transparent 50%)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' },
  marbleOverlay: { position: 'absolute', inset: 0, backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='600'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.08'/%3E%3C/svg%3E")`, backgroundSize: '600px 600px', opacity: 0.6, pointerEvents: 'none' },
  leftPanel: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', zIndex: 1, padding: '40px' },
  logoContainer: { display: 'flex', alignItems: 'center', justifyContent: 'center' },
  outerRing: { width: '360px', height: '360px', borderRadius: '50%', border: '1.5px solid rgba(180,160,100,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 60px rgba(180,160,80,0.12), inset 0 0 40px rgba(0,0,0,0.5)', background: 'radial-gradient(circle, rgba(25,22,18,0.9) 0%, rgba(10,10,12,0.95) 70%)', position: 'relative' },
  innerRing: { width: '290px', height: '290px', borderRadius: '50%', border: '1px solid rgba(180,160,100,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  rightPanel: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center', padding: '60px 80px 60px 40px', maxWidth: '540px', position: 'relative', zIndex: 1 },
  brandBlock: { marginBottom: '20px' },
  brandTitle: { fontSize: 'clamp(30px, 4vw, 44px)', fontWeight: '800', letterSpacing: '0.18em', lineHeight: 1.15, color: 'transparent', background: 'linear-gradient(135deg, #e0e0e0 0%, #a0a0a0 40%, #c8c8c8 60%, #888 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', margin: 0, textTransform: 'uppercase' },
  brandDivider: { display: 'flex', alignItems: 'center', gap: '10px', marginTop: '14px' },
  dividerLine: { flex: 1, maxWidth: '80px', height: '1px', background: 'linear-gradient(90deg, transparent, rgba(180,160,100,0.5), transparent)' },
  dividerStar: { color: 'rgba(180,160,100,0.7)', fontSize: '14px' },
  // Tabs
  tabRow: { display: 'flex', gap: '6px', marginBottom: '14px', width: '100%', maxWidth: '400px' },
  tab: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '9px 14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)', background: 'transparent', color: 'rgba(255,255,255,0.35)', fontSize: '11px', fontFamily: 'monospace', fontWeight: '700', letterSpacing: '0.12em', textTransform: 'uppercase', cursor: 'pointer', transition: 'all 0.2s' },
  tabActive: { background: 'rgba(180,160,100,0.1)', borderColor: 'rgba(180,160,100,0.3)', color: 'rgba(180,160,100,0.9)' },
  // Card
  card: { width: '100%', maxWidth: '400px', backgroundColor: 'rgba(18,16,14,0.85)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '28px', backdropFilter: 'blur(16px)', boxShadow: '0 8px 40px rgba(0,0,0,0.6)' },
  cardHeader: { textAlign: 'center', marginBottom: '20px' },
  welcomeTitle: { fontSize: '16px', fontWeight: '700', letterSpacing: '0.2em', color: '#e0e0e0', margin: '0 0 5px 0' },
  welcomeSub: { fontSize: '11px', color: 'rgba(255,255,255,0.35)', margin: 0, letterSpacing: '0.04em' },
  errorBox: { display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '8px', padding: '10px 12px', marginBottom: '14px' },
  form: { display: 'flex', flexDirection: 'column', gap: '11px' },
  inputWrapper: { position: 'relative', display: 'flex', alignItems: 'center' },
  inputIcon: { position: 'absolute', left: '14px', pointerEvents: 'none', zIndex: 1 },
  input: { width: '100%', padding: '12px 14px 12px 42px', backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#ccc', fontSize: '13px', outline: 'none', transition: 'border-color 0.2s', boxSizing: 'border-box', fontFamily: "'Inter',sans-serif" },
  eyeBtn: { position: 'absolute', right: '14px', background: 'none', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center' },
  loginBtn: { width: '100%', padding: '13px', marginTop: '4px', background: 'linear-gradient(135deg, #4a4a4a 0%, #2a2a2a 40%, #3a3a3a 60%, #1a1a1a 100%)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 12px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)' },
  loginBtnText: { fontSize: '12px', fontWeight: '700', letterSpacing: '0.25em', color: '#d0d0d0', textTransform: 'uppercase' },
  spinner: { width: '18px', height: '18px', border: '2px solid rgba(255,255,255,0.15)', borderTop: '2px solid #aaa', borderRadius: '50%', animation: 'spin 0.8s linear infinite' },
  orRow: { display: 'flex', alignItems: 'center', gap: '12px', margin: '16px 0 12px' },
  orLine: { flex: 1, height: '1px', backgroundColor: 'rgba(255,255,255,0.07)' },
  orText: { fontSize: '11px', color: 'rgba(255,255,255,0.25)', letterSpacing: '0.12em' },
  guestBtn: { width: '100%', padding: '12px', marginBottom: '10px', background: 'transparent', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', color: 'rgba(255,255,255,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer', transition: 'all 0.2s' },
  biometricBtn: { width: '100%', padding: '12px', marginBottom: '10px', background: 'rgba(0, 229, 255, 0.05)', border: '1px solid rgba(0, 229, 255, 0.25)', borderRadius: '8px', color: '#00e5ff', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer', transition: 'all 0.2s', fontSize: '10px', fontWeight: 'bold', letterSpacing: '0.1em' },
  forgotBtn: { width: '100%', padding: '12px', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'rgba(255,255,255,0.4)', fontSize: '11px', fontWeight: '600', letterSpacing: '0.18em', textTransform: 'uppercase', cursor: 'pointer', transition: 'all 0.2s', fontFamily: "'Inter',sans-serif" },
};

// Inject spinner keyframe
if (typeof document !== 'undefined' && !document.getElementById('login-styles')) {
  const s = document.createElement('style');
  s.id = 'login-styles';
  s.textContent = `@keyframes spin{to{transform:rotate(360deg)}} input::placeholder{color:rgba(255,255,255,0.28)!important} @media(max-width:768px){.login-left-panel{display:none!important}}`;
  document.head.appendChild(s);
}
