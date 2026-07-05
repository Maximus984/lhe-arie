import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { getUsers, saveUsers, getUserByEmail, initializeUsers, hasPermission } from '../data/users.js';

const AuthContext = createContext(null);

const MAX_ATTEMPTS = 5;
const SESSION_TIMEOUT_MS = 2 * 60 * 60 * 1000; // 2 hours

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
    const events = JSON.parse(localStorage.getItem('mfs_calendar_events') || '[]');
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

  const registerMember = useCallback(async (name, email, password) => {
    const existing = getUserByEmail(email);
    if (existing) return { success: false, error: 'An account with this email already exists.' };

    const { v4: uuidv4_inner } = await import('uuid');
    const newUser = {
      id: `usr_${uuidv4_inner()}`,
      name,
      displayName: name,
      email,
      password,
      role: 'member',
      avatar: name.substring(0, 2).toUpperCase(),
      bio: '',
      joinedAt: new Date().toISOString(),
      isOnline: false,
      department: 'Community',
      badge: '⭐ Member',
    };

    const users = getUsers();
    saveUsers([...users, newUser]);
    addSessionLog({ action: 'REGISTER', email, userId: newUser.id });

    return { success: true };
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
    return newTicket.id;
  };

  const can = (permission) => hasPermission(currentUser?.role, permission);

  const value = {
    currentUser, isLoading,
    sessionLogs, failedAttempts, onlineStaff,
    chatTickets, formSubmissions, calendarEvents,
    login, logout, registerMember,
    submitForm, updateSubmission,
    addCalendarEvent, deleteCalendarEvent,
    createChatTicket,
    can,
    getSimulatedIP,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
