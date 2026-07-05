import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext.jsx';
import { Eye, EyeOff, Lock, User, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';


// ── Animated intro splash screen ──
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
      {/* Noise texture */}
      <div style={splashStyles.noise} />

      {/* Radial glow */}
      <motion.div
        initial={{ opacity: 0, scale: 0.7 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.4, ease: 'easeOut' }}
        style={splashStyles.glow}
      />

      {/* Content */}
      <div style={splashStyles.content}>
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.85 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
        >
          <div style={splashStyles.logoRing}>
            <div style={splashStyles.logoInnerRing}>
              <img 
                src="/brand/logo.png" 
                alt="Maxx Forge Studio Logo" 
                style={{ width: '220px', height: '220px', objectFit: 'contain', filter: 'drop-shadow(0 0 20px rgba(0, 229, 255, 0.4))' }} 
              />
            </div>
          </div>
        </motion.div>

        {/* Welcome text */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.7 }}
          style={splashStyles.textBlock}
        >
          <p style={splashStyles.welcomeTo}>WELCOME TO</p>
          <h1 style={splashStyles.studioName}>
            MAXX FORGE<br/>
            <span style={splashStyles.studioNameAccent}>STUDIO</span>
            <span style={splashStyles.trademark}>™</span>
          </h1>
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.8, delay: 1.1 }}
            style={splashStyles.divider}
          />
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.4, duration: 0.6 }}
            style={splashStyles.tagline}
          >
            Built on imagination. We value yours.
          </motion.p>
        </motion.div>

        {/* Tap hint */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.4, 0.4, 0] }}
          transition={{ delay: 2, duration: 1.2, repeat: Infinity }}
          style={splashStyles.tapHint}
        >
          Tap anywhere to continue
        </motion.p>
      </div>
    </motion.div>
  );
}

