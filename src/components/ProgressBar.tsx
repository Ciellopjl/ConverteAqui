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
        <div className="flex justify-between mb-1">
          <span className="text-sm font-medium text-ciello-text">{label}</span>
          <span className="text-sm font-medium text-ciello-yellow">{progress.toFixed(1)}%</span>
        </div>
      )}
      <div className="w-full bg-[#111] rounded-full h-2.5 overflow-hidden border border-[rgba(255,215,0,0.1)]">
        <motion.div
          className="h-2.5 rounded-full"
          style={{ backgroundColor: 'var(--color-ciello-yellow)', boxShadow: '0 0 10px rgba(255,215,0,0.5)' }}
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}
