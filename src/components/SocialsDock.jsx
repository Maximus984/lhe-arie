import React from 'react';
import { motion } from 'framer-motion';
import { Disc, HelpCircle, MessageSquare } from 'lucide-react';

// =====================================================
// MAXX FORGE STUDIO™ — Socials & Community Dock
// Glowing glassmorphic dock connecting user to channels
// =====================================================

const SOCIAL_LINKS = [
  {
    name: 'YouTube',
    url: 'https://www.youtube.com/@MaxxForgeStudio',
    icon: '▶',
    color: '#FF0000',
    glow: 'rgba(255, 0, 0, 0.45)',
    description: 'Concert Visuals & Remasters'
  },
  {
    name: 'Instagram',
    url: 'https://instagram.com/lo.veboy1939',
    icon: '📸',
    color: '#E1306C',
    glow: 'rgba(225, 48, 108, 0.45)',
    description: '@lo.veboy1939'
  },
  {
    name: 'Discord',
    url: 'https://discord.gg/peHXGymg7Y',
    icon: '💬',
    color: '#5865F2',
    glow: 'rgba(88, 101, 242, 0.45)',
    description: 'Community Ecosystem'
  },
  {
    name: 'Website',
    url: 'https://maxxforgestudio.com',
    icon: '🌐',
    color: '#10B981',
    glow: 'rgba(16, 185, 129, 0.45)',
    description: 'Official Hub'
  }
];

export default function SocialsDock() {
  return (
    <div style={styles.container}>
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, type: 'spring', stiffness: 200, damping: 20 }}
        style={styles.dock}
      >
        <div style={styles.titleWrapper}>
          <span style={styles.indicator} />
          <span style={styles.title}>MFS CONNECT</span>
        </div>
        
        <div style={styles.linksRow}>
          {SOCIAL_LINKS.map(link => (
            <motion.a
              key={link.name}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              title={`${link.name}: ${link.description}`}
              whileHover={{ 
                scale: 1.15,
                y: -4,
                boxShadow: `0 0 25px ${link.glow}`,
                borderColor: link.color
              }}
              whileTap={{ scale: 0.95 }}
              style={styles.linkButton}
            >
              <span style={{ fontSize: '18px', color: '#fff', lineHeight: 1 }}>{link.icon}</span>
              <span style={{ ...styles.linkText, color: link.color }}>{link.name}</span>
            </motion.a>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

const styles = {
  container: {
    position: 'fixed',
    bottom: '20px',
    left: '50%',
    transform: 'translateX(-50%)',
    zIndex: 9000,
    pointerEvents: 'none',
    width: '100%',
    maxWidth: '460px',
    padding: '0 20px',
    boxSizing: 'border-box'
  },
  dock: {
    pointerEvents: 'auto',
    background: 'rgba(13, 13, 18, 0.8)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '20px',
    padding: '10px 18px',
    backdropFilter: 'blur(20px) saturate(180%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '12px',
    boxShadow: '0 10px 30px -5px rgba(0,0,0,0.8), inset 0 1px 1px rgba(255,255,255,0.05)',
  },
  titleWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    borderRight: '1px solid rgba(255, 255, 255, 0.06)',
    paddingRight: '12px',
    flexShrink: 0
  },
  indicator: {
    width: '5px',
    height: '5px',
    borderRadius: '50%',
    background: '#10B981',
    boxShadow: '0 0 8px #10B981',
    display: 'inline-block'
  },
  title: {
    fontFamily: 'monospace',
    fontSize: '9px',
    fontWeight: '800',
    color: 'rgba(255,255,255,0.3)',
    letterSpacing: '0.18em',
    textTransform: 'uppercase'
  },
  linksRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flex: 1,
    justifyContent: 'space-around'
  },
  linkButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 10px',
    borderRadius: '10px',
    background: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid rgba(255, 255, 255, 0.04)',
    textDecoration: 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s',
  },
  linkText: {
    fontFamily: 'monospace',
    fontSize: '10px',
    fontWeight: '700',
    letterSpacing: '0.05em',
    textTransform: 'uppercase',
    display: 'none',
    '@media (minWidth: 400px)': {
      display: 'inline'
    }
  }
};
