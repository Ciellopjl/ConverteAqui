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

export default function HistoryList({ items }: HistoryListProps) {
  if (items.length === 0) return null;

  return (
    <div className="w-full max-w-2xl mx-auto mt-12">
      <h2 className="text-xl font-bold mb-4 text-ciello-yellow flex items-center gap-2">
        <Music className="w-5 h-5" />
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
              transition={{ delay: index * 0.1 }}
              className="glass-panel rounded-xl p-4 flex items-center justify-between group"
            >
              <div className="flex-1 pr-4">
                <p className="font-medium text-white truncate" title={item.title}>
                  {item.title}
                </p>
                <p className="text-xs text-ciello-text-muted mt-1">
                  MP3 • {item.quality} kbps
                </p>
              </div>
              
              <div className="w-10 h-10 rounded-full bg-[rgba(255,215,0,0.1)] text-ciello-yellow flex items-center justify-center group-hover:bg-ciello-yellow group-hover:text-black transition-colors shrink-0">
                <Download className="w-5 h-5" />
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
