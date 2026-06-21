import { User, Sun } from 'lucide-react';
import { cn } from '../lib/utils';
import { useEffect, useState } from 'react';
import { getWeather } from '../services/weatherService';
import { getMedicines } from '../services/medicineService';
import { getSetup } from '../services/setupService';
import { motion } from 'framer-motion';

const getGreeting = (date = new Date()) => {
  const hour = date.getHours();
  if (hour < 5) return 'Good Night';
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  if (hour < 21) return 'Good Evening';
  return 'Good Night';
};

export default function Header({ className }) {
  const [weather, setWeather] = useState(null);
  const [nextMed, setNextMed] = useState(null);

  useEffect(() => {
    const setup = getSetup();
    getWeather(setup?.city).then(setWeather);
    getMedicines().then(meds => {
      const pending = meds.filter(m => m.status === 'Pending');
      if (pending.length > 0) {
        pending.sort((a, b) => a.time.localeCompare(b.time));
        setNextMed(pending[0]);
      }
    });
  }, []);

  const today = new Date();
  const greeting = getGreeting(today);
  const options = { weekday: 'long', month: 'long', day: 'numeric' };
  const dateString = today.toLocaleDateString('en-US', options);

  return (
    <div className={cn("px-4 pt-6 pb-2", className)}>
      <div className="flex justify-between items-start mb-6">
        <div className="flex flex-col">
          <h1 className="text-2xl font-bold tracking-tight text-text-deep dark:text-white">
            {greeting}, Dad
          </h1>
          <p className="text-sm font-medium text-text-muted dark:text-gray-400 mt-0.5">
            {dateString}
          </p>
        </div>
        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary shadow-sm">
          <User size={24} />
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {weather && (
          <div className="flex items-center gap-2 text-sm font-medium text-text-muted dark:text-gray-400 bg-surface dark:bg-gray-800 rounded-2xl p-3 shadow-premium-sm">
            <Sun size={18} className="text-primary" />
            <span>{weather.temp}°C | {weather.rainChance > 20 ? 'Rain expected' : 'Rain unlikely today'}</span>
          </div>
        )}

        {nextMed ? (
          <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between bg-primary/10 dark:bg-primary/20 rounded-2xl p-4 border border-primary/20">
            <div className="flex flex-col">
              <span className="text-sm font-bold text-primary">Next Medicine</span>
              <span className="text-xs font-medium text-primary/80 mt-0.5">
                <span className="font-bold">{nextMed.alias}</span> — due at{' '}
                <span className="font-black">
                  {new Date(`1970-01-01T${nextMed.time}`).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                </span>
              </span>
            </div>
            <div className="h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm">
              !
            </div>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between bg-success/10 dark:bg-success/20 rounded-2xl p-4 border border-success/20">
            <div className="flex flex-col">
              <span className="text-sm font-bold text-success">All Caught Up</span>
              <span className="text-xs font-medium text-success/80 mt-0.5">No pending medicines right now.</span>
            </div>
            <div className="h-8 w-8 rounded-full bg-success text-white flex items-center justify-center font-bold text-sm">
              ✓
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
