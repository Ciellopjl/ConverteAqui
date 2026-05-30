'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import ProgressBar from './ProgressBar';

interface VideoCardProps {
  title: string;
  thumbnail: string;
  duration: number;
  progress: number;
  status: 'pending' | 'downloading' | 'converting' | 'completed' | 'error';
  error?: string;
}

export default function VideoCard({ title, thumbnail, duration, progress, status, error }: VideoCardProps) {
  const formatDuration = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="glass-panel rounded-2xl p-4 mt-6 flex flex-col md:flex-row gap-4 items-center max-w-2xl w-full mx-auto relative overflow-hidden"
    >
      <div className="relative w-full md:w-48 h-32 rounded-xl overflow-hidden shrink-0 border border-[rgba(255,215,0,0.2)]">
        <Image src={thumbnail} alt={title} fill className="object-cover" />
        <div className="absolute bottom-2 right-2 bg-black/80 px-2 py-1 rounded text-xs text-white">
          {formatDuration(duration)}
        </div>
      </div>
      
      <div className="flex-1 w-full flex flex-col justify-center">
        <h3 className="font-semibold text-lg line-clamp-2 text-white mb-2" title={title}>{title}</h3>
        
        {status === 'error' ? (
          <div className="text-red-400 text-sm">{error || 'Ocorreu um erro.'}</div>
        ) : status === 'completed' ? (
          <div className="text-ciello-yellow text-sm font-medium flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
            Download concluído!
          </div>
        ) : (
          <ProgressBar 
            progress={progress} 
            label={status === 'converting' ? 'Convertendo para MP3...' : 'Baixando...'} 
          />
        )}
      </div>
    </motion.div>
  );
}
