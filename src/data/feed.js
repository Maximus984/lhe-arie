// =====================================================
// MAXX FORGE STUDIO™ — Community Feed Data Layer
// =====================================================

import { v4 as uuidv4 } from 'uuid';

export const DEFAULT_CHANNELS = [
  {
    id: 'ch_announcements',
    name: 'announcements',
    emoji: '📢',
    description: 'Official announcements from Maxx Forge Studio',
    isPublic: true,
    allowMemberPost: false,
    allowMemberReact: true,
    category: 'Official',
    pinned: true,
  },
  {
    id: 'ch_music_drops',
    name: 'music-drops',
    emoji: '🎵',
    description: 'New music releases, previews and track drops',
    isPublic: true,
    allowMemberPost: false,
    allowMemberReact: true,
    category: 'Music',
    pinned: false,
  },
  {
    id: 'ch_events',
    name: 'events',
    emoji: '🎤',
    description: 'Upcoming shows, live events and booking info',
    isPublic: true,
    allowMemberPost: false,
    allowMemberReact: true,
    category: 'Events',
    pinned: false,
  },
  {
    id: 'ch_general',
    name: 'general',
    emoji: '💬',
    description: 'General studio chatter — open to members',
    isPublic: true,
    allowMemberPost: true,
    allowMemberReact: true,
    category: 'Community',
    pinned: false,
  },
  {
    id: 'ch_showcase',
    name: 'showcase',
    emoji: '🎨',
    description: 'Share your art, music, and creative work',
    isPublic: true,
    allowMemberPost: true,
    allowMemberReact: true,
    category: 'Community',
    pinned: false,
  },
  {
    id: 'ch_staff_lounge',
    name: 'staff-lounge',
    emoji: '🔒',
    description: 'Private staff coordination channel',
    isPublic: false,
    allowMemberPost: false,
    allowMemberReact: false,
    category: 'Staff',
    pinned: false,
  },
];

export const SEED_POSTS = [
  {
    id: 'post_001',
    channelId: 'ch_announcements',
    authorId: 'usr_founder_001',
    authorName: 'Maxx — Founder',
    authorBadge: '🔥 Founder',
    authorAvatar: 'MX',
    type: 'text',
    content: '🔥 Welcome to The Forge Feed — our official community space! This is where we drop new music, announce events, and connect with the community. Stay tuned for big things coming in 2026.',
    mediaUrl: null,
    reactions: { '🔥': ['guest_1', 'guest_2'], '❤️': ['guest_3'] },
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    pinned: true,
  },
  {
    id: 'post_002',
    channelId: 'ch_music_drops',
    authorId: 'usr_staff_001',
    authorName: 'DJ Em — Events Lead',
    authorBadge: '⚡ Events Lead',
    authorAvatar: 'EM',
    type: 'text',
    content: '🎵 New track "Adrenaline Rush" is now live on the platform! Head to the Records section to vibe out. This one hits different — produced over 3 late nights fueled by coffee and creativity ☕🎹',
    mediaUrl: null,
    reactions: { '🎵': ['guest_1'], '🔥': ['guest_2', 'guest_3', 'guest_4'], '😍': ['guest_5'] },
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    pinned: false,
  },
  {
    id: 'post_003',
    channelId: 'ch_events',
    authorId: 'usr_staff_001',
    authorName: 'DJ Em — Events Lead',
    authorBadge: '⚡ Events Lead',
    authorAvatar: 'EM',
    type: 'text',
    content: '📅 SAVE THE DATE — Maxx Forge Live Session coming this August! More details dropping soon. Get ready for lights, lasers, and live sets from the whole Forge crew. 🎛️✨',
    mediaUrl: null,
    reactions: { '🎤': ['guest_1', 'guest_2'], '🔥': ['guest_3'] },
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    pinned: false,
  },
];

export const initializeFeed = () => {
  if (!localStorage.getItem('mfs_feed_channels')) {
    localStorage.setItem('mfs_feed_channels', JSON.stringify(DEFAULT_CHANNELS));
  }
  if (!localStorage.getItem('mfs_feed_posts')) {
    localStorage.setItem('mfs_feed_posts', JSON.stringify(SEED_POSTS));
  }
};

export const getChannels = (includePrivate = false) => {
  const raw = localStorage.getItem('mfs_feed_channels');
  const channels = raw ? JSON.parse(raw) : DEFAULT_CHANNELS;
  return includePrivate ? channels : channels.filter(c => c.isPublic);
};

export const saveChannels = (channels) => {
  localStorage.setItem('mfs_feed_channels', JSON.stringify(channels));
};

export const getPosts = (channelId = null) => {
  const raw = localStorage.getItem('mfs_feed_posts');
  const posts = raw ? JSON.parse(raw) : SEED_POSTS;
  if (channelId) return posts.filter(p => p.channelId === channelId);
  return posts;
};

export const createPost = (postData) => {
  const posts = getPosts();
  const newPost = {
    id: `post_${uuidv4().slice(0, 8)}`,
    ...postData,
    reactions: {},
    createdAt: new Date().toISOString(),
    pinned: false,
  };
  const updated = [newPost, ...posts];
  localStorage.setItem('mfs_feed_posts', JSON.stringify(updated));
  return newPost;
};

export const toggleReaction = (postId, emoji, userId) => {
  const posts = getPosts();
  const updated = posts.map(p => {
    if (p.id !== postId) return p;
    const reactions = { ...p.reactions };
    if (!reactions[emoji]) reactions[emoji] = [];
    if (reactions[emoji].includes(userId)) {
      reactions[emoji] = reactions[emoji].filter(id => id !== userId);
      if (reactions[emoji].length === 0) delete reactions[emoji];
    } else {
      reactions[emoji] = [...reactions[emoji], userId];
    }
    return { ...p, reactions };
  });
  localStorage.setItem('mfs_feed_posts', JSON.stringify(updated));
  return updated;
};

export const deletePost = (postId) => {
  const posts = getPosts().filter(p => p.id !== postId);
  localStorage.setItem('mfs_feed_posts', JSON.stringify(posts));
};

export const addChannel = (channelData) => {
  const channels = getChannels(true);
  const newChannel = {
    id: `ch_${uuidv4().slice(0, 8)}`,
    ...channelData,
    pinned: false,
  };
  const updated = [...channels, newChannel];
  saveChannels(updated);
  return newChannel;
};
