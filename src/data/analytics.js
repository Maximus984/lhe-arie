// =====================================================
// MAXX FORGE STUDIO™ — Live Viewer Analytics Engine
// =====================================================
// Simulates realistic viewer counts for public display
// and provides real telemetry hooks for staff/founder.

const STORAGE_KEY = 'mfs_analytics';
const MAINTENANCE_KEY = 'mfs_maintenance_mode';

// ---- Realistic viewer simulation ----
// Uses time-of-day curves + random noise to feel alive
function getTimeMultiplier() {
  const hour = new Date().getHours();
  // Peak hours: 7-9 PM, low hours: 3-6 AM
  const curve = [
    0.15, 0.12, 0.10, 0.08, 0.07, 0.08, // 12am-5am
    0.12, 0.18, 0.25, 0.35, 0.42, 0.50,  // 6am-11am
    0.55, 0.58, 0.52, 0.48, 0.55, 0.65,  // 12pm-5pm
    0.78, 0.92, 1.00, 0.95, 0.80, 0.55,  // 6pm-11pm
  ];
  return curve[hour] || 0.5;
}

function getDayMultiplier() {
  const day = new Date().getDay(); // 0=Sun
  const mult = [0.85, 0.6, 0.65, 0.7, 0.75, 0.9, 1.0]; // weekends higher
  return mult[day];
}

// Generate a realistic-feeling viewer count
export function generateViewerCount(min = 50, max = 5000) {
  const timeMult = getTimeMultiplier();
  const dayMult = getDayMultiplier();
  const baseLine = min + (max - min) * timeMult * dayMult;
  // Add ±15% noise
  const noise = baseLine * (0.85 + Math.random() * 0.30);
  return Math.round(Math.max(min, Math.min(max, noise)));
}

// Smoothly drift between values for animation
let _currentViewers = null;
let _targetViewers = null;
let _driftInterval = null;

export function startViewerDrift(onUpdate, minVal = 50, maxVal = 5000) {
  if (_driftInterval) clearInterval(_driftInterval);

  _currentViewers = generateViewerCount(minVal, maxVal);
  _targetViewers = _currentViewers;
  onUpdate(_currentViewers);

  // Pick a new target every 8-15 seconds
  const pickTarget = () => {
    _targetViewers = generateViewerCount(minVal, maxVal);
  };
  const targetInterval = setInterval(pickTarget, 8000 + Math.random() * 7000);

  // Drift toward target every 1.5s with small steps
  _driftInterval = setInterval(() => {
    if (_currentViewers === null) return;
    const diff = _targetViewers - _currentViewers;
    const step = Math.ceil(Math.abs(diff) * (0.08 + Math.random() * 0.12));
    if (Math.abs(diff) < 3) {
      // Micro-jitter ±1-3
      _currentViewers += Math.round((Math.random() - 0.5) * 6);
    } else {
      _currentViewers += diff > 0 ? step : -step;
    }
    _currentViewers = Math.max(minVal, Math.min(maxVal, _currentViewers));
    onUpdate(_currentViewers);
  }, 1500);

  return () => {
    clearInterval(_driftInterval);
    clearInterval(targetInterval);
    _driftInterval = null;
  };
}

// ---- Session tracking (for staff/founder) ----
export function getAnalytics() {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : {
    totalPageViews: 0,
    uniqueVisitors: 0,
    sessionsToday: 0,
    peakViewers: 0,
    avgSessionDuration: '0m',
    topPages: [],
    lastUpdated: null,
  };
}

export function trackPageView(page = '/') {
  const analytics = getAnalytics();
  analytics.totalPageViews += 1;
  analytics.sessionsToday += 1;
  analytics.lastUpdated = new Date().toISOString();

  // Track top pages
  const existing = analytics.topPages.find(p => p.path === page);
  if (existing) {
    existing.views += 1;
  } else {
    analytics.topPages.push({ path: page, views: 1 });
  }
  analytics.topPages.sort((a, b) => b.views - a.views);
  analytics.topPages = analytics.topPages.slice(0, 10);

  localStorage.setItem(STORAGE_KEY, JSON.stringify(analytics));
  return analytics;
}

export function updatePeakViewers(count) {
  const analytics = getAnalytics();
  if (count > analytics.peakViewers) {
    analytics.peakViewers = count;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(analytics));
  }
}

import { checkScheduledMaintenance } from './releases.js';

// ---- Maintenance Mode ----
export function isMaintenanceMode() {
  if (localStorage.getItem(MAINTENANCE_KEY) === 'true') return true;
  const sched = checkScheduledMaintenance();
  return sched.isMaintenance;
}

export function setMaintenanceMode(enabled) {
  localStorage.setItem(MAINTENANCE_KEY, enabled ? 'true' : 'false');
}

export function getMaintenanceMessage() {
  const sched = checkScheduledMaintenance();
  if (sched.isMaintenance) return sched.message;
  return localStorage.getItem('mfs_maintenance_msg') || 'We are currently updating and improving our systems. Please check back soon.';
}

export function setMaintenanceMessage(msg) {
  localStorage.setItem('mfs_maintenance_msg', msg);
}
