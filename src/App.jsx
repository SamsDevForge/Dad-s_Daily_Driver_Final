import { useEffect, useState } from 'react';
import Header from './components/Header';
import AlertStrip from './components/AlertStrip';
import WeatherOverview from './components/WeatherOverview';
import NewsBriefs from './components/NewsBriefs';
import MedicineManager from './components/MedicineManager';
import EventsManager from './components/EventsManager';
import DocumentVault from './components/DocumentVault';
import BottomNav from './components/BottomNav';
import Sidebar from './components/Sidebar';
import SettingsPanel from './components/SettingsPanel';
import SetupWizard from './components/SetupWizard';
import { useDarkMode } from './hooks/useDarkMode';
import { fetchSetup, isSetupComplete } from './services/setupService';
import { startAlertNotifications, stopAlertNotifications } from './services/notificationService';
import { motion, AnimatePresence } from 'framer-motion';

function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [isDark, setIsDark] = useDarkMode();
  const [setupDone, setSetupDone] = useState(() => isSetupComplete());
  const [setupChecked, setSetupChecked] = useState(() => isSetupComplete());

  useEffect(() => {
    let mounted = true;
    fetchSetup().then((setup) => {
      if (!mounted) return;
      setSetupDone(Boolean(setup?.sonPhone && setup?.city));
      setSetupChecked(true);
    });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!setupDone) return undefined;
    startAlertNotifications();
    return stopAlertNotifications;
  }, [setupDone]);

  if (!setupChecked) {
    return <div className="min-h-screen bg-app-bg dark:bg-gray-950" />;
  }

  if (!setupDone) {
    return <SetupWizard onComplete={() => setSetupDone(true)} />;
  }

  return (
    <div className="min-h-screen flex bg-app-bg">
      {/* Desktop sidebar */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="flex-1 flex flex-col relative h-screen overflow-hidden bg-app-bg dark:bg-gray-950">
        <div className="flex-1 overflow-hidden pb-28 md:pb-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="h-full flex flex-col overflow-hidden"
            >
              {activeTab === 'home' && (
                <div className="h-full flex flex-col overflow-y-auto scrollbar-hide">
                  <div className="mx-auto flex w-full max-w-6xl flex-col md:px-2 lg:px-6">
                  {/* Morning dashboard hero */}
                  <Header className="shrink-0 md:pt-8" />
                  {/* Alert pills */}
                  <AlertStrip className="shrink-0 mb-2" />
                  {/* Premium weather card */}
                  <WeatherOverview className="mb-4 shrink-0" />
                  {/* Daily tip */}
                  <div className="px-4 mb-28 md:mb-8 shrink-0">
                    <div className="premium-card p-5 flex items-center gap-4 dark:bg-gray-800 md:p-6">
                      <div className="h-10 w-10 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary text-xl shrink-0">
                        💧
                      </div>
                      <div className="flex flex-col">
                        <h3 className="text-sm font-bold text-text-deep dark:text-white">Daily Tip</h3>
                        <p className="text-text-muted dark:text-gray-400 text-xs font-medium mt-0.5 md:text-sm">
                          Staying hydrated matters. Keep a water bottle within reach today.
                        </p>
                      </div>
                    </div>
                  </div>
                  </div>
                </div>
              )}
              {activeTab === 'news'      && <NewsBriefs    className="h-full" />}
              {activeTab === 'medicines' && <MedicineManager className="h-full" />}
              {activeTab === 'events'    && <EventsManager  className="h-full" />}
              {activeTab === 'documents' && <DocumentVault  className="h-full" />}
              {activeTab === 'settings'  && <SettingsPanel isDark={isDark} setIsDark={setIsDark} onRedo={() => setSetupDone(false)} className="h-full overflow-y-auto" />}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Floating pill nav */}
        <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
      </main>
    </div>
  );
}

export default App;
