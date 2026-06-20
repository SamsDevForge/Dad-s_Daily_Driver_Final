import { useEffect, useState } from 'react';
import { Search, FileText, Image as ImageIcon, Upload, FileBox, Plus, X, Lock } from 'lucide-react';
import { getDocuments, saveDocument } from '../services/documentService';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

function DocumentCard({ doc }) {
  const isPdf = doc.type?.toLowerCase() === 'pdf';
  const Icon = isPdf ? FileText : ImageIcon;
  const canOpen = Boolean(doc.url);

  const handleOpen = () => {
    if (!canOpen) return;
    const newWindow = window.open();
    if (newWindow) {
      newWindow.document.title = doc.name;
      if (isPdf) {
        newWindow.location.href = doc.url;
      } else {
        newWindow.document.body.style.margin = '0';
        newWindow.document.body.style.background = '#111827';
        newWindow.document.body.innerHTML = `<img src="${doc.url}" alt="${doc.name}" style="max-width:100%;height:auto;display:block;margin:0 auto;" />`;
      }
      return;
    }
    window.location.href = doc.url;
  };

  return (
    <button
      type="button"
      onClick={handleOpen}
      disabled={!canOpen}
      className={cn(
        "premium-card p-4 flex items-center justify-between group hover:shadow-premium transition-all border border-gray-50/50 dark:bg-gray-800 dark:border-gray-700 text-left w-full",
        canOpen ? "cursor-pointer" : "cursor-default opacity-80"
      )}
    >
      <div className="flex items-center gap-4">
        <div className={cn(
          "h-14 w-12 rounded-lg flex items-center justify-center shadow-sm relative overflow-hidden",
          isPdf ? "bg-red-50 dark:bg-red-900/30 text-red-500 dark:text-red-400" : "bg-blue-50 dark:bg-blue-900/30 text-blue-500 dark:text-blue-400"
        )}>
          {/* Folded corner effect for document */}
          <div className="absolute top-0 right-0 border-b-[12px] border-l-[12px] border-b-gray-200 dark:border-b-gray-600 border-l-transparent border-t-transparent border-r-transparent bg-white dark:bg-gray-800 w-3 h-3 z-10"></div>
          <Icon size={20} />
        </div>
        <div className="flex flex-col">
          <span className="text-base font-bold text-text-deep dark:text-white leading-tight">
            {doc.name}
          </span>
          <span className="text-xs font-semibold text-text-muted mt-1 flex items-center gap-1.5">
            <span className="px-1.5 py-0.5 rounded text-[9px] uppercase tracking-wider bg-gray-100 dark:bg-gray-700">{doc.category}</span>
            {new Date(doc.uploadDate).toLocaleDateString()}
          </span>
        </div>
      </div>
      <span className={cn(
        "text-xs font-bold px-3 py-1.5 rounded-full",
        canOpen ? "bg-primary/10 text-primary" : "bg-gray-100 dark:bg-gray-700 text-text-muted dark:text-gray-400"
      )}>
        {canOpen ? 'Open' : 'No file'}
      </span>
    </button>
  );
}

