import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { getUsers, saveUsers, getUserByEmail, initializeUsers, hasPermission, ROLES } from '../data/users.js';
import { initializeFeed } from '../data/feed.js';
import { publish } from '../data/realtime.js';

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
          setCurrentUser(freshUser);
          markUserOnline(freshUser.id);
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
  const registerMember = useCallback(async (name, email, password, avatarEmoji = null) => {
    if (!name || name.trim().length < 2) return { success: false, error: 'Display name must be at least 2 characters.' };
    if (!email || !email.includes('@')) return { success: false, error: 'Please enter a valid email address.' };
    if (!password || password.length < 6) return { success: false, error: 'Password must be at least 6 characters.' };

    const existing = getUserByEmail(email);
    if (existing) return { success: false, error: 'An account with this email already exists.' };

    await new Promise(r => setTimeout(r, 500)); // Simulate network delay

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
    login, logout, registerMember, guestLogin,
    submitForm, updateSubmission,
    addCalendarEvent, deleteCalendarEvent,
    createChatTicket,
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
