import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Database, Music, Shield, Check, X } from 'lucide-react';

const CONSENT_KEY = 'mfs_permissions_granted';

export default function PermissionsModal() {
  const [show, setShow] = useState(false);
  const [notifGranted, setNotifGranted] = useState(false);
  const [audioGranted, setAudioGranted] = useState(true);
  const [storageGranted, setStorageGranted] = useState(true);
  const [step, setStep] = useState('ask'); // 'ask' | 'done'

  useEffect(() => {
    const already = localStorage.getItem(CONSENT_KEY);
    if (!already) {
      const timer = setTimeout(() => setShow(true), 1200);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAcceptAll = async () => {
    // Request browser notification permission
    if ('Notification' in window) {
      try {
        await Notification.requestPermission();
        setNotifGranted(true);
      } catch (_) {}
    }
    setAudioGranted(true);
    setStorageGranted(true);
    setStep('done');
    setTimeout(() => {
      localStorage.setItem(CONSENT_KEY, JSON.stringify({
        notifications: true,
        audio: true,
        storage: true,
        grantedAt: new Date().toISOString(),
      }));
      setShow(false);
    }, 1800);
  };

  const handleCustom = () => {
    localStorage.setItem(CONSENT_KEY, JSON.stringify({
      notifications: notifGranted,
      audio: audioGranted,
      storage: storageGranted,
      grantedAt: new Date().toISOString(),
    }));
    setShow(false);
  };

  return (
    <AnimatePresence>
      {show && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[9999]"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: 60, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed bottom-0 left-0 right-0 md:bottom-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 z-[10000] md:max-w-md w-full"
          >
            <div className="m-4 md:m-0 rounded-2xl border border-white/10 overflow-hidden"
              style={{ background: 'rgba(10,10,15,0.97)', backdropFilter: 'blur(30px)' }}>

              {step === 'done' ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-8 flex flex-col items-center gap-4 text-center"
                >
                  <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
                    <Check size={28} className="text-emerald-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white">You're all set!</h3>
                  <p className="text-sm text-white/40">Welcome to Maxx Forge Studio. Your preferences have been saved.</p>
                </motion.div>
              ) : (
                <>
                  {/* Header */}
                  <div className="px-6 pt-6 pb-4 border-b border-white/5">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border border-emerald-500/20 flex items-center justify-center">
                        <Shield size={18} className="text-emerald-400" />
                      </div>
                      <div>
                        <h2 className="text-base font-bold text-white">Welcome to Maxx Forge Studio™</h2>
                        <p className="text-xs text-white/40">We'd like to customize your experience</p>
                      </div>
                    </div>
                  </div>

                  {/* Permission items */}
                  <div className="px-6 py-4 flex flex-col gap-3">
                    {[
                      {
                        icon: Bell,
                        label: 'Notifications',
                        desc: 'Get notified about new drops, events, and announcements',
                        color: '#10B981',
                        value: notifGranted,
                        set: setNotifGranted,
                      },
                      {
                        icon: Music,
                        label: 'Audio Autoplay',
                        desc: 'Allow music to play automatically in the player',
                        color: '#00E5FF',
                        value: audioGranted,
                        set: setAudioGranted,
                      },
                      {
                        icon: Database,
                        label: 'Local Storage',
                        desc: 'Save your session, preferences, and data locally',
                        color: '#818CF8',
                        value: storageGranted,
                        set: setStorageGranted,
                        required: true,
                      },
                    ].map(({ icon: Icon, label, desc, color, value, set, required }) => (
                      <div key={label}
                        className="flex items-center gap-4 p-3 rounded-xl border border-white/5"
                        style={{ background: value ? `${color}08` : 'rgba(255,255,255,0.02)' }}>
                        <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{ background: `${color}15`, border: `1px solid ${color}25` }}>
                          <Icon size={16} style={{ color }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm font-semibold text-white">{label}</span>
                            {required && <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 text-white/30 font-mono uppercase">Required</span>}
                          </div>
                          <p className="text-xs text-white/40 leading-snug mt-0.5">{desc}</p>
                        </div>
                        {/* Toggle */}
                        <button
                          onClick={() => !required && set(v => !v)}
                          disabled={required}
                          className={`w-11 h-6 rounded-full relative transition-all duration-300 flex-shrink-0 ${required ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
                          style={{ background: value ? color : 'rgba(255,255,255,0.1)' }}
                        >
                          <motion.div
                            layout
                            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                            className="absolute top-1 w-4 h-4 rounded-full bg-white shadow"
                            style={{ left: value ? 'calc(100% - 20px)' : '4px' }}
                          />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="px-6 pb-6 flex flex-col gap-2">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleAcceptAll}
                      className="w-full py-3 rounded-xl font-bold text-sm tracking-wide text-white"
                      style={{ background: 'linear-gradient(135deg, #10B981, #00E5FF)' }}
                    >
                      Accept All & Enter
                    </motion.button>
                    <button
                      onClick={handleCustom}
                      className="w-full py-2.5 rounded-xl text-xs font-semibold text-white/40 hover:text-white/60 transition border border-white/5 hover:border-white/10"
                    >
                      Save my choices
                    </button>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
