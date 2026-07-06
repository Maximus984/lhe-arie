// =====================================================
// MAXX FORGE STUDIO™ — Digital Collectibles System
// "The Forge Chest" — Season-aware digital items for profiles
// =====================================================

export const RARITY = {
  COMMON: 'common',
  RARE: 'rare',
  EPIC: 'epic',
  LEGENDARY: 'legendary',
};

export const RARITY_CONFIG = {
  common:    { label: 'Common',    color: '#9CA3AF', glow: 'rgba(156,163,175,0.3)', stars: 1 },
  rare:      { label: 'Rare',      color: '#60A5FA', glow: 'rgba(96,165,250,0.4)',  stars: 2 },
  epic:      { label: 'Epic',      color: '#A78BFA', glow: 'rgba(167,139,250,0.5)', stars: 3 },
  legendary: { label: 'Legendary', color: '#FBBF24', glow: 'rgba(251,191,36,0.6)',  stars: 4 },
};

// ---- All collectible definitions ----
export const ALL_COLLECTIBLES = [
  // ── MUSIC ──────────────────────────────────────────
  { id: 'music_vinyl',     category: 'music',   emoji: '🎵', name: 'Prime Vinyl',       desc: 'A rare pressing from Prime Records.',     rarity: RARITY.COMMON,    season: null,        cooldownHours: 24  },
  { id: 'music_mic',       category: 'music',   emoji: '🎤', name: 'Studio Mic',        desc: 'Pro-grade microphone from the booth.',    rarity: RARITY.RARE,      season: null,        cooldownHours: 48  },
  { id: 'music_eq',        category: 'music',   emoji: '🎛️', name: 'EQ Console',        desc: 'The heart of the Forge sound engine.',    rarity: RARITY.RARE,      season: null,        cooldownHours: 48  },
  { id: 'music_djbooth',   category: 'music',   emoji: '🎧', name: 'DJ Em Booth',       desc: 'Legendary booth from a 100+ event run.',  rarity: RARITY.EPIC,      season: null,        cooldownHours: 72  },
  { id: 'music_note',      category: 'music',   emoji: '🎶', name: 'Electric Whisper',  desc: 'The sound of inspiration.',               rarity: RARITY.COMMON,    season: null,        cooldownHours: 12  },
  { id: 'music_bass',      category: 'music',   emoji: '🎸', name: 'Bass Guitar',       desc: 'Deep frequencies from the Forge.',        rarity: RARITY.RARE,      season: null,        cooldownHours: 48  },

  // ── GAMING ─────────────────────────────────────────
  { id: 'game_controller', category: 'gaming',  emoji: '🎮', name: 'Forge Controller',  desc: 'Wield the power of the Echoes.',          rarity: RARITY.COMMON,    season: null,        cooldownHours: 24  },
  { id: 'game_skull',      category: 'gaming',  emoji: '💀', name: 'Bio-Skull Helmet',  desc: 'From the survival horror corridors.',     rarity: RARITY.EPIC,      season: null,        cooldownHours: 72  },
  { id: 'game_sword',      category: 'gaming',  emoji: '⚔️', name: 'Cyber Blade',       desc: 'Forged in the digital grid matrix.',      rarity: RARITY.RARE,      season: null,        cooldownHours: 48  },
  { id: 'game_joystick',   category: 'gaming',  emoji: '🕹️', name: 'Retro Stick',       desc: 'Old soul. New power.',                    rarity: RARITY.COMMON,    season: null,        cooldownHours: 12  },

  // ── AI / TECH ───────────────────────────────────────
  { id: 'ai_chip',         category: 'tech',    emoji: '🤖', name: 'Aries Core Chip',   desc: 'A fragment of the Aries AI v4.0 core.',   rarity: RARITY.EPIC,      season: null,        cooldownHours: 72  },
  { id: 'ai_circuit',      category: 'tech',    emoji: '💡', name: 'Neural Orb',        desc: 'Raw intelligence, crystallized.',         rarity: RARITY.RARE,      season: null,        cooldownHours: 48  },
  { id: 'ai_terminal',     category: 'tech',    emoji: '🖥️', name: 'AI Terminal',       desc: 'Your gateway to the Aries network.',      rarity: RARITY.COMMON,    season: null,        cooldownHours: 24  },
  { id: 'ai_cube',         category: 'tech',    emoji: '🔮', name: 'Data Crystal',      desc: 'Stores 4.7B AI context tokens.',          rarity: RARITY.RARE,      season: null,        cooldownHours: 48  },

  // ── LEGENDARY ──────────────────────────────────────
  { id: 'legendary_emblem',category: 'legendary',emoji:'🔥', name: 'Forge Emblem',     desc: 'The ultimate Maxx Forge Studio™ badge. Extremely rare.', rarity: RARITY.LEGENDARY, season: null, cooldownHours: 168 },
  { id: 'legendary_crown', category: 'legendary',emoji:'👑', name: 'Dark Queen Crown', desc: 'From the Prime Records vault. One of one.', rarity: RARITY.LEGENDARY, season: null, cooldownHours: 168 },
  { id: 'legendary_ariana_sunshine', category: 'legendary', emoji: '☀️', name: 'Eternal Sunshine', desc: 'Once-in-a-lifetime badge for listening to Ariana Grande\'s full deluxe album.', rarity: RARITY.LEGENDARY, season: null, cooldownHours: 168 },
  { id: 'legendary_radio_host', category: 'legendary', emoji: '🎙️', name: 'Forge Radio Host', desc: 'Once-in-a-lifetime badge for active loop radio listening.', rarity: RARITY.LEGENDARY, season: null, cooldownHours: 168 },

  // ── SEASONAL: CHRISTMAS (December) ─────────────────
  { id: 'xmas_star',       category: 'seasonal', emoji: '⭐', name: 'Forge Star',       desc: 'Placed on top of the Maxx Forge tree.',   rarity: RARITY.EPIC,      season: 'christmas', cooldownHours: 24  },
  { id: 'xmas_bell',       category: 'seasonal', emoji: '🔔', name: 'Jingle Bell',      desc: 'Rings through the neon studio halls.',    rarity: RARITY.COMMON,    season: 'christmas', cooldownHours: 12  },
  { id: 'xmas_gift',       category: 'seasonal', emoji: '🎁', name: 'Forge Gift Box',   desc: 'A wrapped present from the Forge crew.',  rarity: RARITY.RARE,      season: 'christmas', cooldownHours: 24  },
  { id: 'xmas_snowflake',  category: 'seasonal', emoji: '❄️', name: 'Neon Snowflake',   desc: 'A crystal snowflake lit in cyan.',        rarity: RARITY.RARE,      season: 'christmas', cooldownHours: 24  },
  { id: 'xmas_tree',       category: 'seasonal', emoji: '🎄', name: 'Digital Tree',     desc: 'A holographic Forge Christmas tree.',     rarity: RARITY.EPIC,      season: 'christmas', cooldownHours: 48  },
  { id: 'xmas_santa',      category: 'seasonal', emoji: '🎅', name: 'Santa Forge',      desc: 'Santa wearing a Maxx Forge hoodie.',      rarity: RARITY.LEGENDARY,  season: 'christmas', cooldownHours: 168 },

  // ── SEASONAL: HALLOWEEN (October) ──────────────────
  { id: 'hw_pumpkin',      category: 'seasonal', emoji: '🎃', name: 'Forge Lantern',    desc: 'Carved with the Forge emblem.',           rarity: RARITY.RARE,      season: 'halloween', cooldownHours: 24  },
  { id: 'hw_ghost',        category: 'seasonal', emoji: '👻', name: 'Studio Ghost',     desc: 'Haunts the mixing board at 3AM.',         rarity: RARITY.COMMON,    season: 'halloween', cooldownHours: 12  },
  { id: 'hw_bat',          category: 'seasonal', emoji: '🦇', name: 'Night Bat',        desc: 'Flies only during the midnight set.',     rarity: RARITY.RARE,      season: 'halloween', cooldownHours: 24  },

  // ── SEASONAL: NEW YEAR (January 1) ─────────────────
  { id: 'ny_fireworks',    category: 'seasonal', emoji: '🎆', name: 'Forge Fireworks',  desc: 'The studio rings in the new year.',       rarity: RARITY.EPIC,      season: 'newyear',   cooldownHours: 24  },
  { id: 'ny_champagne',    category: 'seasonal', emoji: '🥂', name: 'Toast Glass',      desc: 'To another year of making the impossible real.', rarity: RARITY.COMMON, season: 'newyear', cooldownHours: 12 },

  // ── SEASONAL: JULY 4TH ─────────────────────────────
  { id: 'j4_star',         category: 'seasonal', emoji: '🇺🇸', name: 'Forge Flag',     desc: 'Made in the studio. Built for the stage.', rarity: RARITY.RARE,     season: 'july4th',   cooldownHours: 24  },

  // ── SEASONAL: SUMMER ───────────────────────────────
  { id: 'summer_sun',      category: 'seasonal', emoji: '☀️', name: 'Sol Disc',         desc: 'The summer vibes hit different here.',    rarity: RARITY.COMMON,    season: 'summer',    cooldownHours: 12  },
  { id: 'summer_wave',     category: 'seasonal', emoji: '🌊', name: 'Wave Form',        desc: 'A sound wave captured in the ocean.',     rarity: RARITY.RARE,      season: 'summer',    cooldownHours: 24  },
];

