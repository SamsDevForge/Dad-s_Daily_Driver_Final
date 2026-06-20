import { Home, Newspaper, Activity, FileBox, Settings, Calendar } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion } from 'framer-motion';

const navItems = [
  { id: 'home',      icon: Home,      label: 'Home' },
  { id: 'news',      icon: Newspaper, label: 'News' },
  { id: 'medicines', icon: Activity,  label: 'Health' },
  { id: 'events',    icon: Calendar,  label: 'Events' },
  { id: 'documents', icon: FileBox,   label: 'Vault' },
  { id: 'settings',  icon: Settings,  label: 'Settings' },
];

export default function Sidebar({ activeTab, setActiveTab, className }) {
  return (
    <div className={cn(
      "hidden md:flex flex-col w-64 h-screen border-r border-gray-100 bg-surface p-6 shadow-sm",
      className
    )}>
      {/* App identity */}
      <div className="flex items-center gap-3 mb-12">
        <img
          src="/logo-icon.png"
          alt="Dad's Daily Driver"
          className="h-12 w-12 rounded-2xl object-cover shadow-sm"
        />
        <img
          src="/logo-full.png"
          alt="Dad's Daily Driver"
          className="h-12 w-auto max-w-[150px] object-contain"
        />
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-1 flex-1">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "relative flex items-center gap-3 px-4 py-3 rounded-2xl outline-none text-left transition-all",
                isActive
                  ? "text-primary font-bold"
                  : "text-text-muted hover:bg-app-bg font-medium"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="sidebar-bubble"
                  className="absolute inset-0 bg-primary/8 rounded-2xl"
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }}
                />
              )}
              <Icon size={20} className="relative z-10" />
              <span className="text-sm relative z-10">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Footer status */}
      <div className="mt-auto">
        <div className="p-4 rounded-2xl bg-secondary/8 border border-secondary/10">
          <p className="text-xs font-bold text-secondary/70 mb-0.5 uppercase tracking-wider">Status</p>
          <p className="text-sm font-semibold text-text-deep">All systems operational.</p>
        </div>
      </div>
    </div>
  );
}
