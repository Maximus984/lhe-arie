import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AppWindow,
  Download,
  Expand,
  Grid2X2,
  Mic,
  MicOff,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  Search,
  Send,
  Settings,
  Trash2,
  User,
  Volume2,
  X,
} from 'lucide-react';
import LottiePlayer from '../components/LottiePlayer.jsx';

const STORAGE_KEY = 'mfs_max_ai_demo_messages';
const NOTICE_KEY = 'mfs_max_ai_beta_notice_dismissed';

const INITIAL_MESSAGE = {
  id: 'welcome',
  from: 'ai',
  text: "Hi there. I'm Max AI, powered by Aries AI. Ask me to plan an impossible idea, explain Maxx Forge Studio, draft a launch, or enter Live Mode.",
  timestamp: new Date().toISOString(),
};

const quickPrompts = [
  'Build me a launch plan for an imaginary company.',
  'Explain Maxx Forge Studio in one punchy paragraph.',
  'Create a youth startup tour checklist.',
  'What can Aries AI do for forms and staff routing?',
];

function MarkdownLite({ text }) {
  return String(text).split(/(\*\*[^*]+\*\*)/g).map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }
    return <React.Fragment key={index}>{part}</React.Fragment>;
  });
}

function fallbackMaxAi(input) {
  const lower = input.toLowerCase();
  if (lower.includes('live') || lower.includes('voice')) {
    return 'Live Mode uses your browser microphone for speech-to-text and your device voices for spoken replies. Official voice models are coming soon while this beta collects feedback.';
  }
  if (lower.includes('startup') || lower.includes('tour')) {
    return 'Startup tour: 1. Define the impossible idea. 2. Choose a division. 3. Draft a form or project brief. 4. Save it to the local cloud. 5. Route it to staff or founder review.';
  }
  if (lower.includes('form') || lower.includes('staff') || lower.includes('founder')) {
    return 'Forms and AI escalations save into the local Maxx Forge Studio database. Founder and Staff portals can review the queue on this device.';
  }
  if (lower.includes('maxx') || lower.includes('forge') || lower.includes('imaginary')) {
    return 'Maxx Forge Studio is a foundry for the impossible. Imagination is the source code, and Max AI turns strange ideas into technical launch paths.';
  }
  return "Signal received. I can help with concepts, launch plans, forms, AI workflows, live-mode ideas, and Maxx Forge Studio's imaginary-company universe.";
}

async function askMaxAi(message, history) {
  const response = await fetch('/api/max-ai', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, history }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || 'Max AI cloud brain unavailable.');
  return data.text || 'Max AI returned an empty signal.';
}

