import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, FileText, Send, Check, Calendar, Music, Zap, Cpu, Mail, User, ChevronRight, AlertTriangle } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import toast from 'react-hot-toast';

const FORM_TYPES = [
  { id: 'booking', label: 'Event Booking', icon: <Zap size={16} />, color: '#10B981', desc: 'Book DJ Em for live events, stage lighting & visual rigs' },
  { id: 'collab', label: 'Music Collab', icon: <Music size={16} />, color: '#00E5FF', desc: 'Collaborate with Prime Records on remixes, mastering & features' },
  { id: 'tech', label: 'Tech Consultation', icon: <Cpu size={16} />, color: '#6366F1', desc: 'Aries AI integration, software builds & API development' },
  { id: 'contact', label: 'General Contact', icon: <Mail size={16} />, color: '#F59E0B', desc: 'Press, partnerships, media & general inquiries' },
  { id: 'vacation', label: 'Time-Off Request', icon: <Calendar size={16} />, color: '#EC4899', desc: 'Staff vacation & schedule adjustment requests (Staff only)' },
  { id: 'staff_report', label: 'Staff Incident Report', icon: <AlertTriangle size={16} />, color: '#EF4444', desc: 'Log system diagnostics, security sweep warnings & node failures (Staff only)' },
  { id: 'account_mgmt', label: 'Account Management', icon: <User size={16} />, color: '#10B981', desc: 'Request credentials reset, role upgrades & telemetry key access' },
];

function BookingForm({ onSubmit, loading }) {
  const [data, setData] = useState({ name: '', email: '', eventDate: '', venue: '', capacity: '', requirements: '', budget: '' });
  const set = k => e => setData(d => ({ ...d, [k]: e.target.value }));
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3">
        <Field label="Full Name" value={data.name} onChange={set('name')} placeholder="e.g. Alex Rivers" required />
        <Field label="Email" type="email" value={data.email} onChange={set('email')} placeholder="you@email.com" required />
        <Field label="Event Date" type="date" value={data.eventDate} onChange={set('eventDate')} required />
        <Field label="Venue / Location" value={data.venue} onChange={set('venue')} placeholder="e.g. The Forge Club, LA" required />
        <Field label="Estimated Capacity" value={data.capacity} onChange={set('capacity')} placeholder="e.g. 500 guests" />
        <Field label="Estimated Budget" value={data.budget} onChange={set('budget')} placeholder="e.g. $2,000–$5,000" />
      </div>
      <Textarea label="Event Requirements & Specifications" value={data.requirements} onChange={set('requirements')} placeholder="Stage dimensions, lighting needs, AV setup, number of sets, genres, etc." rows={3} />
      <SubmitBtn loading={loading} onClick={() => onSubmit('Event Booking', data)} label="Submit Booking Request" color="#10B981" />
    </div>
  );
}

function CollabForm({ onSubmit, loading }) {
  const [data, setData] = useState({ name: '', email: '', artistName: '', type: 'Remix', trackLink: '', vision: '' });
  const set = k => e => setData(d => ({ ...d, [k]: e.target.value }));
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3">
        <Field label="Your Name" value={data.name} onChange={set('name')} placeholder="Real name or alias" required />
        <Field label="Email" type="email" value={data.email} onChange={set('email')} placeholder="you@email.com" required />
        <Field label="Artist / Project Name" value={data.artistName} onChange={set('artistName')} placeholder="Stage name or label" />
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-mono text-white/40 uppercase font-bold tracking-wider">Collaboration Type</label>
          <select value={data.type} onChange={set('type')} className="px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white/80 focus:outline-none focus:border-emerald-500/50 transition">
            <option value="Remix">Remix / Edit</option>
            <option value="Feature">Feature / Verse</option>
            <option value="Mastering">Mastering & Mixing</option>
            <option value="Original">Original Track</option>
            <option value="Sync">Sync Licensing</option>
          </select>
        </div>
      </div>
      <Field label="Reference Track / SoundCloud Link" value={data.trackLink} onChange={set('trackLink')} placeholder="https://soundcloud.com/your-track" />
      <Textarea label="Creative Vision & Goals" value={data.vision} onChange={set('vision')} placeholder="Describe the sound, feel, references, and what you're hoping to achieve..." rows={3} />
      <SubmitBtn loading={loading} onClick={() => onSubmit('Music Collaboration', data)} label="Submit Collaboration Request" color="#00E5FF" />
    </div>
  );
}

