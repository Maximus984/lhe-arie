// =====================================================
// MAXX FORGE STUDIO™ — User Registry & Permissions
// =====================================================

export const ROLES = {
  FOUNDER: 'founder',
  STAFF: 'staff',
  MEMBER: 'member',
  GUEST: 'guest',
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
    'view_feed', 'react_feed', 'post_feed',
    // Settings
    'view_settings', 'edit_profile',
    // Collectibles
    'claim_collectible', 'view_collectibles',
  ],
  guest: [
    // Very limited access — browse only
    'view_dashboard',
    'view_public_events',
    'use_ai_chat',
    // View feed, no posting
    'view_feed',
    // Collectibles — one free starter
    'view_collectibles', 'claim_collectible',
  ],
};

export const initializeRoles = () => {
  const existing = localStorage.getItem('mfs_custom_roles');
  if (!existing) {
    const defaults = {
      founder: { name: 'Founder', color: '#EF4444', badge: '🔥 Founder', permissions: PERMISSIONS.founder },
      staff: { name: 'Staff', color: '#EC4899', badge: '⚡ Staff', permissions: PERMISSIONS.staff },
      member: { name: 'Member', color: '#10B981', badge: '👤 Member', permissions: PERMISSIONS.member },
      guest: { name: 'Guest', color: '#9CA3AF', badge: '🌐 Guest', permissions: PERMISSIONS.guest }
    };
    localStorage.setItem('mfs_custom_roles', JSON.stringify(defaults));
  }
};

export const hasPermission = (role, permission) => {
  // Founder override - has all permissions
  if (role === 'founder') return true;

  // Check dynamic role permissions from localStorage
  try {
    const customRoles = JSON.parse(localStorage.getItem('mfs_custom_roles') || '{}');
    if (customRoles[role]) {
      return customRoles[role].permissions.includes(permission);
    }
  } catch (e) {
    console.error('Failed parsing custom roles', e);
  }

  // Fallback to static PERMISSIONS definitions
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
  initializeRoles();
  const existing = localStorage.getItem('mfs_users');
  if (!existing) {
    localStorage.setItem('mfs_users', JSON.stringify(SEED_USERS));
  } else {
    // Always sync seed users' credentials from env vars so .env changes take effect immediately
    try {
      const users = JSON.parse(existing);
      let changed = false;
      const synced = users.map(u => {
        const seed = SEED_USERS.find(s => s.id === u.id);
        if (seed && (u.email !== seed.email || u.password !== seed.password)) {
          changed = true;
          return { ...u, email: seed.email, password: seed.password };
        }
        return u;
      });
      if (changed) {
        localStorage.setItem('mfs_users', JSON.stringify(synced));
      }
    } catch (e) {
      // If parse fails, re-seed fresh
      localStorage.setItem('mfs_users', JSON.stringify(SEED_USERS));
    }
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
