// =====================================================
// MAXX FORGE STUDIO™ — Security, Anti-Jailbreak & Diagnostics
// =====================================================

import { v4 as uuidv4 } from 'uuid';

const CAPTCHA_COOLDOWN_MS = 2 * 60 * 60 * 1000; // 2 hours
const RECENT_ACTIONS_LIMIT = 20;

// ---- Suspicious Activity & Jailbreak Detection ----
const JAILBREAK_PATTERNS = [
  /select\s+.*\s+from/i,
  /union\s+select/i,
  /insert\s+into/i,
  /drop\s+table/i,
  /<script>/i,
  /javascript:/i,
  /onload\s*=/i,
  /onerror\s*=/i,
  /eval\(/i,
  /exec\s+/i,
  /\.\.\//, // Directory traversal
  /\{\{.*\}\}/, // Template injection
];

export function scanInputForThreats(input) {
  if (typeof input !== 'string') return { safe: true };
  
  for (const pattern of JAILBREAK_PATTERNS) {
    if (pattern.test(input)) {
      logSuspiciousActivity('Jailbreak/Injection Attempt Detected', { payload: input });
      return { safe: false, threat: 'Injection Payload Detected' };
    }
  }
  return { safe: true };
}

export function logSuspiciousActivity(type, details = {}) {
  const logs = JSON.parse(localStorage.getItem('mfs_session_logs') || '[]');
  const newLog = {
    id: `sec_${uuidv4().slice(0, 8)}`,
    timestamp: new Date().toISOString(),
    type: 'SECURITY_ALERT',
    event: type,
    details,
    ip: localStorage.getItem('mfs_simulated_ip') || '127.0.0.1',
    userAgent: navigator.userAgent
  };
  localStorage.setItem('mfs_session_logs', JSON.stringify([newLog, ...logs].slice(0, 100)));
}

// ---- Bot Detection Score Engine ----
let mouseMoves = 0;
let keypresses = 0;
let tabSwitches = 0;

if (typeof window !== 'undefined') {
  window.addEventListener('mousemove', () => { mouseMoves++; });
  window.addEventListener('keypress', () => { keypresses++; });
  document.addEventListener('visibilitychange', () => { if (document.hidden) tabSwitches++; });
}

export function getBotScore() {
  // If zero mouse moves but keyboard interactions exist, or if mouse moves/keypress ratio is highly irregular:
  if (mouseMoves === 0 && keypresses > 10) return 0.95; // Highly suspicious
  if (tabSwitches > 15) return 0.85; // Fast tab switcher
  return 0.1; // Normal human behavior
}

export function shouldShowBotChallenge() {
  const score = getBotScore();
  if (score < 0.7) return false;

  const lastVerify = localStorage.getItem('mfs_last_captcha_pass');
  if (lastVerify) {
    const timePassed = Date.now() - parseInt(lastVerify, 10);
    if (timePassed < CAPTCHA_COOLDOWN_MS) {
      return false; // Skip, verified in last 2 hours
    }
  }
  return true;
}

export function registerCaptchaSuccess() {
  localStorage.setItem('mfs_last_captcha_pass', Date.now().toString());
  logSuspiciousActivity('Bot Challenge Solved', { status: 'Verified human' });
}

// ---- Live Diagnostics Engine ----
export function runSystemDiagnostics(manual = false) {
  const startTime = performance.now();
  const errors = [];
  const status = {
    database: 'healthy',
    session: 'active',
    pwa: 'installable',
    storage: 'healthy',
    security: 'secure',
    backgroundMonitor: 'active'
  };

  // 1. Database/localStorage check
  try {
    const users = localStorage.getItem('mfs_users');
    if (!users) {
      errors.push('Database uninitialized or corrupted.');
      status.database = 'corrupted';
    }
  } catch (e) {
    errors.push(`Local storage write error: ${e.message}`);
    status.storage = 'failed';
  }

  // 2. Scan security logs for excessive failed attempts
  const logs = JSON.parse(localStorage.getItem('mfs_session_logs') || '[]');
  const failedLogins = logs.filter(l => l.event === 'Login Failed' || l.event === 'IP Blocked');
  if (failedLogins.length > 5) {
    errors.push('Multiple unauthorized access attempts detected.');
    status.security = 'warning';
  }

  // 3. Size limit check
  const rawSize = new Blob([JSON.stringify(localStorage)]).size;
  if (rawSize > 4 * 1024 * 1024) {
    errors.push('Local storage is near its max quota (4MB+).');
    status.storage = 'warning';
  }

  const durationMs = (performance.now() - startTime).toFixed(2);
  const report = {
    id: `diag_${uuidv4().slice(0, 8)}`,
    timestamp: new Date().toISOString(),
    manual,
    durationMs: `${durationMs}ms`,
    status,
    errors,
    verdict: errors.length === 0 ? 'ALL SYSTEMS NORMAL' : 'WARNING: ACTION REQUIRED',
    appTarget: 'Maxx Forge Client App v2.5'
  };

  // Save report to logs
  const updatedLogs = [report, ...logs].slice(0, 100);
  localStorage.setItem('mfs_session_logs', JSON.stringify(updatedLogs));

  return report;
}

// ---- Auto 24 Hour Scheduler (Background) ----
export function startDiagnosticScheduler(onReportReady) {
  const runInterval = 24 * 60 * 60 * 1000; // 24 hours
  
  // Check if we ran it recently
  const lastRun = localStorage.getItem('mfs_last_diagnostic_run');
  const now = Date.now();

  const execute = () => {
    const report = runSystemDiagnostics(false);
    localStorage.setItem('mfs_last_diagnostic_run', Date.now().toString());
    if (onReportReady) onReportReady(report);
  };

  if (!lastRun || (now - parseInt(lastRun, 10) > runInterval)) {
    // Run immediately on startup if never run or expired
    setTimeout(execute, 5000);
  }

  const timer = setInterval(execute, runInterval);
  return () => clearInterval(timer);
}
