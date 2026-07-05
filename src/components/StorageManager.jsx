import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Database, Trash2, HardDrive, RefreshCw, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

// =====================================================
// MAXX FORGE STUDIO™ — Storage Manager
// Shows localStorage usage, lets users clear caches
// =====================================================

const STORAGE_CATEGORIES = [
  { key: 'mfs_users', label: 'User Accounts', icon: '👤', color: '#10B981' },
  { key: 'mfs_session', label: 'Active Session', icon: '🔐', color: '#00E5FF' },
  { key: 'mfs_workspace_docs', label: 'Forge Docs', icon: '📄', color: '#6366F1' },
  { key: 'mfs_workspace_drive', label: 'Forge Drive', icon: '📁', color: '#F59E0B' },
  { key: 'mfs_workspace_slides', label: 'Forge Slides', icon: '📊', color: '#EC4899' },
  { key: 'mfs_workspace_vault', label: 'Media Vault', icon: '🖼️', color: '#8B5CF6' },
  { key: 'mfs_feed_channels', label: 'Feed Channels', icon: '💬', color: '#14B8A6' },
  { key: 'mfs_feed_posts', label: 'Feed Posts', icon: '📝', color: '#F97316' },
  { key: 'mfs_calendar_events', label: 'Calendar Events', icon: '📅', color: '#06B6D4' },
  { key: 'mfs_form_submissions', label: 'Form Submissions', icon: '📋', color: '#84CC16' },
  { key: 'mfs_session_logs', label: 'Session Logs', icon: '📊', color: '#A855F7' },
  { key: 'mfs_analytics', label: 'Analytics Data', icon: '📈', color: '#EF4444' },
  { key: 'mfs_theme', label: 'Theme Preference', icon: '🎨', color: '#D946EF' },
  { key: 'mfs_permissions_granted', label: 'Permissions', icon: '🛡️', color: '#22D3EE' },
];

