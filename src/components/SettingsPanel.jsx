import { useState } from 'react';
import { User, MapPin, Globe, Download, Phone, Moon, Sun, RefreshCw, X } from 'lucide-react';
import { cn } from '../lib/utils';
import { AnimatePresence, motion } from 'framer-motion';
import { getSetup, uploadProfilePhoto } from '../services/setupService';
import { usePwaInstall } from '../hooks/usePwaInstall';

export default function SettingsPanel({ isDark, setIsDark, onRedo, className }) {
  const [setup, setSetup] = useState(() => getSetup() || {});
  const { canInstall, isInstalled, install } = usePwaInstall();
  const [showInstallHelp, setShowInstallHelp] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const handleInstall = async () => {
    if (isInstalled) return;
    if (canInstall) {
      await install();
      return;
    }
    setShowInstallHelp(true);
  };

  const handlePhotoUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingPhoto(true);
    try {
      const saved = await uploadProfilePhoto(file);
      setSetup(saved);
    } finally {
      setUploadingPhoto(false);
      event.target.value = '';
    }
  };

  return (
    <div className={cn("mx-auto w-full max-w-3xl px-4 py-2 md:px-6 lg:px-8 flex flex-col overflow-hidden", className)}>
      <div className="flex-1 overflow-y-auto px-2 pb-6 flex flex-col gap-6">

        {/* Profile card */}
        <div>
          <h2 className="text-lg font-bold tracking-tight text-text-deep dark:text-white mb-4 mt-2">
            Profile & Settings
          </h2>
          <div className="premium-card p-4 flex items-center gap-4 dark:bg-gray-800 dark:shadow-none">
            <label className="relative h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-primary overflow-hidden cursor-pointer ring-2 ring-primary/10 hover:ring-primary/40 transition-all shrink-0">
              {setup.profilePhotoUrl ? (
                <img src={setup.profilePhotoUrl} alt="Dad" className="h-full w-full object-cover" />
              ) : (
                <User size={32} />
              )}
              <span className="absolute inset-x-0 bottom-0 bg-text-deep/70 text-white text-[9px] font-black text-center py-1">
                {uploadingPhoto ? '...' : 'Edit'}
              </span>
              <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
            </label>
            <div className="flex flex-col">
              <span className="text-lg font-bold text-text-deep dark:text-white">Dad</span>
              <span className="text-xs font-bold text-rose-500 dark:text-rose-300 tracking-wide font-serif">
                Made for you with love <span aria-hidden="true">♥</span>
              </span>
            </div>
          </div>
        </div>

        {/* Appearance — Dark Mode toggle */}
        <div className="flex flex-col gap-3">
          <h3 className="text-xs font-bold tracking-wider uppercase text-text-muted dark:text-gray-500 ml-2">Appearance</h3>
          <div className="premium-card overflow-hidden dark:bg-gray-800 dark:shadow-none">
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "p-2 rounded-xl transition-colors",
                  isDark ? "bg-indigo-950 text-indigo-300" : "bg-amber-50 text-amber-500"
                )}>
                  {isDark ? <Moon size={18} /> : <Sun size={18} />}
                </div>
                <div className="flex flex-col">
                  <span className="font-semibold text-text-deep dark:text-white">
                    {isDark ? 'Dark Mode' : 'Light Mode'}
                  </span>
                  <span className="text-xs text-text-muted dark:text-gray-400 mt-0.5">
                    {isDark ? 'Easy on the eyes at night' : 'Warm & bright for daytime'}
                  </span>
                </div>
              </div>

              {/* Toggle pill */}
              <button
                onClick={() => setIsDark(!isDark)}
                className={cn(
                  "relative w-14 h-8 rounded-full transition-colors duration-300 focus:outline-none",
                  isDark ? "bg-indigo-600" : "bg-primary"
                )}
                aria-label="Toggle dark mode"
              >
                <motion.div
                  layout
                  transition={{ type: "spring", stiffness: 600, damping: 35 }}
                  className={cn(
                    "absolute top-1 w-6 h-6 rounded-full bg-white shadow-md",
                    isDark ? "left-7" : "left-1"
                  )}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Preferences */}
        <div className="flex flex-col gap-3">
          <h3 className="text-xs font-bold tracking-wider uppercase text-text-muted dark:text-gray-500 ml-2">Preferences</h3>
          <div className="premium-card overflow-hidden divide-y divide-gray-100 dark:divide-gray-700 dark:bg-gray-800 dark:shadow-none">
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-gray-50 dark:bg-gray-700 text-text-muted dark:text-gray-400">
                  <MapPin size={18} />
                </div>
                <span className="font-semibold text-text-deep dark:text-white">City</span>
              </div>
              <span className="text-text-muted dark:text-gray-400 font-medium text-sm">{setup.city || 'Pune'}</span>
            </div>
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-gray-50 dark:bg-gray-700 text-text-muted dark:text-gray-400">
                  <Globe size={18} />
                </div>
                <span className="font-semibold text-text-deep dark:text-white">Language</span>
              </div>
              <span className="text-text-muted dark:text-gray-400 font-medium text-sm">{setup.language || 'English'}</span>
            </div>
          </div>
        </div>

        {/* Emergency contact — from setup */}
        <div className="flex flex-col gap-3">
          <h3 className="text-xs font-bold tracking-wider uppercase text-text-muted dark:text-gray-500 ml-2">Emergency</h3>
          <div className="premium-card p-4 flex items-center justify-between border-l-4 border-alert dark:bg-gray-800 dark:shadow-none">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-orange-50 dark:bg-orange-950/40 text-alert">
                <Phone size={18} />
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-text-deep dark:text-white">{setup.sonName || 'Son'}'s Number</span>
                <span className="text-xs text-text-muted dark:text-gray-400">{setup.sonPhone || 'Not set yet'}</span>
              </div>
            </div>
            {setup.sonPhone && (
              <a href={`tel:${setup.sonPhone}`} className="px-3 py-1.5 rounded-full bg-orange-50 dark:bg-orange-950/40 text-alert font-bold text-xs hover:bg-orange-100 transition-colors">
                Call
              </a>
            )}
          </div>

          {/* Re-do setup */}
          {onRedo && (
            <button
              onClick={onRedo}
              className="premium-card p-4 flex items-center gap-3 dark:bg-gray-800 dark:shadow-none w-full text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <div className="p-2 rounded-xl bg-gray-100 dark:bg-gray-700 text-text-muted dark:text-gray-400">
                <RefreshCw size={18} />
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-text-deep dark:text-white">Update Preferences</span>
                <span className="text-xs text-text-muted dark:text-gray-400">Change location, news topics, or contact</span>
              </div>
            </button>
          )}
        </div>

        {/* Install */}
        <div className="mt-2 mb-8">
          <button
            onClick={handleInstall}
            disabled={isInstalled}
            className={cn(
              "w-full flex items-center justify-center gap-2 h-14 rounded-[20px] premium-card font-bold text-text-deep dark:text-white dark:bg-gray-800 dark:shadow-none transition-all border border-gray-100 dark:border-gray-700",
              !isInstalled ? "hover:bg-gray-50 dark:hover:bg-gray-700" : "opacity-70"
            )}
          >
            <Download size={20} /> {isInstalled ? 'Installed' : 'Install App to Home Screen'}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showInstallHelp && (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-text-deep/40 backdrop-blur-sm md:items-center">
            <motion.div
              initial={{ opacity: 0, y: "100%" }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: "100%" }}
              transition={{ type: "spring", bounce: 0, duration: 0.35 }}
              className="modal-sheet w-full max-w-md rounded-t-[32px] md:rounded-[32px] p-6 shadow-2xl border-t md:border border-gray-100 dark:border-gray-700"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-text-deep dark:text-white">Install App</h3>
                <button onClick={() => setShowInstallHelp(false)} className="p-2 text-text-muted hover:text-text-deep dark:hover:text-white bg-gray-50 dark:bg-gray-800 rounded-full">
                  <X size={18} />
                </button>
              </div>
              <div className="flex flex-col gap-3 text-sm font-semibold text-text-muted dark:text-gray-300 leading-relaxed">
                <p>On Android Chrome, use the browser install prompt when it appears.</p>
                <p>On iPhone Safari, use Share, then Add to Home Screen.</p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
