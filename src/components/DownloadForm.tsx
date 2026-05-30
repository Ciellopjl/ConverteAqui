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
          <input
            type="text"
            placeholder="Cole o link do YouTube aqui..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            disabled={isLoading}
            className="w-full bg-ciello-gray border border-[#333] focus:border-ciello-yellow rounded-xl py-4 px-6 text-white outline-none transition-all placeholder:text-[#666] shadow-inner"
          />
        </div>
        
        <select
          value={quality}
          onChange={(e) => setQuality(e.target.value)}
          disabled={isLoading}
          className="bg-ciello-gray border border-[#333] focus:border-ciello-yellow rounded-xl py-4 px-4 text-white outline-none transition-all min-w-30 cursor-pointer appearance-none"
        >
          <option value="128">128 kbps</option>
          <option value="192">192 kbps</option>
          <option value="320">320 kbps (HQ)</option>
        </select>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={!url.trim() || isLoading}
          className="bg-ciello-yellow hover:bg-ciello-yellow-hover text-black font-bold rounded-xl py-4 px-8 flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-w-40"
        >
          {isLoading ? (
            <Loader2 className="animate-spin w-5 h-5" />
          ) : (
            <>
              <Download className="w-5 h-5" />
              <span>Converter</span>
            </>
          )}
        </motion.button>
      </div>
    </form>
  );
}
