'use client';

import { useState, useRef } from 'react';
import HeroSection from '@/components/HeroSection';

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

const RENDER_BACKEND = 'https://ciello-upload.onrender.com';

const getApiUrl = (path: string): string => {
  if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    return path;
  }
  return `${RENDER_BACKEND}${path}`;
};

export default function Home() {
  const [displayTask, setDisplayTask] = useState<DisplayTask | null>(null);
  const [history, setHistory] = useState<{ id: string; title: string; quality: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const currentUrlRef = useRef<string>('');
  const lastFetchedUrlRef = useRef<string>('');

  const handleUrlChange = async (url: string) => {
    const trimmed = url.trim();
    if (!trimmed) {
      setDisplayTask(null);
      lastFetchedUrlRef.current = '';
      return;
    }

    const isYoutube = trimmed.includes('youtube.com/') || trimmed.includes('youtu.be/');
    if (isYoutube && trimmed !== lastFetchedUrlRef.current && !isLoading) {
      lastFetchedUrlRef.current = trimmed;
      
      // Mostrar loading temporário do preview
      setDisplayTask({
        status: 'pending',
        progress: 0,
        title: 'Carregando informações...',
      });

      try {
        const infoRes = await fetch(getApiUrl('/api/info'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: trimmed }),
        });
        const infoData = await infoRes.json();

        if (infoRes.ok) {
          setDisplayTask({
            title: infoData.title,
            thumbnail: infoData.thumbnail,
            duration: infoData.duration,
            status: 'pending',
            progress: 0,
          });
        } else {
          setDisplayTask(null);
          lastFetchedUrlRef.current = '';
        }
      } catch (err) {
        setDisplayTask(null);
        lastFetchedUrlRef.current = '';
      }
    }
  };

  const handleConvert = async (url: string, quality: string, format: string) => {
    setIsLoading(true);
    currentUrlRef.current = url;

    let info: VideoInfo | null = null;

    if (displayTask && displayTask.title && displayTask.title !== 'Carregando informações...') {
      info = {
        id: null,
        title: displayTask.title,
        thumbnail: displayTask.thumbnail || '',
        duration: displayTask.duration || 0,
      };
    } else {
      setDisplayTask({ status: 'pending', progress: 0 });

      try {
        const infoRes = await fetch(getApiUrl('/api/info'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url }),
        });
        const infoData = await infoRes.json();

        if (!infoRes.ok) {
          const errorMsg =
            infoData.error && typeof infoData.error === 'object'
              ? infoData.error.message || 'Falha ao buscar informações.'
              : infoData.error || 'Falha ao buscar informações.';
          throw new Error(errorMsg);
        }

        info = infoData;
        setDisplayTask({
          title: infoData.title,
          thumbnail: infoData.thumbnail,
          duration: infoData.duration,
          status: 'pending',
          progress: 0,
        });
      } catch (err: any) {
        setDisplayTask({ status: 'error', progress: 0, error: err.message });
        setIsLoading(false);
        return;
      }
    }

    // Step 2: iniciar conversão e fazer polling de progresso
    try {
      const convertRes = await fetch(getApiUrl('/api/convert'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, quality, format }),
      });
      const convertData = await convertRes.json();

      if (!convertRes.ok) {
        const errorMsg =
          convertData.error && typeof convertData.error === 'object'
            ? convertData.error.message || 'Falha ao converter.'
            : convertData.error || 'Falha ao converter.';
        throw new Error(errorMsg);
      }

      const taskId = convertData.taskId;

      const pollProgress = async () => {
        try {
          const progressRes = await fetch(getApiUrl(`/api/progress?taskId=${taskId}`));
          if (!progressRes.ok) throw new Error('Falha ao monitorar o progresso.');

          const progressData = await progressRes.json();

          setDisplayTask((prev) => {
            if (!prev) return null;
            return {
              ...prev,
              status: progressData.status,
              progress: progressData.progress,
              error: progressData.error,
            };
          });

          if (progressData.status === 'completed') {
            if (info?.title) {
              setHistory((prev) => [{ id: taskId, title: info!.title, quality }, ...prev]);
            }

            const a = document.createElement('a');
            a.href = getApiUrl(`/api/download?taskId=${taskId}`);
            a.download = `${info?.title?.replace(/[^a-zA-Z0-9]/g, '_') || 'video'}.${format}`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);

            setIsLoading(false);
            setTimeout(() => setDisplayTask(null), 5000);
          } else if (progressData.status === 'error') {
            throw new Error(progressData.error || 'Falha na conversão.');
          } else {
            setTimeout(pollProgress, 1000);
          }
        } catch (err: any) {
          setDisplayTask((prev) => (prev ? { ...prev, status: 'error', error: err.message } : null));
          setIsLoading(false);
        }
      };

      setTimeout(pollProgress, 1000);
    } catch (err: any) {
      setDisplayTask((prev) => (prev ? { ...prev, status: 'error', error: err.message } : null));
      setIsLoading(false);
    }
  };

  return (
    <HeroSection
      onConvert={handleConvert}
      isLoading={isLoading}
      displayTask={displayTask}
      history={history}
      onUrlChange={handleUrlChange}
    />
  );
}
