import { useEffect, useState } from 'react';
import { Plus, Users, Briefcase, HeartPulse, Receipt, Tag as TagIcon, X, Calendar, Clock } from 'lucide-react';
import { getEvents, saveEvent, deleteEvent } from '../services/eventService';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

const getTagConfig = (tag) => {
  switch (tag) {
    case 'Family': return { bg: 'bg-tag-family/10', color: 'text-tag-family', icon: Users, line: 'bg-tag-family' };
    case 'Health': return { bg: 'bg-tag-health/10', color: 'text-tag-health', icon: HeartPulse, line: 'bg-tag-health' };
    case 'Work': return { bg: 'bg-tag-work/10', color: 'text-tag-work', icon: Briefcase, line: 'bg-tag-work' };
    case 'Bills': return { bg: 'bg-tag-bills/10', color: 'text-tag-bills', icon: Receipt, line: 'bg-tag-bills' };
    default: return { bg: 'bg-primary/10', color: 'text-primary', icon: TagIcon, line: 'bg-primary' };
  }
};

const TIME_HOURS = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));
const TIME_MINUTES = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));

const parseEventTime = (time = '09:00') => {
  const [rawHours, rawMinutes] = String(time || '09:00').split(':').map(Number);
  const hours24 = Number.isFinite(rawHours) ? rawHours : 9;
  const minutes = Number.isFinite(rawMinutes) ? rawMinutes : 0;
  const period = hours24 >= 12 ? 'PM' : 'AM';
  const hours12 = hours24 % 12 || 12;

  return {
    hour: String(hours12).padStart(2, '0'),
    minute: String(minutes).padStart(2, '0'),
    period,
  };
};

const toEventTime = ({ hour, minute, period }) => {
  const numericHour = Number(hour);
  const hours24 = period === 'PM'
    ? (numericHour % 12) + 12
    : numericHour % 12;

  return `${String(hours24).padStart(2, '0')}:${minute}`;
};

