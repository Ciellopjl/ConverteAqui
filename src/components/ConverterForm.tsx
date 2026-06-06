'use client';

import { useState } from 'react';
import { Download, Loader2, Link2 } from 'lucide-react';
import { motion } from 'framer-motion';
import AudioWaveform from './AudioWaveform';
import BenefitBadges from './BenefitBadges';

interface ConverterFormProps {
  onSubmit: (url: string, quality: string, format: string) => void;
  isLoading: boolean;
  onUrlChange?: (url: string) => void;
}

export default function ConverterForm({ onSubmit, isLoading, onUrlChange }: ConverterFormProps) {
  const [url, setUrl] = useState('');
  const [quality, setQuality] = useState('192');
  const [format, setFormat] = useState('mp3');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim() && !isLoading) {
      onSubmit(url.trim(), quality, format);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Glass card container */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative rounded-2xl p-6 md:p-8"
        style={{
          background: 'rgba(10, 8, 20, 0.65)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid rgba(139, 92, 246, 0.18)',
          boxShadow: `
            0 0 0 1px rgba(255,255,255,0.04) inset,
            0 20px 60px -20px rgba(0,0,0,0.8),
            0 0 40px rgba(124, 58, 237, 0.06)
          `,
        }}
      >
        {/* Top highlight line */}
        <div
          className="absolute top-0 left-8 right-8 h-px"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(250, 204, 21, 0.4), rgba(139, 92, 246, 0.4), transparent)' }}
        />

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* URL Input */}
          <div className="relative group">
            <Link2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-violet-400 transition-colors duration-200 pointer-events-none" />
            <motion.input
              whileFocus={{ scale: 1.01 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              type="text"
              placeholder="Cole o link do YouTube aqui..."
              value={url}
              onChange={(e) => {
                const val = e.target.value;
                setUrl(val);
                if (onUrlChange) onUrlChange(val);
              }}
              disabled={isLoading}
              className="w-full pl-11 pr-5 py-3.5 rounded-xl text-white text-sm outline-none transition-all duration-200 placeholder:text-zinc-600 disabled:opacity-50"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.09)',
              }}
              onFocus={(e) => {
                e.currentTarget.style.border = '1px solid rgba(139, 92, 246, 0.55)';
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(124, 58, 237, 0.12), 0 0 20px rgba(124, 58, 237, 0.08)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.border = '1px solid rgba(255,255,255,0.09)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            />
          </div>

          {/* Format + Quality Select + Button row */}
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Format Select */}
            <div className="relative sm:w-36 flex-shrink-0">
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value)}
                disabled={isLoading}
                className="w-full appearance-none py-3.5 pl-4 pr-9 rounded-xl text-white text-sm outline-none cursor-pointer transition-all duration-200 focus:ring-2 focus:ring-violet-500/40 disabled:opacity-50"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.09)',
                }}
              >
                <option value="mp3" className="bg-zinc-900">MP3 (Áudio)</option>
                <option value="mp4" className="bg-zinc-900">MP4 (Vídeo)</option>
              </select>
              <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {/* Quality Select */}
            {format === 'mp3' && (
              <div className="relative sm:w-44 flex-shrink-0">
                <select
                  value={quality}
                  onChange={(e) => setQuality(e.target.value)}
                  disabled={isLoading}
                  className="w-full appearance-none py-3.5 pl-4 pr-9 rounded-xl text-white text-sm outline-none cursor-pointer transition-all duration-200 focus:ring-2 focus:ring-violet-500/40 disabled:opacity-50"
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.09)',
                  }}
                >
                  <option value="128"  className="bg-zinc-900">128 kbps</option>
                  <option value="192"  className="bg-zinc-900">192 kbps</option>
                  <option value="256"  className="bg-zinc-900">256 kbps</option>
                  <option value="320"  className="bg-zinc-900">320 kbps (HQ)</option>
                </select>
                <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <motion.button
              whileHover={{ scale: 1.03, y: -1 }}
              whileTap={{ scale: 0.97 }}
              type="submit"
              disabled={!url.trim() || isLoading}
              className="relative flex-1 overflow-hidden flex items-center justify-center gap-2.5 py-3.5 px-6 rounded-xl font-bold text-sm tracking-wide text-black disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all duration-300"
              style={{
                background: 'linear-gradient(135deg, #facc15 0%, #f59e0b 40%, #ec4899 75%, #8b5cf6 100%)',
                boxShadow: '0 0 24px rgba(250, 204, 21, 0.25), 0 0 40px rgba(139, 92, 246, 0.15)',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.boxShadow =
                  '0 0 32px rgba(250, 204, 21, 0.45), 0 0 60px rgba(139, 92, 246, 0.3)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.boxShadow =
                  '0 0 24px rgba(250, 204, 21, 0.25), 0 0 40px rgba(139, 92, 246, 0.15)';
              }}
            >
              {/* Sweep reflex */}
              <span
                className="absolute inset-0 -translate-x-full hover:translate-x-full transition-transform duration-1000 ease-in-out"
                style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent)' }}
              />
              {isLoading ? (
                <Loader2 className="animate-spin w-4 h-4" />
              ) : (
                <Download className="w-4 h-4 transition-transform duration-200 group-hover:-translate-y-0.5" />
              )}
              <span>{isLoading ? 'Baixando...' : 'Baixar'}</span>
            </motion.button>
          </div>
        </form>

        {/* Waveform */}
        <AudioWaveform />
      </motion.div>

      {/* Badges abaixo do form */}
      <BenefitBadges />
    </div>
  );
}
