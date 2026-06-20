import { Home, Newspaper, Activity, FileBox, Settings, Calendar } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion } from 'framer-motion';

const navItems = [
  { id: 'home',      icon: Home,      label: 'Home' },
  { id: 'news',      icon: Newspaper, label: 'News' },
  { id: 'medicines', icon: Activity,  label: 'Health' },
  { id: 'events',    icon: Calendar,  label: 'Events' },
  { id: 'documents', icon: FileBox,   label: 'Vault' },
  { id: 'settings',  icon: Settings,  label: 'More' },
];

export default function BottomNav({ activeTab, setActiveTab, className }) {
  return (
    <div className={cn("fixed bottom-5 left-0 right-0 z-40 md:hidden flex justify-center px-5 pointer-events-none", className)}>
      {/* Liquid-glass pill */}
      <div className="pointer-events-auto w-full max-w-sm rounded-[32px] px-2 py-1.5 shadow-2xl shadow-black/20"
        style={{
          background: 'rgba(255, 255, 255, 0.15)',
          backdropFilter: 'blur(24px) saturate(180%)',
          WebkitBackdropFilter: 'blur(24px) saturate(180%)',
          border: '1px solid rgba(255, 255, 255, 0.35)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.18), inset 0 1px 0 rgba(255,255,255,0.4), inset 0 -1px 0 rgba(0,0,0,0.05)',
        }}
      >
        <div className="flex justify-between items-center">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className="relative flex flex-col items-center justify-center px-2.5 py-2 gap-0.5 outline-none group"
              >
                {isActive && (
                  <motion.div
                    layoutId="glass-bubble"
                    className="absolute inset-0 rounded-2xl"
                    style={{
                      background: 'rgba(255,255,255,0.28)',
                      border: '1px solid rgba(255,255,255,0.5)',
                    }}
                    transition={{ type: 'spring', bounce: 0.25, duration: 0.5 }}
                  />
                )}
                <Icon
                  size={isActive ? 22 : 20}
                  className={cn(
                    'relative z-10 transition-all duration-300',
                    isActive
                      ? 'text-text-deep dark:text-white drop-shadow-sm'
                      : 'text-text-deep/40 dark:text-white/40 group-hover:text-text-deep/70 dark:group-hover:text-white/70'
                  )}
                />
                <span className={cn(
                  'text-[9px] font-bold relative z-10 transition-colors duration-300 tracking-wide',
                  isActive
                    ? 'text-text-deep dark:text-white'
                    : 'text-text-deep/40 dark:text-white/40 group-hover:text-text-deep/60 dark:group-hover:text-white/70'
                )}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
