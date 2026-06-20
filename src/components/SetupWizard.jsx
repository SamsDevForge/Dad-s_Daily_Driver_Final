import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, MapPin, ChevronRight, ChevronLeft, CheckCircle2, User } from 'lucide-react';
import { saveSetup } from '../services/setupService';
import { cn } from '../lib/utils';

const NEWS_TOPICS = ['India', 'Business', 'Health', 'Local', 'Sports', 'Technology', 'Weather', 'Politics'];

const steps = [
  { id: 'welcome', title: "Welcome to Dad's Daily Driver", subtitle: "Let's set up a few things to personalize your experience." },
  { id: 'son',     title: "Son's Contact",              subtitle: "Add your son's phone number for quick access and emergency calls." },
  { id: 'location',title: "Your Location",              subtitle: "We'll show weather and local news for your city." },
  { id: 'news',    title: "News Preferences",           subtitle: "Pick the topics you want to see in your daily news." },
  { id: 'done',    title: "You're all set, Dad! 🎉",   subtitle: "Your dashboard is personalized and ready." },
];

export default function SetupWizard({ onComplete }) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    sonName: '',
    sonPhone: '',
    sonRelation: 'Son',
    city: 'Pune',
    newsTopics: ['India', 'Health'],
  });

  const current = steps[step];
  const isLast = step === steps.length - 1;
  const isFirst = step === 0;

  const toggleTopic = (t) => {
    setForm(f => ({
      ...f,
      newsTopics: f.newsTopics.includes(t)
        ? f.newsTopics.filter(x => x !== t)
        : [...f.newsTopics, t],
    }));
  };

  const handleFinish = async () => {
    await saveSetup(form);
    onComplete(form);
  };

  const next = () => {
    if (isLast) { handleFinish(); return; }
    setStep(s => s + 1);
  };

  const back = () => setStep(s => s - 1);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-app-bg dark:bg-gray-950 px-6">
      {/* Progress dots */}
      <div className="flex gap-2 mb-10">
        {steps.map((_, i) => (
          <div
            key={i}
            className={cn(
              "h-2 rounded-full transition-all duration-300",
              i === step ? "w-8 bg-primary" : i < step ? "w-2 bg-primary/40" : "w-2 bg-gray-200 dark:bg-gray-700"
            )}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -40 }}
          transition={{ duration: 0.25 }}
          className="w-full max-w-sm flex flex-col gap-6"
        >
          {/* Step title */}
          <div className="flex flex-col gap-1 text-center">
            <h1 className="text-2xl font-black text-text-deep dark:text-white leading-tight">
              {current.title}
            </h1>
            <p className="text-sm text-text-muted dark:text-gray-400 font-medium">
              {current.subtitle}
            </p>
          </div>

          {/* Step content */}
          {current.id === 'welcome' && (
            <div className="flex flex-col items-center gap-6 py-4">
              <img
                src="/logo-icon.png"
                alt="Dad's Daily Driver"
                className="h-24 w-24 rounded-[28px] object-cover shadow-premium"
              />
              <p className="text-center text-text-muted dark:text-gray-400 text-sm leading-relaxed">
                This app is your personal daily companion — weather, news, medicines, events, and documents all in one place.
              </p>
            </div>
          )}

          {current.id === 'son' && (
            <div className="flex flex-col gap-4">
              <div className="premium-card dark:bg-gray-800 p-1 overflow-hidden">
                <div className="flex items-center gap-4 px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                  <User size={18} className="text-text-muted shrink-0" />
                  <div className="flex-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-text-muted dark:text-gray-500 block mb-0.5">Son's Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Rahul"
                      value={form.sonName}
                      onChange={e => setForm(f => ({ ...f, sonName: e.target.value }))}
                      className="w-full bg-transparent outline-none font-semibold text-text-deep dark:text-white text-base placeholder:text-gray-300 dark:placeholder:text-gray-600"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-4 px-4 py-3">
                  <Phone size={18} className="text-primary shrink-0" />
                  <div className="flex-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-text-muted dark:text-gray-500 block mb-0.5">Phone Number *</label>
                    <input
                      type="tel"
                      placeholder="+91 98765 43210"
                      value={form.sonPhone}
                      onChange={e => setForm(f => ({ ...f, sonPhone: e.target.value }))}
                      className="w-full bg-transparent outline-none font-semibold text-text-deep dark:text-white text-base placeholder:text-gray-300 dark:placeholder:text-gray-600"
                    />
                  </div>
                </div>
              </div>
              <p className="text-xs text-text-muted dark:text-gray-500 text-center">Used for emergency quick-call. Never shared.</p>
            </div>
          )}

          {current.id === 'location' && (
            <div className="flex flex-col gap-4">
              <div className="premium-card dark:bg-gray-800 overflow-hidden">
                <div className="flex items-center gap-4 px-4 py-4">
                  <MapPin size={18} className="text-secondary shrink-0" />
                  <div className="flex-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-text-muted dark:text-gray-500 block mb-0.5">Your City *</label>
                    <input
                      type="text"
                      placeholder="e.g. Pune"
                      value={form.city}
                      onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
                      className="w-full bg-transparent outline-none font-semibold text-text-deep dark:text-white text-base placeholder:text-gray-300 dark:placeholder:text-gray-600"
                    />
                  </div>
                </div>
              </div>
              <div className="flex gap-2 flex-wrap justify-center">
                {['Pune', 'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Kolkata'].map(c => (
                  <button
                    key={c}
                    onClick={() => setForm(f => ({ ...f, city: c }))}
                    className={cn(
                      "px-4 py-2 rounded-2xl text-sm font-bold transition-all",
                      form.city === c ? "bg-secondary text-white shadow-sm" : "bg-white dark:bg-gray-800 text-text-muted dark:text-gray-400 border border-gray-100 dark:border-gray-700"
                    )}
                  >
                    {c}
                  </button>
                ))}
              </div>
              <p className="text-xs text-text-muted dark:text-gray-500 text-center mt-4">Weather uses the city you choose here.</p>
            </div>
          )}

          {current.id === 'news' && (
            <div className="flex flex-col gap-4">
              <div className="flex flex-wrap gap-2 justify-center">
                {NEWS_TOPICS.map(t => {
                  const active = form.newsTopics.includes(t);
                  return (
                    <button
                      key={t}
                      onClick={() => toggleTopic(t)}
                      className={cn(
                        "px-4 py-2.5 rounded-2xl text-sm font-bold transition-all border",
                        active
                          ? "bg-primary text-white border-primary shadow-sm"
                          : "bg-white dark:bg-gray-800 text-text-muted dark:text-gray-400 border-gray-100 dark:border-gray-700 hover:border-primary/30"
                      )}
                    >
                      {t}
                    </button>
                  );
                })}
              </div>
              <p className="text-xs text-text-muted dark:text-gray-500 text-center">Select any that interest you. You can change this later.</p>
            </div>
          )}

          {current.id === 'done' && (
            <div className="flex flex-col items-center gap-4 py-4">
              <div className="h-20 w-20 rounded-full bg-success/10 flex items-center justify-center text-success">
                <CheckCircle2 size={48} />
              </div>
              <div className="setup-summary-card premium-card dark:bg-gray-800 p-4 w-full flex flex-col gap-3">
                {form.sonName && (
                  <div className="grid grid-cols-[auto,1fr] items-start gap-3 text-sm">
                    <span className="text-text-muted dark:text-gray-400">Son</span>
                    <span className="font-bold text-text-deep dark:text-white">{form.sonName} · {form.sonPhone}</span>
                  </div>
                )}
                <div className="grid grid-cols-[auto,1fr] items-start gap-3 text-sm">
                  <span className="text-text-muted dark:text-gray-400">City</span>
                  <span className="font-bold text-text-deep dark:text-white">{form.city}</span>
                </div>
                <div className="grid grid-cols-[auto,1fr] items-start gap-3 text-sm">
                  <span className="text-text-muted dark:text-gray-400">News Topics</span>
                  <span className="font-bold text-text-deep dark:text-white">{form.newsTopics.join(', ')}</span>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Navigation buttons */}
      <div className="flex gap-3 mt-10 w-full max-w-sm">
        {!isFirst && (
          <button
            onClick={back}
            className="flex-none h-14 w-14 rounded-2xl bg-white dark:bg-gray-800 text-text-muted dark:text-gray-400 flex items-center justify-center border border-gray-100 dark:border-gray-700 hover:bg-gray-50 transition-all"
          >
            <ChevronLeft size={22} />
          </button>
        )}
        <button
          onClick={next}
          className="flex-1 h-14 rounded-2xl bg-primary text-white font-bold text-base shadow-lg shadow-primary/25 flex items-center justify-center gap-2 hover:bg-primary/90 active:scale-95 transition-all"
        >
          {isLast ? "Let's Go!" : "Continue"}
          {!isLast && <ChevronRight size={20} />}
        </button>
      </div>
    </div>
  );
}
