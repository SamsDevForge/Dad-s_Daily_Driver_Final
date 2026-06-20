import { useEffect, useState } from 'react';
import { Pill, CloudRain, Bell, AlertCircle } from 'lucide-react';
import { getAlerts } from '../services/alertService';
import { cn } from '../lib/utils';
import { motion } from 'framer-motion';

const iconMap = {
  Pill: Pill,
  CloudRain: CloudRain,
  Bell: Bell,
};

const typeConfig = {
  warning: { bg: 'bg-orange-50 dark:bg-orange-900/20', icon: 'text-alert', border: 'border-orange-100 dark:border-orange-900/30', line: 'bg-alert' },
  info:    { bg: 'bg-blue-50 dark:bg-blue-900/20',   icon: 'text-secondary', border: 'border-blue-100 dark:border-blue-900/30', line: 'bg-secondary' },
  alert:   { bg: 'bg-rose-50 dark:bg-rose-900/20',   icon: 'text-rose-500', border: 'border-rose-100 dark:border-rose-900/30',  line: 'bg-rose-500' },
  default: { bg: 'bg-surface dark:bg-gray-800',   icon: 'text-text-muted dark:text-gray-400', border: 'border-gray-100 dark:border-gray-700', line: 'bg-gray-300 dark:bg-gray-600' },
};

export default function AlertStrip({ className }) {
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    getAlerts().then(setAlerts);
  }, []);

  if (alerts.length === 0) return null;

  return (
    <div className={cn("w-full overflow-x-auto pb-2 scrollbar-hide px-4 pt-2", className)}>
      <div className="flex gap-3 w-max">
        {alerts.map((alert, index) => {
          const Icon = iconMap[alert.icon] || AlertCircle;
          const cfg = typeConfig[alert.type] || typeConfig.default;

          return (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              key={alert.id}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-2xl border min-w-[220px] shadow-premium-sm relative overflow-hidden',
                cfg.bg, cfg.border
              )}
            >
              {/* Accent left strip */}
              <div className={cn("absolute left-0 top-3 bottom-3 w-1 rounded-full", cfg.line)} />

              <div className={cn("p-2 rounded-xl bg-white dark:bg-gray-800 shadow-sm ml-2", cfg.icon)}>
                <Icon size={16} />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted dark:text-gray-400">
                  {alert.title}
                </span>
                <span className="text-sm font-semibold text-text-deep dark:text-white leading-tight">
                  {alert.message}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
