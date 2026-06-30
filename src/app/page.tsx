'use client';

import { useEffect, useRef, useState } from 'react';
import HeroSection from '@/components/HeroSection';

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
  const [history, setHistory] = useState<{ id: string; title: string; quality: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const lastFetchedUrlRef = useRef<string>('');
  const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };
  }, []);

  const stopSimulatedProgress = () => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
  };

  const startSimulatedProgress = () => {
    stopSimulatedProgress();
    progressIntervalRef.current = setInterval(() => {
      setDisplayTask((prev) => {
        if (!prev || prev.status === 'completed' || prev.status === 'error') return prev;
        const progress = Math.min(prev.progress + Math.random() * 4 + 1, 95);
        const status = progress > 55 ? 'converting' : 'downloading';
        return { ...prev, progress, status };
      });
    }, 600);
  };

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

      setDisplayTask({
        status: 'pending',
        progress: 0,
        title: 'Carregando informações...',
      });

      try {
        const infoRes = await fetch('/api/info', {
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
      } catch {
        setDisplayTask(null);
        lastFetchedUrlRef.current = '';
      }
    }
  };

  const handleConvert = async (url: string, quality: string, format: string) => {
    setIsLoading(true);

    const hasPreview = !!(displayTask?.title && displayTask.title !== 'Carregando informações...');
    const previewTitle = hasPreview ? displayTask!.title : undefined;

    setDisplayTask((prev) => ({
      title: hasPreview ? prev?.title : undefined,
      thumbnail: hasPreview ? prev?.thumbnail : undefined,
      duration: hasPreview ? prev?.duration : undefined,
      status: 'downloading',
      progress: 0,
    }));
    startSimulatedProgress();

    try {
      const res = await fetch('/api/convert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, quality, format }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Falha ao converter o vídeo.');
      }

      const blob = await res.blob();
      const disposition = res.headers.get('Content-Disposition') || '';
      const fileName = disposition.match(/filename="([^"]+)"/)?.[1] || `download.${format}`;

      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = objectUrl;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(objectUrl);

      stopSimulatedProgress();
      setDisplayTask((prev) => (prev ? { ...prev, status: 'completed', progress: 100 } : null));
      setHistory((prev) => [
        { id: crypto.randomUUID(), title: previewTitle || fileName.replace(/\.[^/.]+$/, ''), quality },
        ...prev,
      ]);
      setTimeout(() => setDisplayTask(null), 5000);
    } catch (err) {
      stopSimulatedProgress();
      const message = err instanceof Error ? err.message : 'Falha ao converter o vídeo.';
      setDisplayTask((prev) =>
        prev ? { ...prev, status: 'error', error: message } : { status: 'error', progress: 0, error: message }
      );
    } finally {
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
