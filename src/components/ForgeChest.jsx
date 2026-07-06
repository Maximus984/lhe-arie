import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, Package, Sparkles, Lock, CheckCircle, Gift } from 'lucide-react';
import {
  getAvailableCollectibles,
  getUserCollectibles,
  claimCollectible,
  getCollectibleCooldownRemaining,
  getEquippedItems,
  setEquippedItem,
  getCurrentSeason,
  RARITY_CONFIG,
  ALL_COLLECTIBLES,
} from '../data/collectibles.js';
import { useAuth } from '../context/AuthContext.jsx';
import toast from 'react-hot-toast';

// ---- Rarity stars ----
function RarityStars({ rarity }) {
  const cfg = RARITY_CONFIG[rarity];
  return (
    <div style={{ display: 'flex', gap: '2px' }}>
      {Array.from({ length: cfg.stars }).map((_, i) => (
        <Star key={i} size={9} fill={cfg.color} color={cfg.color} />
      ))}
    </div>
  );
}

// ---- Single collectible card ----
function CollectibleCard({ item, owned, cooldownMs, onClaim, onEquip, equippedBadge }) {
  const cfg = RARITY_CONFIG[item.rarity];
  const isOwned = owned.includes(item.id);
  const isEquipped = equippedBadge === item.id;
  const onCooldown = cooldownMs > 0;
  const remainingHours = Math.ceil(cooldownMs / 3600000);

  return (
    <motion.div
      whileHover={{ scale: 1.03, y: -3 }}
      whileTap={{ scale: 0.98 }}
      style={{
        position: 'relative',
        borderRadius: '16px',
        border: `1px solid ${isOwned ? cfg.color + '40' : 'rgba(255,255,255,0.06)'}`,
        background: isOwned
          ? `linear-gradient(135deg, ${cfg.color}0A 0%, rgba(10,10,15,0.9) 100%)`
          : 'rgba(10,10,15,0.7)',
        padding: '14px',
        cursor: 'pointer',
        boxShadow: isOwned ? `0 0 20px ${cfg.glow}` : 'none',
        transition: 'box-shadow 0.3s',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        backdropFilter: 'blur(12px)',
      }}
    >
      {/* Owned badge */}
      {isOwned && (
        <div style={{ position: 'absolute', top: '8px', right: '8px' }}>
          <CheckCircle size={13} color={cfg.color} />
        </div>
      )}

      {/* Emoji */}
      <div style={{ fontSize: '28px', lineHeight: 1, textAlign: 'center' }}>
        {item.emoji}
      </div>

      {/* Name */}
      <div style={{ textAlign: 'center' }}>
        <p style={{ fontSize: '11px', fontWeight: '700', color: '#e0e0e0', margin: 0, lineHeight: 1.3 }}>
          {item.name}
        </p>
        <p style={{ fontSize: '9px', color: 'rgba(255,255,255,0.3)', margin: '3px 0 0', fontFamily: 'monospace', lineHeight: 1.4 }}>
          {item.desc}
        </p>
      </div>

      {/* Rarity */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
        <RarityStars rarity={item.rarity} />
        <span style={{ fontSize: '8px', fontFamily: 'monospace', color: cfg.color, fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          {cfg.label}
        </span>
      </div>

      {/* Action button */}
      {isOwned ? (
        <button
          onClick={() => onEquip(item.id)}
          style={{
            padding: '5px 10px',
            borderRadius: '8px',
            border: `1px solid ${isEquipped ? cfg.color : 'rgba(255,255,255,0.1)'}`,
            background: isEquipped ? `${cfg.color}20` : 'transparent',
            color: isEquipped ? cfg.color : 'rgba(255,255,255,0.4)',
            fontSize: '9px',
            fontFamily: 'monospace',
            fontWeight: '700',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          {isEquipped ? '✓ Equipped' : 'Equip Badge'}
        </button>
      ) : onCooldown ? (
        <div style={{ textAlign: 'center', fontSize: '9px', fontFamily: 'monospace', color: 'rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
          <Lock size={9} />
          {remainingHours}h cooldown
        </div>
      ) : (
        <button
          onClick={() => onClaim(item.id)}
          style={{
            padding: '5px 10px',
            borderRadius: '8px',
            border: `1px solid ${cfg.color}60`,
            background: `${cfg.color}15`,
            color: cfg.color,
            fontSize: '9px',
            fontFamily: 'monospace',
            fontWeight: '700',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          Claim
        </button>
      )}
    </motion.div>
  );
}

// ---- Category filter tab ----
const CATEGORIES = [
  { id: 'all',      label: 'All',       emoji: '✨' },
  { id: 'seasonal', label: 'Seasonal',  emoji: '🎄' },
  { id: 'music',    label: 'Music',     emoji: '🎵' },
  { id: 'gaming',   label: 'Gaming',    emoji: '🎮' },
  { id: 'tech',     label: 'Tech',      emoji: '🤖' },
  { id: 'legendary',label: 'Legendary', emoji: '🔥' },
];

// ---- Main Forge Chest component ----
export default function ForgeChest() {
  const { currentUser } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [category, setCategory] = useState('all');
  const [owned, setOwned] = useState([]);
  const [cooldowns, setCooldowns] = useState({});
  const [equipped, setEquipped] = useState({ badge: null, frame: null });
  const season = getCurrentSeason();
  const isChristmas = season === 'christmas';

  const userId = currentUser?.id || 'guest_user';

  const refreshState = useCallback(() => {
    setOwned(getUserCollectibles(userId));
    setEquipped(getEquippedItems(userId));
    // Build cooldown map
    const available = getAvailableCollectibles();
    const map = {};
    available.forEach(c => {
      map[c.id] = getCollectibleCooldownRemaining(userId, c.id);
    });
    setCooldowns(map);
  }, [userId]);

  useEffect(() => {
    refreshState();
    const interval = setInterval(refreshState, 60000);
    return () => clearInterval(interval);
  }, [refreshState]);

  const handleClaim = (id) => {
    const result = claimCollectible(userId, id);
    if (result.success) {
      const cfg = RARITY_CONFIG[result.collectible.rarity];
      toast.success(
        `${result.collectible.emoji} ${result.collectible.name} claimed!`,
        {
          style: {
            background: 'rgba(10,10,15,0.95)',
            color: cfg.color,
            border: `1px solid ${cfg.color}40`,
            borderRadius: '12px',
            fontSize: '13px',
            fontFamily: 'monospace',
          },
          icon: '🎁',
        }
      );
      refreshState();
    } else {
      toast.error(result.error);
    }
  };

  const handleEquip = (id) => {
    setEquippedItem(userId, 'badge', equipped.badge === id ? null : id);
    refreshState();
    toast.success('Badge equipped!', { icon: '✨' });
  };

  const available = getAvailableCollectibles();
  const filtered = category === 'all' ? available : available.filter(c => c.category === category);

  const totalOwned = owned.length;
  const totalAvailable = ALL_COLLECTIBLES.length;

  return (
    <>
      {/* ── Floating Chest Button ── */}
      <motion.button
        id="forge-chest-btn"
        onClick={() => setIsOpen(true)}
        animate={isChristmas ? {
          boxShadow: [
            '0 0 20px rgba(255,50,50,0.5)',
            '0 0 35px rgba(50,255,50,0.5)',
            '0 0 20px rgba(255,215,0,0.5)',
            '0 0 35px rgba(255,50,50,0.5)',
          ],
        } : {
          boxShadow: [
            '0 0 15px rgba(251,191,36,0.3)',
            '0 0 25px rgba(251,191,36,0.5)',
            '0 0 15px rgba(251,191,36,0.3)',
          ],
        }}
        transition={{ duration: isChristmas ? 2 : 3, repeat: Infinity }}
        whileHover={{ scale: 1.1, y: -2 }}
        whileTap={{ scale: 0.95 }}
        style={{
          position: 'fixed',
          bottom: '90px',
          right: '20px',
          zIndex: 9000,
          width: '52px',
          height: '52px',
          borderRadius: '16px',
          border: isChristmas
            ? '1px solid rgba(255,100,100,0.4)'
            : '1px solid rgba(251,191,36,0.3)',
          background: isChristmas
            ? 'linear-gradient(135deg, rgba(180,20,20,0.85), rgba(20,100,20,0.85))'
            : 'linear-gradient(135deg, rgba(30,20,5,0.9), rgba(15,10,2,0.95))',
          backdropFilter: 'blur(16px)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '22px',
        }}
        title="Forge Chest — Collect Digital Items"
      >
        {isChristmas ? '🎄' : '🎁'}
        {/* Owned count badge */}
        {totalOwned > 0 && (
          <span style={{
            position: 'absolute',
            top: '-6px',
            right: '-6px',
            width: '18px',
            height: '18px',
            borderRadius: '50%',
            background: '#FBBF24',
            color: '#000',
            fontSize: '9px',
            fontWeight: '900',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'monospace',
            border: '2px solid rgba(5,5,8,1)',
          }}>
            {totalOwned}
          </span>
        )}
      </motion.button>

      {/* ── Modal ── */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(2,2,4,0.85)',
                backdropFilter: 'blur(12px)',
                zIndex: 10000,
              }}
            />

            {/* Modal Panel */}
            <motion.div
              initial={{ opacity: 0, scale: 0.93, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.93, y: 20 }}
              transition={{ type: 'spring', stiffness: 320, damping: 30 }}
              style={{
                position: 'fixed',
                inset: '5vh 5vw',
                zIndex: 10001,
                display: 'flex',
                flexDirection: 'column',
                borderRadius: '24px',
                border: isChristmas
                  ? '1px solid rgba(255,100,100,0.25)'
                  : '1px solid rgba(251,191,36,0.2)',
                background: 'rgba(8,8,12,0.97)',
                backdropFilter: 'blur(40px)',
                overflow: 'hidden',
                boxShadow: isChristmas
                  ? '0 0 80px rgba(255,50,50,0.15), 0 0 40px rgba(50,200,50,0.1)'
                  : '0 0 60px rgba(251,191,36,0.1)',
              }}
            >
              {/* Christmas snow particles (decorative) */}
              {isChristmas && (
                <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 0 }}>
                  {Array.from({ length: 15 }).map((_, i) => (
                    <motion.div
                      key={i}
                      animate={{ y: ['0%', '105%'], opacity: [0, 1, 0] }}
                      transition={{ duration: 4 + Math.random() * 4, delay: Math.random() * 4, repeat: Infinity, ease: 'linear' }}
                      style={{
                        position: 'absolute',
                        top: '-20px',
                        left: `${Math.random() * 100}%`,
                        fontSize: '12px',
                        opacity: 0.5,
                      }}
                    >❄️</motion.div>
                  ))}
                </div>
              )}

              {/* Header */}
              <div style={{
                position: 'relative',
                zIndex: 1,
                padding: '20px 24px 16px',
                borderBottom: '1px solid rgba(255,255,255,0.06)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: isChristmas
                  ? 'linear-gradient(90deg, rgba(180,20,20,0.08), rgba(20,100,20,0.08))'
                  : 'linear-gradient(90deg, rgba(251,191,36,0.05), transparent)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '28px' }}>{isChristmas ? '🎄' : '🎁'}</span>
                  <div>
                    <h2 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: '#fff', letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: 'monospace' }}>
                      {isChristmas ? 'Forge Gift Chest 🎅' : 'The Forge Chest'}
                    </h2>
                    <p style={{ margin: '2px 0 0', fontSize: '10px', color: 'rgba(255,255,255,0.35)', fontFamily: 'monospace' }}>
                      {totalOwned}/{totalAvailable} collected · {isChristmas ? '🎄 Christmas Exclusives Available!' : `${getCurrentSeason()} season active`}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.4)', padding: '6px' }}
                >
                  <X size={20} />
                </button>
              </div>

              {/* Category Tabs */}
              <div style={{
                position: 'relative',
                zIndex: 1,
                display: 'flex',
                gap: '6px',
                padding: '12px 24px',
                borderBottom: '1px solid rgba(255,255,255,0.04)',
                overflowX: 'auto',
                flexShrink: 0,
              }}>
                {CATEGORIES.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setCategory(cat.id)}
                    style={{
                      padding: '6px 14px',
                      borderRadius: '10px',
                      border: category === cat.id
                        ? `1px solid ${isChristmas ? '#ff6666' : '#FBBF24'}60`
                        : '1px solid rgba(255,255,255,0.06)',
                      background: category === cat.id
                        ? isChristmas ? 'rgba(255,80,80,0.12)' : 'rgba(251,191,36,0.1)'
                        : 'transparent',
                      color: category === cat.id
                        ? isChristmas ? '#ff9999' : '#FBBF24'
                        : 'rgba(255,255,255,0.35)',
                      fontSize: '10px',
                      fontFamily: 'monospace',
                      fontWeight: '700',
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      transition: 'all 0.2s',
                    }}
                  >
                    {cat.emoji} {cat.label}
                  </button>
                ))}
              </div>

              {/* Grid */}
              <div style={{
                position: 'relative',
                zIndex: 1,
                flex: 1,
                overflowY: 'auto',
                padding: '16px 24px 24px',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
                gap: '12px',
                alignContent: 'start',
              }}>
                {filtered.length === 0 ? (
                  <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '40px', color: 'rgba(255,255,255,0.2)', fontFamily: 'monospace', fontSize: '12px' }}>
                    No collectibles available in this category right now.
                  </div>
                ) : (
                  filtered.map(item => (
                    <CollectibleCard
                      key={item.id}
                      item={item}
                      owned={owned}
                      cooldownMs={cooldowns[item.id] || 0}
                      onClaim={handleClaim}
                      onEquip={handleEquip}
                      equippedBadge={equipped.badge}
                    />
                  ))
                )}
              </div>

              {/* Footer */}
              <div style={{
                position: 'relative',
                zIndex: 1,
                padding: '12px 24px',
                borderTop: '1px solid rgba(255,255,255,0.04)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
                <span style={{ fontSize: '9px', fontFamily: 'monospace', color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  Maxx Forge Studio™ — Digital Collectibles v1.0
                </span>
                <span style={{ fontSize: '9px', fontFamily: 'monospace', color: 'rgba(255,255,255,0.2)' }}>
                  {!currentUser && '⚠ Login to save progress'}
                </span>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
