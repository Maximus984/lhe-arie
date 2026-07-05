import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Bot, User, ChevronRight, Clock, AlertCircle, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import toast from 'react-hot-toast';

// ---- Built-in AI knowledge base ----
const AI_KNOWLEDGE = [
  { triggers: ['hello', 'hi', 'hey', 'greetings'], response: "Hello! I'm **ARIA** — Aries Reactive Intelligence Assistant. I'm here to help you navigate the Maxx Forge Studio ecosystem. What can I forge for you today?" },
  { triggers: ['who', 'founder', 'maximus', 'maxx'], response: "**Maxx** is the founder and creative director of Maxx Forge Studio™. He built the entire ecosystem from the ground up — Prime Records, DJ Em Live Events, Aries AI, and the Game Dev division. 🔥" },
  { triggers: ['aries', 'ai', 'artificial'], response: "**Aries AI** is our flagship local LLM system built on Ollama architecture. It runs completely locally with zero cloud dependency. The full v4.0 rollout is scheduled for **September 2026**. Features include custom code generation, DMX lighting automation, and creative pipeline acceleration." },
  { triggers: ['music', 'records', 'prime', 'album', 'track', 'song'], response: "**Maxx Forge Prime Records** is our music division. We produce high-energy remasters, original tracks, and exclusive collaborations. Our catalog includes tracks like Adrenaline Rush, Dark Queen, Electric Whisper, and more. Available on Spotify, Apple Music, BandLab, and SoundCloud." },
  { triggers: ['dj', 'event', 'booking', 'show', 'concert', 'lighting', 'dmx'], response: "**DJ Em** leads our live events and visuals division. We offer professional stage lighting design using TouchDesigner, DMX automation systems, and live visual reels. For bookings, head to the DJ Em section and use the Stage Booking Inquiry form!" },
  { triggers: ['game', 'unity', 'horror', 'echoes', 'forge'], response: "Our game **Echoes of the Forge** is a Unity-built atmospheric survival horror experience. Set in decaying bio-concrete Japanese-style environments with cybernetic elements. Navigate procedural puzzle grids, avoid AI-driven stalkers, and survive. Demo available now in the Game Dev section!" },
  { triggers: ['login', 'account', 'register', 'sign', 'member'], response: "You can create a **Forge Account** from the Login page. Members get access to saved tracks, personalized dashboard, form submissions, and exclusive community features. Staff and Founder accounts are managed internally." },
  { triggers: ['calendar', 'schedule', 'event', 'date'], response: "The **Event Calendar** is accessible from the Staff section and Dashboard. You can view upcoming studio events, live shows, and milestone dates. Founders and Staff can add events directly to the system calendar." },
  { triggers: ['zeppelin', 'collab', 'collaboration'], response: "**Zeppelin** is a key creative collaborator and our Tech Lead at Maxx Forge. He architects the Aries AI pipeline and contributes to the software development division. Collab inquiries can be submitted through our Forms Center." },
  { triggers: ['contact', 'reach', 'email', 'help', 'support'], response: "For inquiries, head to our **Forms Center** in the Dashboard. We have dedicated forms for event booking, music collaboration, tech consultation, and general contact. Our team typically responds within 24–48 hours!" },
  { triggers: ['social', 'instagram', 'twitter', 'discord', 'youtube'], response: "Connect with us on our social platforms! You can also link your Discord account through the **Forge Account** profile panel for exclusive community access and real-time updates from the studio." },
  { triggers: ['price', 'cost', 'rate', 'fee', 'charge'], response: "Pricing varies by project scope and requirements. For specific quotes, please fill out the relevant form in our **Forms Center** (booking, consultation, or collaboration) and our team will get back to you with a detailed proposal." },
];

function getAIResponse(input) {
  const lower = input.toLowerCase();
  for (const entry of AI_KNOWLEDGE) {
    if (entry.triggers.some(t => lower.includes(t))) {
      return { found: true, response: entry.response };
    }
  }
  return { found: false, response: null };
}

function parseMarkdown(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>');
}

