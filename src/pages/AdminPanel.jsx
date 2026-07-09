import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { motion } from 'framer-motion';
import { Shield, Users, Server, FileText, ArrowLeft, RefreshCw, Trash2, Check, Clock, UserPlus, Key, Radio, AlertTriangle, Send } from 'lucide-react';
import { runSystemDiagnostics } from '../data/security.js';
import { isMaintenanceMode, setMaintenanceMode, getMaintenanceMessage, setMaintenanceMessage } from '../data/analytics.js';
import { publish } from '../data/realtime.js';
import toast from 'react-hot-toast';

const ALL_SYSTEM_PERMISSIONS = [
  { id: 'view_dashboard', label: 'View Dashboard Portal', cat: 'General' },
  { id: 'view_admin', label: 'Access Founder Admin Panel', cat: 'Admin Override' },
  { id: 'view_staff_portal', label: 'Access Staff Work Portal', cat: 'Admin Override' },
  { id: 'manage_users', label: 'Create/Remove Roster Users', cat: 'Admin Override' },
  { id: 'view_ip_logs', label: 'Audit Security & Session Logs', cat: 'Admin Override' },
  { id: 'manage_forms', label: 'Review Booking/Collab Inboxes', cat: 'Admin Override' },
  { id: 'view_calendar', label: 'Access Studio calendar', cat: 'Calendar' },
  { id: 'edit_calendar', label: 'Add/Edit Calendar Events', cat: 'Calendar' },
  { id: 'delete_calendar_events', label: 'Delete Calendar Events', cat: 'Calendar' },
  { id: 'use_workspace', label: 'Access Workspace Apps', cat: 'Workspace' },
  { id: 'create_docs', label: 'Create/Edit Workspace Docs', cat: 'Workspace' },
  { id: 'delete_docs', label: 'Delete Workspace Docs', cat: 'Workspace' },
  { id: 'manage_vault', label: 'Manage Vault & Storage files', cat: 'Workspace' },
  { id: 'manage_live_stream', label: 'OBS/TikTok Studio controls', cat: 'Live Stream' },
  { id: 'view_feed', label: 'Access community chat feed', cat: 'Feed/Chat' },
  { id: 'post_feed', label: 'Send messages to chat', cat: 'Feed/Chat' },
  { id: 'react_feed', label: 'Add emoji reactions to feed', cat: 'Feed/Chat' },
  { id: 'moderate_feed', label: 'Moderate chat feed (Delete posts)', cat: 'Feed/Chat' },
  { id: 'manage_channels', label: 'Manage Chat channels', cat: 'Feed/Chat' }
];

