import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, Unlock, Lock } from 'lucide-react';
import { registerCaptchaSuccess } from '../data/security.js';

export default function BotChallenge({ isOpen, onSuccess }) {
  const [sliderVal, setSliderVal] = useState(0);
  const [unlocked, setUnlocked] = useState(false);

  const handleSliderChange = (e) => {
    const val = parseInt(e.target.value, 10);
    setSliderVal(val);
    if (val >= 98) {
      setUnlocked(true);
      registerCaptchaSuccess();
      setTimeout(() => {
        onSuccess();
      }, 1000);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 backdrop-blur-md z-[100000]"
          />

          {/* Modal Container */}
          <div className="fixed inset-0 z-[100001] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="w-full max-w-sm rounded-2xl border border-red-500/20 p-6 text-center flex flex-col items-center gap-5"
              style={{ background: 'rgba(8,8,12,0.98)', boxShadow: '0 0 40px rgba(239,68,68,0.1)' }}
            >
              {/* Alert icon */}
              <div className={`w-14 h-14 rounded-full flex items-center justify-center ${unlocked ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-red-500/10 border-red-500/30'} border transition-all duration-300`}>
                {unlocked ? (
                  <Unlock size={24} className="text-emerald-400" />
                ) : (
                  <ShieldAlert size={24} className="text-red-400" />
                )}
              </div>

              {/* Text */}
              <div>
                <h3 className="text-sm font-bold font-mono tracking-widest text-white uppercase">
                  {unlocked ? 'INTEGRITY VERIFIED' : 'CORE THREAT SHIELD'}
                </h3>
                <p className="text-[11px] text-white/40 font-mono mt-1">
                  {unlocked ? 'Bypassing threat block...' : 'Suspicious activity has triggered bot validation check.'}
                </p>
              </div>

              {/* Slide track */}
              <div className="w-full relative mt-2">
                <div className="w-full h-12 rounded-xl bg-white/2 border border-white/5 flex items-center justify-center relative overflow-hidden">
                  <span className="text-[10px] font-mono font-bold text-white/20 select-none uppercase tracking-wider">
                    {unlocked ? 'ACCESS GRANTED' : 'Slide to verify humanity'}
                  </span>
                  
                  {/* Slider bar background visual */}
                  <div
                    className={`absolute left-0 top-0 bottom-0 transition-all ${unlocked ? 'bg-emerald-500/10' : 'bg-red-500/10'}`}
                    style={{ width: `${sliderVal}%` }}
                  />

                  {/* Input range */}
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={sliderVal}
                    onChange={handleSliderChange}
                    disabled={unlocked}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  
                  {/* Sliding Thumb visual element */}
                  {!unlocked && (
                    <motion.div
                      style={{ left: `calc(${sliderVal}% - ${sliderVal * 0.4}px)` }}
                      className="absolute top-1 left-1 bottom-1 w-10 rounded-lg bg-white/10 border border-white/25 flex items-center justify-center pointer-events-none"
                    >
                      <Lock size={12} className="text-white/60" />
                    </motion.div>
                  )}
                </div>
              </div>

              <span className="text-[8px] font-mono text-white/20">
                MAX FLIGHT AUTO-CHECKER SYSTEM v2.5
              </span>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
