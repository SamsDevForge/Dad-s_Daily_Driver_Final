import { useEffect, useState } from 'react';
import { Plus, X, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { getMedicines, saveMedicine, toggleMedicineStatus } from '../services/medicineService';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

function MedicineCard({ medicine, onToggle }) {
  const isTaken = medicine.status === 'Taken';
  const isMissed = medicine.status === 'Missed';
  const medImage = medicine.imageUrl || "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=150&h=150&fit=crop&q=80";

  return (
    <div className={cn(
      "premium-card p-4 flex items-center justify-between transition-all duration-300 border-l-4",
      isTaken && "opacity-60 border-success bg-gray-50 dark:bg-gray-800 shadow-none",
      isMissed && "border-rose-500",
      !isTaken && !isMissed && "border-alert"
    )}>
      <div className="flex items-center gap-4">
        <img src={medImage} alt="" className={cn("h-14 w-14 rounded-2xl object-cover shadow-sm", (isTaken || isMissed) && "grayscale")} />
        <div className="flex flex-col">
          <span className={cn(
            "text-lg font-bold tracking-tight",
            isTaken ? "text-text-muted dark:text-gray-500 line-through" : "text-text-deep dark:text-white"
          )}>
            {medicine.alias}
          </span>
          <span className="text-sm font-medium text-text-muted dark:text-gray-400">
            {medicine.name}
          </span>
          <div className="flex items-center gap-2 mt-1">
            <span className={cn(
              "px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wider uppercase",
              isTaken && "bg-success/10 text-success",
              isMissed && "bg-rose-500/10 text-rose-500 dark:text-rose-300",
              !isTaken && !isMissed && "bg-alert/10 text-alert"
            )}>
              {isTaken ? 'Taken' : isMissed ? 'Missed' : 'Due'}
            </span>
            <span className="text-xs font-semibold text-text-muted dark:text-gray-400 flex items-center gap-1">
              <Clock size={12} /> {medicine.time}
            </span>
          </div>
        </div>
      </div>
      
      <button 
        onClick={() => onToggle(medicine.id)}
        className={cn(
          "h-12 w-12 rounded-full flex items-center justify-center transition-all active:scale-95 shadow-sm",
          isTaken 
            ? "bg-success/10 text-success hover:bg-success/20" 
            : isMissed
              ? "bg-rose-500 text-white hover:bg-rose-600 shadow-rose-500/30"
              : "bg-primary text-white hover:bg-primary/90 shadow-primary/30"
        )}
      >
        {isTaken ? <CheckCircle2 size={24} /> : <div className="h-4 w-4 rounded-full border-2 border-white"></div>}
      </button>
    </div>
  );
}

export default function MedicineManager({ className }) {
  const [medicines, setMedicines] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    alias: '',
    name: '',
    description: '',
    time: '09:00',
    category: 'BP',
    image: null,
  });

  const fetchMedicines = async () => {
    const data = await getMedicines();
    setMedicines([...data].sort((a, b) => a.time.localeCompare(b.time)));
  };

  useEffect(() => {
    getMedicines().then(data => {
      setMedicines([...data].sort((a, b) => a.time.localeCompare(b.time)));
    });
  }, []);

  const handleToggle = async (id) => {
    await toggleMedicineStatus(id);
    fetchMedicines();
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.alias || !formData.time) return;

    const payload = new FormData();
    payload.append('alias', formData.alias);
    payload.append('name', formData.name);
    payload.append('description', formData.description);
    payload.append('time', formData.time);
    payload.append('category', formData.category);
    payload.append('status', 'Pending');
    if (formData.image) payload.append('image', formData.image);

    await saveMedicine(payload);
    setFormData({ alias: '', name: '', description: '', time: '09:00', category: 'BP', image: null });
    setIsModalOpen(false);
    fetchMedicines();
  };

  return (
    <div className={cn("px-4 py-2 flex flex-col overflow-hidden", className)}>
      <div className="flex items-center justify-between mb-4 shrink-0 px-2 mt-2">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-success/10 text-success">
            <AlertCircle size={20} />
          </div>
          <h2 className="text-xl font-bold tracking-tight text-text-deep dark:text-white">
            Health Records
          </h2>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-2 pb-24 flex flex-col gap-4 relative">
        {medicines.length === 0 && (
          <div className="py-12 text-center flex flex-col items-center justify-center">
            <AlertCircle className="text-gray-300 mb-3" size={40} />
            <p className="text-text-muted dark:text-gray-400 font-medium">No medicines added yet.</p>
          </div>
        )}

        {medicines.map((med, i) => (
          <motion.div
            key={med.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <MedicineCard medicine={med} onToggle={handleToggle} />
          </motion.div>
        ))}
        
        <button 
          onClick={() => setIsModalOpen(true)}
          className="absolute bottom-6 right-2 h-14 w-14 rounded-full bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/40 hover:scale-105 transition-transform z-10"
        >
          <Plus size={24} />
        </button>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-text-deep/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, y: "100%" }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: "100%" }}
              transition={{ type: "spring", bounce: 0, duration: 0.4 }}
              className="modal-sheet w-full max-w-md rounded-t-[32px] p-6 shadow-2xl border-t border-gray-100 dark:border-gray-700 max-h-[90vh] overflow-y-auto pb-safe"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-text-deep dark:text-white">New Medicine</h3>
                <button onClick={() => setIsModalOpen(false)} className="p-2 text-text-muted hover:text-text-deep dark:hover:text-white bg-gray-50 dark:bg-gray-800 rounded-full">
                  <X size={18} />
                </button>
              </div>
              
              <form onSubmit={handleSave} className="flex flex-col gap-5">
                <div>
                  <label className="form-label text-xs font-bold uppercase tracking-wider mb-2 block ml-1">Alias / Nickname</label>
                  <input required value={formData.alias} onChange={e => setFormData({...formData, alias: e.target.value})} type="text" className="form-control w-full h-14 px-5 rounded-2xl border-none focus:ring-2 focus:ring-primary outline-none transition-all font-medium" />
                </div>
                <div>
                  <label className="form-label text-xs font-bold uppercase tracking-wider mb-2 block ml-1">Actual Name</label>
                  <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} type="text" className="form-control w-full h-14 px-5 rounded-2xl border-none focus:ring-2 focus:ring-primary outline-none transition-all font-medium" />
                </div>
                <div>
                  <label className="form-label text-xs font-bold uppercase tracking-wider mb-2 block ml-1">Description</label>
                  <input value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} type="text" className="form-control w-full h-14 px-5 rounded-2xl border-none focus:ring-2 focus:ring-primary outline-none transition-all font-medium" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="form-label text-xs font-bold uppercase tracking-wider mb-2 block ml-1">Time</label>
                    <input required value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})} type="time" className="form-control w-full h-14 px-5 rounded-2xl border-none focus:ring-2 focus:ring-primary outline-none transition-all font-medium" />
                  </div>
                  <div>
                    <label className="form-label text-xs font-bold uppercase tracking-wider mb-2 block ml-1">Category</label>
                    <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="form-control w-full h-14 px-5 rounded-2xl border-none focus:ring-2 focus:ring-primary outline-none transition-all font-medium appearance-none">
                      <option>BP</option>
                      <option>Diabetes</option>
                      <option>Heart</option>
                      <option>Custom</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="form-label text-xs font-bold uppercase tracking-wider mb-2 block ml-1">Image</label>
                  <input onChange={e => setFormData({...formData, image: e.target.files?.[0] || null})} type="file" accept="image/*" className="form-control w-full px-5 py-4 rounded-2xl border-none focus:ring-2 focus:ring-primary outline-none transition-all font-medium" />
                </div>
                <button 
                  type="submit"
                  className="w-full h-14 mt-4 rounded-2xl bg-secondary text-white font-bold hover:bg-opacity-90 transition-colors shadow-lg shadow-secondary/20 text-lg"
                >
                  Save to Records
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