export default function MaxAiDemo() {
  const [messages, setMessages] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null') || [INITIAL_MESSAGE];
    } catch {
      return [INITIAL_MESSAGE];
    }
  });
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [liveMode, setLiveMode] = useState(false);
  const [listening, setListening] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState('');
  const [installPrompt, setInstallPrompt] = useState(null);
  const [noticeVisible, setNoticeVisible] = useState(() => localStorage.getItem(NOTICE_KEY) !== 'true');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const recognitionRef = useRef(null);
  const bottomRef = useRef(null);

  const lastChats = useMemo(() => {
    const userMessages = messages.filter(message => message.from === 'user');
    return userMessages.slice(-4).reverse();
  }, [messages]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-60)));
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const handleBeforeInstallPrompt = (event) => {
      event.preventDefault();
      setInstallPrompt(event);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis?.getVoices?.() || [];
      setVoices(availableVoices);
      if (!selectedVoice && availableVoices.length) {
        const preferred = availableVoices.find(voice => /google|assistant|samantha|aria|natural/i.test(voice.name)) || availableVoices[0];
        setSelectedVoice(preferred.name);
      }
    };
    loadVoices();
    window.speechSynthesis?.addEventListener?.('voiceschanged', loadVoices);
    return () => window.speechSynthesis?.removeEventListener?.('voiceschanged', loadVoices);
  }, [selectedVoice]);

  const speak = (text) => {
    if (!voiceEnabled || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(String(text).replace(/\*\*/g, ''));
    utterance.rate = 0.96;
    utterance.pitch = 1;
    const voice = voices.find(item => item.name === selectedVoice);
    if (voice) utterance.voice = voice;
    window.speechSynthesis.speak(utterance);
  };

  const sendMessage = async (rawText = input) => {
    const text = rawText.trim();
    if (!text || loading) return;

    const userMessage = {
      id: `${Date.now()}-user`,
      from: 'user',
      text,
      timestamp: new Date().toISOString(),
    };
    const history = messages.slice(-8);
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const answer = await askMaxAi(text, history);
      setMessages(prev => [...prev, {
        id: `${Date.now()}-ai`,
        from: 'ai',
        text: answer,
        timestamp: new Date().toISOString(),
      }]);
      if (liveMode) speak(answer);
    } catch {
      const answer = fallbackMaxAi(text);
      setMessages(prev => [...prev, {
        id: `${Date.now()}-fallback`,
        from: 'ai',
        text: answer,
        timestamp: new Date().toISOString(),
      }]);
      if (liveMode) speak(answer);
    } finally {
      setLoading(false);
    }
  };

  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setMessages(prev => [...prev, {
        id: `${Date.now()}-voice-error`,
        from: 'ai',
        text: 'Voice capture is not supported in this browser yet. Try Chrome or Edge, or type your message below.',
        timestamp: new Date().toISOString(),
      }]);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.continuous = false;
    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);
    recognition.onerror = () => setListening(false);
    recognition.onresult = (event) => {
      const transcript = event.results?.[0]?.[0]?.transcript || '';
      if (transcript) sendMessage(transcript);
    };
    recognitionRef.current = recognition;
    recognition.start();
  };

  const stopListening = () => {
    recognitionRef.current?.stop?.();
    setListening(false);
  };

  const clearChat = () => {
    window.speechSynthesis?.cancel?.();
    setMessages([INITIAL_MESSAGE]);
  };

  const installApp = async () => {
    if (installPrompt) {
      installPrompt.prompt();
      await installPrompt.userChoice.catch(() => null);
      setInstallPrompt(null);
      return;
    }

    const shortcut = `[InternetShortcut]\nURL=${window.location.origin}/max-ai\nIconFile=${window.location.origin}/icons/app-icon-512.png\nIconIndex=0\n`;
    const blob = new Blob([shortcut], { type: 'application/internet-shortcut' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'Max AI Desktop.url';
    link.click();
    URL.revokeObjectURL(url);
  };

  const dismissNotice = () => {
    localStorage.setItem(NOTICE_KEY, 'true');
    setNoticeVisible(false);
  };

  return (
    <div className="min-h-screen overflow-hidden bg-black px-4 py-5 text-white md:px-10 md:py-9">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_50%_100%,rgba(29,45,180,0.52),transparent_34%),radial-gradient(circle_at_75%_78%,rgba(0,229,255,0.12),transparent_28%),linear-gradient(180deg,#000_0%,#000_45%,#050822_100%)]" />
      <div className="pointer-events-none fixed inset-0 opacity-[0.08] [background-image:linear-gradient(rgba(255,255,255,.12)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.12)_1px,transparent_1px)] [background-size:44px_44px]" />

      <main className="relative mx-auto flex h-[calc(100vh-2.5rem)] max-w-[1720px] overflow-hidden rounded-[28px] border border-white/16 bg-black/86 shadow-[0_0_0_1px_rgba(88,118,255,.18),0_30px_100px_rgba(0,0,0,.75)] backdrop-blur-2xl md:h-[calc(100vh-4.5rem)]">
        <AnimatePresence initial={false}>
          {sidebarOpen && (
            <motion.aside
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 278, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="hidden shrink-0 overflow-hidden border-r border-white/10 bg-white/[0.045] backdrop-blur-2xl md:block"
            >
              <div className="flex h-full w-[278px] flex-col p-5">
                <div className="mb-6 flex items-center justify-between">
                  <div className="flex gap-2">
                    <span className="h-4 w-4 rounded-full bg-[#ff5f57]" />
                    <span className="h-4 w-4 rounded-full bg-[#ffbd2e]" />
                    <span className="h-4 w-4 rounded-full bg-[#28c840]" />
                  </div>
                  <button onClick={() => setSidebarOpen(false)} className="rounded-lg p-1.5 text-white/60 hover:bg-white/10 hover:text-white" aria-label="Collapse sidebar">
                    <PanelLeftClose size={18} />
                  </button>
                </div>

                <div className="mb-3 flex items-center gap-2 rounded-2xl bg-white/8 px-3 py-2.5 text-sm text-white/48">
                  <Search size={17} />
                  <span>Search</span>
                </div>

                <button onClick={clearChat} className="mb-3 flex items-center gap-3 rounded-xl bg-white/12 px-3 py-3 text-sm font-bold text-white/85 transition hover:bg-white/18">
                  <Plus size={18} />
                  New chat
                </button>
                <button className="mb-8 flex items-center gap-3 px-3 py-2 text-sm font-bold text-white/75 transition hover:text-white">
                  <Grid2X2 size={17} />
                  Library
                </button>

                <p className="mb-3 px-3 text-sm font-bold text-white/38">Notebooks</p>
                <button className="mb-8 flex items-center gap-3 px-3 py-2 text-sm font-bold text-white/82">
                  <Plus size={17} />
                  New notebook
                </button>

                <p className="mb-3 px-3 text-sm font-bold text-white/38">Chats</p>
                <div className="flex flex-col gap-1">
                  {lastChats.length ? lastChats.map(message => (
                    <button key={message.id} className="truncate rounded-xl px-3 py-2 text-left text-sm font-semibold text-white/76 transition hover:bg-white/8">
                      {message.text}
                    </button>
                  )) : (
                    <>
                      <button className="truncate rounded-xl px-3 py-2 text-left text-sm font-semibold text-white/76">Choosing AI Model for Webs...</button>
                      <button className="truncate rounded-xl px-3 py-2 text-left text-sm font-semibold text-white/76">Maxx Forge Studio Ecosyste...</button>
                    </>
                  )}
                </div>

                <div className="mt-auto flex items-center gap-3 rounded-2xl border border-white/10 bg-black/25 p-3">
                  <img src="/ai/max-ai-portrait.png" alt="" className="h-7 w-7 object-contain" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold">Max AI Hub</p>
                    <p className="truncate text-[10px] text-white/36">Powered by Aries AI</p>
                  </div>
                </div>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        <section className="relative flex min-w-0 flex-1 flex-col">
          <div className="flex items-center justify-between px-5 py-4 md:px-7">
            <div className="flex items-center gap-2">
              {!sidebarOpen && (
                <button onClick={() => setSidebarOpen(true)} className="rounded-xl bg-white/8 p-2 text-white/65 hover:bg-white/12 hover:text-white" aria-label="Open sidebar">
                  <PanelLeftOpen size={18} />
                </button>
              )}
              <div className="rounded-full border border-white/10 bg-white/7 px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.16em] text-white/50">
                beta desktop demo
              </div>
            </div>

            <div className="flex items-center gap-2 rounded-full bg-white/8 p-1.5">
              <button onClick={installApp} className="flex items-center gap-2 rounded-full px-3 py-2 text-xs font-bold text-white/78 transition hover:bg-white/10 hover:text-white">
                <Download size={15} />
                <span className="hidden sm:inline">Install</span>
              </button>
              <button onClick={() => setLiveMode(true)} className="flex items-center gap-2 rounded-full bg-white/10 px-3 py-2 text-xs font-bold text-white transition hover:bg-cyan-300 hover:text-black">
                <Mic size={15} />
                Live
              </button>
              <button className="rounded-full p-2 text-white/65 hover:bg-white/10 hover:text-white" aria-label="Demo settings">
                <Settings size={16} />
              </button>
              <button className="rounded-full p-2 text-white/65 hover:bg-white/10 hover:text-white" aria-label="Expand demo">
                <Expand size={16} />
              </button>
            </div>
          </div>

          <div className="relative flex flex-1 flex-col overflow-hidden">
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[42%] bg-[radial-gradient(circle_at_50%_100%,rgba(40,55,190,.62),transparent_58%)]" />

            <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col px-5 pb-28 pt-4 md:px-8">
              {messages.length <= 1 ? (
                <div className="flex flex-1 flex-col items-center justify-center text-center">
                  <LottiePlayer src="/animations/ai-logo-foriday-live.json" className="mb-8 h-16 w-16" ariaLabel="Max AI logo animation" />
                  <h1 className="text-4xl font-medium tracking-[-0.02em] text-white/82 md:text-5xl">
                    Hi There,
                    <br />
                    What's on your mind?
                  </h1>
                  <div className="mt-10 grid w-full max-w-3xl grid-cols-1 gap-3 md:grid-cols-2">
                    {quickPrompts.map(prompt => (
                      <button
                        key={prompt}
                        onClick={() => sendMessage(prompt)}
                        className="rounded-2xl border border-white/10 bg-white/[0.045] px-4 py-3 text-left text-sm text-white/62 transition hover:border-cyan-300/40 hover:bg-cyan-300/8 hover:text-white"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-4 overflow-y-auto pb-5 pr-1">
                  {messages.map(message => (
                    <div key={message.id} className={`flex ${message.from === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[82%] rounded-3xl px-4 py-3 text-sm leading-relaxed md:max-w-[72%] ${
                        message.from === 'user'
                          ? 'bg-blue-500/85 text-white'
                          : 'border border-white/10 bg-white/[0.055] text-white/76'
                      }`}>
                        <MarkdownLite text={message.text} />
                      </div>
                    </div>
                  ))}
                  {loading && (
                    <div className="flex items-center gap-3 rounded-3xl border border-white/10 bg-white/[0.055] px-4 py-3 text-sm text-white/55">
                      <LottiePlayer src="/animations/ai-animation-flow-1.json" className="h-10 w-10" ariaLabel="Max AI live processing animation" />
                      Max AI is thinking...
                    </div>
                  )}
                  <div ref={bottomRef} />
                </div>
              )}
            </div>

            <form onSubmit={(event) => { event.preventDefault(); sendMessage(); }} className="absolute inset-x-4 bottom-4 mx-auto flex max-w-5xl items-center gap-3 rounded-[28px] border border-blue-300/20 bg-[#131933]/85 px-4 py-3 shadow-[0_0_0_1px_rgba(255,255,255,.04),0_20px_70px_rgba(0,0,0,.45)] backdrop-blur-2xl md:bottom-7">
              <button type="button" className="rounded-full p-1 text-white/80 hover:bg-white/10" aria-label="Attach item">
                <Plus size={22} />
              </button>
              <input
                value={input}
                onChange={event => setInput(event.target.value)}
                placeholder="Ask Max AI"
                className="min-w-0 flex-1 bg-transparent text-lg text-white outline-none placeholder:text-white/36"
              />
              <button type="button" onClick={() => setLiveMode(true)} className="hidden rounded-full px-3 py-2 text-sm font-bold text-white/80 transition hover:bg-white/10 sm:block">
                Live Mode
              </button>
              <button type="button" onClick={listening ? stopListening : startListening} className={`rounded-full p-2 transition ${listening ? 'bg-red-400 text-black' : 'text-white/80 hover:bg-white/10'}`} aria-label="Use voice input">
                {listening ? <MicOff size={22} /> : <Mic size={22} />}
              </button>
              <button type="submit" disabled={!input.trim() || loading} className="rounded-full bg-white px-4 py-2 font-bold text-black transition hover:bg-cyan-200 disabled:opacity-40">
                <Send size={17} />
              </button>
            </form>
          </div>
        </section>
      </main>

      <AnimatePresence>
        {noticeVisible && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-5 left-5 right-5 z-[80] mx-auto max-w-3xl rounded-2xl border border-white/12 bg-black/88 p-4 text-xs leading-relaxed text-white/62 shadow-2xl backdrop-blur-xl"
          >
            <div className="flex gap-4">
              <AppWindow className="mt-0.5 shrink-0 text-cyan-200" size={18} />
              <p className="flex-1">
                Max AI is in beta. This demo may use local storage, cookies, microphone permissions, voice services, and interaction data to improve the model experience. You can delete chat data at any time with the trash button, clear browser data, or dismiss this notice. Official voice models and more desktop features are coming soon.
              </p>
              <button onClick={dismissNotice} className="shrink-0 rounded-xl bg-white/10 px-3 py-2 font-bold text-white hover:bg-white/16">
                OK
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {liveMode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] flex items-center justify-center bg-black/84 p-5 backdrop-blur-2xl"
          >
            <motion.div
              initial={{ scale: 0.95, y: 16 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 16 }}
              className="relative flex w-full max-w-3xl flex-col items-center overflow-hidden rounded-[32px] border border-cyan-300/22 bg-[#03030a] p-8 text-center shadow-[0_0_90px_rgba(0,229,255,.18)]"
            >
              <button onClick={() => setLiveMode(false)} className="absolute right-5 top-5 rounded-full bg-white/8 p-2 text-white/65 hover:bg-white/14 hover:text-white" aria-label="Close Live Mode">
                <X size={18} />
              </button>
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_25%,rgba(0,229,255,.16),transparent_30%),radial-gradient(circle_at_50%_100%,rgba(66,62,255,.34),transparent_42%)]" />
              <div className="relative z-10">
                <LottiePlayer src={listening ? '/animations/ai-animation-flow-1.json' : '/animations/ai-logo-foriday-live.json'} className="mx-auto h-56 w-56" ariaLabel="Max AI live mode animation" />
                <h2 className="mt-2 text-3xl font-semibold tracking-[-0.02em]">Live Mode</h2>
                <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-white/52">
                  Use your device microphone for voice input and any available browser voice for spoken replies. Google Assistant voices can appear here only if your browser exposes them.
                </p>

                <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
                  <button onClick={listening ? stopListening : startListening} className={`flex items-center gap-2 rounded-full px-6 py-3 font-bold transition ${listening ? 'bg-red-400 text-black' : 'bg-cyan-300 text-black hover:bg-fuchsia-300'}`}>
                    {listening ? <MicOff size={18} /> : <Mic size={18} />}
                    {listening ? 'Stop listening' : 'Start talking'}
                  </button>
                  <button onClick={() => setVoiceEnabled(value => !value)} className="flex items-center gap-2 rounded-full border border-white/12 bg-white/8 px-5 py-3 font-bold text-white/72 hover:bg-white/14">
                    <Volume2 size={18} />
                    Voice {voiceEnabled ? 'on' : 'off'}
                  </button>
                  <button onClick={clearChat} className="flex items-center gap-2 rounded-full border border-white/12 bg-white/8 px-5 py-3 font-bold text-white/72 hover:bg-white/14">
                    <Trash2 size={18} />
                    Delete chat
                  </button>
                </div>

                <label className="mt-6 block text-left text-[10px] font-mono uppercase tracking-[0.18em] text-white/35">
                  Device voice
                  <select
                    value={selectedVoice}
                    onChange={event => setSelectedVoice(event.target.value)}
                    className="mt-2 w-full rounded-2xl border border-white/10 bg-white/8 px-3 py-3 text-sm normal-case tracking-normal text-white outline-none"
                  >
                    {voices.length ? voices.map(voice => (
                      <option key={voice.name} value={voice.name} className="bg-neutral-950">
                        {voice.name} {voice.lang ? `(${voice.lang})` : ''}
                      </option>
                    )) : (
                      <option className="bg-neutral-950">Browser voice unavailable</option>
                    )}
                  </select>
                </label>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
