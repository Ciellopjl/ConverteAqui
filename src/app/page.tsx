'use client';

import { useState, useEffect, useRef } from 'react';
import TypewriterTitle from '@/components/TypewriterTitle';
import DownloadForm from '@/components/DownloadForm';
import VideoCard from '@/components/VideoCard';
import HistoryList from '@/components/HistoryList';

interface VideoInfo {
  id: string | null;
  title: string;
  thumbnail: string;
  duration: number;
}

interface DisplayTask {
  title?: string;
  thumbnail?: string;
  duration?: number;
  progress: number;
  status: 'pending' | 'downloading' | 'converting' | 'completed' | 'error';
  error?: string;
}

export default function Home() {
  const [displayTask, setDisplayTask] = useState<DisplayTask | null>(null);
  const [history, setHistory] = useState<{id: string, title: string, quality: string}[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const currentUrlRef = useRef<string>('');

  const handleConvert = async (url: string, quality: string) => {
    setIsLoading(true);
    currentUrlRef.current = url;

    // Step 1: Fetch video info
    setDisplayTask({ status: 'pending', progress: 0 });

    let info: VideoInfo | null = null;

    try {
      const infoRes = await fetch('/api/info', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      const infoData = await infoRes.json();

      if (!infoRes.ok) throw new Error(infoData.error || 'Falha ao buscar informações.');

      info = infoData;
      setDisplayTask({
        title: infoData.title,
        thumbnail: infoData.thumbnail,
        duration: infoData.duration,
        status: 'converting',
        progress: 0,
      });
    } catch (err: any) {
      setDisplayTask({ status: 'error', progress: 0, error: err.message });
      setIsLoading(false);
      return;
    }

    // Step 2: Get download URL from cobalt
    try {
      const convertRes = await fetch('/api/convert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, quality }),
      });
      const convertData = await convertRes.json();

      if (!convertRes.ok) throw new Error(convertData.error || 'Falha ao converter.');

      // Show completed state
      setDisplayTask(prev => prev ? { ...prev, status: 'completed', progress: 100 } : null);

      // Add to history
      if (info?.title) {
        const taskId = crypto.randomUUID();
        setHistory(prev => [{ id: taskId, title: info!.title, quality }, ...prev]);
      }

      // Trigger direct download
      const a = document.createElement('a');
      a.href = convertData.downloadUrl;
      a.download = convertData.filename || 'audio.mp3';
      a.target = '_blank';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      // Clear card after delay
      setTimeout(() => setDisplayTask(null), 5000);
    } catch (err: any) {
      setDisplayTask(prev => prev ? { ...prev, status: 'error', error: err.message } : null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-ciello-black relative overflow-hidden flex flex-col items-center py-20 px-4">
      {/* Background Glow */}
      <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-200 h-125 bg-ciello-yellow rounded-full blur-[150px] opacity-10 pointer-events-none"></div>

      <div className="z-10 w-full max-w-4xl flex flex-col items-center">
        <TypewriterTitle />
        
        <p className="text-ciello-text-muted text-center max-w-xl mb-8">
          Converta e baixe áudios do YouTube em MP3 de alta qualidade. 
          Sem limites, sem instalar nada e totalmente gratuito.
        </p>

        <DownloadForm onSubmit={handleConvert} isLoading={isLoading} />

        {displayTask && (
          <VideoCard 
            title={displayTask.title || 'Carregando informações...'}
            thumbnail={displayTask.thumbnail || 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=640&auto=format&fit=crop'}
            duration={displayTask.duration || 0}
            progress={displayTask.progress}
            status={displayTask.status}
            error={displayTask.error}
          />
        )}

        <HistoryList items={history} />
      </div>
    </main>
  );
}
