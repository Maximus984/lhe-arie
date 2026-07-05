import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { startViewerDrift, updatePeakViewers } from '../data/analytics.js';
import { Eye } from 'lucide-react';

// =====================================================
// Live Viewer Counter — public-facing animated counter
// Shows realistic-feeling "people viewing now" number
// =====================================================

export default function LiveViewerCounter({ style = 'badge', className = '' }) {
  const [count, setCount] = useState(null);
  const [prevCount, setPrevCount] = useState(null);

  useEffect(() => {
    const stop = startViewerDrift((newCount) => {
      setPrevCount(prev => prev ?? newCount);
      setCount(newCount);
      updatePeakViewers(newCount);
    });
    return stop;
  }, []);

  if (count === null) return null;

  const formatted = count.toLocaleString();
  const trending = prevCount !== null && count > prevCount;

  useEffect(() => {
    const t = setTimeout(() => setPrevCount(count), 2000);
    return () => clearTimeout(t);
  }, [count]);

  if (style === 'minimal') {
    return (
      <div className={className} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
        <motion.span
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10B981', boxShadow: '0 0 6px #10B981', display: 'inline-block' }}
        />
        <span style={{ fontSize: '11px', fontFamily: 'monospace', color: 'rgba(255,255,255,0.5)', fontWeight: '600' }}>
          <motion.span
            key={formatted}
            initial={{ y: -8, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            style={{ display: 'inline-block', color: '#10B981', fontWeight: '800' }}
          >
            {formatted}
          </motion.span>
          {' '}viewing now
        </span>
      </div>
    );
  }

  // Default "badge" style
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={className}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: '8px',
        padding: '7px 14px', borderRadius: '12px',
        background: 'rgba(16,185,129,0.06)',
        border: '1px solid rgba(16,185,129,0.15)',
        backdropFilter: 'blur(8px)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <motion.div
          animate={{ scale: [1, 1.3, 1], opacity: [0.8, 1, 0.8] }}
          transition={{ duration: 2, repeat: Infinity }}
          style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#10B981', boxShadow: '0 0 8px #10B981' }}
        />
        <Eye size={13} color="rgba(255,255,255,0.35)" />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <motion.span
          key={formatted}
          initial={{ y: trending ? -6 : 6, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          style={{
            fontSize: '13px', fontFamily: 'monospace', fontWeight: '800',
            color: '#10B981', lineHeight: 1,
          }}
        >
          {formatted}
        </motion.span>
        <span style={{
          fontSize: '8px', fontFamily: 'monospace', color: 'rgba(255,255,255,0.3)',
          textTransform: 'uppercase', letterSpacing: '0.12em', lineHeight: 1, marginTop: '3px',
        }}>
          people viewing now
        </span>
      </div>
    </motion.div>
  );
}