// ---- Season detection (mirrors SeasonalEffects) ----
export function getCurrentSeason() {
  const override = localStorage.getItem('mfs_active_season');
  if (override) return override;

  const now = new Date();
  const month = now.getMonth();
  const day = now.getDate();
  if (month === 11 && day >= 20 && day <= 31) return 'christmas';
  if (month === 0 && day === 1) return 'newyear';
  if (month === 9 && day >= 25 && day <= 31) return 'halloween';
  if (month === 6 && day === 4) return 'july4th';
  if (month >= 5 && month <= 7) return 'summer';
  if (month >= 2 && month <= 4) return 'spring';
  if (month >= 8 && month <= 10) return 'autumn';
  return 'winter';
}

// ---- Get collectibles available right now ----
export function getAvailableCollectibles() {
  const season = getCurrentSeason();
  return ALL_COLLECTIBLES.filter(c => c.season === null || c.season === season);
}

// ---- LocalStorage helpers ----
const STORAGE_KEY = 'mfs_collectibles';
const COOLDOWN_KEY = 'mfs_collectible_cooldowns';

export function getUserCollectibles(userId) {
  const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  return data[userId] || [];
}

export function claimCollectible(userId, collectibleId) {
  const collectible = ALL_COLLECTIBLES.find(c => c.id === collectibleId);
  if (!collectible) return { success: false, error: 'Collectible not found.' };

  // Check cooldown
  const cooldowns = JSON.parse(localStorage.getItem(COOLDOWN_KEY) || '{}');
  const key = `${userId}_${collectibleId}`;
  if (cooldowns[key]) {
    const elapsed = Date.now() - cooldowns[key];
    const cooldownMs = collectible.cooldownHours * 60 * 60 * 1000;
    if (elapsed < cooldownMs) {
      const remaining = Math.ceil((cooldownMs - elapsed) / 3600000);
      return { success: false, error: `Cooldown active. Try again in ${remaining}h.` };
    }
  }

  // Add to user collection
  const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  const owned = data[userId] || [];
  if (!owned.includes(collectibleId)) {
    owned.push(collectibleId);
    data[userId] = owned;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  // Set cooldown
  cooldowns[key] = Date.now();
  localStorage.setItem(COOLDOWN_KEY, JSON.stringify(cooldowns));

  return { success: true, collectible };
}

export function getCollectibleCooldownRemaining(userId, collectibleId) {
  const collectible = ALL_COLLECTIBLES.find(c => c.id === collectibleId);
  if (!collectible) return 0;
  const cooldowns = JSON.parse(localStorage.getItem(COOLDOWN_KEY) || '{}');
  const key = `${userId}_${collectibleId}`;
  if (!cooldowns[key]) return 0;
  const elapsed = Date.now() - cooldowns[key];
  const cooldownMs = collectible.cooldownHours * 60 * 60 * 1000;
  return Math.max(0, cooldownMs - elapsed);
}

export function getEquippedItems(userId) {
  const data = JSON.parse(localStorage.getItem('mfs_equipped') || '{}');
  return data[userId] || { badge: null, frame: null };
}

export function setEquippedItem(userId, slot, collectibleId) {
  const data = JSON.parse(localStorage.getItem('mfs_equipped') || '{}');
  data[userId] = { ...(data[userId] || {}), [slot]: collectibleId };
  localStorage.setItem('mfs_equipped', JSON.stringify(data));
}
