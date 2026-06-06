'use client';

import { motion } from 'framer-motion';

interface ProgressBarProps {
  progress: number; // 0 to 100
  label?: string;
}

export default function ProgressBar({ progress, label }: ProgressBarProps) {
  return (
    <div className="w-full mt-4">
      {label && (
        <div className="flex justify-between mb-1.5">
          <span className="text-sm font-medium text-brand-text/90">{label}</span>
          <span className="text-sm font-semibold text-brand-yellow">{progress.toFixed(1)}%</span>
        </div>
      )}
      <div className="w-full bg-brand-black/60 rounded-full h-2.5 overflow-hidden border border-brand-purple/20">
        <motion.div
          className="h-2.5 rounded-full bg-gradient-to-r from-brand-yellow via-brand-purple to-fuchsia-500 animate-progress-flow"
          style={{ boxShadow: '0 0 10px rgba(168, 85, 247, 0.4)' }}
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}

