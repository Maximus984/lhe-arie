import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Trash2, ChevronLeft, ChevronRight, Calendar as CalIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday, addMonths, subMonths } from 'date-fns';
import toast from 'react-hot-toast';

const EVENT_COLORS = {
  'Studio Session': '#10B981',
  'Live Show': '#00E5FF',
  'AI Milestone': '#6366F1',
  'Meeting': '#F59E0B',
  'Deadline': '#EF4444',
  'Personal': '#EC4899',
};

const makeGoogleCalendarLink = (ev) => {
  const title = encodeURIComponent(ev.title);
  const dateClean = ev.date.replace(/-/g, '');
  const dates = `${dateClean}/${dateClean}`;
  const details = encodeURIComponent(ev.description || ev.notes || 'Maxx Forge Studio Event');
  const location = encodeURIComponent(ev.location || 'Maxx Forge Central Hub');
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dates}&details=${details}&location=${location}`;
};

function AddEventModal({ date, onSave, onClose }) {
  const [title, setTitle] = useState('');
  const [type, setType] = useState('Studio Session');
  const [notes, setNotes] = useState('');

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, y: 10 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 10 }}
        className="w-full max-w-sm rounded-2xl p-6 flex flex-col gap-4"
        style={{ background: 'rgba(10,10,15,0.98)', border: '1px solid rgba(255,255,255,0.08)' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h3 className="font-display font-bold text-white">Add Event</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition">
            <X size={16} />
          </button>
        </div>
        <p className="text-xs font-mono text-white/40">{format(date, 'EEEE, MMMM d, yyyy')}</p>

        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-mono text-white/40 uppercase font-bold tracking-wider">Event Title *</label>
          <input
            autoFocus
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="e.g. Studio Recording Session"
            className="px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-white/20 focus:outline-none focus:border-emerald-500/40 transition"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-mono text-white/40 uppercase font-bold tracking-wider">Event Type</label>
          <select
            value={type}
            onChange={e => setType(e.target.value)}
            className="px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500/40 transition"
          >
            {Object.keys(EVENT_COLORS).map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-mono text-white/40 uppercase font-bold tracking-wider">Notes (optional)</label>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            rows={2}
            placeholder="Additional details..."
            className="px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white/80 placeholder-white/20 focus:outline-none focus:border-emerald-500/40 transition resize-none"
          />
        </div>

        <button
          onClick={() => { if (title.trim()) { onSave({ title, type, notes, date: date.toISOString() }); } else { toast.error('Please enter an event title'); } }}
          className="w-full py-3 bg-emerald-500 text-neutral-950 rounded-xl font-semibold text-sm hover:bg-emerald-400 transition shadow-[0_0_15px_rgba(16,185,129,0.3)]"
        >
          Add to Calendar
        </button>
      </motion.div>
    </motion.div>
  );
}

export default function CalendarPanel({ isOpen, onClose }) {
  const { calendarEvents, addCalendarEvent, deleteCalendarEvent, can } = useAuth();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [addModal, setAddModal] = useState(false);
  const canEdit = can('manage_calendar');

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Pad start with empty slots
  const startPad = monthStart.getDay();

  const getEventsForDay = (day) =>
    calendarEvents.filter(e => isSameDay(new Date(e.date), day));

  const handleDayClick = (day) => {
    setSelectedDate(day);
    if (canEdit) setAddModal(true);
  };

  const handleSaveEvent = (eventData) => {
    addCalendarEvent(eventData);
    setAddModal(false);
    toast.success('Event added to calendar!');
  };

  const dayEvents = selectedDate ? getEventsForDay(selectedDate) : [];

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
            className="w-full max-w-2xl flex flex-col rounded-3xl overflow-hidden"
            style={{ background: 'rgba(8,8,12,0.98)', border: '1px solid rgba(255,255,255,0.08)' }}
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/5">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-cyan-500/10 border border-cyan-500/20 rounded-xl">
                  <CalIcon size={18} className="text-cyan-400" />
                </div>
                <div>
                  <h2 className="text-lg font-display font-bold text-white">Studio Calendar</h2>
                  <p className="text-[10px] font-mono text-white/30">
                    {canEdit ? 'Click a day to add events' : 'View upcoming events'}
                  </p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition">
                <X size={18} />
              </button>
            </div>

            <div className="p-6 flex flex-col gap-5">
              {/* Month navigator */}
              <div className="flex items-center justify-between">
                <button onClick={() => setCurrentMonth(m => subMonths(m, 1))} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition">
                  <ChevronLeft size={16} />
                </button>
                <h3 className="text-base font-display font-bold text-white">{format(currentMonth, 'MMMM yyyy')}</h3>
                <button onClick={() => setCurrentMonth(m => addMonths(m, 1))} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition">
                  <ChevronRight size={16} />
                </button>
              </div>

              {/* Day headers */}
              <div className="grid grid-cols-7 gap-1 text-center">
                {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => (
                  <div key={d} className="text-[10px] font-mono font-bold text-white/25 uppercase py-1">{d}</div>
                ))}
              </div>

              {/* Calendar grid */}
              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: startPad }).map((_, i) => <div key={`pad-${i}`} />)}
                {days.map(day => {
                  const events = getEventsForDay(day);
                  const isSelected = selectedDate && isSameDay(day, selectedDate);
                  const todayDay = isToday(day);
                  return (
                    <button
                      key={day.toISOString()}
                      onClick={() => handleDayClick(day)}
                      className={`relative aspect-square rounded-xl flex flex-col items-center justify-start pt-1.5 pb-1 px-1 transition group ${
                        isSelected ? 'bg-emerald-500/20 border border-emerald-500/40' :
                        todayDay ? 'bg-cyan-500/10 border border-cyan-500/20' :
                        'bg-white/3 border border-transparent hover:bg-white/5 hover:border-white/10'
                      }`}
                    >
                      <span className={`text-xs font-mono font-bold ${
                        isSelected ? 'text-emerald-400' :
                        todayDay ? 'text-cyan-400' :
                        'text-white/60'
                      }`}>{format(day, 'd')}</span>
                      <div className="flex flex-wrap gap-0.5 justify-center mt-0.5">
                        {events.slice(0, 3).map((ev, i) => (
                          <span
                            key={i}
                            className="w-1.5 h-1.5 rounded-full"
                            style={{ background: EVENT_COLORS[ev.type] || '#10B981' }}
                          />
                        ))}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Selected day event list */}
              {selectedDate && (
                <div className="flex flex-col gap-2 border-t border-white/5 pt-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-display font-semibold text-white">{format(selectedDate, 'MMMM d, yyyy')}</p>
                    {canEdit && (
                      <button
                        onClick={() => setAddModal(true)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg text-xs font-semibold hover:bg-emerald-500/20 transition"
                      >
                        <Plus size={12} /> Add Event
                      </button>
                    )}
                  </div>
                  {dayEvents.length === 0 ? (
                    <p className="text-xs font-mono text-white/25 py-4 text-center">{canEdit ? 'Click "Add Event" to schedule something' : 'No events scheduled'}</p>
                  ) : (
                    dayEvents.map(ev => (
                      <div key={ev.id} className="flex items-center justify-between p-3 rounded-xl border border-white/5 bg-white/3">
                        <div className="flex items-center gap-3">
                          <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: EVENT_COLORS[ev.type] || '#10B981' }} />
                          <div>
                            <p className="text-sm font-semibold text-white">{ev.title}</p>
                            <p className="text-[10px] font-mono text-white/30">{ev.type}{ev.notes ? ` · ${ev.notes}` : ''}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <a
                            href={makeGoogleCalendarLink(ev)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2 py-1 rounded bg-cyan-500/10 border border-cyan-500/20 text-[9px] font-mono text-cyan-400 hover:bg-cyan-500/20 transition decoration-none font-bold"
                            title="Sync to Google Calendar"
                          >
                            + Google Calendar
                          </a>
                          {canEdit && (
                            <button onClick={() => { deleteCalendarEvent(ev.id); toast.success('Event removed'); }} className="p-1.5 text-white/20 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition">
                              <Trash2 size={13} />
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Event type legend */}
              <div className="flex flex-wrap gap-3 border-t border-white/5 pt-4">
                {Object.entries(EVENT_COLORS).map(([type, color]) => (
                  <div key={type} className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full" style={{ background: color }} />
                    <span className="text-[9px] font-mono text-white/30">{type}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {addModal && selectedDate && (
        <AddEventModal
          date={selectedDate}
          onSave={handleSaveEvent}
          onClose={() => setAddModal(false)}
        />
      )}
    </AnimatePresence>
  );
}
