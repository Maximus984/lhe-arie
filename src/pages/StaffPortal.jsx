import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, MessageCircle, FileText, Calendar, ArrowLeft, Send, CheckCircle, Clock, Radio, Sliders, Camera, Tv, Activity, Check, Plus, Trash2, Settings, Zap, Eye, EyeOff, Upload, Users, Key, Mail, ShieldOff, ClipboardList, BarChart3, AlertTriangle, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';
import toast from 'react-hot-toast';
import { subscribe, publish } from '../data/realtime.js';
import { setLiveMode, getLiveModeConfig } from '../data/liveMode.js';
import { getUsers } from '../data/users.js';

export default function StaffPortal() {
  const { currentUser, chatTickets, formSubmissions, updateSubmission, calendarEvents, addCalendarEvent, generateOneTimeRecoveryKey, changeUserEmail, clearAccountLockout, submitDiagnosticReport, failedAttempts, can } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('chats'); // chats | forms | schedule | live-control | live-mode | accounts | daily
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [replyText, setReplyText] = useState('');

  // === Account Management State ===
  const [allUsers, setAllUsers] = useState(() => getUsers());
  const [selectedUser, setSelectedUser] = useState(null);
  const [emailEditVal, setEmailEditVal] = useState('');
  const [emailEditing, setEmailEditing] = useState(false);
  const [generatedKey, setGeneratedKey] = useState(null);
  const [keyUserId, setKeyUserId] = useState(null);
  const [accountSearch, setAccountSearch] = useState('');

  // === Daily Check-In State ===
  const todayKey = new Date().toISOString().slice(0, 10);
  const taskStorageKey = `mfs_daily_tasks_${currentUser?.id}_${todayKey}`;
  const DAILY_TASKS = [
    'Morning system check-in',
    'Review pending chat tickets',
    'Check form submissions inbox',
    'Confirm event schedule for today',
    'Broadcast readiness check',
    'Review any escalated reports',
    'Community feed moderation sweep',
    'End-of-shift diagnostic report'
  ];
  const [checkedTasks, setCheckedTasks] = useState(() => {
    try { return JSON.parse(localStorage.getItem(taskStorageKey) || '[]'); } catch { return []; }
  });
  const [diagTitle, setDiagTitle] = useState('');
  const [diagNotes, setDiagNotes] = useState('');
  const [diagSystemStatus, setDiagSystemStatus] = useState('operational');
  const [diagIssues, setDiagIssues] = useState('');
  const [diagEscalate, setDiagEscalate] = useState(false);
  const [submittingDiag, setSubmittingDiag] = useState(false);
  const [diagSubmitted, setDiagSubmitted] = useState(false);
  
  // Streak
  const [checkInStreak, setCheckInStreak] = useState(() => {
    try { return parseInt(localStorage.getItem(`mfs_checkin_streak_${currentUser?.id}`) || '0'); } catch { return 0; }
  });

  const refreshUsers = () => setAllUsers(getUsers());

  // Live Mode state
  const [liveModeConfig, setLiveModeConfig] = useState(getLiveModeConfig);
  const [liveStreamUrl, setLiveStreamUrl] = useState(getLiveModeConfig().streamUrl || '');
  const [liveTitle, setLiveTitle] = useState(getLiveModeConfig().title || 'WE ARE LIVE');
  const [liveSubtitle, setLiveSubtitle] = useState(getLiveModeConfig().subtitle || 'Maxx Forge Studio is streaming now.');

  // Live Stream Control States
  const [streamActive, setStreamActive] = useState(false);
  const [streamType, setStreamType] = useState('preset'); // preset | youtube | webcam
  const [streamUrl, setStreamUrl] = useState('');
  const [streamFilter, setStreamFilter] = useState('none');
  const [showGoal, setShowGoal] = useState(true);
  const [goalTitle, setGoalTitle] = useState('Sub Goal');
  const [goalTarget, setGoalTarget] = useState(100);
  const [goalCurrent, setGoalCurrent] = useState(76);
  const [viewerCount, setViewerCount] = useState(142);
  const [broadcasterChat, setBroadcasterChat] = useState([]);
  const [broadcasterInput, setBroadcasterInput] = useState('');

  useEffect(() => {
    try {
      const saved = localStorage.getItem('mfs_live_stream_config');
      if (saved) {
        const config = JSON.parse(saved);
        setStreamActive(config.active);
        setStreamType(config.type);
        setStreamUrl(config.url);
        setStreamFilter(config.filter);
        setShowGoal(config.showGoal);
        setGoalTitle(config.goalTitle);
        setGoalTarget(config.goalTarget);
        setGoalCurrent(config.goalCurrent);
        setViewerCount(config.viewerCount);
      }
      
      const chats = localStorage.getItem('mfs_live_chat_logs');
      if (chats) {
        setBroadcasterChat(JSON.parse(chats));
      }
    } catch (e) {}

    // Real-time: subscribe to incoming form submissions and chat escalations
    const unsub = subscribe(['form_submitted', 'chat_ticket', 'live_chat_sent'], (event, data) => {
      if (event === 'form_submitted') {
        toast('📋 New form submission received!', { icon: '📋', duration: 5000, style: { borderLeft: '3px solid #10B981' } });
      } else if (event === 'chat_ticket') {
        toast(`💬 Chat escalated by ${data.userName || 'a user'}`, { icon: '💬', duration: 5000, style: { borderLeft: '3px solid #6366F1' } });
      } else if (event === 'live_chat_sent') {
        setBroadcasterChat(prev => {
          if (prev.find(m => m.id === data.id)) return prev;
          const updated = [...prev, data].slice(-80);
          localStorage.setItem('mfs_live_chat_logs', JSON.stringify(updated));
          return updated;
        });
      } else if (event === 'diagnostic_report_submitted') {
        toast(`📋 Diagnostic report submitted by ${data.staffName || 'staff'}`, { icon: '📋', duration: 5000, style: { borderLeft: '3px solid #a78bfa' } });
      }
    });

    return () => unsub();
  }, []);

  const saveStreamConfig = (updates = {}) => {
    const config = {
      active: updates.active !== undefined ? updates.active : streamActive,
      type: updates.type !== undefined ? updates.type : streamType,
      url: updates.url !== undefined ? updates.url : streamUrl,
      filter: updates.filter !== undefined ? updates.filter : streamFilter,
      showGoal: updates.showGoal !== undefined ? updates.showGoal : showGoal,
      goalTitle: updates.goalTitle !== undefined ? updates.goalTitle : goalTitle,
      goalTarget: updates.goalTarget !== undefined ? updates.goalTarget : goalTarget,
      goalCurrent: updates.goalCurrent !== undefined ? updates.goalCurrent : goalCurrent,
      viewerCount: updates.viewerCount !== undefined ? updates.viewerCount : viewerCount,
    };
    localStorage.setItem('mfs_live_stream_config', JSON.stringify(config));
    
    // Sync with mfs_live_mode key
    try {
      const rawLive = localStorage.getItem('mfs_live_mode');
      const liveCfg = rawLive ? JSON.parse(rawLive) : {
        active: false,
        streamUrl: '',
        streamType: 'preset',
        title: 'WE ARE LIVE',
        subtitle: 'Maxx Forge Studio is streaming now. Click to watch.',
        startedAt: null,
        activatedBy: null,
      };

      liveCfg.active = config.active;
      liveCfg.streamUrl = config.url;
      liveCfg.streamType = config.type;
      if (config.active && !liveCfg.startedAt) {
        liveCfg.startedAt = new Date().toISOString();
      } else if (!config.active) {
        liveCfg.startedAt = null;
      }
      localStorage.setItem('mfs_live_mode', JSON.stringify(liveCfg));
      
      // Update local state if needed
      setLiveStreamUrl(config.url);
      setLiveModeConfig(liveCfg);
    } catch (e) {}

    publish('live_config_changed', {});
    publish('live_mode_changed', { active: config.active });
    
    if (updates.active === true) {
      toast.success('Broadcast stream is now LIVE!');
    } else if (updates.active === false) {
      toast.success('Broadcast terminated.');
    }
  };

  const handleSourceChange = (val) => {
    let finalUrl = val.trim();
    let finalType = streamType;

    const ytMatch = finalUrl.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i);
    const isYtId = /^[a-zA-Z0-9_-]{11}$/.test(finalUrl);

    if (ytMatch) {
      finalUrl = ytMatch[1];
      finalType = 'youtube';
      setStreamType('youtube');
      toast.success('YouTube Video ID extracted successfully!');
    } else if (isYtId) {
      finalType = 'youtube';
      setStreamType('youtube');
      toast.success('YouTube Video ID detected!');
    } else if (finalUrl.includes('.mp4') || finalUrl.startsWith('data:video/')) {
      finalType = 'custom-video';
      setStreamType('custom-video');
    }
    
    setStreamUrl(finalUrl);
    saveStreamConfig({ url: finalUrl, type: finalType });
  };

  const handleVideoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('video/')) {
      return toast.error('Only MP4/video files are allowed.');
    }

    const reader = new FileReader();
    toast.loading('Processing video file...', { id: 'vid_load' });
    reader.onloadend = () => {
      setStreamType('custom-video');
      setStreamUrl(reader.result);
      saveStreamConfig({ type: 'custom-video', url: reader.result });
      toast.dismiss('vid_load');
      toast.success('Video loaded and piped to broadcast feed!');
    };
    reader.readAsDataURL(file);
  };

  const handleToggleLiveMode = (on) => {
    const cfg = setLiveMode(on, {
      streamUrl: liveStreamUrl,
      title: liveTitle,
      subtitle: liveSubtitle,
    });
    setLiveModeConfig(cfg);
    setStreamActive(on);
    publish('live_mode_changed', { active: on });
    publish('live_config_changed', {});
    if (on) {
      toast.success('🔴 LIVE MODE ACTIVATED — Dashboard banner is live!');
    } else {
      toast.success('Live Mode deactivated.');
    }
  };

  const handleSendBroadcasterChat = (e) => {
    e.preventDefault();
    if (!broadcasterInput.trim()) return;

    const newMessage = {
      id: `chat_${Date.now()}`,
      author: 'Founder (Maximus)',
      role: 'founder',
      text: broadcasterInput.trim(),
      timestamp: new Date().toISOString()
    };

    const updatedChats = [...broadcasterChat, newMessage].slice(-80);
    localStorage.setItem('mfs_live_chat_logs', JSON.stringify(updatedChats));
    setBroadcasterChat(updatedChats);
    setBroadcasterInput('');
    toast.success('Alert sent to chat feed.');
  };
  const [shifts, setShifts] = useState([
    { day: 'Monday', staff: 'DJ Em', hours: '12:00 PM – 6:00 PM', task: 'Studio Remaster Rigs' },
    { day: 'Wednesday', staff: 'Zeppelin', hours: '2:00 PM – 8:00 PM', task: 'Aries AI Pipeline Build' },
    { day: 'Friday', staff: 'DJ Em', hours: '6:00 PM – 12:00 AM', task: 'Live Stage Mixing Test' },
  ]);

  const handleSendReply = (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    // Simulate sending reply
    toast.success('Reply submitted to ticket queue');
    setReplyText('');
    setSelectedTicket(null);
  };

  const getStatusColor = (status) => {
    if (status === 'completed') return 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400';
    if (status === 'in-progress') return 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400';
    return 'bg-amber-500/10 border-amber-500/20 text-amber-400';
  };

  return (
    <div className="min-h-screen bg-[#050508] text-white p-6 md:p-12 font-sans selection:bg-pink-500/20">
      <div className="max-w-6xl mx-auto flex flex-col gap-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/5 pb-6">
          <div className="flex items-center gap-4">
            <Link to="/dashboard" className="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:border-pink-500 hover:text-pink-400 transition">
              <ArrowLeft size={16} />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <Terminal size={16} className="text-pink-400" />
                <h1 className="text-xl font-display font-black tracking-wider uppercase">Staff Control Portal</h1>
              </div>
              <p className="text-xs font-mono text-white/30 mt-0.5">Maxx Forge Studio™ Staff Terminal</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5 bg-pink-500/10 border border-pink-500/20 rounded-xl px-4 py-2">
            <span className="w-2 h-2 rounded-full bg-pink-400 animate-pulse shadow-[0_0_8px_#EC4899]" />
            <span className="text-xs font-mono text-pink-400 font-bold uppercase tracking-wider">Clearance level: Staff</span>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="flex gap-2 border-b border-white/5 pb-px overflow-x-auto">
          {[
            { id: 'chats', label: 'Escalated AI Chats', icon: <MessageCircle size={14} /> },
            { id: 'forms', label: 'Proposals Inbox', icon: <FileText size={14} /> },
            { id: 'schedule', label: 'Shift Schedule', icon: <Calendar size={14} /> },
            { id: 'accounts', label: 'Accounts', icon: <Users size={14} /> },
            { id: 'daily', label: 'Daily Check-In', icon: <ClipboardList size={14} /> },
            { id: 'live-control', label: 'TikTok Live Studio', icon: <Radio size={14} /> },
            { id: 'live-mode', label: '🔴 Live Mode', icon: <Zap size={14} /> },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-3 text-xs font-mono font-bold border-b-2 transition -mb-px whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-pink-500 text-pink-400 bg-pink-500/5'
                  : 'border-transparent text-white/40 hover:text-white/70'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab: Escalated Chats */}
        {activeTab === 'chats' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-5 bg-white/3 border border-white/5 rounded-2xl p-6 flex flex-col gap-4">
              <h3 className="text-sm font-display font-bold uppercase tracking-wider">Escalated Tickets Queue</h3>
              {chatTickets.length === 0 ? (
                <p className="text-xs font-mono text-white/20 py-8 text-center">No escalated chats in the queue.</p>
              ) : (
                <div className="flex flex-col gap-2">
                  {chatTickets.map(ticket => (
                    <button
                      key={ticket.id}
                      onClick={() => setSelectedTicket(ticket)}
                      className={`p-4 rounded-xl border text-left transition ${
                        selectedTicket?.id === ticket.id
                          ? 'border-pink-500/40 bg-pink-500/5 text-white'
                          : 'border-white/5 bg-white/3 text-white/70 hover:border-white/10'
                      }`}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-bold font-mono text-pink-400 uppercase">{ticket.userName}</span>
                        <span className="text-[9px] font-mono text-white/30">{new Date(ticket.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <p className="text-xs text-white/50 truncate">Last message: {ticket.messages?.[ticket.messages.length - 1]?.text}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="lg:col-span-7">
              {selectedTicket ? (
                <div className="bg-white/3 border border-white/5 rounded-2xl p-6 flex flex-col gap-4 h-full min-h-[400px]">
                  <h3 className="text-sm font-display font-bold uppercase tracking-wider">Conversation Log — {selectedTicket.userName}</h3>
                  <div className="flex-grow overflow-y-auto max-h-[300px] border border-white/5 bg-neutral-950/40 rounded-xl p-4 flex flex-col gap-3">
                    {selectedTicket.messages?.map((msg, i) => (
                      <div key={i} className={`flex flex-col gap-1 ${msg.from === 'user' ? 'items-end' : 'items-start'}`}>
                        <span className="text-[8px] font-mono text-white/30">{msg.from === 'user' ? selectedTicket.userName : 'ARIA'}</span>
                        <div className={`px-3 py-2 rounded-xl text-xs max-w-[80%] ${
                          msg.from === 'user'
                            ? 'bg-pink-600 text-white rounded-tr-sm'
                            : 'bg-white/5 border border-white/5 text-white/80 rounded-tl-sm'
                        }`}>
                          {msg.text}
                        </div>
                      </div>
                    ))}
                  </div>

                  <form onSubmit={handleSendReply} className="flex gap-2">
                    <input
                      type="text"
                      value={replyText}
                      onChange={e => setReplyText(e.target.value)}
                      placeholder="Type ticket response..."
                      className="flex-grow bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-white/20 focus:outline-none focus:border-pink-500/50 transition"
                    />
                    <button
                      type="submit"
                      className="p-2.5 bg-pink-500 text-neutral-950 font-bold rounded-xl hover:bg-pink-400 transition flex items-center justify-center"
                    >
                      <Send size={14} />
                    </button>
                  </form>
                </div>
              ) : (
                <div className="bg-white/3 border border-white/5 rounded-2xl p-6 flex flex-col items-center justify-center text-center gap-2 h-full min-h-[400px]">
                  <MessageCircle size={32} className="text-white/10" />
                  <p className="text-sm text-white/40 font-mono">Select a ticket from the queue to start responding.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab: Form proposals */}
        {activeTab === 'forms' && (
          <div className="bg-white/3 border border-white/5 rounded-2xl p-6 flex flex-col gap-4">
            <h3 className="text-sm font-display font-bold uppercase tracking-wider">Assigned Form Submissions</h3>
            {formSubmissions.length === 0 ? (
              <p className="text-xs font-mono text-white/20 py-8 text-center">No assigned form submissions.</p>
            ) : (
              <div className="flex flex-col gap-3">
                {formSubmissions.map(sub => (
                  <div key={sub.id} className="p-4 rounded-xl border border-white/5 bg-white/3 flex items-center justify-between">
                    <div>
                      <span className="px-2 py-0.5 rounded bg-pink-500/10 border border-pink-500/20 text-[9px] font-mono text-pink-400 font-bold uppercase mr-2">
                        {sub.type}
                      </span>
                      <span className="text-xs font-mono text-white/50">Submitted by: <strong>{sub.submittedBy}</strong></span>
                      <p className="text-[10px] text-white/30 font-mono mt-1">Proposal Date: {new Date(sub.submittedAt).toLocaleDateString()}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-2.5 py-1 border rounded text-[10px] font-mono font-bold uppercase ${getStatusColor(sub.status)}`}>
                        {sub.status}
                      </span>
                      <select
                        value={sub.status}
                        onChange={(e) => {
                          updateSubmission(sub.id, { status: e.target.value });
                          toast.success('Status updated');
                        }}
                        className="px-2.5 py-1 bg-neutral-900 border border-white/10 rounded-lg text-xs text-white/60 focus:outline-none focus:border-pink-500"
                      >
                        <option value="pending">Pending</option>
                        <option value="in-progress">In Progress</option>
                        <option value="completed">Completed</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab: Shift Schedule */}
        {activeTab === 'schedule' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-7 bg-white/3 border border-white/5 rounded-2xl p-6 flex flex-col gap-4">
              <h3 className="text-sm font-display font-bold uppercase tracking-wider">Weekly Staff Shifts</h3>
              <div className="flex flex-col gap-3">
                {shifts.map((shift, i) => (
                  <div key={i} className="p-4 rounded-xl border border-white/5 bg-white/3 flex justify-between items-center">
                    <div>
                      <p className="text-xs font-mono font-bold text-pink-400">{shift.day} — {shift.staff}</p>
                      <p className="text-xs text-white/70 font-semibold mt-1">{shift.task}</p>
                    </div>
                    <span className="text-xs font-mono text-white/30">{shift.hours}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-5 bg-white/3 border border-white/5 rounded-2xl p-6 flex flex-col gap-4">
              <h3 className="text-sm font-display font-bold uppercase tracking-wider">Quick Shift Scheduler</h3>
              <p className="text-xs text-white/50 leading-relaxed font-mono">Select a day, staff name, and project task to add a new shift node to the local staff manifest.</p>
              
              <button
                onClick={() => {
                  addCalendarEvent({
                    title: 'Staff Shift Block',
                    type: 'Studio Session',
                    notes: 'Shift scheduled via Staff Terminal Portal.',
                    date: new Date().toISOString(),
                  });
                  toast.success('Shift block added to the studio calendar!');
                }}
                className="w-full py-3.5 bg-pink-500 text-neutral-950 font-bold rounded-xl text-xs hover:bg-pink-400 transition"
              >
                Sync Next Shift to Studio Calendar
              </button>
            </div>
          </div>
        )}

        {/* Tab: TikTok Live Studio (OBS style) */}
        {activeTab === 'live-control' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-left font-mono">
            {/* Left Column: Overlays & Config (3 cols) */}
            <div className="lg:col-span-3 bg-white/3 border border-white/5 rounded-2xl p-5 flex flex-col gap-4 self-start">
              <h3 className="text-xs font-bold text-pink-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sliders size={13} className="text-pink-400" /> Scene controls
              </h3>

              <div className="flex flex-col gap-3">
                {/* Broadcast trigger button */}
                <button
                  onClick={() => {
                    setStreamActive(!streamActive);
                    saveStreamConfig({ active: !streamActive });
                  }}
                  className={`w-full py-3.5 rounded-xl font-bold text-xs transition flex items-center justify-center gap-2 ${
                    streamActive 
                      ? 'bg-red-500 hover:bg-red-400 text-white shadow-[0_0_20px_rgba(239,68,68,0.3)]' 
                      : 'bg-pink-500 hover:bg-pink-400 text-neutral-950 shadow-[0_0_20px_rgba(236,72,153,0.2)]'
                  }`}
                >
                  <Activity size={14} className={streamActive ? "animate-pulse" : ""} />
                  {streamActive ? 'TERMINATE STREAM' : 'GO LIVE NOW'}
                </button>

                {/* Stream capture source */}
                <div className="flex flex-col gap-1 mt-2">
                  <label className="text-[9px] text-white/40 uppercase">Video Source</label>
                  <select
                    value={streamType}
                    onChange={e => {
                      setStreamType(e.target.value);
                      saveStreamConfig({ type: e.target.value });
                    }}
                    className="px-3 py-2 bg-neutral-950 border border-white/10 rounded-xl text-xs text-white/80 focus:outline-none"
                  >
                    <option value="preset">Preset TouchDesigner Loop</option>
                    <option value="webcam">Simulated Webcam Feed</option>
                    <option value="youtube">YouTube Embed Stream</option>
                    <option value="custom-video">Custom Video (Link / Upload)</option>
                  </select>
                </div>

                {/* Overlays list */}
                <div className="flex flex-col gap-2 mt-2 border-t border-white/5 pt-3">
                  <span className="text-[9px] text-white/40 uppercase">Active Overlays</span>
                  <label className="flex items-center gap-2 text-xs text-white/70 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showGoal}
                      onChange={e => {
                        setShowGoal(e.target.checked);
                        saveStreamConfig({ showGoal: e.target.checked });
                      }}
                      className="rounded border-white/10 text-pink-500 bg-neutral-900 focus:ring-0"
                    />
                    Sub Goal Overlay
                  </label>
                </div>

                {/* Camera filters */}
                <div className="flex flex-col gap-1 mt-2 border-t border-white/5 pt-3">
                  <label className="text-[9px] text-white/40 uppercase">Interactive Filter</label>
                  <select
                    value={streamFilter}
                    onChange={e => {
                      setStreamFilter(e.target.value);
                      saveStreamConfig({ filter: e.target.value });
                    }}
                    className="px-3 py-2 bg-neutral-950 border border-white/10 rounded-xl text-xs text-white/80 focus:outline-none"
                  >
                    <option value="none">Normal (No Filter)</option>
                    <option value="neon">Cyber Neon Hue-Shift</option>
                    <option value="christmas">Cozy Christmas Hue</option>
                    <option value="halloween">Spooky Glitch Flare</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Center Column: Live Preview & Configurations (6 cols) */}
            <div className="lg:col-span-6 bg-white/3 border border-white/5 rounded-2xl p-5 flex flex-col gap-5">
              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Tv size={13} /> OBS Preview Canvas
                </h3>
                <span className="text-[9px] text-white/40">Grid Overlay Active</span>
              </div>

              {/* Broadcast Preview Canvas Screen */}
              <div className="relative aspect-video w-full bg-black rounded-xl border border-white/10 overflow-hidden flex items-center justify-center">
                {streamActive ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-950 border border-pink-500/20">
                    {/* OBS Tech Guide Grid Lines overlay */}
                    <div className="absolute inset-0 border border-dashed border-white/5 pointer-events-none grid grid-cols-3 grid-rows-3 z-20" />
                    
                    {streamType === 'webcam' ? (
                      <span className="text-xs text-pink-400 animate-pulse font-bold tracking-widest z-10 uppercase">🎥 WEBCAM FEED ACTIVE</span>
                    ) : streamType === 'youtube' && streamUrl ? (
                      <iframe
                        src={`https://www.youtube.com/embed/${streamUrl}?autoplay=1&mute=1&controls=0`}
                        className="absolute inset-0 w-full h-full border-0 pointer-events-none"
                        title="YouTube Preview"
                      />
                    ) : streamType === 'custom-video' && streamUrl ? (
                      <video
                        src={streamUrl}
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-xs text-pink-400 animate-pulse font-bold tracking-widest z-10 uppercase">🔮 GRAPHICS GENERATOR LOOP</span>
                    )}
                    
                    {/* Source label */}
                    <div className="absolute bottom-2 left-3 text-[9px] font-mono text-white/60 bg-black/60 border border-white/10 px-2 py-0.5 rounded backdrop-blur z-30">
                      OBS OUT: {streamType.toUpperCase()}
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-white/30 font-bold uppercase tracking-widest">FEED OFFLINE</div>
                )}
              </div>

              {/* Widescreen config form */}
              <div className="grid grid-cols-2 gap-3 mt-2 border-t border-white/5 pt-4">
                <div className="flex flex-col gap-1 col-span-2">
                  <label className="text-[9px] text-white/40 uppercase">Stream Source URL / YouTube Link</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={streamUrl}
                      onChange={e => handleSourceChange(e.target.value)}
                      placeholder="Paste YouTube ID, full watch link, or direct MP4 URL"
                      className="flex-grow px-3 py-2 bg-neutral-900 border border-white/10 rounded-xl text-xs text-white focus:outline-none font-mono"
                    />
                    
                    <label className="px-3.5 py-2 bg-pink-500 hover:bg-pink-400 text-neutral-950 font-bold text-xs rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 flex-shrink-0">
                      <Upload size={12} /> Upload MP4
                      <input type="file" accept="video/mp4" onChange={handleVideoUpload} className="hidden" />
                    </label>
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] text-white/40 uppercase">Viewer Count Override</label>
                  <input
                    type="number"
                    value={viewerCount}
                    onChange={e => {
                      const count = parseInt(e.target.value) || 0;
                      setViewerCount(count);
                      saveStreamConfig({ viewerCount: count });
                    }}
                    className="px-3 py-2 bg-neutral-900 border border-white/10 rounded-xl text-xs text-white focus:outline-none"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[9px] text-white/40 uppercase">Goal Title</label>
                  <input
                    type="text"
                    value={goalTitle}
                    onChange={e => {
                      setGoalTitle(e.target.value);
                      saveStreamConfig({ goalTitle: e.target.value });
                    }}
                    className="px-3 py-2 bg-neutral-900 border border-white/10 rounded-xl text-xs text-white focus:outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] text-white/40 uppercase">Current</label>
                    <input
                      type="number"
                      value={goalCurrent}
                      onChange={e => {
                        const count = parseInt(e.target.value) || 0;
                        setGoalCurrent(count);
                        saveStreamConfig({ goalCurrent: count });
                      }}
                      className="px-3 py-2 bg-neutral-900 border border-white/10 rounded-xl text-xs text-white focus:outline-none"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] text-white/40 uppercase">Target</label>
                    <input
                      type="number"
                      value={goalTarget}
                      onChange={e => {
                        const count = parseInt(e.target.value) || 0;
                        setGoalTarget(count);
                        saveStreamConfig({ goalTarget: count });
                      }}
                      className="px-3 py-2 bg-neutral-900 border border-white/10 rounded-xl text-xs text-white focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Chat Monitor (3 cols) */}
            <div className="lg:col-span-3 bg-white/3 border border-white/5 rounded-2xl p-5 flex flex-col h-[400px] lg:h-auto self-stretch">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-2 pb-2 border-b border-white/5 flex items-center gap-1">
                <MessageCircle size={13} /> Chat Ticker
              </h3>
              
              <div className="flex-grow overflow-y-auto flex flex-col gap-2.5 mb-3">
                {broadcasterChat.length === 0 ? (
                  <p className="text-[10px] text-white/20 text-center py-6">No chat messages yet.</p>
                ) : (
                  broadcasterChat.map(chat => (
                    <div key={chat.id} className="text-[10px] flex flex-col gap-0.5 border-b border-white/5 pb-1.5">
                      <span className="font-bold text-pink-400">{chat.author}</span>
                      <p className="text-white/70">{chat.text}</p>
                    </div>
                  ))
                )}
              </div>

              <form onSubmit={handleSendBroadcasterChat} className="flex gap-2 mt-auto">
                <input
                  type="text"
                  value={broadcasterInput}
                  onChange={e => setBroadcasterInput(e.target.value)}
                  placeholder="Send broadcast message..."
                  className="flex-grow px-2 py-1.5 bg-neutral-950 border border-white/10 rounded-lg text-xs text-white focus:outline-none placeholder-white/20"
                />
                <button type="submit" className="p-1.5 bg-pink-500 hover:bg-pink-400 text-neutral-950 rounded-lg transition flex items-center justify-center">
                  <Send size={12} className="text-neutral-950" />
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Tab: Live Mode — Site-Wide Takeover */}
        {activeTab === 'live-mode' && (
          <div className="flex flex-col gap-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Toggle Card */}
              <div className="bg-white/3 border border-white/5 rounded-2xl p-6 flex flex-col gap-5">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl ${liveModeConfig.active ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-white/5 text-white/40 border border-white/10'}`}>
                    <Radio size={18} className={liveModeConfig.active ? 'animate-pulse' : ''} />
                  </div>
                  <div>
                    <h3 className="text-sm font-display font-black uppercase tracking-wider text-white">Live Mode Control</h3>
                    <p className="text-[10px] font-mono text-white/30 mt-0.5">Activates a LIVE NOW banner on the dashboard homepage for all users.</p>
                  </div>
                </div>

                {/* Big toggle */}
                <div className="flex items-center justify-between p-4 bg-neutral-950/60 rounded-xl border border-white/5">
                  <div>
                    <p className="text-xs font-bold text-white">{liveModeConfig.active ? '🔴 LIVE MODE IS ON' : '⚫ LIVE MODE IS OFF'}</p>
                    <p className="text-[10px] font-mono text-white/30 mt-0.5">
                      {liveModeConfig.active ? `Activated ${liveModeConfig.startedAt ? new Date(liveModeConfig.startedAt).toLocaleTimeString() : ''}` : 'All users see the normal dashboard'}
                    </p>
                  </div>
                  <button
                    onClick={() => handleToggleLiveMode(!liveModeConfig.active)}
                    className={`relative w-14 h-7 rounded-full border transition-all duration-300 ${liveModeConfig.active ? 'bg-red-500 border-red-400 shadow-[0_0_20px_rgba(239,68,68,0.5)]' : 'bg-white/10 border-white/10'}`}
                  >
                    <span className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-md transition-all duration-300 ${liveModeConfig.active ? 'left-7' : 'left-0.5'}`} />
                  </button>
                </div>

                {/* Quick action buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={() => handleToggleLiveMode(true)}
                    disabled={liveModeConfig.active}
                    className="flex-1 py-3 bg-red-500 hover:bg-red-400 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-2"
                  >
                    <Radio size={13} className="animate-pulse" /> GO LIVE
                  </button>
                  <button
                    onClick={() => handleToggleLiveMode(false)}
                    disabled={!liveModeConfig.active}
                    className="flex-1 py-3 bg-white/10 hover:bg-white/20 disabled:opacity-40 disabled:cursor-not-allowed text-white/70 font-bold text-xs rounded-xl transition"
                  >
                    END BROADCAST
                  </button>
                </div>
              </div>

              {/* Config Card */}
              <div className="bg-white/3 border border-white/5 rounded-2xl p-6 flex flex-col gap-4">
                <h3 className="text-xs font-display font-black uppercase tracking-wider text-white border-b border-white/5 pb-3">Banner Configuration</h3>
                
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] font-mono text-white/40 uppercase tracking-wider">Banner Title</label>
                  <input
                    type="text"
                    value={liveTitle}
                    onChange={e => setLiveTitle(e.target.value)}
                    placeholder="WE ARE LIVE"
                    className="px-3 py-2.5 bg-neutral-950 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-red-500/50"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[9px] font-mono text-white/40 uppercase tracking-wider">Banner Subtitle</label>
                  <input
                    type="text"
                    value={liveSubtitle}
                    onChange={e => setLiveSubtitle(e.target.value)}
                    placeholder="Maxx Forge Studio is streaming now."
                    className="px-3 py-2.5 bg-neutral-950 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-red-500/50"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[9px] font-mono text-white/40 uppercase tracking-wider">YouTube Video ID (optional)</label>
                  <input
                    type="text"
                    value={liveStreamUrl}
                    onChange={e => setLiveStreamUrl(e.target.value)}
                    placeholder="e.g. dQw4w9WgXcQ"
                    className="px-3 py-2.5 bg-neutral-950 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-red-500/50"
                  />
                </div>

                <button
                  onClick={() => {
                    const cfg = setLiveMode(liveModeConfig.active, { streamUrl: liveStreamUrl, title: liveTitle, subtitle: liveSubtitle });
                    setLiveModeConfig(cfg);
                    publish('live_mode_changed', { active: liveModeConfig.active });
                    toast.success('Banner config saved.');
                  }}
                  className="w-full py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 font-bold text-xs rounded-xl transition"
                >
                  Save Config
                </button>
              </div>
            </div>

            {/* Preview */}
            <div className="bg-white/3 border border-white/5 rounded-2xl p-5">
              <h3 className="text-xs font-mono text-white/40 uppercase tracking-wider mb-3">Banner Preview</h3>
              <div className={`w-full rounded-2xl p-5 border flex flex-col md:flex-row items-center justify-between gap-4 transition-all ${
                liveModeConfig.active
                  ? 'bg-gradient-to-r from-red-950/60 via-red-900/30 to-red-950/60 border-red-500/30'
                  : 'bg-white/3 border-white/10 opacity-50'
              }`}>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className={`w-3 h-3 rounded-full bg-red-500 ${liveModeConfig.active ? 'animate-ping' : ''}`} />
                    <span className="w-3 h-3 rounded-full bg-red-500 absolute" />
                  </div>
                  <div>
                    <p className="text-base font-display font-black text-white uppercase tracking-wide">{liveTitle}</p>
                    <p className="text-xs text-white/50 font-light mt-0.5">{liveSubtitle}</p>
                  </div>
                </div>
                <div className="px-5 py-2.5 bg-red-500 rounded-xl text-white font-bold text-xs uppercase tracking-wider">
                  WATCH LIVE →
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ─── ACCOUNTS TAB ─── */}
        {activeTab === 'accounts' && (
          <div className="flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
              <div>
                <h2 className="text-lg font-display font-black tracking-wider uppercase">Account Management</h2>
                <p className="text-xs font-mono text-white/30 mt-0.5">Manage user accounts, emails, lockouts & recovery keys</p>
              </div>
              <button onClick={refreshUsers} className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs font-mono text-white/50 hover:border-pink-500/40 hover:text-pink-300 transition">
                <RefreshCw size={12} />
                Refresh
              </button>
            </div>

            <input
              type="text"
              placeholder="Search users by name or email…"
              value={accountSearch}
              onChange={e => setAccountSearch(e.target.value)}
              className="w-full bg-white/3 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/25 focus:outline-none focus:border-pink-500/40"
            />

            <div className="flex flex-col gap-3">
              {allUsers
                .filter(u => !accountSearch || u.name?.toLowerCase().includes(accountSearch.toLowerCase()) || u.email?.toLowerCase().includes(accountSearch.toLowerCase()))
                .map(user => {
                  const isLocked = (JSON.parse(localStorage.getItem('mfs_failed_attempts') || '{}'))[user.email?.toLowerCase()] >= 5;
                  const activeKey = JSON.parse(localStorage.getItem('mfs_otp_keys') || '[]').find(k => k.userId === user.id && !k.used);
                  return (
                    <div key={user.id} className="bg-white/3 border border-white/8 rounded-2xl p-4 flex flex-col gap-3">
                      <div className="flex items-center justify-between flex-wrap gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-pink-500/15 border border-pink-500/20 flex items-center justify-center text-sm font-bold text-pink-300">
                            {user.avatar || user.name?.[0] || '?'}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-white">{user.displayName || user.name}</p>
                            <p className="text-[10px] font-mono text-white/40">{user.email} · <span className="text-white/25 capitalize">{user.role}</span></p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {isLocked && (
                            <span className="px-2 py-0.5 rounded-full bg-red-500/15 border border-red-500/25 text-red-400 text-[9px] font-mono font-bold uppercase flex items-center gap-1">
                              <ShieldOff size={9} /> Locked
                            </span>
                          )}
                          {activeKey && (
                            <span className="px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/25 text-amber-400 text-[9px] font-mono font-bold uppercase flex items-center gap-1">
                              <Key size={9} /> OTP Active
                            </span>
                          )}
                          <button
                            onClick={() => setSelectedUser(selectedUser?.id === user.id ? null : user)}
                            className="text-[10px] font-mono text-white/40 hover:text-white/70 px-3 py-1.5 rounded-lg border border-white/8 hover:border-white/20 transition"
                          >
                            {selectedUser?.id === user.id ? 'Close ▲' : 'Manage ▼'}
                          </button>
                        </div>
                      </div>

                      <AnimatePresence>
                        {selectedUser?.id === user.id && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.22 }}
                            style={{ overflow: 'hidden' }}
                          >
                            <div className="flex flex-col gap-3 pt-3 border-t border-white/5">
                              {/* Change Email */}
                              <div className="bg-white/2 rounded-xl p-3 flex flex-col gap-2">
                                <div className="flex items-center gap-2">
                                  <Mail size={12} className="text-white/40" />
                                  <span className="text-[10px] font-mono text-white/50 uppercase tracking-wider">Change Email</span>
                                </div>
                                <div className="flex gap-2">
                                  <input
                                    type="email"
                                    value={emailEditing && keyUserId === user.id ? emailEditVal : ''}
                                    placeholder={user.email}
                                    onChange={e => setEmailEditVal(e.target.value)}
                                    onFocus={() => { setEmailEditing(true); setKeyUserId(user.id); setEmailEditVal(''); }}
                                    className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white placeholder-white/25 focus:outline-none focus:border-pink-500/30"
                                  />
                                  <button
                                    onClick={async () => {
                                      if (!emailEditVal.trim() || !emailEditVal.includes('@')) { toast.error('Enter a valid email'); return; }
                                      const res = changeUserEmail(user.id, emailEditVal.trim());
                                      if (res.success) { toast.success('Email updated!'); refreshUsers(); setEmailEditing(false); setEmailEditVal(''); }
                                      else toast.error(res.error);
                                    }}
                                    className="px-3 py-1.5 bg-pink-500/15 border border-pink-500/25 hover:border-pink-500/50 text-pink-300 text-[10px] font-mono font-bold rounded-lg transition"
                                  >
                                    Save
                                  </button>
                                </div>
                              </div>

                              {/* One-Time Recovery Key */}
                              <div className="bg-white/2 rounded-xl p-3 flex flex-col gap-2">
                                <div className="flex items-center gap-2">
                                  <Key size={12} className="text-white/40" />
                                  <span className="text-[10px] font-mono text-white/50 uppercase tracking-wider">One-Time Recovery Key</span>
                                </div>
                                {generatedKey && keyUserId === user.id ? (
                                  <div className="flex flex-col gap-1.5">
                                    <div className="bg-emerald-500/10 border border-emerald-500/25 rounded-lg px-3 py-2.5 font-mono text-sm font-bold text-emerald-300 tracking-widest text-center">
                                      {generatedKey}
                                    </div>
                                    <p className="text-[9px] font-mono text-white/30 text-center">Share with user. Expires 24h · One-use only.</p>
                                    <button
                                      onClick={() => { navigator.clipboard.writeText(generatedKey); toast.success('Key copied!'); }}
                                      className="text-[10px] font-mono text-white/50 hover:text-white/80 transition"
                                    >Copy to clipboard ↗</button>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => {
                                      const key = generateOneTimeRecoveryKey(user.id);
                                      if (key) { setGeneratedKey(key); setKeyUserId(user.id); toast.success('One-time recovery key generated!'); }
                                      else toast.error('Failed to generate key.');
                                    }}
                                    className="flex items-center justify-center gap-2 p-2.5 bg-amber-500/10 border border-amber-500/20 hover:border-amber-500/40 text-amber-300 text-[10px] font-mono font-bold rounded-lg transition"
                                  >
                                    <Key size={11} />
                                    Generate OTP Recovery Key
                                  </button>
                                )}
                              </div>

                              {/* Clear Lockout */}
                              {isLocked && (
                                <button
                                  onClick={() => {
                                    clearAccountLockout(user.email);
                                    toast.success(`Lockout cleared for ${user.name}!`);
                                    refreshUsers();
                                  }}
                                  className="flex items-center justify-center gap-2 p-2.5 bg-red-500/10 border border-red-500/20 hover:border-red-500/40 text-red-300 text-[10px] font-mono font-bold rounded-lg transition"
                                >
                                  <ShieldOff size={11} />
                                  CLEAR ACCOUNT LOCKOUT
                                </button>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* ─── DAILY CHECK-IN TAB ─── */}
        {activeTab === 'daily' && (
          <div className="flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div>
                <h2 className="text-lg font-display font-black tracking-wider uppercase">Daily Check-In</h2>
                <p className="text-xs font-mono text-white/30 mt-0.5">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
              </div>
              {checkInStreak > 0 && (
                <div className="flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                  <span className="text-base">🔥</span>
                  <span className="text-xs font-mono font-bold text-amber-300">{checkInStreak} Day Streak</span>
                </div>
              )}
            </div>

            {/* Task Checklist */}
            <div className="bg-white/3 border border-white/8 rounded-2xl p-5">
              <h3 className="text-xs font-mono text-white/40 uppercase tracking-wider mb-4">Today's Task List</h3>
              <div className="flex flex-col gap-2">
                {DAILY_TASKS.map((task, idx) => {
                  const done = checkedTasks.includes(idx);
                  return (
                    <button
                      key={idx}
                      onClick={() => {
                        const updated = done ? checkedTasks.filter(i => i !== idx) : [...checkedTasks, idx];
                        setCheckedTasks(updated);
                        localStorage.setItem(taskStorageKey, JSON.stringify(updated));
                        if (!done && updated.length === DAILY_TASKS.length) {
                          const newStreak = checkInStreak + 1;
                          setCheckInStreak(newStreak);
                          localStorage.setItem(`mfs_checkin_streak_${currentUser?.id}`, String(newStreak));
                          toast.success('🎉 All daily tasks complete! Streak updated!');
                        }
                      }}
                      className={`flex items-center gap-3 p-3 rounded-xl border text-left transition group ${
                        done
                          ? 'bg-emerald-500/10 border-emerald-500/20'
                          : 'bg-white/2 border-white/6 hover:border-pink-500/20 hover:bg-pink-500/3'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition ${
                        done ? 'bg-emerald-500 border-emerald-500' : 'border-white/20 group-hover:border-pink-500/50'
                      }`}>
                        {done && <Check size={10} className="text-white" strokeWidth={3} />}
                      </div>
                      <span className={`text-xs font-medium transition ${done ? 'text-white/40 line-through' : 'text-white/70'}`}>{task}</span>
                      {task === 'End-of-shift diagnostic report' && !done && (
                        <span className="ml-auto text-[9px] font-mono text-pink-400/60 font-bold">↓ fill below</span>
                      )}
                    </button>
                  );
                })}
              </div>
              <div className="mt-4">
                <div className="flex justify-between mb-1">
                  <span className="text-[10px] font-mono text-white/30">Progress</span>
                  <span className="text-[10px] font-mono text-white/50">{checkedTasks.length}/{DAILY_TASKS.length}</span>
                </div>
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-pink-500 to-violet-500 rounded-full transition-all duration-500"
                    style={{ width: `${(checkedTasks.length / DAILY_TASKS.length) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Diagnostic Report Builder */}
            <div className="bg-white/3 border border-white/8 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 size={14} className="text-pink-400" />
                <h3 className="text-xs font-mono text-white/60 uppercase tracking-wider">End-of-Shift Diagnostic Report</h3>
              </div>

              {diagSubmitted ? (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-8 flex flex-col items-center gap-3">
                  <CheckCircle size={40} className="text-emerald-400" />
                  <p className="text-sm font-bold text-white">Report Submitted!</p>
                  <p className="text-xs font-mono text-white/40">Synced to Admin Dashboard proposals registry.</p>
                  <button onClick={() => { setDiagSubmitted(false); setDiagTitle(''); setDiagNotes(''); setDiagIssues(''); setDiagEscalate(false); setDiagSystemStatus('operational'); }}
                    className="mt-2 text-[10px] font-mono text-white/30 hover:text-white/60 transition">Write Another →</button>
                </motion.div>
              ) : (
                <div className="flex flex-col gap-3">
                  <div>
                    <label className="text-[10px] font-mono text-white/40 uppercase tracking-wider block mb-1">Report Title</label>
                    <input
                      type="text"
                      value={diagTitle}
                      onChange={e => setDiagTitle(e.target.value)}
                      placeholder={`End-of-shift check — ${new Date().toLocaleDateString()}`}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-white/25 focus:outline-none focus:border-pink-500/30"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-mono text-white/40 uppercase tracking-wider block mb-1">System Status</label>
                    <select
                      value={diagSystemStatus}
                      onChange={e => setDiagSystemStatus(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-pink-500/30"
                      style={{ colorScheme: 'dark' }}
                    >
                      <option value="operational">✅ Operational — everything running smoothly</option>
                      <option value="degraded">⚠️ Degraded — minor issues detected</option>
                      <option value="outage">🔴 Partial Outage — some services down</option>
                      <option value="maintenance">🔧 Maintenance — scheduled work in progress</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-mono text-white/40 uppercase tracking-wider block mb-1">Issues / Observations</label>
                    <textarea
                      value={diagIssues}
                      onChange={e => setDiagIssues(e.target.value)}
                      placeholder="List any anomalies, bugs, user complaints, or system alerts observed during shift…"
                      rows={3}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-white/25 focus:outline-none focus:border-pink-500/30 resize-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-mono text-white/40 uppercase tracking-wider block mb-1">Notes & Recommendations</label>
                    <textarea
                      value={diagNotes}
                      onChange={e => setDiagNotes(e.target.value)}
                      placeholder="Additional notes, action items, or recommendations for next shift…"
                      rows={3}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-white/25 focus:outline-none focus:border-pink-500/30 resize-none"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setDiagEscalate(v => !v)}
                    className={`flex items-center gap-2 p-3 rounded-xl border transition ${
                      diagEscalate
                        ? 'bg-red-500/10 border-red-500/30 text-red-300'
                        : 'bg-white/2 border-white/8 text-white/40 hover:border-white/20'
                    }`}
                  >
                    <AlertTriangle size={12} />
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider">
                      {diagEscalate ? '⚠ Escalate to Admin — MARKED' : 'Mark as Escalation (Admin Review Required)'}
                    </span>
                  </button>
                  <button
                    onClick={async () => {
                      if (!diagTitle.trim()) { toast.error('Please enter a report title'); return; }
                      setSubmittingDiag(true);
                      await new Promise(r => setTimeout(r, 600));
                      submitDiagnosticReport({
                        title: diagTitle,
                        notes: diagNotes,
                        issues: diagIssues,
                        systemStatus: diagSystemStatus,
                        escalate: diagEscalate,
                        tasksCompleted: checkedTasks.length,
                        totalTasks: DAILY_TASKS.length,
                      });
                      setSubmittingDiag(false);
                      setDiagSubmitted(true);
                      toast.success('Diagnostic report submitted to Admin Panel!');
                    }}
                    disabled={submittingDiag}
                    className="flex items-center justify-center gap-2 p-3.5 bg-gradient-to-r from-pink-600 to-violet-600 text-white font-bold text-xs rounded-xl hover:brightness-110 disabled:opacity-50 transition shadow-[0_0_20px_rgba(236,72,153,0.2)]"
                  >
                    {submittingDiag ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Send size={12} />}
                    SUBMIT DIAGNOSTIC REPORT
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