function TechForm({ onSubmit, loading }) {
  const [data, setData] = useState({ name: '', email: '', company: '', service: 'Aries AI Integration', timeline: '', description: '' });
  const set = k => e => setData(d => ({ ...d, [k]: e.target.value }));
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3">
        <Field label="Full Name" value={data.name} onChange={set('name')} placeholder="Your name" required />
        <Field label="Email" type="email" value={data.email} onChange={set('email')} placeholder="you@company.com" required />
        <Field label="Company / Studio" value={data.company} onChange={set('company')} placeholder="Optional" />
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-mono text-white/40 uppercase font-bold tracking-wider">Service Needed</label>
          <select value={data.service} onChange={set('service')} className="px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white/80 focus:outline-none focus:border-indigo-500/50 transition">
            <option value="Aries AI Integration">Aries AI Integration</option>
            <option value="Custom API Build">Custom API Build</option>
            <option value="Ollama Local Setup">Ollama Local LLM Setup</option>
            <option value="Python SDK">Python SDK Development</option>
            <option value="Web Development">Full-Stack Web Development</option>
            <option value="Automation">Workflow Automation</option>
          </select>
        </div>
        <Field label="Target Timeline" value={data.timeline} onChange={set('timeline')} placeholder="e.g. Q4 2026, 3 months" />
      </div>
      <Textarea label="Project Description" value={data.description} onChange={set('description')} placeholder="Describe your use case, current tech stack, scale, and specific challenges..." rows={4} />
      <SubmitBtn loading={loading} onClick={() => onSubmit('Tech Consultation', data)} label="Submit Consultation Request" color="#6366F1" />
    </div>
  );
}

function ContactForm({ onSubmit, loading }) {
  const [data, setData] = useState({ name: '', email: '', subject: '', category: 'General', message: '' });
  const set = k => e => setData(d => ({ ...d, [k]: e.target.value }));
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3">
        <Field label="Your Name" value={data.name} onChange={set('name')} placeholder="Name" required />
        <Field label="Email" type="email" value={data.email} onChange={set('email')} placeholder="Email" required />
        <Field label="Subject" value={data.subject} onChange={set('subject')} placeholder="Brief subject line" required />
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-mono text-white/40 uppercase font-bold tracking-wider">Category</label>
          <select value={data.category} onChange={set('category')} className="px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white/80 focus:outline-none focus:border-amber-500/50 transition">
            <option>General</option>
            <option>Press & Media</option>
            <option>Partnership</option>
            <option>Fan Mail</option>
            <option>Business</option>
            <option>Other</option>
          </select>
        </div>
      </div>
      <Textarea label="Message" value={data.message} onChange={set('message')} placeholder="Write your message here..." rows={4} required />
      <SubmitBtn loading={loading} onClick={() => onSubmit('General Contact', data)} label="Send Message" color="#F59E0B" />
    </div>
  );
}

function VacationForm({ onSubmit, loading }) {
  const [data, setData] = useState({ name: '', startDate: '', endDate: '', reason: '', coverage: '' });
  const set = k => e => setData(d => ({ ...d, [k]: e.target.value }));
  return (
    <div className="flex flex-col gap-4">
      <div className="p-3 bg-pink-500/10 border border-pink-500/20 rounded-xl text-xs text-pink-300 font-mono">
        ⚠️ This form is for Staff members only. All requests are reviewed by the Founder.
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Staff Member Name" value={data.name} onChange={set('name')} placeholder="Your name" required />
        <div />
        <Field label="Start Date" type="date" value={data.startDate} onChange={set('startDate')} required />
        <Field label="End Date" type="date" value={data.endDate} onChange={set('endDate')} required />
      </div>
      <Textarea label="Reason for Request" value={data.reason} onChange={set('reason')} placeholder="Brief reason for time off..." rows={2} />
      <Textarea label="Coverage Plan" value={data.coverage} onChange={set('coverage')} placeholder="Who will cover your duties? Any handover notes?" rows={2} />
      <SubmitBtn loading={loading} onClick={() => onSubmit('Time-Off Request', data)} label="Submit Time-Off Request" color="#EC4899" />
    </div>
  );
}

