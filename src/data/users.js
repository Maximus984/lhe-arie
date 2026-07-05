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
    // Dashboard core
    'view_dashboard', 'view_admin', 'view_staff_portal',
    'manage_users', 'view_ip_logs', 'manage_forms',
    'manage_calendar', 'manage_content', 'view_analytics',
    'respond_chat', 'manage_staff', 'delete_submissions',
    'view_all_events', 'system_settings',
    // Calendar
    'view_calendar', 'edit_calendar', 'delete_calendar_events',
    // Workspace suite
    'use_workspace', 'manage_workspace',
    'create_docs', 'edit_docs', 'delete_docs', 'view_docs',
    'manage_drive', 'upload_drive', 'view_drive',
    'create_slides', 'edit_slides', 'delete_slides', 'view_slides',
    'manage_vault', 'upload_vault', 'view_vault', 'delete_vault',
    // Community feed
    'view_feed', 'post_feed', 'delete_post', 'manage_feed',
    'manage_channels', 'post_channel', 'react_feed',
    'moderate_feed',
    // Settings
    'view_settings', 'view_settings_system', 'edit_profile',
    'edit_about', 'manage_theme',
    // Notifications
    'send_announcements',
  ],
  staff: [
    // Dashboard core
    'view_dashboard', 'view_staff_portal',
    'view_forms', 'manage_calendar', 'respond_chat',
    'view_all_events', 'manage_assigned_tickets',
    'update_submission_status',
    // Calendar
    'view_calendar', 'edit_calendar',
    // Workspace suite
    'use_workspace', 'view_workspace',
    'create_docs', 'edit_docs', 'view_docs',
    'upload_drive', 'view_drive',
    'create_slides', 'edit_slides', 'view_slides',
    'upload_vault', 'view_vault',
    // Community feed
    'view_feed', 'post_feed', 'post_channel', 'react_feed',
    'delete_own_post',
    // Settings
    'view_settings', 'edit_profile',
  ],
  member: [
    // Dashboard core
    'view_dashboard', 'submit_forms',
    'view_public_events', 'use_ai_chat',
    // Calendar
    'view_calendar',
    // Workspace suite (read-only)
    'view_docs', 'view_drive', 'view_slides', 'view_vault',
    // Community feed
    'view_feed', 'react_feed',
    // Settings
    'view_settings', 'edit_profile',
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
    email: import.meta.env.VITE_FOUNDER_EMAIL || 'maximus@example.com',
    password: import.meta.env.VITE_FOUNDER_PASSWORD || 'DummyPassword123!',
    role: ROLES.FOUNDER,
    avatar: 'MX',
    bio: 'Founder & Creative Director of Maxx Forge Studio™. Architect of the Aries AI ecosystem.',
    joinedAt: '2024-01-01T00:00:00Z',
    isOnline: false,
    department: 'Executive',
    badge: '🔥 Founder',
    photo: null, // Set to '/brand/maximus-photo.jpg' when you add the file
  },
  {
    id: 'usr_staff_001',
    name: 'Em',
    displayName: 'DJ Em — Events Lead',
    email: import.meta.env.VITE_STAFF_EM_EMAIL || 'em@example.com',
    password: import.meta.env.VITE_STAFF_EM_PASSWORD || 'DummyPassword123!',
    role: ROLES.STAFF,
    avatar: 'EM',
    bio: 'Lead DJ & Live Events Coordinator. TouchDesigner visual artist and DMX automation specialist.',
    joinedAt: '2024-03-15T00:00:00Z',
    isOnline: false,
    department: 'Live Events',
    badge: '⚡ Events Lead',
    photo: null,
  },
  {
    id: 'usr_staff_002',
    name: 'Zeppelin',
    displayName: 'Zeppelin — Tech Lead',
    email: import.meta.env.VITE_STAFF_ZEPPELIN_EMAIL || 'zeppelin@example.com',
    password: import.meta.env.VITE_STAFF_ZEPPELIN_PASSWORD || 'DummyPassword123!',
    role: ROLES.STAFF,
    avatar: 'ZL',
    bio: 'Lead AI/Software Engineer. Aries AI pipeline architect and Python SDK developer.',
    joinedAt: '2024-06-01T00:00:00Z',
    isOnline: false,
    department: 'Technology',
    badge: '🤖 Tech Lead',
    photo: null,
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
