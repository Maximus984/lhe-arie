import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { getUsers, saveUsers, getUserByEmail, initializeUsers, hasPermission, ROLES } from '../data/users.js';
import { initializeFeed } from '../data/feed.js';
import { publish } from '../data/realtime.js';
import { initializeReleases } from '../data/releases.js';

// Change Log: cleanup for bugs summer - Added recovery key system and custom profile accent helpers.
const WORDLIST = ['forge', 'matrix', 'aries', 'neon', 'digital', 'glass', 'music', 'quantum', 'cyber', 'laser', 'studio', 'future', 'sound', 'creative', 'logic', 'arcade', 'visual', 'canvas', 'telemetry', 'system', 'vector', 'node', 'pipeline', 'reactor'];
export function generateRecoveryKey() {
  const words = [];
  for (let i = 0; i < 12; i++) {
    words.push(WORDLIST[Math.floor(Math.random() * WORDLIST.length)]);
  }
  return words.join(' ');
}

const AuthContext = createContext(null);

const MAX_ATTEMPTS = 5;
const SESSION_TIMEOUT_MS = 2 * 60 * 60 * 1000; // 2 hours

const DEFAULT_CALENDAR_EVENTS = [
  {
    id: 'evt_xmas_2026',
    title: '🎄 Maxx Forge Christmas Festival',
    description: 'Special profile gift claiming open! Festive decorations, holiday music catalog rollout, and community gift drop.',
    date: '2026-12-25',
    time: '12:00',
    location: 'Maxx Forge Central Hub',
    division: 'events'
  },
  {
    id: 'evt_newyear_2026',
    title: '🎆 Forge New Year Midnight DJ Set',
    description: 'Live virtual music performance by DJ Em synchronized with digital fireworks and custom TouchDesigner visuals.',
    date: '2026-12-31',
    time: '23:30',
    location: 'The Bio Forge Stage',
    division: 'records'
  },
  {
    id: 'evt_halloween_2026',
    title: '🎃 Bio-Skull Unity Horror Hunt',
    description: 'Live play-test tournament of the new Unity survival horror concept game. Collect game trophies and win epic badges.',
    date: '2026-10-31',
    time: '18:00',
    location: 'Unity Sandbox Room',
    division: 'gamedev'
  },
  {
    id: 'evt_aries_v4_2026',
    title: '🤖 Aries AI Core v4.0 Release',
    description: 'Official rollout of the Aries OS client software, interactive python game runner, and local AI sandbox v4.0.',
    date: '2026-09-15',
    time: '10:00',
    location: 'Aries Lab Node',
    division: 'aries'
  },
  {
    id: 'evt_prime_catalog_2026',
    title: '🎵 Prime Records Catalog Sweep',
    description: 'Distribution sweep of 12+ new electronic master mixes across BandLab, SoundCloud, and streaming services.',
    date: '2026-09-01',
    time: '09:00',
    location: 'SoundCloud / BandLab',
    division: 'records'
  }
];

