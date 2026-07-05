import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { motion } from 'framer-motion';
import { Terminal, MessageCircle, FileText, Calendar, ArrowLeft, Send, CheckCircle, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

export default function StaffPortal() {
  const { chatTickets, formSubmissions, updateSubmission, calendarEvents, addCalendarEvent } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('chats'); // chats | forms | schedule
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [replyText, setReplyText] = useState('');
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

      </div>
    </div>
  );
}
