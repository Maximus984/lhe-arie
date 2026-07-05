import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { motion } from 'framer-motion';
import { Shield, Users, Server, FileText, ArrowLeft, RefreshCw, Trash2, Check, Clock, UserCheck } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminPanel() {
  const { sessionLogs, formSubmissions, failedAttempts, updateSubmission, getSimulatedIP } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('telemetry'); // telemetry | users | logs | forms

  const handleUpdateStatus = (id, newStatus) => {
    updateSubmission(id, { status: newStatus });
    toast.success(`Submission marked as ${newStatus}`);
  };

  const getStatusColor = (status) => {
    if (status === 'completed') return 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400';
    if (status === 'in-progress') return 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400';
    return 'bg-amber-500/10 border-amber-500/20 text-amber-400';
  };

  const localUsers = JSON.parse(localStorage.getItem('mfs_users') || '[]');

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

        {/* Tab Selector */}
        <div className="flex gap-2 border-b border-white/5 pb-px overflow-x-auto">
          {[
            { id: 'telemetry', label: 'Ecosystem Telemetry', icon: <Server size={14} /> },
            { id: 'users', label: 'User Directory', icon: <Users size={14} /> },
            { id: 'logs', label: 'Session IP Logs', icon: <Shield size={14} /> },
            { id: 'forms', label: 'Form Inboxes', icon: <FileText size={14} /> },
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

        {/* Tab: Telemetry */}
        {activeTab === 'telemetry' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/3 border border-white/5 rounded-2xl p-6 flex flex-col gap-2">
              <span className="text-[10px] font-mono text-white/30 uppercase tracking-widest">Active Roster</span>
              <span className="text-3xl font-display font-black text-white">{localUsers.length}</span>
              <p className="text-xs text-white/50 leading-relaxed mt-2">Total accounts registered in the local ecosystem storage matrix.</p>
            </div>
            <div className="bg-white/3 border border-white/5 rounded-2xl p-6 flex flex-col gap-2">
              <span className="text-[10px] font-mono text-white/30 uppercase tracking-widest">Lockout Incidents</span>
              <span className="text-3xl font-display font-black text-red-400">
                {Object.keys(failedAttempts).filter(k => failedAttempts[k] >= 5).length}
              </span>
              <p className="text-xs text-white/50 leading-relaxed mt-2">Active IP/Email lockouts due to brute force authentication triggers.</p>
            </div>
            <div className="bg-white/3 border border-white/5 rounded-2xl p-6 flex flex-col gap-2">
              <span className="text-[10px] font-mono text-white/30 uppercase tracking-widest">Forms Received</span>
              <span className="text-3xl font-display font-black text-emerald-400">{formSubmissions.length}</span>
              <p className="text-xs text-white/50 leading-relaxed mt-2">Total project proposals, event bookings, and general contact inquiries.</p>
            </div>

            {/* Lockout Details */}
            <div className="md:col-span-3 bg-white/3 border border-white/5 rounded-2xl p-6 flex flex-col gap-4">
              <h3 className="text-sm font-display font-bold uppercase tracking-wider">Locked Accounts / Brute Force Telemetry</h3>
              {Object.keys(failedAttempts).length === 0 ? (
                <p className="text-xs font-mono text-white/20 py-4 text-center">No brute force or auth lockout triggers logged.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left font-mono text-xs">
                    <thead>
                      <tr className="border-b border-white/5 text-white/30">
                        <th className="py-2.5">Email Identifier</th>
                        <th className="py-2.5">Failed Attempts</th>
                        <th className="py-2.5">Lockout Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(failedAttempts).map(([email, count]) => (
                        <tr key={email} className="border-b border-white/5 text-white/70">
                          <td className="py-3 font-semibold">{email}</td>
                          <td className="py-3 text-amber-400">{count} / 5</td>
                          <td className="py-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              count >= 5 ? 'bg-red-500/10 border border-red-500/20 text-red-400' : 'bg-amber-500/10 border border-amber-500/20 text-amber-400'
                            }`}>
                              {count >= 5 ? 'LOCKED OUT' : 'WARNING'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab: Users */}
        {activeTab === 'users' && (
          <div className="bg-white/3 border border-white/5 rounded-2xl p-6 flex flex-col gap-4">
            <h3 className="text-sm font-display font-bold uppercase tracking-wider">Ecosystem User Directory</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-xs">
                <thead>
                  <tr className="border-b border-white/5 text-white/30">
                    <th className="py-2.5">Name</th>
                    <th className="py-2.5">Email Address</th>
                    <th className="py-2.5">Role</th>
                    <th className="py-2.5">Department</th>
                    <th className="py-2.5">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {localUsers.map(u => (
                    <tr key={u.id} className="border-b border-white/5 text-white/70">
                      <td className="py-3 font-semibold flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center font-bold text-[10px] text-indigo-400">
                          {u.avatar}
                        </div>
                        {u.displayName}
                      </td>
                      <td className="py-3 text-white/40">{u.email}</td>
                      <td className="py-3">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                          u.role === 'founder' ? 'bg-red-500/10 border border-red-500/20 text-red-400' :
                          u.role === 'staff' ? 'bg-cyan-500/10 border border-cyan-500/20 text-cyan-400' :
                          'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                        }`}>
                          {u.role.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3 text-white/40">{u.department || '—'}</td>
                      <td className="py-3">
                        <div className="flex items-center gap-1.5">
                          <span className={`w-1.5 h-1.5 rounded-full ${u.isOnline ? 'bg-emerald-400 animate-pulse shadow-[0_0_6px_#10B981]' : 'bg-white/10'}`} />
                          <span className="text-[10px]">{u.isOnline ? 'Active' : 'Offline'}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab: Logs */}
        {activeTab === 'logs' && (
          <div className="bg-white/3 border border-white/5 rounded-2xl p-6 flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-display font-bold uppercase tracking-wider">Ecosystem IP Session Log</h3>
              <span className="text-[10px] font-mono text-white/30">Showing latest 200 security entries</span>
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
                          {log.action}
                        </span>
                      </td>
                      <td className="py-3 font-semibold">{log.email}</td>
                      <td className="py-3 text-cyan-400">{log.ip}</td>
                      <td className="py-3 text-white/30 max-w-[200px] truncate" title={log.reason || log.userAgent}>
                        {log.reason || log.userAgent}
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
          <div className="bg-white/3 border border-white/5 rounded-2xl p-6 flex flex-col gap-4">
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
        
      </div>
    </div>
  );
}
