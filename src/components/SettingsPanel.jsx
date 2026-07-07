import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Palette, Bell, Shield, Sliders, Moon, Sun, Zap, ChevronRight, LogOut, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import StorageManager from './StorageManager.jsx';

const THEMES = [
  { id: 'obsidian',      label: 'Obsidian',      color: '#10B981', bg: '#050508',                          desc: 'Dark void with emerald accents' },
  { id: 'forge-red',    label: 'Forge Red',     color: '#EF4444', bg: '#0a0505',                          desc: 'Deep red — heat & intensity' },
  { id: 'deep-navy',   label: 'Deep Navy',     color: '#6366F1', bg: '#04040f',                          desc: 'Indigo dark — cosmic and calm' },
  { id: 'chrome',       label: 'Chrome',        color: '#a0a0b0', bg: '#0a0a0d',                          desc: 'Silver & steel — minimal luxury' },
  { id: 'liquid-glass', label: '✦ Liquid Glass', color: '#a5f3fc', bg: 'rgba(180,220,255,0.08)',          desc: 'Frosted translucent iOS-style glass' },
];

export default function SettingsPanel({ onClose }) {
  const { currentUser, logout, can } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [storageOpen, setStorageOpen] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState(
    localStorage.getItem('mfs_theme') || 'obsidian'
  );
  const [reduceMotion, setReduceMotion] = useState(
    localStorage.getItem('mfs_reduce_motion') === 'true'
  );
  const [notifEnabled, setNotifEnabled] = useState(
    localStorage.getItem('mfs_notif') !== 'false'
  );
  const [displayName, setDisplayName] = useState(currentUser?.displayName || '');
  const [bio, setBio] = useState(currentUser?.bio || '');
  const [saved, setSaved] = useState(false);

  const handleSaveProfile = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    toast.success('Profile updated!');
  };

  const handleThemeChange = (themeId) => {
    setSelectedTheme(themeId);
    localStorage.setItem('mfs_theme', themeId);
    toast.success(`Theme changed to ${THEMES.find(t => t.id === themeId)?.label}`);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    onClose();
    toast.success('Signed out successfully');
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    ...(can('view_settings_system') ? [{ id: 'system', label: 'System', icon: Sliders }] : []),
  ];

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[900]"
      />

      {/* Drawer */}
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', stiffness: 300, damping: 32 }}
        className="fixed top-0 right-0 bottom-0 w-full max-w-sm z-[950] flex flex-col"
        style={{ background: 'rgba(8,8,12,0.98)', borderLeft: '1px solid rgba(255,255,255,0.07)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/5 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border border-emerald-500/20 flex items-center justify-center">
              <Sliders size={16} className="text-emerald-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Settings</h2>
              <p className="text-[10px] text-white/30 font-mono">Maxx Forge Studio™</p>
            </div>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white/40 hover:text-white hover:bg-white/5 transition">
            <X size={16} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 px-4 py-3 border-b border-white/5 overflow-x-auto flex-shrink-0">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition flex-shrink-0 ${
                activeTab === id
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25'
                  : 'text-white/40 hover:text-white/70 hover:bg-white/5'
              }`}
            >
              <Icon size={12} />
              {label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          <AnimatePresence mode="wait">
            {activeTab === 'profile' && (
              <motion.div key="profile"
                initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.2 }}
                className="flex flex-col gap-5"
              >
                {/* Avatar */}
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-black text-white flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg, #10B981, #00E5FF)' }}>
                    {currentUser?.avatar || '??'}
                  </div>
                  <div>
                    <p className="font-bold text-white">{currentUser?.displayName}</p>
                    <p className="text-xs text-white/40">{currentUser?.email}</p>
                    <span className="mt-1 inline-block text-[10px] px-2 py-0.5 rounded-full font-mono font-bold"
                      style={{ background: 'rgba(16,185,129,0.1)', color: '#10B981', border: '1px solid rgba(16,185,129,0.2)' }}>
                      {currentUser?.badge}
                    </span>
                  </div>
                </div>

                <div className="h-px bg-white/5" />

                {can('edit_profile') && (
                  <>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-mono text-white/40 uppercase tracking-widest font-bold">Display Name</label>
                      <input
                        type="text"
                        value={displayName}
                        onChange={e => setDisplayName(e.target.value)}
                        className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-white/20 focus:outline-none focus:border-emerald-500/40 transition"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-mono text-white/40 uppercase tracking-widest font-bold">Bio</label>
                      <textarea
                        value={bio}
                        onChange={e => setBio(e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-white/20 focus:outline-none focus:border-emerald-500/40 transition resize-none"
                      />
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleSaveProfile}
                      className="w-full py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition"
                      style={{ background: saved ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.06)', border: `1px solid ${saved ? 'rgba(16,185,129,0.3)' : 'rgba(255,255,255,0.1)'}`, color: saved ? '#10B981' : '#fff' }}
                    >
                      {saved ? <><Check size={14} />Saved!</> : 'Save Changes'}
                    </motion.button>
                  </>
                )}

                {/* Info rows */}
                {[
                  { label: 'Role', value: currentUser?.role },
                  { label: 'Department', value: currentUser?.department },
                  { label: 'Member since', value: currentUser?.joinedAt ? new Date(currentUser.joinedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long' }) : '—' },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between items-center py-2 border-b border-white/5">
                    <span className="text-xs text-white/40">{label}</span>
                    <span className="text-xs text-white capitalize">{value}</span>
                  </div>
                ))}
              </motion.div>
            )}

            {activeTab === 'appearance' && (
              <motion.div key="appearance"
                initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.2 }}
                className="flex flex-col gap-5"
              >
                <div>
                  <h3 className="text-xs font-bold text-white mb-3">Color Theme</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {THEMES.map(theme => (
                      <button
                        key={theme.id}
                        onClick={() => handleThemeChange(theme.id)}
                        className={`p-3 rounded-xl text-left border transition group ${
                          selectedTheme === theme.id
                            ? 'border-opacity-50'
                            : 'border-white/5 hover:border-white/15'
                        }`}
                        style={{
                          background: `${theme.bg}`,
                          borderColor: selectedTheme === theme.id ? theme.color : undefined,
                          boxShadow: selectedTheme === theme.id ? `0 0 12px ${theme.color}25` : undefined,
                        }}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="w-4 h-4 rounded-full" style={{ background: theme.color }} />
                          {selectedTheme === theme.id && <Check size={12} style={{ color: theme.color }} />}
                        </div>
                        <p className="text-xs font-bold text-white">{theme.label}</p>
                        <p className="text-[10px] text-white/30 mt-0.5 leading-tight">{theme.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="h-px bg-white/5" />

                <div>
                  <h3 className="text-xs font-bold text-white mb-3">Seasonal Look Override</h3>
                  <p className="text-[10px] text-white/30 mb-2 leading-relaxed">
                    Bypass date-based auto-seasons to preview specific holiday themes and effects instantly.
                  </p>
                  <select
                    value={localStorage.getItem('mfs_active_season') || 'auto'}
                    onChange={e => {
                      if (e.target.value === 'auto') {
                        localStorage.removeItem('mfs_active_season');
                      } else {
                        localStorage.setItem('mfs_active_season', e.target.value);
                      }
                      toast.success(`Seasonal look override active: ${e.target.value}`);
                      setTimeout(() => window.location.reload(), 600);
                    }}
                    className="w-full px-3 py-2.5 bg-neutral-900 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="auto">Automatic (Date Based)</option>
                    <option value="christmas">Christmas 🎄</option>
                    <option value="winter">Winter ❄️</option>
                    <option value="newyear">New Year 🎆</option>
                    <option value="halloween">Halloween 🎃</option>
                    <option value="spring">Spring 🌸</option>
                    <option value="summer">Summer ☀️</option>
                    <option value="autumn">Autumn 🍂</option>
                  </select>
                </div>

                <div className="h-px bg-white/5" />

                <div>
                  <h3 className="text-xs font-bold text-white mb-3">Accessibility</h3>
                  {[
                    {
                      icon: Zap,
                      label: 'Reduce Motion',
                      desc: 'Minimize animations and transitions',
                      value: reduceMotion,
                      set: (v) => { setReduceMotion(v); localStorage.setItem('mfs_reduce_motion', String(v)); },
                    },
                  ].map(({ icon: Icon, label, desc, value, set }) => (
                    <div key={label} className="flex items-center gap-3 p-3 rounded-xl border border-white/5 bg-white/2">
                      <Icon size={14} className="text-white/40 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-xs font-semibold text-white">{label}</p>
                        <p className="text-[10px] text-white/30">{desc}</p>
                      </div>
                      <button
                        onClick={() => set(!value)}
                        className="w-10 h-5 rounded-full relative transition-all duration-300"
                        style={{ background: value ? '#10B981' : 'rgba(255,255,255,0.1)' }}
                      >
                        <motion.div layout transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                          className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow"
                          style={{ left: value ? 'calc(100% - 18px)' : '2px' }} />
                      </button>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'notifications' && (
              <motion.div key="notifications"
                initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.2 }}
                className="flex flex-col gap-4"
              >
                <p className="text-xs text-white/40">Control what you hear from Maxx Forge Studio.</p>
                {[
                  { label: 'New music drops', desc: 'Get notified when new tracks are added', enabled: notifEnabled },
                  { label: 'Live event reminders', desc: '24-hour reminders for upcoming events', enabled: notifEnabled },
                  { label: 'Studio announcements', desc: 'Official news from the team', enabled: true },
                ].map(({ label, desc, enabled }, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl border border-white/5">
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-white">{label}</p>
                      <p className="text-[10px] text-white/30 mt-0.5">{desc}</p>
                    </div>
                    <button
                      onClick={() => setNotifEnabled(v => !v)}
                      className="w-10 h-5 rounded-full relative transition-all duration-300"
                      style={{ background: enabled ? '#10B981' : 'rgba(255,255,255,0.1)' }}
                    >
                      <motion.div layout transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                        className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow"
                        style={{ left: enabled ? 'calc(100% - 18px)' : '2px' }} />
                    </button>
                  </div>
                ))}
              </motion.div>
            )}

            {activeTab === 'security' && (
              <motion.div key="security"
                initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.2 }}
                className="flex flex-col gap-4"
              >
                <div className="p-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5">
                  <div className="flex items-center gap-2 mb-1">
                    <Shield size={13} className="text-emerald-400" />
                    <span className="text-xs font-bold text-emerald-400">Session Active</span>
                  </div>
                  <p className="text-[10px] text-white/40">Your session is encrypted and will expire after 2 hours of inactivity.</p>
                </div>
                {[
                  { label: 'Account Email', value: currentUser?.email },
                  { label: 'Role', value: currentUser?.role },
                  { label: 'Session timeout', value: '2 hours' },
                  { label: 'IP Logging', value: 'Active' },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between items-center py-2 border-b border-white/5">
                    <span className="text-xs text-white/40">{label}</span>
                    <span className="text-xs text-white">{value}</span>
                  </div>
                ))}
                {/* Storage Manager trigger */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setStorageOpen(true)}
                  className="w-full py-2.5 rounded-xl text-xs font-semibold text-emerald-400 border border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10 transition mt-2"
                >
                  ⚙️ Launch Storage Manager
                </motion.button>
              </motion.div>
            )}

            {activeTab === 'system' && can('view_settings_system') && (
              <motion.div key="system"
                initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.2 }}
                className="flex flex-col gap-4"
              >
                <div className="p-3 rounded-xl border border-indigo-500/20 bg-indigo-500/5">
                  <p className="text-xs font-bold text-indigo-400 mb-1">⚙️ System Settings</p>
                  <p className="text-[10px] text-white/40">Founder-level configuration for the Maxx Forge Studio platform.</p>
                </div>
                {[
                  { label: 'Platform Version', value: 'v2.5' },
                  { label: 'Data Storage', value: 'localStorage + Firebase ready' },
                  { label: 'Total Users', value: `${JSON.parse(localStorage.getItem('mfs_users') || '[]').length} registered` },
                  { label: 'Feed Posts', value: `${JSON.parse(localStorage.getItem('mfs_feed_posts') || '[]').length} posts` },
                  { label: 'Workspace Docs', value: `${JSON.parse(localStorage.getItem('mfs_workspace_docs') || '[]').length} docs` },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between items-center py-2 border-b border-white/5">
                    <span className="text-xs text-white/40">{label}</span>
                    <span className="text-xs text-emerald-400 font-mono">{value}</span>
                  </div>
                ))}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => { localStorage.removeItem('mfs_permissions_granted'); toast.success('Permissions reset — reload to see modal'); }}
                  className="w-full py-2.5 rounded-xl text-xs font-semibold text-white/50 border border-white/10 hover:border-white/20 hover:text-white/70 transition"
                >
                  Reset First-Visit Permissions
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setStorageOpen(true)}
                  className="w-full py-2.5 bg-indigo-500/10 border border-indigo-500/20 hover:bg-indigo-500/20 text-indigo-400 rounded-xl text-xs font-semibold transition"
                >
                  📁 Manage Local Cache Cache
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-white/5 flex-shrink-0">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleLogout}
            className="w-full py-2.5 rounded-xl text-sm font-semibold text-red-400 border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 hover:border-red-500/30 transition flex items-center justify-center gap-2"
          >
            <LogOut size={14} />
            Sign Out
          </motion.button>
        </div>
      </motion.div>

      {/* Storage Manager Dialog Overlay */}
      <AnimatePresence>
        {storageOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setStorageOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[1000]"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="fixed inset-0 m-auto w-max h-max z-[1001] px-4"
            >
              <StorageManager onClose={() => setStorageOpen(false)} />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