function StaffReportForm({ onSubmit, loading }) {
  const [data, setData] = useState({ name: '', email: '', severity: 'Medium', division: 'System Core', desc: '', steps: '' });
  const set = k => e => setData(d => ({ ...d, [k]: e.target.value }));
  return (
    <div className="flex flex-col gap-4">
      <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-300 font-mono">
        ⚠️ This incident form submits direct telemetry tickets to the technical triage team.
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Staff Member Name" value={data.name} onChange={set('name')} placeholder="Your name" required />
        <Field label="Telemetry Email" type="email" value={data.email} onChange={set('email')} placeholder="staff@company.com" required />
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-mono text-white/40 uppercase font-bold tracking-wider">Severity Level</label>
          <select value={data.severity} onChange={set('severity')} className="px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white/80 focus:outline-none focus:border-red-500/50 transition">
            <option value="Low">Low - Cosmetic/Typos</option>
            <option value="Medium">Medium - Functionality bug</option>
            <option value="Critical">Critical - Performance crash</option>
            <option value="Emergency">Emergency - System downtime</option>
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-mono text-white/40 uppercase font-bold tracking-wider">Impacted Core</label>
          <select value={data.division} onChange={set('division')} className="px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white/80 focus:outline-none focus:border-red-500/50 transition">
            <option value="System Core">System Core Node</option>
            <option value="Aries AI">Aries LLM Pipeline</option>
            <option value="Prime Records">Prime Music Suite</option>
            <option value="DJ Em Events">Event Visual Syncs</option>
            <option value="Game Dev">Unity Horror Concept</option>
          </select>
        </div>
      </div>
      <Textarea label="Incident Telemetry Description" value={data.desc} onChange={set('desc')} placeholder="Describe what occurred, console logs seen, or system behavior..." rows={2} required />
      <Textarea label="Reproduction Telemetry Steps" value={data.steps} onChange={set('steps')} placeholder="1. Go to tab X\n2. Trigger input Y..." rows={2} />
      <SubmitBtn loading={loading} onClick={() => onSubmit('Staff System Report', data)} label="Dispatch Incident Report" color="#EF4444" />
    </div>
  );
}

function AccountMgmtForm({ onSubmit, loading }) {
  const [data, setData] = useState({ name: '', email: '', requestType: 'Request Role Upgrade', authCode: '', reason: '' });
  const set = k => e => setData(d => ({ ...d, [k]: e.target.value }));
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3">
        <Field label="Display Name" value={data.name} onChange={set('name')} placeholder="Your name" required />
        <Field label="Account Email" type="email" value={data.email} onChange={set('email')} placeholder="you@email.com" required />
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-mono text-white/40 uppercase font-bold tracking-wider">Action Requested</label>
          <select value={data.requestType} onChange={set('requestType')} className="px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white/80 focus:outline-none focus:border-emerald-500/50 transition">
            <option value="Request Role Upgrade">Request Role Upgrade</option>
            <option value="Reset Security Credentials">Reset Security Credentials</option>
            <option value="Export My Account Data">Export My Account Data (JSON)</option>
            <option value="Request Account Deletion">Request Account Deletion</option>
          </select>
        </div>
        <Field label="Authorization/Triage Code" value={data.authCode} onChange={set('authCode')} placeholder="Staff validation hash" />
      </div>
      <Textarea label="Justification & Business Case" value={data.reason} onChange={set('reason')} placeholder="State the reason for this account upgrade or modification request..." rows={2} required />
      <SubmitBtn loading={loading} onClick={() => onSubmit('Account Management', data)} label="Submit Account Request" color="#10B981" />
    </div>
  );
}

// ---- Shared field components ----
function Field({ label, type = 'text', value, onChange, placeholder, required }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[10px] font-mono text-white/40 uppercase font-bold tracking-wider">{label}{required && ' *'}</label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white/80 placeholder-white/20 focus:outline-none focus:border-emerald-500/40 transition"
      />
    </div>
  );
}

function Textarea({ label, value, onChange, placeholder, rows = 3, required }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[10px] font-mono text-white/40 uppercase font-bold tracking-wider">{label}{required && ' *'}</label>
      <textarea
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        required={required}
        className="px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white/80 placeholder-white/20 focus:outline-none focus:border-emerald-500/40 transition resize-none"
      />
    </div>
  );
}

function SubmitBtn({ loading, onClick, label, color }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className="w-full py-3.5 rounded-xl font-semibold text-sm transition flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
      style={{ background: color, color: '#050508', boxShadow: `0 0 20px ${color}30` }}
    >
      {loading ? <div className="w-5 h-5 border-2 border-neutral-950 border-t-transparent rounded-full animate-spin" /> : <><Send size={15} />{label}</>}
    </button>
  );
}

