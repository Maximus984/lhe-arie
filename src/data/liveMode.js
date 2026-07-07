// =====================================================
// MAXX FORGE STUDIO™ — Live Mode Control
// Staff/Founder can activate a site-wide "LIVE NOW"
// takeover that banners the dashboard and directs
// all users to the Live Theater.
// =====================================================

const LIVE_MODE_KEY = 'mfs_live_mode';

const DEFAULT_CONFIG = {
  active: false,
  streamUrl: '',   // optional YouTube video ID
  streamType: 'preset', // 'preset' | 'youtube' | 'webcam'
  title: 'WE ARE LIVE',
  subtitle: 'Maxx Forge Studio is streaming now. Click to watch.',
  startedAt: null,
  activatedBy: null,
};

export function getLiveModeConfig() {
  try {
    const raw = localStorage.getItem(LIVE_MODE_KEY);
    if (raw) return { ...DEFAULT_CONFIG, ...JSON.parse(raw) };
  } catch (_) {}
  return DEFAULT_CONFIG;
}

export function isLiveModeActive() {
  return getLiveModeConfig().active === true;
}

export function setLiveMode(active, options = {}) {
  const current = getLiveModeConfig();
  const updated = {
    ...current,
    ...options,
    active,
    startedAt: active ? (current.startedAt || new Date().toISOString()) : null,
  };
  if (!active) updated.startedAt = null;
  localStorage.setItem(LIVE_MODE_KEY, JSON.stringify(updated));
  return updated;
}