// ── Main Login component ──
export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [showSplash, setShowSplash] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
      toast.success(`Welcome back, ${result.user.name}!`);
      navigate('/dashboard');
    } else {
      setError(result.error);
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
            {/* Marble texture */}
            <div style={styles.marbleOverlay} />

            {/* Left: Logo */}
            <div style={styles.leftPanel}>
              <motion.div
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.9, ease: 'easeOut' }}
                style={styles.logoContainer}
              >
                <div style={styles.outerRing}>
                  <div style={styles.innerRing}>
                    <img 
                      src="/brand/logo.png" 
                      alt="Maxx Forge Studio Logo" 
                      style={{ width: '260px', height: '260px', objectFit: 'contain', filter: 'drop-shadow(0 0 30px rgba(0, 229, 255, 0.45))' }} 
                    />
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Right: Form */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, ease: 'easeOut', delay: 0.15 }}
              style={styles.rightPanel}
            >
              {/* Brand title */}
              <div style={styles.brandBlock}>
                <h1 style={styles.brandTitle}>MAXX FORGE<br/>STUDIO</h1>
                <div style={styles.brandDivider}>
                  <div style={styles.dividerLine}/>
                  <span style={styles.dividerStar}>✦</span>
                  <div style={styles.dividerLine}/>
                </div>
              </div>

              {/* Card */}
              <div style={styles.card}>
                <div style={styles.cardHeader}>
                  <h2 style={styles.welcomeTitle}>WELCOME BACK</h2>
                  <p style={styles.welcomeSub}>Sign in to your account</p>
                </div>

                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      style={styles.errorBox}
                    >
                      <AlertCircle size={14} color="#f87171" />
                      <span style={{ color: '#fca5a5', fontSize: '12px' }}>{error}</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                <form onSubmit={handleLogin} style={styles.form}>
                  <div style={styles.inputWrapper}>
                    <User size={15} color="#888" style={styles.inputIcon} />
                    <input
                      id="login-email"
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="Email / Username"
                      autoComplete="email"
                      style={styles.input}
                      onFocus={e => e.target.style.borderColor = 'rgba(180,160,100,0.5)'}
                      onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                    />
                  </div>

                  <div style={styles.inputWrapper}>
                    <Lock size={15} color="#888" style={styles.inputIcon} />
                    <input
                      id="login-password"
                      type={showPass ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="Password"
                      autoComplete="current-password"
                      style={{ ...styles.input, paddingRight: '44px' }}
                      onFocus={e => e.target.style.borderColor = 'rgba(180,160,100,0.5)'}
                      onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                    />
                    <button type="button" onClick={() => setShowPass(v => !v)} style={styles.eyeBtn}>
                      {showPass ? <EyeOff size={15} color="#666"/> : <Eye size={15} color="#666"/>}
                    </button>
                  </div>

                  <motion.button
                    id="login-submit"
                    type="submit"
                    disabled={loading}
                    whileHover={{ scale: loading ? 1 : 1.02 }}
                    whileTap={{ scale: loading ? 1 : 0.98 }}
                    style={styles.loginBtn}
                  >
                    {loading
                      ? <div style={styles.spinner} />
                      : <span style={styles.loginBtnText}>LOGIN</span>
                    }
                  </motion.button>
                </form>

                <div style={styles.orRow}>
                  <div style={styles.orLine}/><span style={styles.orText}>OR</span><div style={styles.orLine}/>
                </div>

                <button
                  id="forgot-password-btn"
                  onClick={() => toast('Contact an admin to reset your password.', { icon: '🔑' })}
                  style={styles.forgotBtn}
                  onMouseEnter={e => { e.target.style.borderColor='rgba(255,255,255,0.2)'; e.target.style.color='rgba(255,255,255,0.6)'; }}
                  onMouseLeave={e => { e.target.style.borderColor='rgba(255,255,255,0.1)'; e.target.style.color='rgba(255,255,255,0.4)'; }}
                >
                  FORGOT PASSWORD?
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Splash Styles ── */
const splashStyles = {
  page: {
    position: 'fixed', inset: 0,
    background: '#0a0a0c',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer', overflow: 'hidden', zIndex: 100,
    fontFamily: "'Inter', sans-serif",
  },
  noise: {
    position: 'absolute', inset: 0, opacity: 0.05, pointerEvents: 'none',
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
  },
  glow: {
    position: 'absolute', width: '600px', height: '600px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(180,160,80,0.08) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  content: {
    position: 'relative', zIndex: 1,
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '32px',
  },
  logoRing: {
    width: '280px', height: '280px', borderRadius: '50%',
    border: '1.5px solid rgba(180,160,100,0.3)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: 'radial-gradient(circle, rgba(25,22,18,0.9) 0%, rgba(8,8,10,0.98) 70%)',
    boxShadow: '0 0 60px rgba(180,160,80,0.1), inset 0 0 40px rgba(0,0,0,0.5)',
  },
  logoInnerRing: {
    width: '230px', height: '230px', borderRadius: '50%',
    border: '1px solid rgba(180,160,100,0.12)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  textBlock: { textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' },
  welcomeTo: {
    fontSize: '12px', letterSpacing: '0.35em', color: 'rgba(180,160,100,0.7)',
    fontWeight: '600', textTransform: 'uppercase', margin: 0,
  },
  studioName: {
    fontSize: 'clamp(36px, 8vw, 56px)', fontWeight: '800',
    letterSpacing: '0.12em', lineHeight: 1.1,
    background: 'linear-gradient(135deg, #e0e0e0 0%, #a0a0a0 40%, #c8c8c8 60%, #888 100%)',
    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
    margin: 0,
  },
  studioNameAccent: {
    background: 'linear-gradient(135deg, #d4c080 0%, #a08040 50%, #c8a855 100%)',
    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
  },
  trademark: { fontSize: '0.4em', verticalAlign: 'super', color: 'rgba(180,160,100,0.6)', WebkitTextFillColor: 'rgba(180,160,100,0.6)' },
  divider: {
    width: '120px', height: '1px',
    background: 'linear-gradient(90deg, transparent, rgba(180,160,100,0.5), transparent)',
    transformOrigin: 'left',
  },
  tagline: {
    fontSize: '13px', color: 'rgba(255,255,255,0.35)',
    letterSpacing: '0.05em', fontStyle: 'italic', margin: 0,
  },
  tapHint: {
    fontSize: '11px', color: 'rgba(255,255,255,0.2)',
    letterSpacing: '0.1em', textTransform: 'uppercase', margin: 0,
  },
};

/* ── Login Form Styles ── */
const styles = {
  page: { minHeight: '100vh', backgroundColor: '#0d0d0f', fontFamily: "'Inter','Helvetica Neue',sans-serif", overflow: 'hidden' },
  layout: {
    minHeight: '100vh',
    background: '#0d0d0f',
    backgroundImage: 'radial-gradient(ellipse at 20% 50%, rgba(30,28,26,0.8) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(20,18,16,0.6) 0%, transparent 50%)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    position: 'relative',
  },
  marbleOverlay: {
    position: 'absolute', inset: 0,
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='600'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.08'/%3E%3C/svg%3E")`,
    backgroundSize: '600px 600px', opacity: 0.6, pointerEvents: 'none',
  },
  leftPanel: {
    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
    position: 'relative', zIndex: 1, padding: '40px',
  },
  logoContainer: { display: 'flex', alignItems: 'center', justifyContent: 'center' },
  outerRing: {
    width: '360px', height: '360px', borderRadius: '50%',
    border: '1.5px solid rgba(180,160,100,0.35)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    boxShadow: '0 0 60px rgba(180,160,80,0.12), inset 0 0 40px rgba(0,0,0,0.5)',
    background: 'radial-gradient(circle, rgba(25,22,18,0.9) 0%, rgba(10,10,12,0.95) 70%)',
    position: 'relative',
  },
  innerRing: {
    width: '290px', height: '290px', borderRadius: '50%',
    border: '1px solid rgba(180,160,100,0.15)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  rightPanel: {
    flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
    justifyContent: 'center', padding: '60px 80px 60px 40px',
    maxWidth: '520px', position: 'relative', zIndex: 1,
  },
  brandBlock: { marginBottom: '28px' },
  brandTitle: {
    fontSize: 'clamp(30px, 4vw, 44px)', fontWeight: '800', letterSpacing: '0.18em',
    lineHeight: 1.15, color: 'transparent',
    background: 'linear-gradient(135deg, #e0e0e0 0%, #a0a0a0 40%, #c8c8c8 60%, #888 100%)',
    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
    margin: 0, textTransform: 'uppercase',
  },
  brandDivider: { display: 'flex', alignItems: 'center', gap: '10px', marginTop: '14px' },
  dividerLine: { flex: 1, maxWidth: '80px', height: '1px', background: 'linear-gradient(90deg, transparent, rgba(180,160,100,0.5), transparent)' },
  dividerStar: { color: 'rgba(180,160,100,0.7)', fontSize: '14px' },
  card: {
    width: '100%', maxWidth: '400px',
    backgroundColor: 'rgba(18,16,14,0.85)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '12px', padding: '32px',
    backdropFilter: 'blur(16px)', boxShadow: '0 8px 40px rgba(0,0,0,0.6)',
  },
  cardHeader: { textAlign: 'center', marginBottom: '24px' },
  welcomeTitle: { fontSize: '17px', fontWeight: '700', letterSpacing: '0.2em', color: '#e0e0e0', margin: '0 0 6px 0' },
  welcomeSub: { fontSize: '12px', color: 'rgba(255,255,255,0.35)', margin: 0, letterSpacing: '0.04em' },
  errorBox: {
    display: 'flex', alignItems: 'center', gap: '8px',
    backgroundColor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
    borderRadius: '8px', padding: '10px 12px', marginBottom: '16px',
  },
  form: { display: 'flex', flexDirection: 'column', gap: '12px' },
  inputWrapper: { position: 'relative', display: 'flex', alignItems: 'center' },
  inputIcon: { position: 'absolute', left: '14px', pointerEvents: 'none', zIndex: 1 },
  input: {
    width: '100%', padding: '13px 14px 13px 42px',
    backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '8px', color: '#ccc', fontSize: '14px', outline: 'none',
    transition: 'border-color 0.2s', boxSizing: 'border-box',
    fontFamily: "'Inter',sans-serif",
  },
  eyeBtn: { position: 'absolute', right: '14px', background: 'none', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center' },
  loginBtn: {
    width: '100%', padding: '14px', marginTop: '4px',
    background: 'linear-gradient(135deg, #4a4a4a 0%, #2a2a2a 40%, #3a3a3a 60%, #1a1a1a 100%)',
    border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px',
    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
    boxShadow: '0 2px 12px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)',
  },
  loginBtnText: { fontSize: '13px', fontWeight: '700', letterSpacing: '0.25em', color: '#d0d0d0', textTransform: 'uppercase' },
  spinner: { width: '18px', height: '18px', border: '2px solid rgba(255,255,255,0.15)', borderTop: '2px solid #aaa', borderRadius: '50%', animation: 'spin 0.8s linear infinite' },
  orRow: { display: 'flex', alignItems: 'center', gap: '12px', margin: '20px 0 16px' },
  orLine: { flex: 1, height: '1px', backgroundColor: 'rgba(255,255,255,0.07)' },
  orText: { fontSize: '11px', color: 'rgba(255,255,255,0.25)', letterSpacing: '0.12em' },
  forgotBtn: {
    width: '100%', padding: '13px', background: 'transparent',
    border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px',
    color: 'rgba(255,255,255,0.4)', fontSize: '12px', fontWeight: '600',
    letterSpacing: '0.18em', textTransform: 'uppercase', cursor: 'pointer',
    transition: 'all 0.2s', fontFamily: "'Inter',sans-serif",
  },
};

// Inject spinner keyframe
if (typeof document !== 'undefined' && !document.getElementById('login-styles')) {
  const s = document.createElement('style');
  s.id = 'login-styles';
  s.textContent = `@keyframes spin{to{transform:rotate(360deg)}} input::placeholder{color:rgba(255,255,255,0.28)!important} @media(max-width:768px){.login-left-panel{display:none!important}}`;
  document.head.appendChild(s);
}
