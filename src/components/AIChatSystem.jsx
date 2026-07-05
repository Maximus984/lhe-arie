import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertCircle,
  Bot,
  ChevronRight,
  Clock,
  Database,
  Radio,
  Send,
  Sparkles,
  User,
  X,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext.jsx';
import LottiePlayer from './LottiePlayer.jsx';

const MAX_AI_IDENTITY = {
  name: 'Max AI',
  poweredBy: 'Powered by Aries AI',
  portrait: '/ai/max-ai-portrait.png',
  introAnimation: '/animations/ai-logo-foriday.json',
  loadingAnimation: '/animations/ai-loading-model.json',
  cloudAnimation: '/animations/glowing-fish-loader.json',
};

const AI_KNOWLEDGE = [
  {
    triggers: ['hello', 'hi', 'hey', 'greetings'],
    response: "Signal locked. I'm Max AI, powered by Aries AI. I help visitors navigate Maxx Forge Studio, route requests, and translate impossible ideas into build plans.",
  },
  {
    triggers: ['who are you', 'max ai', 'aries ai', 'ai'],
    response: 'Max AI is the Maxx Forge Studio assistant layer, powered by Aries AI. I act as a site guide, idea mediator, booking router, and technical concierge for the imaginary company.',
  },
  {
    triggers: ['imaginary', 'company', 'mission', 'about', 'imagination'],
    response: "Maxx Forge Studio is not just a digital workshop; it is a foundry for the impossible. Imagination is the ultimate source code. If you can imagine it, we're the ones building it.",
  },
  {
    triggers: ['founder', 'maximus', 'maxx'],
    response: 'Maximus leads Maxx Forge Studio as founder and creative director, connecting Aries AI, Prime Records, DJ Em visuals, game development, and unreal digital experiences into one studio system.',
  },
  {
    triggers: ['form', 'submit', 'booking', 'contact', 'staff', 'founder', 'mediator'],
    response: 'I can help you choose the right form and escalate unknown questions. Submitted forms are saved into the local studio database and visible to Founder and Staff portals on this device.',
  },
  {
    triggers: ['cloud', 'storage', 'save', 'database', 'cache', 'local'],
    response: 'This build uses a local device storage node: submissions, tickets, sessions, and calendar data are cached in browser localStorage. For cross-device staff access, the next upgrade is Firebase or a server database.',
  },
  {
    triggers: ['music', 'records', 'prime', 'track', 'song'],
    response: 'Prime Records is the sound wing: original tracks, remasters, collaborations, and sonic identity systems for the Maxx Forge universe.',
  },
  {
    triggers: ['dj', 'event', 'lighting', 'dmx', 'show', 'visual'],
    response: 'DJ Em handles live energy: stage lighting, TouchDesigner visuals, DMX automation, event rigs, and performance systems.',
  },
  {
    triggers: ['game', 'unity', 'horror', 'interactive'],
    response: 'The game division builds interactive unreal spaces: horror prototypes, cybernetic puzzle systems, environment design, and playable imagination engines.',
  },
  {
    triggers: ['price', 'cost', 'rate', 'quote'],
    response: 'Pricing depends on scope. Use the Forms Center for bookings, tech consultation, collaboration, or general contact so staff can review the exact request.',
  },
];

function getFallbackResponse(input) {
  const lower = input.toLowerCase();
  for (const entry of AI_KNOWLEDGE) {
    if (entry.triggers.some(trigger => lower.includes(trigger))) {
      return { found: true, response: entry.response };
    }
  }
  return {
    found: false,
    response: "I don't have a clean local answer for that yet. I can route this to staff, or you can ask about Maxx Forge Studio, Aries AI, forms, bookings, cloud storage, music, events, or game development.",
  };
}

function MarkdownLite({ text }) {
  const parts = String(text).split(/(\*\*[^*]+\*\*)/g);
  return (
    <>
      {parts.map((part, index) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={index}>{part.slice(2, -2)}</strong>;
        }
        return <React.Fragment key={index}>{part}</React.Fragment>;
      })}
    </>
  );
}