export default function AIChatSystem() {
  const { currentUser, createChatTicket, onlineStaff } = useAuth();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      from: 'ai',
      text: "Hello! I'm **ARIA** — your Aries Reactive Intelligence Assistant. Ask me anything about Maxx Forge Studio™ or our services. How can I help you today?",
      timestamp: new Date().toISOString(),
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [escalated, setEscalated] = useState(false);
  const [escalationSent, setEscalationSent] = useState(false);
  const [unknownCount, setUnknownCount] = useState(0);
  const [unread, setUnread] = useState(0);
  const bottomRef = useRef();

  useEffect(() => {
    if (bottomRef.current) bottomRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const addMessage = (msg) => {
    setMessages(prev => [...prev, { id: Date.now(), timestamp: new Date().toISOString(), ...msg }]);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userText = input.trim();
    setInput('');
    addMessage({ from: 'user', text: userText });
    setIsTyping(true);

    await new Promise(r => setTimeout(r, 800 + Math.random() * 600));

    const { found, response } = getAIResponse(userText);
    setIsTyping(false);

    if (found) {
      addMessage({ from: 'ai', text: response });
      setUnknownCount(0);
    } else {
      const newCount = unknownCount + 1;
      setUnknownCount(newCount);

      if (newCount >= 2) {
        addMessage({ from: 'ai', text: "I'm having trouble finding the right answer for you. Would you like me to **route you to a staff member** who can help directly?" });
        setEscalated(true);
      } else {
        addMessage({ from: 'ai', text: "I don't have specific information on that yet. Could you rephrase or ask about our music, events, AI tech, or game dev? Or try keywords like 'booking', 'Aries AI', or 'contact'." });
      }
    }
  };

  const handleEscalate = () => {
    const ticketData = {
      userId: currentUser?.id || 'guest',
      userName: currentUser?.name || 'Guest',
      subject: 'AI Escalation — Staff Assistance Required',
      messages: messages.map(m => ({ from: m.from, text: m.text, timestamp: m.timestamp })),
      priority: 'normal',
    };
    createChatTicket(ticketData);
    setEscalationSent(true);
    setEscalated(false);
    addMessage({
      from: 'ai',
      text: "✅ Your request has been routed to our staff team. **A staff member will be in touch with you within 10–15 minutes.** In the meantime, feel free to continue browsing the site!"
    });
    toast.success('Staff member notified! Response within 10–15 min.');
  };

  const handleOpen = () => {
    setOpen(true);
    setUnread(0);
  };

  return (
    <>
      {/* Chat toggle button */}
      <div className="fixed bottom-24 right-6 z-50 flex flex-col items-end gap-2">
        <AnimatePresence>
          {!open && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 10 }}
              className="bg-neutral-900/90 border border-white/10 rounded-2xl px-3 py-2 text-[10px] font-mono text-white/50 backdrop-blur-xl shadow-lg whitespace-nowrap"
            >
              Ask ARIA anything ✨
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleOpen}
          className="relative w-14 h-14 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-[0_8px_24px_rgba(16,185,129,0.4)] hover:shadow-[0_8px_32px_rgba(16,185,129,0.6)] transition-shadow"
        >
          <Bot size={24} className="text-neutral-950 font-bold" />
          {unread > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center shadow-lg">
              {unread}
            </span>
          )}
        </motion.button>
      </div>

      {/* Chat Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="fixed bottom-24 right-6 z-50 w-[360px] max-h-[560px] flex flex-col rounded-3xl overflow-hidden shadow-2xl"
            style={{
              background: 'rgba(8,8,12,0.97)',
              border: '1px solid rgba(255,255,255,0.08)',
              backdropFilter: 'blur(24px)',
              boxShadow: '0 24px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(16,185,129,0.1)',
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/5 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="relative w-9 h-9 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-xl flex items-center justify-center">
                  <Bot size={18} className="text-neutral-950" />
                  <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#08080c] shadow-[0_0_6px_#10B981]" />
                </div>
                <div>
                  <p className="text-sm font-display font-bold text-white">ARIA</p>
                  <p className="text-[10px] font-mono text-emerald-400">Aries AI Assistant • Online</p>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition"
              >
                <X size={16} />
              </button>
            </div>

            {/* Messages area */}
            <div className="flex-grow overflow-y-auto p-4 flex flex-col gap-3">
              {messages.map(msg => (
                <div key={msg.id} className={`flex gap-2.5 ${msg.from === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className={`w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 text-[10px] font-bold ${
                    msg.from === 'ai'
                      ? 'bg-gradient-to-br from-emerald-500 to-cyan-500 text-neutral-950'
                      : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                  }`}>
                    {msg.from === 'ai' ? <Bot size={12} /> : (currentUser?.avatar?.charAt(0) || 'G')}
                  </div>
                  <div className={`max-w-[75%] ${msg.from === 'user' ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                    <div
                      className={`px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed ${
                        msg.from === 'ai'
                          ? 'bg-white/5 border border-white/5 text-white/80 rounded-tl-sm'
                          : 'bg-indigo-600 text-white rounded-tr-sm'
                      }`}
                      dangerouslySetInnerHTML={{ __html: parseMarkdown(msg.text) }}
                    />
                    <span className="text-[8px] font-mono text-white/20 px-1">
                      {new Date(msg.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))}

              {/* Typing indicator */}
              {isTyping && (
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center">
                    <Bot size={12} className="text-neutral-950" />
                  </div>
                  <div className="flex items-center gap-1 bg-white/5 border border-white/5 rounded-2xl rounded-tl-sm px-3.5 py-2.5">
                    {[0, 1, 2].map(i => (
                      <motion.div
                        key={i}
                        className="w-1.5 h-1.5 rounded-full bg-emerald-400"
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.2 }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Escalation option */}
              {escalated && !escalationSent && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col gap-2 p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl"
                >
                  <div className="flex items-center gap-2 text-indigo-300 text-xs font-semibold">
                    <AlertCircle size={14} />
                    <span>Connect to a staff member?</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleEscalate}
                      className="flex-grow py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl transition flex items-center justify-center gap-1.5"
                    >
                      <ChevronRight size={12} />
                      Route to Staff
                    </button>
                    <button
                      onClick={() => { setEscalated(false); setUnknownCount(0); }}
                      className="px-3 py-2 bg-white/5 hover:bg-white/10 text-white/50 text-xs rounded-xl transition"
                    >
                      Cancel
                    </button>
                  </div>
                  <div className="flex items-center gap-1.5 text-[9px] font-mono text-white/30">
                    <Clock size={9} />
                    <span>Staff response: 10–15 minutes</span>
                  </div>
                </motion.div>
              )}

              <div ref={bottomRef} />
            </div>

            {/* Online staff indicator */}
            {onlineStaff.length > 0 && (
              <div className="px-4 py-2 border-t border-white/5 flex items-center gap-2 flex-shrink-0">
                <div className="flex -space-x-1">
                  {onlineStaff.slice(0, 3).map(s => (
                    <div
                      key={s.id}
                      className="w-5 h-5 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-[7px] font-bold text-indigo-300"
                      title={s.name}
                    >
                      {s.avatar}
                    </div>
                  ))}
                </div>
                <span className="text-[9px] font-mono text-white/30">
                  {onlineStaff.length} staff member{onlineStaff.length > 1 ? 's' : ''} online
                </span>
              </div>
            )}

            {/* Input area */}
            <form onSubmit={handleSend} className="p-3 border-t border-white/5 flex gap-2 flex-shrink-0">
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Ask ARIA anything..."
                className="flex-grow bg-white/5 border border-white/5 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-white/20 focus:outline-none focus:border-emerald-500/40 transition"
                disabled={isTyping}
              />
              <button
                type="submit"
                disabled={!input.trim() || isTyping}
                className="p-2.5 bg-emerald-500 text-neutral-950 rounded-xl hover:bg-emerald-400 transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center"
              >
                <Send size={14} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