// ---- Main Forms Center ----
export default function FormsCenter({ isOpen, onClose }) {
  const { currentUser, submitForm, can } = useAuth();
  const [activeForm, setActiveForm] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);

  const availableForms = FORM_TYPES.filter(f => {
    if (f.id === 'vacation' || f.id === 'staff_report') return can('view_staff_portal');
    return true;
  });

  const handleSubmit = async (formType, data) => {
    if (!data.name || !data.email) { toast.error('Please fill in required fields.'); return; }
    setLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    const id = submitForm({
      type: formType,
      formId: activeForm,
      submittedBy: currentUser?.name || 'Guest',
      submittedByEmail: data.email,
      data,
    });
    setLoading(false);
    setSuccess({ formType, id });
    toast.success(`${formType} submitted successfully!`);
  };

  const handleReset = () => { setSuccess(null); setActiveForm(null); };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 20 }}
            transition={{ type: 'spring', stiffness: 280, damping: 25 }}
            className="w-full max-w-2xl max-h-[90vh] flex flex-col rounded-3xl overflow-hidden"
            style={{ background: 'rgba(8,8,12,0.98)', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(24px)' }}
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/5 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                  <FileText size={18} className="text-emerald-400" />
                </div>
                <div>
                  <h2 className="text-lg font-display font-bold text-white">Forms Center</h2>
                  <p className="text-[10px] font-mono text-white/30">Submit requests to our team</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition">
                <X size={18} />
              </button>
            </div>

            <div className="flex-grow overflow-y-auto p-6">
              {success ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center text-center py-12 gap-5"
                >
                  <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
                    <Check size={32} className="text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-display font-bold text-white mb-2">{success.formType} Received!</h3>
                    <p className="text-sm text-white/50 max-w-sm leading-relaxed">
                      Your submission has been logged and our team has been notified. We'll be in touch soon!
                    </p>
                    <p className="text-[10px] font-mono text-white/25 mt-2">Ticket ID: {success.id?.substring(0, 12).toUpperCase()}</p>
                  </div>
                  <button onClick={handleReset} className="px-6 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white/60 hover:text-white hover:border-white/20 transition">
                    Submit Another Form
                  </button>
                </motion.div>
              ) : !activeForm ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {availableForms.map(form => (
                    <motion.button
                      key={form.id}
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setActiveForm(form.id)}
                      className="flex items-start gap-3 p-4 text-left rounded-2xl border transition group"
                      style={{ borderColor: `${form.color}15`, background: `${form.color}08` }}
                    >
                      <div className="p-2 rounded-xl flex-shrink-0" style={{ background: `${form.color}15`, color: form.color }}>
                        {form.icon}
                      </div>
                      <div className="flex-grow min-w-0">
                        <p className="font-semibold text-sm text-white group-hover:text-white transition mb-1">{form.label}</p>
                        <p className="text-[11px] text-white/40 leading-relaxed">{form.desc}</p>
                      </div>
                      <ChevronRight size={14} className="text-white/20 group-hover:text-white/50 flex-shrink-0 mt-1 transition" />
                    </motion.button>
                  ))}
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex flex-col gap-5"
                >
                  <button
                    onClick={() => setActiveForm(null)}
                    className="flex items-center gap-2 text-sm text-white/40 hover:text-white/80 transition w-fit"
                  >
                    ← Back to Forms
                  </button>
                  <div>
                    <h3 className="text-lg font-display font-bold text-white">
                      {availableForms.find(f => f.id === activeForm)?.label}
                    </h3>
                    <p className="text-xs text-white/30 font-mono mt-0.5">
                      {availableForms.find(f => f.id === activeForm)?.desc}
                    </p>
                  </div>
                  {activeForm === 'booking' && <BookingForm onSubmit={handleSubmit} loading={loading} />}
                  {activeForm === 'collab' && <CollabForm onSubmit={handleSubmit} loading={loading} />}
                  {activeForm === 'tech' && <TechForm onSubmit={handleSubmit} loading={loading} />}
                  {activeForm === 'contact' && <ContactForm onSubmit={handleSubmit} loading={loading} />}
                  {activeForm === 'vacation' && <VacationForm onSubmit={handleSubmit} loading={loading} />}
                  {activeForm === 'staff_report' && <StaffReportForm onSubmit={handleSubmit} loading={loading} />}
                  {activeForm === 'account_mgmt' && <AccountMgmtForm onSubmit={handleSubmit} loading={loading} />}
                </motion.div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
