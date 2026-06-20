import { useEffect, useState } from 'react';
import { CloudSun, Droplets, ThermometerSun } from 'lucide-react';
import { getWeather } from '../services/weatherService';
import { getSetup } from '../services/setupService';
import { cn } from '../lib/utils';
import { motion } from 'framer-motion';

// Background image based on condition
const getBgImage = (condition = '', rainChance = 0) => {
  if (rainChance > 50 || condition.toLowerCase().includes('rain')) {
    return 'https://images.unsplash.com/photo-1531889013178-5e3c14cdcb8a?auto=format&fit=crop&w=800&q=70';
  }
  if (condition.toLowerCase().includes('cloud')) {
    return 'https://images.unsplash.com/photo-1504608524841-42584120d791?auto=format&fit=crop&w=800&q=70';
  }
  return 'https://images.unsplash.com/photo-1601297183305-6df142704ea2?auto=format&fit=crop&w=800&q=70';
};

// Gradient overlay based on condition
const getGradient = (condition = '', rainChance = 0) => {
  if (rainChance > 50 || condition.toLowerCase().includes('rain')) {
    return 'from-slate-700/90 via-blue-900/70 to-blue-950/80';
  }
  if (condition.toLowerCase().includes('cloud')) {
    return 'from-slate-600/85 via-sky-700/65 to-sky-900/75';
  }
  return 'from-orange-500/70 via-amber-600/55 to-sky-600/80';
};

export default function WeatherOverview({ className }) {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const setup = getSetup();
    getWeather(setup?.city).then(data => {
      setWeather(data);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className={cn("px-4", className)}>
        <div className="h-52 bg-white dark:bg-gray-800 rounded-[28px] animate-pulse shadow-premium"></div>
      </div>
    );
  }

  if (!weather) return null;

  const bgImage = getBgImage(weather.condition, weather.rainChance);
  const gradient = getGradient(weather.condition, weather.rainChance);

  return (
    <div className={cn("px-4", className)}>
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="rounded-[28px] relative overflow-hidden h-52 shadow-premium flex flex-col justify-between"
        style={{ minHeight: '210px' }}
      >
        {/* Background photo */}
        <div
          className="absolute inset-0 bg-cover bg-center transition-all duration-700"
          style={{ backgroundImage: `url('${bgImage}')` }}
        />
        {/* Gradient overlay */}
        <div className={cn("absolute inset-0 bg-gradient-to-br", gradient)} />

        {/* Content */}
        <div className="relative z-10 p-6 flex flex-col h-full justify-between">
          {/* Top row */}
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-white/70 mb-1">
                {weather.city}
              </p>
              <div className="flex items-baseline gap-2">
                <span className="text-6xl font-black tracking-tighter text-white drop-shadow-lg">
                  {weather.temp}°
                </span>
                <span className="text-lg font-semibold text-white/80">
                  {weather.condition}
                </span>
              </div>
            </div>
            <div className="bg-white/20 backdrop-blur-md p-3 rounded-2xl border border-white/30 text-white">
              <CloudSun size={30} />
            </div>
          </div>

          {/* Bottom row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5 text-white/90">
                <ThermometerSun size={15} />
                <span className="text-sm font-bold">{weather.high}° / {weather.low}°</span>
              </div>
              <div className="flex items-center gap-1.5 text-white/90">
                <Droplets size={15} />
                <span className="text-sm font-bold">{weather.rainChance}% rain</span>
              </div>
            </div>
            <span className="text-xs font-semibold text-white/70 italic max-w-[140px] text-right leading-snug">
              {weather.advice}
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
