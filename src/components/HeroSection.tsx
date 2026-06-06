'use client';

import { motion, type Variants } from 'framer-motion';
import BackgroundEffects from './BackgroundEffects';
import ConverterForm from './ConverterForm';
import VideoCard from './VideoCard';
import HistoryList from './HistoryList';

interface DisplayTask {
  title?: string;
  thumbnail?: string;
  duration?: number;
  progress: number;
  status: 'pending' | 'downloading' | 'converting' | 'completed' | 'error';
  error?: string;
}

interface HeroSectionProps {
  onConvert: (url: string, quality: string, format: string) => void;
  isLoading: boolean;
  displayTask: DisplayTask | null;
  history: { id: string; title: string; quality: string }[];
  onUrlChange?: (url: string) => void;
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.14, delayChildren: 0.05 } as any,
  },
};

const itemVariants: Variants = {
  hidden:  { opacity: 0, y: 22 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] } },
};

export default function HeroSection({ onConvert, isLoading, displayTask, history, onUrlChange }: HeroSectionProps) {
  return (
    <main
      className="relative min-h-screen flex flex-col items-center justify-start pt-24 pb-20 px-4 overflow-hidden"
      style={{ background: '#030306' }}
    >
      <BackgroundEffects />

      <motion.div
        className="relative z-10 w-full max-w-3xl flex flex-col items-center text-center"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {/* Badge topo */}
        <motion.div variants={itemVariants} className="mb-6">
          <span
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold tracking-widest uppercase"
            style={{
              background: 'rgba(139, 92, 246, 0.1)',
              border: '1px solid rgba(139, 92, 246, 0.3)',
              color: '#a78bfa',
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
            Conversor Online Gratuito
          </span>
        </motion.div>

        {/* Título principal */}
        <motion.h1
          variants={itemVariants}
          className="text-5xl sm:text-6xl md:text-7xl font-black tracking-tight leading-tight mb-5 select-none"
        >
          <span
            style={{
              background: 'linear-gradient(135deg, #facc15 0%, #f59e0b 35%, #ec4899 65%, #8b5cf6 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            MP3
          </span>{' '}
          <span className="text-white">Premium</span>
        </motion.h1>

        {/* Subtítulo */}
        <motion.p
          variants={itemVariants}
          className="max-w-xl text-base md:text-lg leading-relaxed mb-10"
          style={{ color: '#9ca3af' }}
        >
          Converta e baixe áudios do YouTube em MP3 de alta qualidade.{' '}
          <span className="text-zinc-300">
            Sem limites, sem instalar nada e totalmente gratuito.
          </span>
        </motion.p>

        {/* Formulário */}
        <motion.div variants={itemVariants} className="w-full">
          <ConverterForm onSubmit={onConvert} isLoading={isLoading} onUrlChange={onUrlChange} />
        </motion.div>

        {/* VideoCard de progresso */}
        {displayTask && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="w-full mt-6"
          >
            <VideoCard
              title={displayTask.title || 'Carregando informações...'}
              thumbnail={
                displayTask.thumbnail ||
                '/favicon converteAaqui.png'
              }
              duration={displayTask.duration || 0}
              progress={displayTask.progress}
              status={displayTask.status}
              error={displayTask.error}
            />
          </motion.div>
        )}

        {/* Histórico */}
        {history.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="w-full mt-4"
          >
            <HistoryList items={history} />
          </motion.div>
        )}
      </motion.div>
    </main>
  );
}
