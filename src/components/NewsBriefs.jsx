import { useEffect, useState } from 'react';
import { ChevronDown, ChevronUp, Newspaper } from 'lucide-react';
import { getNews } from '../services/newsService';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

const getImageForCategory = (category) => {
  const map = {
    'India':    'https://images.unsplash.com/photo-1580757468214-c73f7062a5cb?w=400&h=200&fit=crop&q=80',
    'Business': 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&h=200&fit=crop&q=80',
    'Health':   'https://images.unsplash.com/photo-1505576399279-565b52d4ac71?w=400&h=200&fit=crop&q=80',
    'Local':    'https://images.unsplash.com/photo-1567446537708-ac4aa75c9c28?w=400&h=200&fit=crop&q=80',
  };
  return map[category] || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=400&h=200&fit=crop&q=80';
};

function NewsCard({ news }) {
  const [expanded, setExpanded] = useState(false);
  const hasExtraText = news.fullText && news.fullText !== news.summary;

  return (
    <div className="premium-card flex flex-col group relative overflow-hidden transition-all duration-300 dark:bg-gray-800 dark:border-gray-700">
      <div className="h-40 w-full overflow-hidden relative">
        <img src={news.imageUrl || getImageForCategory(news.category)} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
        <div className="absolute bottom-3 left-3 flex justify-between items-center w-[calc(100%-24px)]">
          <span className="px-3 py-1 rounded-full text-xs font-bold tracking-wider text-white bg-black/30 backdrop-blur-md border border-white/20">
            {news.category}
          </span>
          <span className="text-xs font-semibold text-white/90 drop-shadow-md">
            {news.date}
          </span>
        </div>
      </div>
      
      <div className="p-5 flex flex-col gap-3">
        <h3 className="text-lg font-bold leading-snug text-text-deep dark:text-white">
          {news.headline}
        </h3>
        
        <p className={cn(
          "text-sm text-text-muted dark:text-gray-400",
          !expanded && "line-clamp-2"
        )}>
          {news.summary}
        </p>

        <AnimatePresence>
          {expanded && hasExtraText && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <p className="text-sm text-text-deep dark:text-gray-300 font-medium mt-2 pt-3 border-t border-gray-100 dark:border-gray-700">
                {news.fullText}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-1 flex items-center justify-center gap-1.5 w-full py-2 rounded-xl bg-gray-50 dark:bg-indigo-500/10 hover:bg-gray-100 dark:hover:bg-indigo-500/20 text-sm font-bold text-primary dark:text-indigo-300 transition-colors"
        >
          {expanded ? (
            <>Read Less <ChevronUp size={16} /></>
          ) : (
            <>Read Full News <ChevronDown size={16} /></>
          )}
        </button>
      </div>
    </div>
  );
}

export default function NewsBriefs({ className }) {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getNews().then(data => {
      setNews(data);
      setLoading(false);
    });
  }, []);

  return (
    <div className={cn("px-4 py-2 flex flex-col overflow-hidden", className)}>
      <div className="flex items-center gap-2 mb-4 shrink-0 px-2 mt-2">
        <div className="p-2 rounded-xl bg-primary/10 text-primary">
           <Newspaper size={20} />
        </div>
        <h2 className="text-xl font-bold tracking-tight text-text-deep dark:text-white">
          Discover
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide px-2 pb-6 flex flex-col gap-6">
        {loading ? (
          <div className="grid grid-cols-1 gap-6">
            {[1, 2].map(i => (
              <div key={i} className="h-64 premium-card rounded-2xl animate-pulse bg-gray-200 dark:bg-gray-800" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {news.map((item, i) => (
              <motion.div 
                key={item.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <NewsCard news={item} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