function EventTimelineCard({ event, onDelete, highlight }) {
  const { color, icon: Icon, line } = getTagConfig(event.tag);
  
  return (
    <div className="relative pl-8 pb-8 group">
      {/* Timeline line */}
      <div className={cn("absolute left-3 top-8 bottom-0 w-0.5 rounded-full opacity-30", line)}></div>
      
      {/* Timeline dot */}
      <div className={cn("absolute left-1 top-2 w-4 h-4 rounded-full border-2 border-white shadow-sm z-10", line)}></div>

      <div className={cn(
        "premium-card p-5 flex flex-col gap-3 relative transition-all duration-300 dark:bg-gray-800",
        highlight ? "ring-2 ring-primary/20 shadow-premium" : "shadow-sm border border-gray-50 dark:border-gray-700",
        event.tag === 'Family' ? "bg-[#fffaf5] dark:bg-gray-800" : "" // Special warm styling for Family
      )}>
        {highlight && (
          <div className="absolute top-0 right-0 px-3 py-1 bg-primary text-white text-[10px] font-bold uppercase tracking-widest rounded-bl-2xl rounded-tr-3xl">
            Up Next
          </div>
        )}
        
        <div className="flex items-start justify-between">
          <div className="flex flex-col">
            <div className="flex items-center gap-2 mb-1">
              <span className={cn("text-[10px] font-bold uppercase tracking-wider flex items-center gap-1", color)}>
                <Icon size={12} /> {event.tag}
              </span>
            </div>
            <h3 className="text-lg font-bold text-text-deep dark:text-white leading-tight pr-12">{event.title}</h3>
          </div>
        </div>

        <div className="flex flex-col gap-2 mt-1">
          <div className="flex items-center gap-2 text-sm font-semibold text-text-muted dark:text-gray-400">
            <div className="p-1.5 rounded-lg bg-gray-50 dark:bg-gray-700"><Calendar size={14} /></div>
            {new Date(event.date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
          </div>
          <div className="flex items-center gap-2 text-sm font-semibold text-text-muted dark:text-gray-400">
            <div className="p-1.5 rounded-lg bg-gray-50 dark:bg-gray-700"><Clock size={14} /></div>
            {event.time}
          </div>
          {event.notes && (
            <p className="text-sm text-text-muted dark:text-gray-400 mt-2 pl-2 border-l-2 border-gray-100 dark:border-gray-700">
              {event.notes}
            </p>
          )}
        </div>

        <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
           <button onClick={() => onDelete(event.id)} className="p-2 bg-red-50 text-red-500 rounded-full hover:bg-red-100 transition-colors">
              <X size={14} />
           </button>
        </div>
      </div>
    </div>
  );
}

export default function EventsManager({ className }) {
  const [events, setEvents] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ title: '', date: '', time: '', tag: 'Family', notes: '', reminder: true });
  const timeParts = parseEventTime(formData.time);

  const fetchEvents = async () => {
    const data = await getEvents();
    const sorted = [...data].sort((a, b) => new Date(`${a.date}T${a.time || '00:00'}`) - new Date(`${b.date}T${b.time || '00:00'}`));
    setEvents(sorted);
  };

  useEffect(() => {
    getEvents().then(data => {
      const sorted = [...data].sort((a, b) => new Date(`${a.date}T${a.time || '00:00'}`) - new Date(`${b.date}T${b.time || '00:00'}`));
      setEvents(sorted);
    });
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.date) return;
    await saveEvent(formData);
    setFormData({ title: '', date: '', time: '', tag: 'Family', notes: '', reminder: true });
    setIsModalOpen(false);
    fetchEvents();
  };

  const handleDelete = async (id) => {
    await deleteEvent(id);
    fetchEvents();
  };

  const handleAddAnniversary = () => {
    setFormData({
      title: 'Marriage Anniversary',
      date: '',
      time: '09:00',
      tag: 'Family',
      notes: 'Important day. Do not miss this.',
      reminder: true,
    });
    setIsModalOpen(true);
  };

  const handleAddEvent = () => {
    setFormData({ title: '', date: '', time: '', tag: 'Family', notes: '', reminder: true });
    setIsModalOpen(true);
  };

  const handleTimeChange = (part, value) => {
    setFormData((current) => {
      const nextTime = { ...parseEventTime(current.time), [part]: value };
      return { ...current, time: toEventTime(nextTime) };
    });
  };

  const today = new Date().toISOString().split('T')[0];
  const upcomingEvents = events.filter(e => e.date >= today);
  const upNext = upcomingEvents[0];
  const hasAnniversaryEvent = events.some(e => (
    e.title?.toLowerCase().includes('marriage anniversary')
    || e.title?.toLowerCase().includes('anniversary')
  ));
  const remainingEvents = [
    ...upcomingEvents.slice(1).filter(e => e.tag === 'Family'),
    ...upcomingEvents.slice(1).filter(e => e.tag !== 'Family'),
  ];

  return (
    <div className={cn("mx-auto w-full max-w-4xl px-4 py-2 md:px-6 lg:px-8 flex flex-col overflow-hidden", className)}>
      <div className="flex items-center justify-between mb-6 shrink-0 px-2 mt-2">
        <h2 className="text-xl font-bold tracking-tight text-text-deep dark:text-white">
          Timeline
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto px-2 pb-24 md:pb-8 flex flex-col relative">
        <div className="py-2">
          {upNext && (
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
              <EventTimelineCard event={upNext} onDelete={handleDelete} highlight />
            </motion.div>
          )}

          {remainingEvents.map((e, i) => (
            <motion.div key={e.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: (i + 1) * 0.1 }}>
              <EventTimelineCard event={e} onDelete={handleDelete} />
            </motion.div>
          ))}

          {upcomingEvents.length === 0 && (
            <div className="py-12 text-center flex flex-col items-center justify-center">
              <Calendar className="text-gray-300 mb-3" size={40} />
              <p className="text-text-muted font-medium">Timeline is clear.</p>
            </div>
          )}
        </div>

        {/* Floating Action Button */}
        <div className="absolute bottom-6 right-2 z-10 flex items-center gap-3">
          {!hasAnniversaryEvent && (
            <div className="max-w-[210px] rounded-2xl bg-white/95 px-3 py-2 text-right text-[11px] font-semibold leading-snug text-text-muted shadow-premium-sm dark:bg-gray-800/95 dark:text-gray-300">
              <p>
                Add your marriage anniversary. We recommend this <strong className="text-rose-500 dark:text-rose-300">for your safety</strong>.
              </p>
              <button
                type="button"
                onClick={handleAddAnniversary}
                className="mt-2 rounded-xl bg-rose-500 px-3 py-1.5 text-[11px] font-black text-white shadow-sm hover:bg-rose-600 transition-colors"
              >
                Add Anniversary
              </button>
            </div>
          )}
          <button
            onClick={handleAddEvent}
            className="h-14 w-14 rounded-full bg-secondary text-white flex items-center justify-center shadow-lg shadow-secondary/40 hover:scale-105 transition-transform"
            aria-label="Add event"
          >
            <Plus size={24} />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-text-deep/40 backdrop-blur-sm md:items-center">
            <motion.div 
              initial={{ opacity: 0, y: "100%" }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: "100%" }}
              transition={{ type: "spring", bounce: 0, duration: 0.4 }}
              className="modal-sheet w-full max-w-md rounded-t-[32px] md:rounded-[32px] p-6 shadow-2xl border-t md:border border-gray-100 dark:border-gray-700 max-h-[90vh] md:max-h-[86vh] overflow-y-auto pb-safe"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-text-deep dark:text-white">Add Event</h3>
                <button onClick={() => setIsModalOpen(false)} className="p-2 text-text-muted hover:text-text-deep dark:hover:text-white bg-gray-50 dark:bg-gray-800 rounded-full">
                  <X size={18} />
                </button>
              </div>
              
              <form onSubmit={handleSave} className="flex flex-col gap-5">
                <div>
                  <label className="form-label text-xs font-bold uppercase tracking-wider mb-2 block ml-1">Event Title</label>
                  <input required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} type="text" className="form-control w-full h-14 px-5 rounded-2xl border-none focus:ring-2 focus:ring-secondary outline-none transition-all font-medium" />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="form-label text-xs font-bold uppercase tracking-wider mb-2 block ml-1">Date</label>
                    <input required value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} type="date" className="form-control w-full h-14 px-5 rounded-2xl border-none focus:ring-2 focus:ring-secondary outline-none transition-all font-medium" />
                  </div>
                  <div>
                    <label className="form-label text-xs font-bold uppercase tracking-wider mb-2 block ml-1">Time</label>
                    <div className="form-control w-full h-14 px-3 rounded-2xl border-none focus-within:ring-2 focus-within:ring-secondary outline-none transition-all font-medium flex items-center gap-1">
                      <select
                        value={timeParts.hour}
                        onChange={e => handleTimeChange('hour', e.target.value)}
                        className="w-14 bg-transparent outline-none font-bold text-center"
                      >
                        {TIME_HOURS.map(hour => <option key={hour} value={hour}>{hour}</option>)}
                      </select>
                      <span className="font-black text-text-muted dark:text-gray-400">:</span>
                      <select
                        value={timeParts.minute}
                        onChange={e => handleTimeChange('minute', e.target.value)}
                        className="w-14 bg-transparent outline-none font-bold text-center"
                      >
                        {TIME_MINUTES.map(minute => <option key={minute} value={minute}>{minute}</option>)}
                      </select>
                      <select
                        value={timeParts.period}
                        onChange={e => handleTimeChange('period', e.target.value)}
                        className="ml-auto w-16 bg-transparent outline-none font-bold text-center"
                      >
                        <option value="AM">AM</option>
                        <option value="PM">PM</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="form-label text-xs font-bold uppercase tracking-wider mb-2 block ml-1">Tag</label>
                  <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
                    {['Family', 'Health', 'Work', 'Bills', 'Personal', 'Other'].map(tag => (
                      <button 
                        key={tag} type="button"
                        onClick={() => setFormData({...formData, tag})}
                        className={cn(
                          "px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all",
                          formData.tag === tag ? "tag-button-active shadow-md" : "tag-button hover:bg-gray-200 dark:hover:bg-gray-700"
                        )}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="form-label text-xs font-bold uppercase tracking-wider mb-2 block ml-1">Notes</label>
                  <textarea value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} className="form-control w-full p-5 rounded-2xl border-none focus:ring-2 focus:ring-secondary outline-none transition-all font-medium resize-none h-24" />
                </div>

                <label className="form-control flex items-center justify-between h-14 px-5 rounded-2xl font-bold">
                  Reminder
                  <input type="checkbox" checked={formData.reminder} onChange={e => setFormData({...formData, reminder: e.target.checked})} className="h-5 w-5 accent-secondary" />
                </label>

                <button 
                  type="submit"
                  className="w-full h-14 mt-2 rounded-2xl bg-secondary text-white font-bold hover:bg-opacity-90 transition-colors shadow-lg shadow-secondary/20 text-lg"
                >
                  Save Event
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