export default function DocumentVault({ className }) {
  const [documents, setDocuments] = useState([]);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category: 'Identity',
    tags: '',
    description: '',
    file: null,
  });

  useEffect(() => {
    getDocuments().then(setDocuments);
  }, []);

  const filteredDocs = documents.filter(d => 
    d.name.toLowerCase().includes(search.toLowerCase()) || 
    d.category.toLowerCase().includes(search.toLowerCase()) ||
    d.description?.toLowerCase().includes(search.toLowerCase()) ||
    d.tags?.join(' ').toLowerCase().includes(search.toLowerCase())
  );

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.name) return;

    const payload = new FormData();
    payload.append('name', formData.name);
    payload.append('category', formData.category);
    payload.append('tags', formData.tags);
    payload.append('description', formData.description);
    if (formData.file) payload.append('file', formData.file);

    await saveDocument(payload);
    setDocuments(await getDocuments());
    setFormData({ name: '', category: 'Identity', tags: '', description: '', file: null });
    setIsModalOpen(false);
  };

  return (
    <div className={cn("px-4 py-2 flex flex-col overflow-hidden", className)}>
      <div className="flex items-center justify-between mb-4 shrink-0 px-2 mt-2">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-text-deep dark:text-white">
            <Lock size={20} />
          </div>
          <h2 className="text-xl font-bold tracking-tight text-text-deep dark:text-white">
            Secure Vault
          </h2>
        </div>
      </div>

      <div className="relative shrink-0 px-2 mb-4">
        <div className="absolute inset-y-0 left-2 pl-4 flex items-center pointer-events-none">
          <Search size={18} className="text-text-muted" />
        </div>
        <input 
          type="text" 
          placeholder="Search Aadhaar, reports..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full h-14 pl-12 pr-4 rounded-2xl bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700 focus:ring-2 focus:ring-primary outline-none transition-all text-text-deep dark:text-white font-medium placeholder:text-gray-400 dark:placeholder:text-gray-500"
        />
      </div>

      <div className="flex-1 overflow-y-auto px-2 pb-24 flex flex-col gap-3 relative">
        {filteredDocs.length > 0 ? (
          filteredDocs.map((doc, i) => (
            <motion.div
              key={doc.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <DocumentCard doc={doc} />
            </motion.div>
          ))
        ) : (
          <div className="py-12 text-center flex flex-col items-center justify-center">
            <FileBox className="text-gray-300 mb-4" size={48} />
            <p className="text-text-muted font-medium">No documents found.</p>
          </div>
        )}

        {/* Floating Action Button */}
        <button 
          onClick={() => setIsModalOpen(true)}
          className="absolute bottom-6 right-2 h-14 w-14 rounded-full bg-text-deep text-white flex items-center justify-center shadow-lg shadow-text-deep/40 hover:scale-105 transition-transform z-10"
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
                 <h3 className="text-xl font-bold text-text-deep dark:text-white">Upload Document</h3>
                 <button onClick={() => setIsModalOpen(false)} className="p-2 text-text-muted hover:text-text-deep dark:hover:text-white bg-gray-50 dark:bg-gray-800 rounded-full">
                   <X size={18} />
                 </button>
               </div>
               
               <form onSubmit={handleSave} className="flex flex-col gap-4">
                 <label className="h-40 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex flex-col items-center justify-center text-text-muted dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:border-primary/50 transition-colors cursor-pointer">
                   <Upload size={32} className="mb-3 text-gray-400" />
                   <span className="font-bold">{formData.file ? formData.file.name : 'Tap to browse files'}</span>
                   <span className="text-xs mt-1">PDF, JPG, PNG</span>
                   <input type="file" accept=".pdf,image/*" className="hidden" onChange={e => setFormData({...formData, file: e.target.files?.[0] || null})} />
                 </label>

                 <div>
                   <label className="form-label text-xs font-bold uppercase tracking-wider mb-2 block ml-1">Document Name</label>
                   <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} type="text" className="form-control w-full h-14 px-5 rounded-2xl border-none focus:ring-2 focus:ring-primary outline-none transition-all font-medium" />
                 </div>
                 <div>
                   <label className="form-label text-xs font-bold uppercase tracking-wider mb-2 block ml-1">Category</label>
                   <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="form-control w-full h-14 px-5 rounded-2xl border-none focus:ring-2 focus:ring-primary outline-none transition-all font-medium">
                     <option>Identity</option>
                     <option>Insurance</option>
                     <option>Medical</option>
                     <option>Vehicle</option>
                     <option>Bills</option>
                     <option>Other</option>
                   </select>
                 </div>
                 <div>
                   <label className="form-label text-xs font-bold uppercase tracking-wider mb-2 block ml-1">Tags</label>
                   <input value={formData.tags} onChange={e => setFormData({...formData, tags: e.target.value})} type="text" className="form-control w-full h-14 px-5 rounded-2xl border-none focus:ring-2 focus:ring-primary outline-none transition-all font-medium" />
                 </div>
                 <div>
                   <label className="form-label text-xs font-bold uppercase tracking-wider mb-2 block ml-1">Description</label>
                   <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="form-control w-full p-5 rounded-2xl border-none focus:ring-2 focus:ring-primary outline-none transition-all font-medium resize-none h-24" />
                 </div>
                 <button type="submit" className="w-full h-14 rounded-2xl bg-text-deep text-white font-bold hover:bg-opacity-90 transition-colors shadow-lg shadow-text-deep/20 text-lg">
                   Save Document
                 </button>
               </form>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
