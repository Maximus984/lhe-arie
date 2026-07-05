// =====================================================
// MAXX FORGE STUDIO™ — User Registry & Permissions
// =====================================================

export const ROLES = {
  FOUNDER: 'founder',
  STAFF: 'staff',
  MEMBER: 'member',
};

export const PERMISSIONS = {
  founder: [
    'view_dashboard', 'view_admin', 'view_staff_portal',
    'manage_users', 'view_ip_logs', 'manage_forms',
    'manage_calendar', 'manage_content', 'view_analytics',
    'respond_chat', 'manage_staff', 'delete_submissions',
    'view_all_events', 'system_settings',
  ],
  staff: [
    'view_dashboard', 'view_staff_portal',
    'view_forms', 'manage_calendar', 'respond_chat',
    'view_all_events', 'manage_assigned_tickets',
    'update_submission_status',
  ],
  member: [
    'view_dashboard', 'submit_forms',
    'view_public_events', 'use_ai_chat',
  ],
};

export const hasPermission = (role, permission) => {
  return PERMISSIONS[role]?.includes(permission) ?? false;
};

// ---- Pre-seeded accounts ----
export const SEED_USERS = [
  {
    id: 'usr_founder_001',
    name: 'Maximus',
    displayName: 'Maxx — Founder',
    email: 'maximus@maxxforgestudio.com',
    password: 'ForgeFounder2026!',
    role: ROLES.FOUNDER,
    avatar: 'MX',
    bio: 'Founder & Creative Director of Maxx Forge Studio™. Architect of the Aries AI ecosystem.',
    joinedAt: '2024-01-01T00:00:00Z',
    isOnline: false,
    department: 'Executive',
    badge: '🔥 Founder',
  },
  {
    id: 'usr_staff_001',
    name: 'Em',
    displayName: 'DJ Em — Events Lead',
    email: 'em@maxxforgestudio.com',
    password: 'StaffForge2026!',
    role: ROLES.STAFF,
    avatar: 'EM',
    bio: 'Lead DJ & Live Events Coordinator. TouchDesigner visual artist and DMX automation specialist.',
    joinedAt: '2024-03-15T00:00:00Z',
    isOnline: false,
    department: 'Live Events',
    badge: '⚡ Events Lead',
  },
  {
    id: 'usr_staff_002',
    name: 'Zeppelin',
    displayName: 'Zeppelin — Tech Lead',
    email: 'zeppelin@maxxforgestudio.com',
    password: 'AriesDev2026!',
    role: ROLES.STAFF,
    avatar: 'ZL',
    bio: 'Lead AI/Software Engineer. Aries AI pipeline architect and Python SDK developer.',
    joinedAt: '2024-06-01T00:00:00Z',
    isOnline: false,
    department: 'Technology',
    badge: '🤖 Tech Lead',
  },
];

export const initializeUsers = () => {
  const existing = localStorage.getItem('mfs_users');
  if (!existing) {
    localStorage.setItem('mfs_users', JSON.stringify(SEED_USERS));
  }
};

export const getUsers = () => {
  const data = localStorage.getItem('mfs_users');
  return data ? JSON.parse(data) : SEED_USERS;
};

export const saveUsers = (users) => {
  localStorage.setItem('mfs_users', JSON.stringify(users));
};

export const getUserByEmail = (email) => {
  return getUsers().find(u => u.email.toLowerCase() === email.toLowerCase());
};