export default function AdminPanel() {
  const { sessionLogs, formSubmissions, failedAttempts, updateSubmission, getSimulatedIP } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('telemetry'); // telemetry | users | logs | forms
  
  // Roster States
  const [users, setUsers] = useState([]);
  const [newStaffName, setNewStaffName] = useState('');
  const [newStaffEmail, setNewStaffEmail] = useState('');
  const [newStaffPass, setNewStaffPass] = useState('');
  const [newStaffDept, setNewStaffDept] = useState('Technology');
  const [newStaffRole, setNewStaffRole] = useState('staff');

  // Custom Roles & Permissions States (Discord-style)
  const [customRoles, setCustomRoles] = useState({});
  const [roleKey, setRoleKey] = useState('');
  const [roleName, setRoleName] = useState('');
  const [roleColor, setRoleColor] = useState('#6366F1');
  const [roleBadge, setRoleBadge] = useState('🛡️ Mod');
  const [rolePerms, setRolePerms] = useState([]);

  // Maintenance States
  const [maintenance, setMaintenance] = useState(isMaintenanceMode());
  const [maintMsg, setMaintMsg] = useState(getMaintenanceMessage());

  // Diagnostics States
  const [lastReport, setLastReport] = useState(null);

  // Announcement States
  const [announcements, setAnnouncements] = useState([]);
  const [newAnn, setNewAnn] = useState('');

  const refreshUsers = () => {
    setUsers(JSON.parse(localStorage.getItem('mfs_users') || '[]'));
  };

  const refreshRoles = () => {
    setCustomRoles(JSON.parse(localStorage.getItem('mfs_custom_roles') || '{}'));
  };

  const refreshAnnouncements = () => {
    try {
      const raw = localStorage.getItem('mfs_announcements');
      if (raw) {
        setAnnouncements(JSON.parse(raw));
      } else {
        setAnnouncements([
          {
            id: 'ann_1',
            author: 'Maxx — Founder',
            role: 'founder',
            text: 'Welcome to the Liquid Glass Ecosystem! Staff can post real-time updates and notes here.',
            timestamp: new Date().toISOString(),
          }
        ]);
      }
    } catch (_) {}
  };

  useEffect(() => {
    refreshUsers();
    refreshRoles();
    refreshAnnouncements();

    const unsub = subscribe(['announcement_added', 'announcement_deleted'], () => {
      refreshAnnouncements();
    });
    return () => unsub();
  }, []);

  const handleUpdateStatus = (id, newStatus) => {
    updateSubmission(id, { status: newStatus });
    toast.success(`Submission marked as ${newStatus}`);
  };

  const getStatusColor = (status) => {
    if (status === 'completed') return 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400';
    if (status === 'in-progress') return 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400';
    return 'bg-amber-500/10 border-amber-500/20 text-amber-400';
  };

  // Create Staff account
  const handleCreateStaff = (e) => {
    e.preventDefault();
    if (!newStaffName || !newStaffEmail || !newStaffPass) {
      return toast.error('Please fill in all staff registration fields.');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newStaffEmail)) {
      return toast.error('Invalid email address format.');
    }

    const currentUsers = JSON.parse(localStorage.getItem('mfs_users') || '[]');
    if (currentUsers.find(u => u.email.toLowerCase() === newStaffEmail.toLowerCase())) {
      return toast.error('An account with this email already exists.');
    }

    const newAccount = {
      id: `usr_${Math.random().toString(36).substr(2, 9)}`,
      name: newStaffName,
      displayName: `${newStaffName} — ${newStaffRole === 'staff' ? 'Staff' : 'Member'}`,
      email: newStaffEmail.toLowerCase(),
      password: newStaffPass,
      role: newStaffRole,
      avatar: newStaffName.slice(0, 2).toUpperCase(),
      bio: `Maxx Forge ${newStaffRole === 'staff' ? 'Staff' : 'Community Member'}. Joined via founder override.`,
      joinedAt: new Date().toISOString(),
      isOnline: false,
      department: newStaffDept,
      badge: newStaffRole === 'staff' ? '⚡ Staff' : '👤 Member',
      photo: null
    };

    const updated = [...currentUsers, newAccount];
    localStorage.setItem('mfs_users', JSON.stringify(updated));
    refreshUsers();
    
    // Reset Form
    setNewStaffName('');
    setNewStaffEmail('');
    setNewStaffPass('');
    toast.success(`Registered ${newStaffRole} account successfully!`);
  };

  // Ban/Unban user (Block/Lockout toggle)
  const handleBanUser = (userId, name) => {
    if (userId === 'usr_founder_001') {
      return toast.error('Cannot ban founder account Maximus.');
    }
    const currentUsers = JSON.parse(localStorage.getItem('mfs_users') || '[]');
    const updated = currentUsers.map(u => {
      if (u.id === userId) {
        const nextBanned = !u.isBanned;
        return { ...u, isBanned: nextBanned };
      }
      return u;
    });
    localStorage.setItem('mfs_users', JSON.stringify(updated));
    refreshUsers();
    
    const userObj = updated.find(u => u.id === userId);
    toast.success(`${userObj.isBanned ? 'Banned/Blocked' : 'Unbanned'} user: ${name}`);
  };

  const handlePostAnnouncement = (e) => {
    e.preventDefault();
    if (!newAnn.trim()) return;

    const newAnnouncement = {
      id: `ann_${Date.now()}`,
      author: 'Maxx — Founder',
      role: 'founder',
      text: newAnn.trim(),
      timestamp: new Date().toISOString()
    };

    const updated = [newAnnouncement, ...announcements];
    setAnnouncements(updated);
    localStorage.setItem('mfs_announcements', JSON.stringify(updated));
    publish('announcement_added', newAnnouncement);
    setNewAnn('');
    toast.success('Founder announcement broadcasted!');
  };

  const handleDeleteAnnouncement = (id) => {
    const updated = announcements.filter(a => a.id !== id);
    setAnnouncements(updated);
    localStorage.setItem('mfs_announcements', JSON.stringify(updated));
    publish('announcement_deleted', { id });
    toast.success('Announcement deleted');
  };

  // Create / Update Role (Discord-style)
  const handleSaveRole = (e) => {
    e.preventDefault();
    if (!roleKey.trim() || !roleName.trim()) {
      return toast.error('Role Key and Display Name are required.');
    }
    
    const key = roleKey.toLowerCase().replace(/\s+/g, '-');
    if (key === 'founder') {
      return toast.error('Founder role permissions cannot be edited.');
    }

    const existingRoles = JSON.parse(localStorage.getItem('mfs_custom_roles') || '{}');
    
    existingRoles[key] = {
      name: roleName.trim(),
      color: roleColor,
      badge: roleBadge.trim(),
      permissions: rolePerms
    };
    
    localStorage.setItem('mfs_custom_roles', JSON.stringify(existingRoles));
    refreshRoles();
    
    // Clear inputs
    setRoleKey('');
    setRoleName('');
    setRoleBadge('🛡️ Mod');
    setRolePerms([]);
    toast.success(`Role "${roleName}" has been synchronized.`);
  };

  // Toggle permission checkbox
  const handleTogglePerm = (permId) => {
    if (rolePerms.includes(permId)) {
      setRolePerms(rolePerms.filter(p => p !== permId));
    } else {
      setRolePerms([...rolePerms, permId]);
    }
  };

  // Assign user to role
  const handleAssignUserRole = (userId, newRole) => {
    if (userId === 'usr_founder_001') {
      return toast.error('Founder Maximus role is permanent.');
    }
    const currentUsers = JSON.parse(localStorage.getItem('mfs_users') || '[]');
    const updated = currentUsers.map(u => {
      if (u.id === userId) {
        const savedRoles = JSON.parse(localStorage.getItem('mfs_custom_roles') || '{}');
        const rInfo = savedRoles[newRole] || { badge: newRole.toUpperCase() };
        return {
          ...u,
          role: newRole,
          badge: rInfo.badge
        };
      }
      return u;
    });
    localStorage.setItem('mfs_users', JSON.stringify(updated));
    refreshUsers();
    toast.success('Roster user permissions updated.');
  };

  // Maintenance Toggle
  const handleMaintToggle = () => {
    const next = !maintenance;
    setMaintenance(next);
    setMaintenanceMode(next);
    setMaintenanceMessage(maintMsg);
    toast.success(`Maintenance mode toggled ${next ? 'ON' : 'OFF'}`);
  };

  const handleSaveMaintMsg = () => {
    setMaintenanceMessage(maintMsg);
    toast.success('Maintenance message updated');
  };

  // Manual Diagnostics Trigger
  const triggerDiagnostics = () => {
    const report = runSystemDiagnostics(true);
    setLastReport(report);
    toast.success('Diagnostic Audit successfully executed!');
  };

  return (
    <div className="min-h-screen bg-[#050508] text-white p-6 md:p-12 font-sans selection:bg-indigo-500/20">
      <div className="max-w-6xl mx-auto flex flex-col gap-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/5 pb-6">
          <div className="flex items-center gap-4">
            <Link to="/dashboard" className="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:border-indigo-500 hover:text-indigo-400 transition">
              <ArrowLeft size={16} />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <Shield size={16} className="text-indigo-400" />
                <h1 className="text-xl font-display font-black tracking-wider uppercase">Founder Control Panel</h1>
              </div>
              <p className="text-xs font-mono text-white/30 mt-0.5">Maxx Forge Studio™ Admin Node</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5 bg-indigo-500/10 border border-indigo-500/20 rounded-xl px-4 py-2">
            <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse shadow-[0_0_8px_#6366F1]" />
            <span className="text-xs font-mono text-indigo-400 font-bold uppercase tracking-wider">Security clearance: Founder</span>
          </div>
        </div>

        {/* Credentials Debug Reference Card */}
        <div className="p-4 rounded-xl border border-yellow-500/20 bg-yellow-500/5 text-left">
          <div className="flex items-center gap-2 mb-2 text-yellow-400">
            <Key size={14} />
            <span className="text-xs font-mono font-bold uppercase">Pre-Seeded Login Credentials Reference</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
            <div className="p-2 rounded bg-white/5">
              <p className="text-white/60 font-bold">1. Founder Account</p>
              <p className="text-[11px] text-white/40 mt-1">Email: maximus@maxxforgestudio.com</p>
              <p className="text-[11px] text-white/40">Pass: ForgeFounder2026!</p>
            </div>
            <div className="p-2 rounded bg-white/5">
              <p className="text-white/60 font-bold">2. Staff (Events Lead)</p>
              <p className="text-[11px] text-white/40 mt-1">Email: em@maxxforgestudio.com</p>
              <p className="text-[11px] text-white/40">Pass: StaffForge2026!</p>
            </div>
            <div className="p-2 rounded bg-white/5">
              <p className="text-white/60 font-bold">3. Staff (Tech Lead)</p>
              <p className="text-[11px] text-white/40 mt-1">Email: zeppelin@maxxforgestudio.com</p>
              <p className="text-[11px] text-white/40">Pass: AriesDev2026!</p>
            </div>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="flex gap-2 border-b border-white/5 pb-px overflow-x-auto">
          {[
            { id: 'telemetry', label: 'Ecosystem Telemetry', icon: <Server size={14} /> },
            { id: 'users', label: 'Roster & User Directory', icon: <Users size={14} /> },
            { id: 'roles', label: 'Roles & Permissions', icon: <Key size={14} /> },
            { id: 'logs', label: 'Session IP Logs', icon: <Shield size={14} /> },
            { id: 'forms', label: 'Form Inboxes', icon: <FileText size={14} /> },
            { id: 'announcements', label: 'Announcements', icon: <Radio size={14} /> },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-3 text-xs font-mono font-bold border-b-2 transition -mb-px whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5'
                  : 'border-transparent text-white/40 hover:text-white/70'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab: Telemetry (Maintenance + Diagnostics) */}
        {activeTab === 'telemetry' && (
          <div className="flex flex-col gap-6">
            
            {/* Control Widgets */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Maintenance Control */}
              <div className="bg-white/3 border border-white/5 rounded-2xl p-6 flex flex-col gap-4 text-left">
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <Radio size={14} className={maintenance ? 'text-red-400' : 'text-white/40'} />
                    Maintenance Mode Controls
                  </h3>
                  <p className="text-xs text-white/40 mt-1">Activate site lock. Directs all non-staff/non-founder visitors to the maintenance message page instantly.</p>
                </div>
                
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleMaintToggle}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                      maintenance 
                        ? 'bg-red-500 text-white' 
                        : 'bg-white/5 border border-white/10 text-white hover:bg-white/10'
                    }`}
                  >
                    {maintenance ? 'DEACTIVATE LOCK' : 'ACTIVATE MAINTENANCE LOCK'}
                  </button>
                </div>

                <div className="flex flex-col gap-1.5 mt-2">
                  <label className="text-[10px] font-mono text-white/40 uppercase tracking-widest font-bold">Custom Lockout Message</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={maintMsg}
                      onChange={e => setMaintMsg(e.target.value)}
                      placeholder="Maintenance message details..."
                      className="flex-grow px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                    <button onClick={handleSaveMaintMsg} className="px-3 bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl text-xs font-bold">
                      Save
                    </button>
                  </div>
                </div>
              </div>

              {/* System Diagnostics Trigger */}
              <div className="bg-white/3 border border-white/5 rounded-2xl p-6 flex flex-col justify-between gap-4 text-left">
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <AlertTriangle size={14} className="text-indigo-400" />
                    Diagnostics Audit Engine
                  </h3>
                  <p className="text-xs text-white/40 mt-1">Manually initiate a local ecosystem telemetry sweep. Checks database structures, log sizes, cache memory, and safety metrics.</p>
                </div>
                <button
                  onClick={triggerDiagnostics}
                  className="w-full py-3 bg-indigo-500 hover:bg-indigo-400 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(99,102,241,0.2)] transition"
                >
                  <RefreshCw size={13} /> RUN SYSTEM DIAGNOSTIC SWEEP
                </button>
              </div>

            </div>

            {/* Diagnostic Report Panel */}
            {lastReport && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/3 border border-white/5 rounded-2xl p-6 text-left flex flex-col gap-4 font-mono text-xs"
              >
                <div className="flex justify-between items-center border-b border-white/5 pb-3">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">DIAGNOSTIC REPORT · {lastReport.id}</h3>
                  <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${
                    lastReport.verdict === 'ALL SYSTEMS NORMAL' ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' : 'bg-amber-500/10 border border-amber-500/20 text-amber-400'
                  }`}>
                    {lastReport.verdict}
                  </span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-white/50">
                  <div>
                    <span className="text-[9px] text-white/20 uppercase block">Timestamp</span>
                    <span className="text-white font-semibold">{new Date(lastReport.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-white/20 uppercase block">Duration</span>
                    <span className="text-white font-semibold">{lastReport.durationMs}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-white/20 uppercase block">Monitor Check</span>
                    <span className="text-emerald-400 font-semibold">{lastReport.status.backgroundMonitor.toUpperCase()}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-white/20 uppercase block">Security WAF</span>
                    <span className="text-emerald-400 font-semibold">{lastReport.status.security.toUpperCase()}</span>
                  </div>
                </div>
                <div className="mt-2 bg-black/40 border border-white/5 p-3 rounded-xl">
                  <span className="text-[10px] text-white/30 block mb-1">SYSTEM ISSUES / WARNING LOGS:</span>
                  {lastReport.errors.length === 0 ? (
                    <p className="text-emerald-400">✓ No issues or integrity leaks detected in the active user environment.</p>
                  ) : (
                    lastReport.errors.map((e, idx) => <p key={idx} className="text-red-400">⚠️ {e}</p>)
                  )}
                </div>
              </motion.div>
            )}

            {/* Quick Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white/3 border border-white/5 rounded-2xl p-6 flex flex-col gap-2">
                <span className="text-[10px] font-mono text-white/30 uppercase tracking-widest">Active Roster</span>
                <span className="text-3xl font-display font-black text-white">{users.length}</span>
              </div>
              <div className="bg-white/3 border border-white/5 rounded-2xl p-6 flex flex-col gap-2">
                <span className="text-[10px] font-mono text-white/30 uppercase tracking-widest">Lockout Incidents</span>
                <span className="text-3xl font-display font-black text-red-400">
                  {Object.keys(failedAttempts).filter(k => failedAttempts[k] >= 5).length}
                </span>
              </div>
              <div className="bg-white/3 border border-white/5 rounded-2xl p-6 flex flex-col gap-2">
                <span className="text-[10px] font-mono text-white/30 uppercase tracking-widest">Forms Received</span>
                <span className="text-3xl font-display font-black text-emerald-400">{formSubmissions.length}</span>
              </div>
            </div>

          </div>
        )}

        {/* Tab: Users (Roster + Register Staff) */}
        {activeTab === 'users' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Register Staff Form (Founder only) (4 cols) */}
            <div className="lg:col-span-4 bg-white/3 border border-white/5 rounded-2xl p-6 flex flex-col gap-4 text-left self-start">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <UserPlus size={14} className="text-indigo-400" />
                  Add Team Account
                </h3>
                <p className="text-[10px] text-white/30 mt-1">Founder bypass panel to add new verified Staff or Community Members.</p>
              </div>

              <form onSubmit={handleCreateStaff} className="flex flex-col gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] font-mono text-white/40 uppercase">Full Name</label>
                  <input
                    type="text"
                    value={newStaffName}
                    onChange={e => setNewStaffName(e.target.value)}
                    placeholder="e.g. Alexis Dev"
                    className="px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] font-mono text-white/40 uppercase">Email Address</label>
                  <input
                    type="email"
                    value={newStaffEmail}
                    onChange={e => setNewStaffEmail(e.target.value)}
                    placeholder="e.g. alexis@maxxforgestudio.com"
                    className="px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] font-mono text-white/40 uppercase">Password</label>
                  <input
                    type="password"
                    value={newStaffPass}
                    onChange={e => setNewStaffPass(e.target.value)}
                    placeholder="Access passcode"
                    className="px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] font-mono text-white/40 uppercase">Department</label>
                  <select
                    value={newStaffDept}
                    onChange={e => setNewStaffDept(e.target.value)}
                    className="px-3 py-2 bg-neutral-900 border border-white/10 rounded-xl text-xs focus:outline-none"
                  >
                    <option value="Technology">Technology</option>
                    <option value="Live Events">Live Events</option>
                    <option value="Music Production">Music Production</option>
                    <option value="Management">Management</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] font-mono text-white/40 uppercase">Account Role</label>
                  <select
                    value={newStaffRole}
                    onChange={e => setNewStaffRole(e.target.value)}
                    className="px-3 py-2 bg-neutral-900 border border-white/10 rounded-xl text-xs focus:outline-none text-white"
                  >
                    {Object.keys(customRoles).map(rk => (
                      <option key={rk} value={rk}>{customRoles[rk].name}</option>
                    ))}
                  </select>
                </div>
                <button type="submit" className="w-full py-2.5 bg-indigo-500 hover:bg-indigo-400 text-white rounded-xl text-xs font-bold transition">
                  REGISTER ACCOUNT
                </button>
              </form>
            </div>
 
            {/* User List (8 cols) */}
            <div className="lg:col-span-8 bg-white/3 border border-white/5 rounded-2xl p-6 flex flex-col gap-4">
              <h3 className="text-sm font-display font-bold uppercase tracking-wider text-left">Ecosystem Directory</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left font-mono text-xs">
                  <thead>
                    <tr className="border-b border-white/5 text-white/30">
                      <th className="py-2.5">Name</th>
                      <th className="py-2.5">Email Address</th>
                      <th className="py-2.5">Role</th>
                      <th className="py-2.5">Department</th>
                      <th className="py-2.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(u => {
                      const rInfo = customRoles[u.role] || { name: u.role, color: '#10B981', badge: u.role };
                      return (
                        <tr key={u.id} className="border-b border-white/5 text-white/70">
                          <td className="py-3 font-semibold flex items-center gap-2">
                            <div className="w-6 h-6 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center font-bold text-[10px] text-indigo-400">
                              {u.avatar}
                            </div>
                            {u.name}
                            {u.isBanned && (
                              <span className="px-1.5 py-0.5 rounded bg-red-500/10 border border-red-500/25 text-red-400 text-[8px] font-mono font-bold uppercase tracking-wider">
                                Banned
                              </span>
                            )}
                          </td>
                          <td className="py-3 text-white/40">{u.email}</td>
                          <td className="py-3">
                            {u.role === 'founder' ? (
                              <span className="px-2 py-0.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded text-[9px] font-bold">
                                FOUNDER
                              </span>
                            ) : (
                              <select
                                value={u.role}
                                onChange={(e) => handleAssignUserRole(u.id, e.target.value)}
                                className="px-2 py-0.5 bg-neutral-900 border border-white/10 rounded text-[10px] focus:outline-none font-bold uppercase"
                                style={{ color: rInfo.color }}
                              >
                                {Object.keys(customRoles).map(rk => (
                                  <option key={rk} value={rk}>{customRoles[rk].name.toUpperCase()}</option>
                                ))}
                              </select>
                            )}
                          </td>
                          <td className="py-3 text-white/40">{u.department || '—'}</td>
                          <td className="py-3 text-right">
                            <button
                              onClick={() => handleBanUser(u.id, u.name)}
                              disabled={u.role === 'founder'}
                              className={`p-1.5 rounded transition disabled:opacity-30 disabled:cursor-not-allowed ${
                                u.isBanned
                                  ? 'bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/25'
                                  : 'bg-red-500/15 hover:bg-red-500/25 text-red-400 border border-red-500/25'
                              }`}
                              title={u.isBanned ? "Unban / Unblock User" : "Ban / Block User"}
                            >
                              {u.isBanned ? <Check size={12} /> : <Trash2 size={12} />}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* Tab: Logs */}
        {activeTab === 'logs' && (
          <div className="bg-white/3 border border-white/5 rounded-2xl p-6 flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-display font-bold uppercase tracking-wider">Ecosystem IP Session Log</h3>
              <span className="text-[10px] font-mono text-white/30">Showing latest 200 entries</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-xs">
                <thead>
                  <tr className="border-b border-white/5 text-white/30">
                    <th className="py-2.5">Timestamp</th>
                    <th className="py-2.5">Security Event</th>
                    <th className="py-2.5">User / Email</th>
                    <th className="py-2.5">IP Address</th>
                    <th className="py-2.5">Details</th>
                  </tr>
                </thead>
                <tbody>
                  {sessionLogs.map(log => (
                    <tr key={log.id} className="border-b border-white/5 text-white/70">
                      <td className="py-3 text-white/30">{new Date(log.timestamp).toLocaleString()}</td>
                      <td className="py-3">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                          log.action === 'FAILED_LOGIN' ? 'bg-red-500/10 border border-red-500/20 text-red-400' :
                          log.action === 'LOGIN' ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' :
                          'bg-indigo-500/10 border border-indigo-500/20 text-indigo-400'
                        }`}>
                          {log.action || log.type}
                        </span>
                      </td>
                      <td className="py-3 font-semibold">{log.email || log.event}</td>
                      <td className="py-3 text-cyan-400">{log.ip}</td>
                      <td className="py-3 text-white/30 max-w-[200px] truncate" title={log.reason || log.userAgent || JSON.stringify(log.details)}>
                        {log.reason || log.userAgent || JSON.stringify(log.details)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab: Forms */}
        {activeTab === 'forms' && (
          <div className="bg-white/3 border border-white/5 rounded-2xl p-6 flex flex-col gap-4 text-left">
            <h3 className="text-sm font-display font-bold uppercase tracking-wider">Ecosystem Form Proposals</h3>
            {formSubmissions.length === 0 ? (
              <p className="text-xs font-mono text-white/20 py-8 text-center">No proposals or bookings submitted yet.</p>
            ) : (
              <div className="flex flex-col gap-4">
                {formSubmissions.map(sub => (
                  <div key={sub.id} className="p-4 rounded-xl border border-white/5 bg-white/3 flex flex-col gap-3">
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/5 pb-2">
                      <div>
                        <span className="px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20 text-[9px] font-mono text-indigo-400 font-bold uppercase mr-2">
                          {sub.type}
                        </span>
                        <span className="text-xs font-mono text-white/50">From: <strong>{sub.submittedBy}</strong> ({sub.submittedByEmail})</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-1 border rounded text-[10px] font-mono font-bold uppercase ${getStatusColor(sub.status)}`}>
                          {sub.status}
                        </span>
                        <select
                          value={sub.status}
                          onChange={(e) => handleUpdateStatus(sub.id, e.target.value)}
                          className="px-2 py-1 bg-neutral-900 border border-white/10 rounded-lg text-xs text-white/60 focus:outline-none focus:border-indigo-500"
                        >
                          <option value="pending">Pending</option>
                          <option value="in-progress">In Progress</option>
                          <option value="completed">Completed</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 font-mono text-[11px] text-white/70">
                      {Object.entries(sub.data).filter(([k]) => k !== 'name' && k !== 'email').map(([key, val]) => (
                        <div key={key} className="flex flex-col gap-0.5">
                          <span className="text-[9px] text-white/30 uppercase">{key.replace(/([A-Z])/g, ' $1')}</span>
                          <span className="truncate">{val || '—'}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab: Roles Manager (Discord style) */}
        {activeTab === 'roles' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-left font-mono">
            {/* Left Column: Role Creator Form */}
            <div className="lg:col-span-5 bg-white/3 border border-white/5 rounded-2xl p-6 flex flex-col gap-4 self-start">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Key size={14} className="text-indigo-400" />
                  Role Editor Sandbox
                </h3>
                <p className="text-[10px] text-white/30 mt-1">Configure role badges, custom styling, and bind permission scopes.</p>
              </div>

              <form onSubmit={handleSaveRole} className="flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] text-white/40 uppercase">Role Key (ID)</label>
                    <input
                      type="text"
                      value={roleKey}
                      onChange={e => setRoleKey(e.target.value)}
                      placeholder="e.g. moderator"
                      className="px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] text-white/40 uppercase">Display Name</label>
                    <input
                      type="text"
                      value={roleName}
                      onChange={e => setRoleName(e.target.value)}
                      placeholder="e.g. Moderator"
                      className="px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] text-white/40 uppercase">Badge Emoji/Prefix</label>
                    <input
                      type="text"
                      value={roleBadge}
                      onChange={e => setRoleBadge(e.target.value)}
                      placeholder="e.g. 🛡️ Mod"
                      className="px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] text-white/40 uppercase">Tag Color (Hex)</label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={roleColor}
                        onChange={e => setRoleColor(e.target.value)}
                        className="w-8 h-8 rounded bg-transparent border-0 cursor-pointer self-center"
                      />
                      <input
                        type="text"
                        value={roleColor}
                        onChange={e => setRoleColor(e.target.value)}
                        placeholder="#A855F7"
                        className="flex-grow px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Permissions checklist grouped by category */}
                <div className="flex flex-col gap-2 mt-2">
                  <span className="text-[9px] text-white/40 uppercase">Permissions checklist</span>
                  <div className="max-h-[220px] overflow-y-auto border border-white/5 rounded-xl p-3 bg-neutral-950/60 flex flex-col gap-3">
                    {['General', 'Admin Override', 'Calendar', 'Workspace', 'Live Stream', 'Feed/Chat'].map(cat => (
                      <div key={cat} className="flex flex-col gap-1">
                        <span className="text-[9px] text-indigo-400 font-bold uppercase border-b border-white/5 pb-0.5">{cat}</span>
                        {ALL_SYSTEM_PERMISSIONS.filter(p => p.cat === cat).map(p => (
                          <label key={p.id} className="flex items-start gap-2 text-[11px] text-white/70 py-0.5 cursor-pointer hover:text-white transition">
                            <input
                              type="checkbox"
                              checked={rolePerms.includes(p.id)}
                              onChange={() => handleTogglePerm(p.id)}
                              className="rounded border-white/10 text-indigo-500 bg-neutral-900 focus:ring-0 mt-0.5"
                            />
                            <span>{p.label}</span>
                          </label>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>

                <button type="submit" className="w-full py-3 bg-indigo-500 hover:bg-indigo-400 text-white rounded-xl text-xs font-bold transition">
                  SYNCHRONIZE ROLE SETTINGS
                </button>
              </form>
            </div>

            {/* Right Column: Roles Registry */}
            <div className="lg:col-span-7 flex flex-col gap-6">
              {/* Roles registry list */}
              <div className="bg-white/3 border border-white/5 rounded-2xl p-6 flex flex-col gap-4">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">Roles Registry</h3>
                <div className="flex flex-col gap-3">
                  {Object.keys(customRoles).map(rk => {
                    const r = customRoles[rk];
                    const isSystemRole = ['founder', 'staff', 'member', 'guest'].includes(rk);
                    return (
                      <div key={rk} className="p-4 rounded-xl border border-white/5 bg-white/2 flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: r.color }} />
                            <span className="text-xs font-bold text-white">{r.name}</span>
                            <span className="text-[10px] font-mono bg-white/5 px-2 py-0.5 rounded text-white/50 border border-white/5">{r.badge}</span>
                          </div>
                          {!isSystemRole && (
                            <button
                              type="button"
                              onClick={() => {
                                const current = JSON.parse(localStorage.getItem('mfs_custom_roles') || '{}');
                                delete current[rk];
                                localStorage.setItem('mfs_custom_roles', JSON.stringify(current));
                                refreshRoles();
                                toast.success(`Purged custom role: ${rk}`);
                              }}
                              className="text-[10px] text-red-400 hover:underline"
                            >
                              Delete
                            </button>
                          )}
                        </div>

                        <div className="flex flex-wrap gap-1 mt-1">
                          {r.permissions.map(p => (
                            <span key={p} className="text-[8px] bg-white/5 text-white/60 px-1.5 py-0.5 rounded border border-white/5">
                              {p}
                            </span>
                          ))}
                          {r.permissions.length === 0 && (
                            <span className="text-[8px] text-white/20 italic">No permissions bound.</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab: Announcements */}
        {activeTab === 'announcements' && (
          <div className="bg-white/3 border border-white/5 rounded-2xl p-6 flex flex-col gap-5 text-left font-mono">
            <div>
              <h3 className="text-sm font-display font-bold uppercase tracking-wider flex items-center gap-2">
                <Radio size={14} className="text-indigo-400" />
                Ecosystem Announcements Bulletin
              </h3>
              <p className="text-xs text-white/40 mt-1">Directly post and manage site-wide announcements broadcasted to all logged-in users.</p>
            </div>

            <form onSubmit={handlePostAnnouncement} className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-[9px] font-mono text-white/40 uppercase">Broadcast Message</label>
                <textarea
                  value={newAnn}
                  onChange={e => setNewAnn(e.target.value)}
                  placeholder="Type a new global update or system note..."
                  rows={3}
                  className="w-full px-3 py-2 bg-neutral-900 border border-white/10 rounded-xl text-xs text-white placeholder-white/20 focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>
              <button
                type="submit"
                disabled={!newAnn.trim()}
                className="py-2.5 bg-indigo-500 hover:bg-indigo-400 disabled:opacity-40 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition"
              >
                <Send size={12} />
                BROADCAST TO ECOSYSTEM
              </button>
            </form>

            <div className="flex flex-col gap-3 mt-2 border-t border-white/5 pt-4">
              <span className="text-[10px] font-mono text-white/30 uppercase tracking-widest">Active Bulletins ({announcements.length})</span>
              
              {announcements.length === 0 ? (
                <p className="text-center text-xs font-mono text-white/20 py-6">No active announcements.</p>
              ) : (
                <div className="flex flex-col gap-3">
                  {announcements.map((ann) => (
                    <div key={ann.id} className="p-4 rounded-xl border border-white/5 bg-white/3 flex items-center justify-between gap-4">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <span className={`px-1.5 py-0.5 rounded text-[8px] font-mono uppercase font-bold border ${
                            ann.role === 'founder' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                            ann.role === 'staff' ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' :
                            'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          }`}>
                            {ann.role}
                          </span>
                          <span className="font-bold text-white/70 text-xs">{ann.author}</span>
                          <span className="text-[9px] text-white/30">
                            {new Date(ann.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-xs text-white/60 font-light mt-1">{ann.text}</p>
                      </div>
                      <button
                        onClick={() => handleDeleteAnnouncement(ann.id)}
                        className="p-2 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 text-white/40 hover:text-red-400 rounded-lg transition"
                        title="Delete announcement"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
