import React from 'react';
import { motion } from 'framer-motion';

// =====================================================
// MAXX FORGE STUDIO™ — Maintenance Mode Page
// Displayed when the founder toggles maintenance ON
// =====================================================

export default function MaintenancePage({ message }) {
  return (
    <div style={styles.page}>
      {/* Noise texture */}
      <div style={styles.noise} />

      {/* Pulsing glow */}
      <motion.div
        animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        style={styles.glow}
      />

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        style={styles.content}
      >
        {/* Logo */}
        <motion.img
          src="/brand/logo.png"
          alt="Maxx Forge Studio"
          style={styles.logo}
          animate={{ rotate: [0, 2, -2, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          onError={(e) => { e.target.style.display = 'none'; }}
        />

        {/* Maintenance badge */}
        <motion.div
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          style={styles.badge}
        >
          <span style={styles.badgeDot} />
          <span style={styles.badgeText}>MAINTENANCE MODE</span>
        </motion.div>

        {/* Title */}
        <h1 style={styles.title}>
          MAXX FORGE STUDIO<span style={styles.tm}>™</span>
        </h1>

        <div style={styles.divider}>
          <div style={styles.dividerLine} />
          <span style={styles.dividerIcon}>⚙️</span>
          <div style={styles.dividerLine} />
        </div>

        <h2 style={styles.subtitle}>Currently Under Maintenance</h2>

        <p style={styles.message}>
          {message || 'We are currently updating and improving our systems. Please check back soon.'}
        </p>

        {/* Animated progress bar */}
        <div style={styles.progressContainer}>
          <motion.div
            style={styles.progressBar}
            animate={{ x: ['-100%', '100%'] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>
        <p style={styles.progressLabel}>Systems updating...</p>

        {/* Status indicators */}
        <div style={styles.statusGrid}>
          {[
            { label: 'Core Systems', status: 'updating', color: '#F59E0B' },
            { label: 'Database', status: 'syncing', color: '#00E5FF' },
            { label: 'Security', status: 'active', color: '#10B981' },
            { label: 'CDN Network', status: 'standby', color: '#6366F1' },
          ].map(item => (
            <div key={item.label} style={styles.statusItem}>
              <motion.span
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: item.status === 'active' ? 0 : 1.5, repeat: Infinity }}
                style={{ ...styles.statusDot, backgroundColor: item.color }}
              />
              <div>
                <span style={styles.statusLabel}>{item.label}</span>
                <span style={{ ...styles.statusValue, color: item.color }}>{item.status.toUpperCase()}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Countdown / estimated */}
        <p style={styles.footer}>
          We appreciate your patience. Follow us on social media for live updates.
        </p>
      </motion.div>
    </div>
  );
}

const styles = {
  page: {
    position: 'fixed', inset: 0, zIndex: 99999,
    background: '#050508',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontFamily: "'Inter', 'Helvetica Neue', sans-serif",
    overflow: 'hidden',
  },
  noise: {
    position: 'absolute', inset: 0, opacity: 0.04, pointerEvents: 'none',
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
  },
  glow: {
    position: 'absolute', width: '500px', height: '500px', borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(239,68,68,0.08) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  content: {
    position: 'relative', zIndex: 1, textAlign: 'center',
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px',
    padding: '40px', maxWidth: '520px',
  },
  logo: {
    width: '120px', height: '120px', objectFit: 'contain',
    filter: 'drop-shadow(0 0 30px rgba(239,68,68,0.3)) grayscale(30%)',
    marginBottom: '8px',
  },
  badge: {
    display: 'flex', alignItems: 'center', gap: '8px',
    padding: '6px 16px', borderRadius: '20px',
    background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)',
  },
  badgeDot: {
    width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#EF4444',
    boxShadow: '0 0 8px #EF4444',
  },
  badgeText: {
    fontSize: '10px', fontWeight: '800', letterSpacing: '0.2em',
    color: '#EF4444', fontFamily: 'monospace',
  },
  title: {
    fontSize: 'clamp(24px, 5vw, 38px)', fontWeight: '900',
    letterSpacing: '0.15em', lineHeight: 1.1, margin: 0,
    background: 'linear-gradient(135deg, #e0e0e0 0%, #888 50%, #b0b0b0 100%)',
    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
  },
  tm: { fontSize: '0.4em', verticalAlign: 'super', WebkitTextFillColor: 'rgba(255,255,255,0.3)' },
  divider: { display: 'flex', alignItems: 'center', gap: '12px', width: '100%', maxWidth: '300px' },
  dividerLine: { flex: 1, height: '1px', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)' },
  dividerIcon: { fontSize: '18px' },
  subtitle: {
    fontSize: '16px', fontWeight: '700', color: '#F59E0B',
    letterSpacing: '0.08em', margin: 0,
  },
  message: {
    fontSize: '13px', color: 'rgba(255,255,255,0.4)', lineHeight: 1.7, margin: 0,
    maxWidth: '400px',
  },
  progressContainer: {
    width: '100%', maxWidth: '300px', height: '3px',
    borderRadius: '4px', background: 'rgba(255,255,255,0.06)',
    overflow: 'hidden', marginTop: '8px',
  },
  progressBar: {
    width: '40%', height: '100%', borderRadius: '4px',
    background: 'linear-gradient(90deg, transparent, #F59E0B, transparent)',
  },
  progressLabel: {
    fontSize: '10px', color: 'rgba(255,255,255,0.25)', fontFamily: 'monospace',
    letterSpacing: '0.1em', margin: 0,
  },
  statusGrid: {
    display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px',
    width: '100%', maxWidth: '340px', marginTop: '12px',
  },
  statusItem: {
    display: 'flex', alignItems: 'center', gap: '8px',
    padding: '10px 12px', borderRadius: '10px',
    background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)',
    textAlign: 'left',
  },
  statusDot: { width: '6px', height: '6px', borderRadius: '50%', flexShrink: 0 },
  statusLabel: { display: 'block', fontSize: '10px', color: 'rgba(255,255,255,0.5)', fontWeight: '600' },
  statusValue: { display: 'block', fontSize: '9px', fontFamily: 'monospace', fontWeight: '700', letterSpacing: '0.08em', marginTop: '2px' },
  footer: {
    fontSize: '11px', color: 'rgba(255,255,255,0.2)', fontStyle: 'italic',
    marginTop: '16px', margin: 0,
  },
};