function getByteSize(str) {
  return new Blob([str || '']).size;
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(2)} MB`;
}

function getStorageUsage() {
  let totalUsed = 0;
  const items = [];

  for (const cat of STORAGE_CATEGORIES) {
    const raw = localStorage.getItem(cat.key);
    const size = getByteSize(raw);
    totalUsed += size;
    items.push({ ...cat, size, exists: raw !== null });
  }

  // Catch unlisted keys too
  let otherSize = 0;
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!STORAGE_CATEGORIES.find(c => c.key === key)) {
      otherSize += getByteSize(localStorage.getItem(key));
    }
  }
  totalUsed += otherSize;

  // localStorage quota is typically ~5-10 MB
  const quota = 5 * 1024 * 1024; // 5 MB estimate
  const percentage = Math.min(100, (totalUsed / quota) * 100);

  return { items, totalUsed, otherSize, quota, percentage };
}

export default function StorageManager({ onClose }) {
  const [usage, setUsage] = useState(null);

  const refresh = () => setUsage(getStorageUsage());

  useEffect(() => { refresh(); }, []);

  const handleClear = (key, label) => {
    // Protect session and user data from accidental wipe
    if (key === 'mfs_session' || key === 'mfs_users') {
      toast.error(`Cannot clear ${label} — protected data.`);
      return;
    }
    localStorage.removeItem(key);
    refresh();
    toast.success(`Cleared ${label}`);
  };

  const handleClearAll = () => {
    const protectedKeys = ['mfs_session', 'mfs_users', 'mfs_simulated_ip'];
    STORAGE_CATEGORIES.forEach(cat => {
      if (!protectedKeys.includes(cat.key)) {
        localStorage.removeItem(cat.key);
      }
    });
    refresh();
    toast.success('Cache cleared! Protected data preserved.');
  };

  if (!usage) return null;

  const usedColor = usage.percentage > 80 ? '#EF4444' : usage.percentage > 50 ? '#F59E0B' : '#10B981';

  return (
    <div style={styles.panel}>
      {/* Header */}
      <div style={styles.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={styles.iconBox}>
            <HardDrive size={16} color="#10B981" />
          </div>
          <div>
            <h3 style={styles.title}>Storage Manager</h3>
            <p style={styles.subtitle}>Manage local data & cache</p>
          </div>
        </div>
        <button onClick={onClose} style={styles.closeBtn}>✕</button>
      </div>

      {/* Usage bar */}
      <div style={styles.usageSection}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <span style={styles.usageLabel}>Storage Used</span>
          <span style={{ ...styles.usageValue, color: usedColor }}>
            {formatBytes(usage.totalUsed)} / {formatBytes(usage.quota)}
          </span>
        </div>
        <div style={styles.progressBg}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${usage.percentage}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            style={{ ...styles.progressFill, backgroundColor: usedColor }}
          />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px' }}>
          <span style={styles.pctLabel}>{usage.percentage.toFixed(1)}% used</span>
          <span style={styles.pctLabel}>{formatBytes(usage.quota - usage.totalUsed)} free</span>
        </div>
      </div>

      {/* Item list */}
      <div style={styles.itemList}>
        {usage.items.filter(i => i.exists).sort((a, b) => b.size - a.size).map(item => (
          <div key={item.key} style={styles.item}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
              <span style={{ fontSize: '16px' }}>{item.icon}</span>
              <div>
                <span style={styles.itemLabel}>{item.label}</span>
                <span style={styles.itemSize}>{formatBytes(item.size)}</span>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '40px', height: '3px', borderRadius: '2px', background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                <div style={{ width: `${Math.min(100, (item.size / usage.totalUsed) * 100)}%`, height: '100%', borderRadius: '2px', backgroundColor: item.color }} />
              </div>
              <button
                onClick={() => handleClear(item.key, item.label)}
                style={styles.deleteBtn}
                title={`Clear ${item.label}`}
              >
                <Trash2 size={11} />
              </button>
            </div>
          </div>
        ))}

        {usage.otherSize > 0 && (
          <div style={styles.item}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
              <span style={{ fontSize: '16px' }}>📦</span>
              <div>
                <span style={styles.itemLabel}>Other / System</span>
                <span style={styles.itemSize}>{formatBytes(usage.otherSize)}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div style={styles.actions}>
        <button onClick={refresh} style={styles.refreshBtn}>
          <RefreshCw size={12} /> Refresh
        </button>
        <button onClick={handleClearAll} style={styles.clearAllBtn}>
          <AlertTriangle size={12} /> Clear All Cache
        </button>
      </div>
    </div>
  );
}

const styles = {
  panel: {
    width: '100%', maxWidth: '380px',
    background: 'rgba(8,8,12,0.98)',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: '16px', overflow: 'hidden',
    fontFamily: "'Inter', sans-serif",
    boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
  },
  header: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)',
  },
  iconBox: {
    width: '36px', height: '36px', borderRadius: '10px',
    background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  title: { margin: 0, fontSize: '13px', fontWeight: '700', color: '#fff' },
  subtitle: { margin: 0, fontSize: '10px', color: 'rgba(255,255,255,0.3)', fontFamily: 'monospace' },
  closeBtn: {
    background: 'rgba(255,255,255,0.05)', border: 'none', color: 'rgba(255,255,255,0.4)',
    width: '28px', height: '28px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  usageSection: { padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)' },
  usageLabel: { fontSize: '10px', fontFamily: 'monospace', color: 'rgba(255,255,255,0.4)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em' },
  usageValue: { fontSize: '11px', fontFamily: 'monospace', fontWeight: '700' },
  progressBg: { width: '100%', height: '6px', borderRadius: '4px', background: 'rgba(255,255,255,0.06)', overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: '4px', transition: 'background-color 0.3s' },
  pctLabel: { fontSize: '9px', fontFamily: 'monospace', color: 'rgba(255,255,255,0.25)' },
  itemList: { padding: '12px 20px', display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '280px', overflowY: 'auto' },
  item: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '8px 10px', borderRadius: '10px', background: 'rgba(255,255,255,0.02)',
    border: '1px solid rgba(255,255,255,0.04)',
  },
  itemLabel: { display: 'block', fontSize: '11px', fontWeight: '600', color: '#fff' },
  itemSize: { display: 'block', fontSize: '9px', fontFamily: 'monospace', color: 'rgba(255,255,255,0.3)', marginTop: '1px' },
  deleteBtn: {
    background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)',
    borderRadius: '6px', width: '24px', height: '24px', cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: 'rgba(239,68,68,0.6)', transition: 'all 0.2s',
  },
  actions: { padding: '16px 20px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', gap: '8px' },
  refreshBtn: {
    flex: 1, padding: '10px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)',
    background: 'rgba(255,255,255,0.03)', color: 'rgba(255,255,255,0.5)',
    fontSize: '11px', fontWeight: '600', cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
    fontFamily: "'Inter', sans-serif",
  },
  clearAllBtn: {
    flex: 1, padding: '10px', borderRadius: '10px', border: '1px solid rgba(239,68,68,0.2)',
    background: 'rgba(239,68,68,0.06)', color: '#EF4444',
    fontSize: '11px', fontWeight: '600', cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
    fontFamily: "'Inter', sans-serif",
  },
};