// Simulated IP from browser fingerprint
const getSimulatedIP = () => {
  const stored = localStorage.getItem('mfs_simulated_ip');
  if (stored) return stored;
  const ip = `192.168.${Math.floor(Math.random()*255)}.${Math.floor(Math.random()*255)}`;
  localStorage.setItem('mfs_simulated_ip', ip);
  return ip;
};

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [sessionLogs, setSessionLogs] = useState([]);
  const [failedAttempts, setFailedAttempts] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [chatTickets, setChatTickets] = useState([]);
  const [formSubmissions, setFormSubmissions] = useState([]);
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [onlineStaff, setOnlineStaff] = useState([]);

  // Initialize data on mount
  useEffect(() => {
    initializeUsers();
    initializeFeed();
    initializeReleases();
    
    // Restore session
    const savedSession = localStorage.getItem('mfs_session');
    if (savedSession) {
      const session = JSON.parse(savedSession);
      const now = Date.now();
      if (now - session.loginTime < SESSION_TIMEOUT_MS) {
        // Fetch latest user data
        const users = getUsers();
        const freshUser = users.find(u => u.id === session.userId);
        if (freshUser) {
          if (freshUser.isBanned) {
            localStorage.removeItem('mfs_session');
            setCurrentUser(null);
          } else {
            setCurrentUser(freshUser);
            markUserOnline(freshUser.id);
          }
        } else {
          localStorage.removeItem('mfs_session');
        }
      } else {
        localStorage.removeItem('mfs_session');
      }
    }

    // Restore logs and submissions
    const logs = JSON.parse(localStorage.getItem('mfs_session_logs') || '[]');
    const tickets = JSON.parse(localStorage.getItem('mfs_chat_tickets') || '[]');
    const submissions = JSON.parse(localStorage.getItem('mfs_form_submissions') || '[]');
    let events = JSON.parse(localStorage.getItem('mfs_calendar_events') || '[]');
    if (events.length === 0) {
      events = DEFAULT_CALENDAR_EVENTS;
      localStorage.setItem('mfs_calendar_events', JSON.stringify(events));
    }
    const attempts = JSON.parse(localStorage.getItem('mfs_failed_attempts') || '{}');

    setSessionLogs(logs);
    setChatTickets(tickets);
    setFormSubmissions(submissions);
    setCalendarEvents(events);
    setFailedAttempts(attempts);
    setIsLoading(false);
  }, []);

  const markUserOnline = (userId) => {
    const users = getUsers();
    const updated = users.map(u => u.id === userId ? { ...u, isOnline: true, lastSeen: new Date().toISOString() } : u);
    saveUsers(updated);
    setOnlineStaff(updated.filter(u => u.isOnline && (u.role === 'staff' || u.role === 'founder')));
  };

  const markUserOffline = (userId) => {
    const users = getUsers();
    const updated = users.map(u => u.id === userId ? { ...u, isOnline: false, lastSeen: new Date().toISOString() } : u);
    saveUsers(updated);
    setOnlineStaff(updated.filter(u => u.isOnline && (u.role === 'staff' || u.role === 'founder')));
  };

  const addSessionLog = (entry) => {
    const logs = JSON.parse(localStorage.getItem('mfs_session_logs') || '[]');
    const newLog = {
      id: uuidv4(),
      ...entry,
      timestamp: new Date().toISOString(),
      ip: getSimulatedIP(),
      userAgent: navigator.userAgent.substring(0, 80),
    };
    const updated = [newLog, ...logs].slice(0, 200);
    localStorage.setItem('mfs_session_logs', JSON.stringify(updated));
    setSessionLogs(updated);
  };

  const login = useCallback(async (email, password) => {
    const attempts = JSON.parse(localStorage.getItem('mfs_failed_attempts') || '{}');
    const emailKey = email.toLowerCase();

    if ((attempts[emailKey] || 0) >= MAX_ATTEMPTS) {
      return { success: false, error: 'Account locked after 5 failed attempts. Contact an administrator.' };
    }

    await new Promise(r => setTimeout(r, 600)); // Simulate network delay

    const user = getUserByEmail(email);
    if (!user || user.password !== password) {
      const newAttempts = { ...attempts, [emailKey]: (attempts[emailKey] || 0) + 1 };
      localStorage.setItem('mfs_failed_attempts', JSON.stringify(newAttempts));
      setFailedAttempts(newAttempts);

      addSessionLog({ action: 'FAILED_LOGIN', email, reason: 'Invalid credentials' });
      const remaining = MAX_ATTEMPTS - newAttempts[emailKey];
      return { success: false, error: `Invalid credentials. ${remaining} attempt${remaining !== 1 ? 's' : ''} remaining.` };
    }

    if (user.isBanned) {
      return { success: false, error: 'This account has been banned by an administrator.' };
    }

    // Clear failed attempts on success
    const newAttempts = { ...attempts };
    delete newAttempts[emailKey];
    localStorage.setItem('mfs_failed_attempts', JSON.stringify(newAttempts));
    setFailedAttempts(newAttempts);

    // Save session
    const session = { userId: user.id, loginTime: Date.now() };
    localStorage.setItem('mfs_session', JSON.stringify(session));

    setCurrentUser(user);
    markUserOnline(user.id);
    addSessionLog({ action: 'LOGIN', email: user.email, userId: user.id, role: user.role });

    return { success: true, user };
  }, []);

  const logout = useCallback(() => {
    if (currentUser) {
      markUserOffline(currentUser.id);
      addSessionLog({ action: 'LOGOUT', email: currentUser.email, userId: currentUser.id });
    }
    localStorage.removeItem('mfs_session');
    setCurrentUser(null);
  }, [currentUser]);

  // ---- Full account registration ----
  const registerMember = useCallback(async (name, email, password, avatarEmoji = null, customRecoveryKey = null) => {
    if (!name || name.trim().length < 2) return { success: false, error: 'Display name must be at least 2 characters.' };
    if (!email || !email.includes('@')) return { success: false, error: 'Please enter a valid email address.' };
    if (!password || password.length < 6) return { success: false, error: 'Password must be at least 6 characters.' };

    const existing = getUserByEmail(email);
    if (existing) return { success: false, error: 'An account with this email already exists.' };

    await new Promise(r => setTimeout(r, 500)); // Simulate network delay

    const recoveryKey = customRecoveryKey || generateRecoveryKey();

    const newUser = {
      id: `usr_${uuidv4()}`,
      name: name.trim(),
      displayName: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      role: ROLES.MEMBER,
      avatar: avatarEmoji || name.trim().substring(0, 2).toUpperCase(),
      avatarIsEmoji: !!avatarEmoji,
      bio: '',
      joinedAt: new Date().toISOString(),
      isOnline: false,
      department: 'Community',
      badge: '⭐ Member',
      isGuest: false,
      recoveryKey,
      profileAccent: '#10B981',
      profileTheme: 'obsidian',
    };

    const users = getUsers();
    saveUsers([...users, newUser]);
    addSessionLog({ action: 'REGISTER', email: newUser.email, userId: newUser.id });

    // Auto-login after registration
    const session = { userId: newUser.id, loginTime: Date.now() };
    localStorage.setItem('mfs_session', JSON.stringify(session));
    setCurrentUser(newUser);
    markUserOnline(newUser.id);

    return { success: true, user: newUser };
  }, []);

  // ---- Password Recovery ----
  const recoverAccount = useCallback(async (email, recoveryKey, newPassword) => {
    if (!email || !recoveryKey || !newPassword) {
      return { success: false, error: 'All fields are required.' };
    }
    if (newPassword.length < 6) {
      return { success: false, error: 'New password must be at least 6 characters.' };
    }

    await new Promise(r => setTimeout(r, 600)); // Simulate network delay

    const users = getUsers();
    const userIndex = users.findIndex(u => u.email.toLowerCase() === email.toLowerCase().trim());
    if (userIndex === -1) {
      return { success: false, error: 'No account found with this email address.' };
    }

    const user = users[userIndex];
    const userKey = user.recoveryKey || '';
    if (!userKey || userKey.toLowerCase().trim() !== recoveryKey.toLowerCase().trim()) {
      return { success: false, error: 'Invalid recovery key.' };
    }

    // Reset password
    const updatedUser = { ...user, password: newPassword };
    const updatedUsers = [...users];
    updatedUsers[userIndex] = updatedUser;
    saveUsers(updatedUsers);

    addSessionLog({ action: 'PASSWORD_RECOVERED', email: user.email, userId: user.id });

    // Clear failed attempts
    const attempts = JSON.parse(localStorage.getItem('mfs_failed_attempts') || '{}');
    const emailKey = email.toLowerCase();
    delete attempts[emailKey];
    localStorage.setItem('mfs_failed_attempts', JSON.stringify(attempts));
    setFailedAttempts(attempts);

    return { success: true, user: updatedUser };
  }, []);

  // ---- Update User Profile (Customizations) ----
  const updateUserProfile = useCallback(async (updates) => {
    if (!currentUser) return { success: false, error: 'Not authenticated.' };

    const users = getUsers();
    const userIndex = users.findIndex(u => u.id === currentUser.id);
    if (userIndex === -1) {
      // For guests, update state only
      const updatedUser = { ...currentUser, ...updates };
      setCurrentUser(updatedUser);
      return { success: true, user: updatedUser };
    }

    const updatedUser = { ...users[userIndex], ...updates };
    const updatedUsers = [...users];
    updatedUsers[userIndex] = updatedUser;
    saveUsers(updatedUsers);
    setCurrentUser(updatedUser);

    addSessionLog({ action: 'PROFILE_UPDATED', email: updatedUser.email, userId: updatedUser.id });
    return { success: true, user: updatedUser };
  }, [currentUser]);

  // ---- Guest session ----
  const guestLogin = useCallback(() => {
    const guestNum = Math.floor(1000 + Math.random() * 8999);
    const guestUser = {
      id: `guest_${uuidv4()}`,
      name: `ForgeGuest#${guestNum}`,
      displayName: `ForgeGuest#${guestNum}`,
      email: `guest_${guestNum}@forge.temp`,
      password: '',
      role: ROLES.GUEST,
      avatar: '👤',
      avatarIsEmoji: true,
      bio: 'Visiting the Forge as a guest.',
      joinedAt: new Date().toISOString(),
      isOnline: true,
      department: 'Guest',
      badge: '🌐 Guest',
      isGuest: true,
    };
    // Guests use session storage only (not persisted to users list)
    sessionStorage.setItem('mfs_guest_session', JSON.stringify(guestUser));
    setCurrentUser(guestUser);
    addSessionLog({ action: 'GUEST_LOGIN', userId: guestUser.id });
    return { success: true, user: guestUser };
  }, []);

  // Form submissions
  const submitForm = (formData) => {
    const submissions = JSON.parse(localStorage.getItem('mfs_form_submissions') || '[]');
    const newSub = {
      id: uuidv4(),
      ...formData,
      submittedAt: new Date().toISOString(),
      status: 'pending',
      assignedTo: null,
    };
    const updated = [newSub, ...submissions];
    localStorage.setItem('mfs_form_submissions', JSON.stringify(updated));
    setFormSubmissions(updated);
    // Broadcast to all tabs so Staff Portal gets instant notification
    publish('form_submitted', { id: newSub.id, type: newSub.formType || formData.formType, submittedAt: newSub.submittedAt });
    return newSub.id;
  };

  const updateSubmission = (id, updates) => {
    const submissions = JSON.parse(localStorage.getItem('mfs_form_submissions') || '[]');
    const updated = submissions.map(s => s.id === id ? { ...s, ...updates } : s);
    localStorage.setItem('mfs_form_submissions', JSON.stringify(updated));
    setFormSubmissions(updated);
  };

  // Calendar events
  const addCalendarEvent = (event) => {
    const events = JSON.parse(localStorage.getItem('mfs_calendar_events') || '[]');
    const newEvent = { id: uuidv4(), ...event, createdAt: new Date().toISOString() };
    const updated = [...events, newEvent];
    localStorage.setItem('mfs_calendar_events', JSON.stringify(updated));
    setCalendarEvents(updated);
    return newEvent.id;
  };

  const deleteCalendarEvent = (id) => {
    const events = JSON.parse(localStorage.getItem('mfs_calendar_events') || '[]');
    const updated = events.filter(e => e.id !== id);
    localStorage.setItem('mfs_calendar_events', JSON.stringify(updated));
    setCalendarEvents(updated);
  };

  // ── Staff: Account Management Functions ──

  const generateOneTimeRecoveryKey = (userId) => {
    const users = getUsers();
    const user = users.find(u => u.id === userId);
    if (!user) return null;
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    const key = Array.from({ length: 4 }, () =>
      Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
    ).join('-');
    const record = { userId, key, email: user.email, createdAt: new Date().toISOString(), used: false };
    const existing = JSON.parse(localStorage.getItem('mfs_otp_keys') || '[]');
    const filtered = existing.filter(r => r.userId !== userId); // one active key per user
    localStorage.setItem('mfs_otp_keys', JSON.stringify([record, ...filtered]));
    addSessionLog({ action: 'OTP_KEY_GENERATED', targetUserId: userId, email: user.email });
    return key;
  };

  const validateOneTimeKey = (email, key) => {
    try {
      const records = JSON.parse(localStorage.getItem('mfs_otp_keys') || '[]');
      const record = records.find(r =>
        r.email.toLowerCase() === email.toLowerCase() &&
        r.key === key.toUpperCase().replace(/[^A-Z0-9]/g, '').replace(/(....)/g, '$1-').slice(0, 19) &&
        !r.used
      );
      if (!record) return { success: false, error: 'Invalid or expired recovery key.' };
      const ageMs = Date.now() - new Date(record.createdAt).getTime();
      if (ageMs > 24 * 60 * 60 * 1000) return { success: false, error: 'Recovery key has expired (24h limit).' };
      // Mark used
      const updated = records.map(r => r.userId === record.userId ? { ...r, used: true } : r);
      localStorage.setItem('mfs_otp_keys', JSON.stringify(updated));
      const users = getUsers();
      const user = users.find(u => u.id === record.userId);
      return { success: true, user };
    } catch (_) {
      return { success: false, error: 'Key validation failed.' };
    }
  };

  const changeUserEmail = (userId, newEmail) => {
    const users = getUsers();
    const exists = users.find(u => u.email.toLowerCase() === newEmail.toLowerCase() && u.id !== userId);
    if (exists) return { success: false, error: 'Email already in use.' };
    const updated = users.map(u => u.id === userId ? { ...u, email: newEmail } : u);
    saveUsers(updated);
    if (currentUser?.id === userId) setCurrentUser(prev => ({ ...prev, email: newEmail }));
    addSessionLog({ action: 'EMAIL_CHANGED', targetUserId: userId, newEmail });
    return { success: true };
  };

  const clearAccountLockout = (email) => {
    const attempts = JSON.parse(localStorage.getItem('mfs_failed_attempts') || '{}');
    const emailKey = email.toLowerCase();
    delete attempts[emailKey];
    localStorage.setItem('mfs_failed_attempts', JSON.stringify(attempts));
    setFailedAttempts(attempts);
    addSessionLog({ action: 'LOCKOUT_CLEARED', email });
    return { success: true };
  };

  const submitDiagnosticReport = (report) => {
    const reports = JSON.parse(localStorage.getItem('mfs_diagnostic_reports') || '[]');
    const newReport = {
      id: uuidv4(),
      ...report,
      submittedAt: new Date().toISOString(),
      staffId: currentUser?.id,
      staffName: currentUser?.name,
    };
    const updated = [newReport, ...reports];
    localStorage.setItem('mfs_diagnostic_reports', JSON.stringify(updated));
    // Also push to proposals for Admin visibility
    const proposals = JSON.parse(localStorage.getItem('mfs_proposals') || '[]');
    proposals.unshift({
      id: uuidv4(),
      title: `[DIAG] ${report.title || 'Staff Diagnostic Report'}`,
      body: report.notes || '',
      category: 'diagnostics',
      authorId: currentUser?.id,
      authorName: currentUser?.name,
      createdAt: new Date().toISOString(),
      status: report.escalate ? 'review' : 'submitted',
      priority: report.escalate ? 'high' : 'normal',
    });
    localStorage.setItem('mfs_proposals', JSON.stringify(proposals));
    publish('diagnostic_report_submitted', { staffId: currentUser?.id, staffName: currentUser?.name, title: newReport.title });
    addSessionLog({ action: 'DIAGNOSTIC_REPORT_SUBMITTED', reportId: newReport.id });
    return { success: true, reportId: newReport.id };
  };

  const getOtpKeys = () => {
    try { return JSON.parse(localStorage.getItem('mfs_otp_keys') || '[]'); } catch (_) { return []; }
  };

  const getDiagnosticReports = () => {
    try { return JSON.parse(localStorage.getItem('mfs_diagnostic_reports') || '[]'); } catch (_) { return []; }
  };

  // Chat tickets
  const createChatTicket = (ticket) => {
    const tickets = JSON.parse(localStorage.getItem('mfs_chat_tickets') || '[]');
    const newTicket = {
      id: uuidv4(),
      ...ticket,
      status: 'open',
      createdAt: new Date().toISOString(),
      messages: ticket.messages || [],
    };
    const updated = [newTicket, ...tickets];
    localStorage.setItem('mfs_chat_tickets', JSON.stringify(updated));
    setChatTickets(updated);
    // Broadcast to all tabs so Staff Portal gets instant notification
    publish('chat_ticket', { id: newTicket.id, userName: newTicket.userName, subject: newTicket.subject });
    return newTicket.id;
  };

  const can = (permission) => hasPermission(currentUser?.role, permission);
  const isGuest = currentUser?.isGuest === true;

  const value = {
    currentUser, isLoading,
    sessionLogs, failedAttempts, onlineStaff,
    chatTickets, formSubmissions, calendarEvents,
    login, logout, registerMember, guestLogin, recoverAccount, updateUserProfile,
    submitForm, updateSubmission,
    addCalendarEvent, deleteCalendarEvent,
    createChatTicket,
    // Staff account management
    generateOneTimeRecoveryKey, validateOneTimeKey,
    changeUserEmail, clearAccountLockout,
    submitDiagnosticReport, getOtpKeys, getDiagnosticReports,
    can, isGuest,
    getSimulatedIP,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
