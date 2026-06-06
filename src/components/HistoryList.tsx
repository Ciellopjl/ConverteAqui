'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Download, Music } from 'lucide-react';

interface HistoryItem {
  id: string;
  title: string;
  quality: string;
}

interface HistoryListProps {
  items: HistoryItem[];
}

const RENDER_BACKEND = 'https://ciello-upload.onrender.com';

const getApiUrl = (path: string): string => {
  if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    return path;
  }
  return `${RENDER_BACKEND}${path}`;
};

export default function HistoryList({ items }: HistoryListProps) {
  if (items.length === 0) return null;

  return (
    <div className="w-full max-w-2xl mx-auto mt-12 relative z-10">
      <h2 className="text-xl font-bold mb-4 text-brand-yellow flex items-center gap-2">
        <Music className="w-5 h-5 text-brand-yellow animate-pulse" />
        Downloads Recentes
      </h2>
      
      <div className="flex flex-col gap-3">
        <AnimatePresence>
          {items.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              whileHover={{ 
                x: 6, 
                borderColor: "rgba(168, 85, 247, 0.45)",
                boxShadow: "0 0 20px rgba(168, 85, 247, 0.15)"
              }}
              transition={{ 
                type: "spring", 
                stiffness: 400, 
                damping: 25,
                delay: index * 0.05 
              }}
              className="glass-panel rounded-xl p-4 flex items-center justify-between group border border-brand-purple/10 transition-all duration-300"
            >
              <div className="flex-1 pr-4">
                <p className="font-medium text-white truncate group-hover:text-brand-yellow transition-colors duration-300" title={item.title}>
                  {item.title}
                </p>
                <p className="text-xs text-brand-text-muted mt-1">
                  MP3 • {item.quality} kbps
                </p>
              </div>
              
              <a
                href={getApiUrl(`/api/download?taskId=${item.id}`)}
                download
                className="w-10 h-10 rounded-full bg-brand-purple/10 border border-brand-purple/20 text-brand-purple flex items-center justify-center hover:scale-105 group-hover:bg-brand-purple group-hover:text-white group-hover:shadow-[0_0_15px_rgba(168, 85, 247, 0.4)] transition-all duration-300 shrink-0 cursor-pointer"
                title="Baixar novamente"
              >
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                >
                  <Download className="w-5 h-5" />
                </motion.div>
              </a>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
