import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, MessageCircle, Globe, ExternalLink } from 'lucide-react';

// =====================================================
// MAXX FORGE STUDIO™ — Socials Dock
// Clean icon-only dock with hover tooltips
// =====================================================

const SOCIAL_LINKS = [
  {
    name: 'YouTube',
    url: 'https://www.youtube.com/@MaxxForgeStudio',
    Icon: Play,
    color: '#FF0000',
    glow: 'rgba(255, 0, 0, 0.5)',
  },
  {
    name: 'Instagram',
    url: 'https://instagram.com/lo.veboy1939',
    emoji: '📸',
    color: '#E1306C',
    glow: 'rgba(225, 48, 108, 0.5)',
  },
  {
    name: 'Discord',
    url: 'https://discord.gg/peHXGymg7Y',
    Icon: MessageCircle,
    color: '#5865F2',
    glow: 'rgba(88, 101, 242, 0.5)',
  },
  {
    name: 'Website',
    url: 'https://maxxforgestudio.com',
    Icon: Globe,
    color: '#10B981',
    glow: 'rgba(16, 185, 129, 0.5)',
  },
];

export default function SocialsDock() {
  const [hovered, setHovered] = useState(null);

  return (
    <div style={styles.container}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2, type: 'spring', stiffness: 220, damping: 22 }}
        style={styles.dock}
      >
        {/* Brand chip */}
        <div style={styles.brand}>
          <span style={styles.dot} />
          <span style={styles.brandText}>MFS CONNECT</span>
        </div>

        {/* Divider */}
        <div style={styles.divider} />

        {/* Icon links */}
        <div style={styles.icons}>
          {SOCIAL_LINKS.map(({ name, url, Icon, emoji, color, glow }) => (
            <div key={name} style={{ position: 'relative' }}>
              <AnimatePresence>
                {hovered === name && (
                  <motion.div
                    initial={{ opacity: 0, y: 4, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 4, scale: 0.9 }}
                    transition={{ duration: 0.15 }}
                    style={{
                      position: 'absolute',
                      bottom: 'calc(100% + 8px)',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      background: 'rgba(10,10,14,0.95)',
                      border: `1px solid ${color}40`,
                      borderRadius: '7px',
                      padding: '4px 10px',
                      whiteSpace: 'nowrap',
                      fontFamily: 'monospace',
                      fontSize: '10px',
                      fontWeight: '700',
                      color: color,
                      letterSpacing: '0.08em',
                      pointerEvents: 'none',
                      zIndex: 100,
                      boxShadow: `0 4px 20px ${glow}30`,
                    }}
                  >
                    {name}
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.18, y: -3 }}
                whileTap={{ scale: 0.92 }}
                onMouseEnter={() => setHovered(name)}
                onMouseLeave={() => setHovered(null)}
                style={{ ...styles.iconBtn }}
                onMouseOver={e => {
                  e.currentTarget.style.boxShadow = `0 0 18px ${glow}`;
                  e.currentTarget.style.borderColor = `${color}50`;
                  e.currentTarget.style.background = `${color}12`;
                }}
                onMouseOut={e => {
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
                  e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                }}
                aria-label={name}
              >
                {emoji ? (
                  <span style={{ fontSize: '15px', lineHeight: 1 }}>{emoji}</span>
                ) : (
                  <Icon size={15} color={hovered === name ? color : 'rgba(255,255,255,0.5)'} strokeWidth={1.8} />
                )}
              </motion.a>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

const styles = {
  container: {
    position: 'fixed',
    bottom: '18px',
    right: '18px',
    zIndex: 9000,
    pointerEvents: 'none',
  },
  dock: {
    pointerEvents: 'auto',
    background: 'rgba(10, 10, 14, 0.88)',
    border: '1px solid rgba(255, 255, 255, 0.07)',
    borderRadius: '18px',
    padding: '8px 14px',
    backdropFilter: 'blur(24px) saturate(180%)',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    boxShadow: '0 8px 32px -4px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.05)',
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    paddingRight: '2px',
    flexShrink: 0,
  },
  dot: {
    width: '5px',
    height: '5px',
    borderRadius: '50%',
    background: '#10B981',
    boxShadow: '0 0 7px #10B981',
    display: 'inline-block',
    flexShrink: 0,
  },
  brandText: {
    fontFamily: 'monospace',
    fontSize: '8px',
    fontWeight: '800',
    color: 'rgba(255,255,255,0.28)',
    letterSpacing: '0.2em',
    textTransform: 'uppercase',
    whiteSpace: 'nowrap',
  },
  divider: {
    width: '1px',
    height: '18px',
    background: 'rgba(255,255,255,0.07)',
    flexShrink: 0,
  },
  icons: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  iconBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '34px',
    height: '34px',
    borderRadius: '10px',
    background: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid rgba(255, 255, 255, 0.06)',
    textDecoration: 'none',
    transition: 'all 0.18s ease',
    cursor: 'pointer',
    flexShrink: 0,
  },
};