async function askMaxAi(message, history) {
  const response = await fetch('/api/max-ai', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, history }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.error || 'Max AI cloud brain unavailable.');
    error.status = response.status;
    throw error;
  }
  return data.text;
}

export default function AIChatSystem() {
  const { currentUser, createChatTicket, onlineStaff } = useAuth();
  const [open, setOpen] = useState(false);
  const [booted, setBooted] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      from: 'ai',
      text: "Welcome to the forge. I'm **Max AI**, powered by Aries AI. I can guide you through the imaginary company, forms, bookings, local cloud storage, and staff routing.",
      timestamp: new Date().toISOString(),
      source: 'local',
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [brainMode, setBrainMode] = useState('standby');
  const [escalated, setEscalated] = useState(false);
  const [escalationSent, setEscalationSent] = useState(false);
  const [unknownCount, setUnknownCount] = useState(0);
  const bottomRef = useRef(null);

  const staffLabel = useMemo(() => {
    if (!onlineStaff.length) return 'local mediator standby';
    return `${onlineStaff.length} staff signal${onlineStaff.length > 1 ? 's' : ''} online`;
  }, [onlineStaff.length]);

  useEffect(() => {
    if (bottomRef.current) bottomRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping, escalated]);

  useEffect(() => {
    if (!open) return undefined;
    const timeout = window.setTimeout(() => setBooted(true), 850);
    return () => window.clearTimeout(timeout);
  }, [open]);

  const addMessage = (message) => {
    setMessages(prev => [
      ...prev,
      {
        id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
        timestamp: new Date().toISOString(),
        ...message,
      },
    ]);
  };

  const handleSend = async (event) => {
    event.preventDefault();
    if (!input.trim() || isTyping) return;

    const userText = input.trim();
    const history = messages.slice(-8);
    setInput('');
    addMessage({ from: 'user', text: userText });
    setIsTyping(true);
    setBrainMode('thinking');

    try {
      const text = await askMaxAi(userText, history);
      addMessage({ from: 'ai', text, source: 'cloud' });
      setUnknownCount(0);
      setBrainMode('cloud');
    } catch (error) {
      const fallback = getFallbackResponse(userText);
      addMessage({
        from: 'ai',
        text: fallback.response,
        source: error.status === 501 ? 'local' : 'fallback',
      });
      setBrainMode(error.status === 501 ? 'standby' : 'fallback');

      if (!fallback.found) {
        const nextUnknownCount = unknownCount + 1;
        setUnknownCount(nextUnknownCount);
        if (nextUnknownCount >= 2) setEscalated(true);
      } else {
        setUnknownCount(0);
      }
    } finally {
      setIsTyping(false);
    }
  };

  const handleEscalate = () => {
    const ticketData = {
      userId: currentUser?.id || 'guest',
      userName: currentUser?.name || 'Guest',
      subject: 'Max AI Escalation - Staff Assistance Required',
      messages: messages.map(message => ({
        from: message.from,
        text: message.text,
        timestamp: message.timestamp,
      })),
      priority: 'normal',
    };
    createChatTicket(ticketData);
    setEscalationSent(true);
    setEscalated(false);
    addMessage({
      from: 'ai',
      text: 'Escalation packet saved. Founder and Staff portals can review this conversation in the local ticket queue.',
      source: 'local',
    });
    toast.success('Max AI routed this to staff.');
  };

  const statusText = {
    standby: 'local brain standby',
    thinking: 'thinking through Aries AI',
    cloud: 'OpenRouter signal linked',
    fallback: 'fallback intelligence active',
  }[brainMode];

  return (
    <>
      <div className="fixed bottom-24 right-6 z-50 flex flex-col items-end gap-2">
        <AnimatePresence>
          {!open && (
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 10 }}
              className="max-w-[260px] rounded-2xl border border-cyan-400/20 bg-black/80 px-3 py-2 text-right font-mono text-[10px] text-cyan-100/70 shadow-[0_0_28px_rgba(0,229,255,0.18)] backdrop-blur-xl"
            >
              Max AI is on standby
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          whileHover={{ scale: 1.05, rotate: -1 }}
          whileTap={{ scale: 0.96 }}
          onClick={() => {
            setOpen(true);
            setBooted(false);
          }}
          className="relative h-16 w-16 overflow-hidden rounded-2xl border border-fuchsia-300/40 bg-black shadow-[0_0_34px_rgba(236,72,153,0.35)]"
          aria-label="Open Max AI"
        >
          <img
            src={MAX_AI_IDENTITY.portrait}
            alt=""
            className="h-full w-full object-contain p-1.5"
          />
          <span className="absolute inset-0 bg-cyan-400/0 transition hover:bg-cyan-400/10" />
          <span className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full bg-cyan-300 shadow-[0_0_12px_#00e5ff]" />
        </motion.button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="fixed bottom-24 right-6 z-50 flex max-h-[min(620px,calc(100vh-7rem))] w-[min(390px,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-cyan-300/20 bg-[#030307]/95 shadow-[0_24px_90px_rgba(0,0,0,0.75),0_0_60px_rgba(0,229,255,0.16)] backdrop-blur-2xl"
          >
            <div className="relative border-b border-cyan-300/10 p-4">
              <div className="absolute inset-0 bg-[linear-gradient(110deg,rgba(0,229,255,0.14),transparent_42%,rgba(236,72,153,0.13))]" />
              <div className="relative flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-2xl border border-fuchsia-300/30 bg-black">
                    <img src={MAX_AI_IDENTITY.portrait} alt="" className="h-full w-full object-contain p-1" />
                    <span className="absolute bottom-1 right-1 h-2.5 w-2.5 rounded-full bg-cyan-300 shadow-[0_0_10px_#00e5ff]" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="truncate font-mono text-sm font-black uppercase tracking-[0.18em] text-white">
                        {MAX_AI_IDENTITY.name}
                      </p>
                      <Sparkles size={13} className="shrink-0 text-fuchsia-300" />
                    </div>
                    <p className="mt-1 truncate font-mono text-[10px] uppercase tracking-[0.14em] text-cyan-200/70">
                      {MAX_AI_IDENTITY.poweredBy}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="rounded-xl border border-white/10 bg-white/5 p-2 text-white/45 transition hover:border-fuchsia-300/40 hover:text-white"
                  aria-label="Close Max AI"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {!booted ? (
              <div className="flex min-h-[430px] flex-col items-center justify-center gap-5 p-8 text-center">
                <LottiePlayer
                  src={MAX_AI_IDENTITY.introAnimation}
                  className="h-32 w-32"
                  loop
                  ariaLabel="Max AI standby animation"
                />
                <div>
                  <p className="font-mono text-xs uppercase tracking-[0.24em] text-cyan-200">Booting Max AI</p>
                  <p className="mt-2 text-xs leading-relaxed text-white/45">
                    Syncing Aries AI identity, local database memory, and staff mediator routes.
                  </p>
                </div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-3 gap-px border-b border-cyan-300/10 bg-cyan-300/10 text-[9px] font-mono uppercase tracking-[0.12em]">
                  <div className="bg-[#05050b] px-3 py-2 text-cyan-200/70">
                    <Radio size={10} className="mr-1 inline" />
                    {statusText}
                  </div>
                  <div className="bg-[#05050b] px-3 py-2 text-fuchsia-200/70">
                    <Database size={10} className="mr-1 inline" />
                    local cache
                  </div>
                  <div className="bg-[#05050b] px-3 py-2 text-violet-200/70">
                    <Bot size={10} className="mr-1 inline" />
                    mediator
                  </div>
                </div>

                <div className="flex-grow overflow-y-auto p-4">
                  <div className="mb-4 rounded-2xl border border-cyan-300/10 bg-cyan-300/[0.04] p-3">
                    <div className="flex items-center gap-3">
                      <LottiePlayer
                        src={MAX_AI_IDENTITY.cloudAnimation}
                        className="h-10 w-10 shrink-0"
                        ariaLabel="Local cloud storage animation"
                      />
                      <p className="text-[10px] leading-relaxed text-cyan-50/55">
                        Device cloud active: conversations can escalate to staff tickets, and form data is saved in the local studio database.
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3">
                    {messages.map(message => (
                      <div
                        key={message.id}
                        className={`flex gap-2.5 ${message.from === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                      >
                        <div className={`flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-xl border ${
                          message.from === 'ai'
                            ? 'border-cyan-300/25 bg-black'
                            : 'border-violet-300/25 bg-violet-500/10 text-violet-200'
                        }`}
                        >
                          {message.from === 'ai' ? (
                            <img src={MAX_AI_IDENTITY.portrait} alt="" className="h-full w-full object-contain p-1" />
                          ) : (
                            currentUser?.avatar || <User size={13} />
                          )}
                        </div>
                        <div className={`flex max-w-[78%] flex-col gap-1 ${message.from === 'user' ? 'items-end' : 'items-start'}`}>
                          <div
                            className={`rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed ${
                              message.from === 'ai'
                                ? 'rounded-tl-sm border border-cyan-300/10 bg-white/[0.055] text-white/82'
                                : 'rounded-tr-sm border border-violet-300/20 bg-violet-600/75 text-white'
                            }`}
                          >
                            <MarkdownLite text={message.text} />
                          </div>
                          <span className="px-1 font-mono text-[8px] uppercase tracking-wider text-white/20">
                            {message.source || 'user'} / {new Date(message.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    ))}

                    {isTyping && (
                      <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 overflow-hidden rounded-xl border border-cyan-300/25 bg-black">
                          <img src={MAX_AI_IDENTITY.portrait} alt="" className="h-full w-full object-contain p-1" />
                        </div>
                        <div className="flex items-center gap-2 rounded-2xl rounded-tl-sm border border-cyan-300/10 bg-white/[0.055] px-3 py-2">
                          <LottiePlayer
                            src={MAX_AI_IDENTITY.loadingAnimation}
                            className="h-8 w-8"
                            ariaLabel="Max AI loading animation"
                          />
                          <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-cyan-100/60">
                            thinking
                          </span>
                        </div>
                      </div>
                    )}

                    {escalated && !escalationSent && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="rounded-2xl border border-fuchsia-300/20 bg-fuchsia-500/10 p-3"
                      >
                        <div className="mb-2 flex items-center gap-2 font-mono text-xs font-semibold uppercase tracking-wider text-fuchsia-200">
                          <AlertCircle size={14} />
                          Route to staff?
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={handleEscalate}
                            className="flex flex-grow items-center justify-center gap-1.5 rounded-xl bg-fuchsia-500 px-3 py-2 text-xs font-bold text-black transition hover:bg-fuchsia-300"
                          >
                            <ChevronRight size={12} />
                            Send packet
                          </button>
                          <button
                            onClick={() => {
                              setEscalated(false);
                              setUnknownCount(0);
                            }}
                            className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/55 transition hover:text-white"
                          >
                            Cancel
                          </button>
                        </div>
                        <div className="mt-2 flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-wider text-white/35">
                          <Clock size={9} />
                          {staffLabel}
                        </div>
                      </motion.div>
                    )}

                    <div ref={bottomRef} />
                  </div>
                </div>

                <div className="border-t border-cyan-300/10 p-3">
                  <form onSubmit={handleSend} className="flex gap-2">
                    <input
                      type="text"
                      value={input}
                      onChange={event => setInput(event.target.value)}
                      placeholder="Transmit to Max AI..."
                      className="min-w-0 flex-grow rounded-xl border border-cyan-300/10 bg-white/[0.055] px-3.5 py-2.5 font-mono text-xs text-white outline-none transition placeholder:text-white/25 focus:border-cyan-300/45"
                      disabled={isTyping}
                    />
                    <button
                      type="submit"
                      disabled={!input.trim() || isTyping}
                      className="flex items-center justify-center rounded-xl bg-cyan-300 px-3 text-black transition hover:bg-fuchsia-300 disabled:cursor-not-allowed disabled:opacity-40"
                      aria-label="Send message"
                    >
                      <Send size={15} />
                    </button>
                  </form>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
