'use client';

import { useState } from 'react';
import { Download, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface DownloadFormProps {
  onSubmit: (url: string, quality: string) => void;
  isLoading: boolean;
}

export default function DownloadForm({ onSubmit, isLoading }: DownloadFormProps) {
  const [url, setUrl] = useState('');
  const [quality, setQuality] = useState('192');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim() && !isLoading) {
      onSubmit(url.trim(), quality);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto flex flex-col gap-4 mt-8 relative z-10">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <motion.input
            whileHover={{ scale: 1.015 }}
            whileFocus={{ scale: 1.015 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            type="text"
            placeholder="Cole o link do YouTube aqui..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            disabled={isLoading}
            className="w-full bg-brand-black/40 border border-brand-purple/20 focus:border-brand-purple rounded-xl py-4 px-6 text-white outline-none transition-all placeholder:text-brand-text-muted/50 focus:shadow-[0_0_20px_rgba(168,85,247,0.25)] focus:bg-brand-black/60 shadow-inner"
          />
        </div>
        
        <div className="relative">
          <motion.select
            whileHover={{ scale: 1.015 }}
            whileFocus={{ scale: 1.015 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            value={quality}
            onChange={(e) => setQuality(e.target.value)}
            disabled={isLoading}
            className="w-full bg-brand-black/40 border border-brand-purple/20 focus:border-brand-purple rounded-xl py-4 pl-6 pr-10 text-white outline-none transition-all min-w-[150px] cursor-pointer appearance-none focus:shadow-[0_0_20px_rgba(168,85,247,0.25)] focus:bg-brand-black/60"
          >
            <option value="128" className="bg-brand-dark">128 kbps</option>
            <option value="192" className="bg-brand-dark">192 kbps</option>
            <option value="320" className="bg-brand-dark">320 kbps (HQ)</option>
          </motion.select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-brand-text-muted">
            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
          </div>
        </div>


        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          type="submit"
          disabled={!url.trim() || isLoading}
          className="relative overflow-hidden group bg-gradient-to-r from-brand-yellow via-fuchsia-500 to-brand-purple text-brand-black font-black tracking-wide rounded-xl py-4 px-8 flex items-center justify-center gap-2 transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed min-w-[160px] cursor-pointer border border-white/10 shadow-[0_0_20px_rgba(255,184,0,0.15),_0_0_30px_rgba(168,85,247,0.15)] hover:shadow-[0_0_30px_rgba(255,184,0,0.35),_0_0_40px_rgba(168,85,247,0.45)] before:content-[''] before:absolute before:inset-0 before:-translate-x-full hover:before:translate-x-full before:bg-gradient-to-r before:from-transparent before:via-white/35 before:to-transparent before:transition-transform before:duration-1000 before:ease-in-out"
        >
          {isLoading ? (
            <Loader2 className="animate-spin w-5 h-5 text-brand-black" />
          ) : (
            <>
              <Download className="w-5 h-5 text-brand-black group-hover:scale-110 group-hover:-translate-y-0.5 transition-transform duration-300" />
              <span>Converter</span>
            </>
          )}
        </motion.button>
      </div>
    </form>
  );
}

