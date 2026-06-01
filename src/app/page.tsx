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

      if (!infoRes.ok) {
        const errorMsg = infoData.error && typeof infoData.error === 'object'
          ? (infoData.error.message || 'Falha ao buscar informações.')
          : (infoData.error || 'Falha ao buscar informações.');
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

    // Step 2: Start conversion task and poll for progress
    try {
      const convertRes = await fetch('/api/convert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, quality }),
      });
      const convertData = await convertRes.json();

      if (!convertRes.ok) {
        const errorMsg = convertData.error && typeof convertData.error === 'object'
          ? (convertData.error.message || 'Falha ao converter.')
          : (convertData.error || 'Falha ao converter.');
        throw new Error(errorMsg);
      }

      const taskId = convertData.taskId;

      // Função de polling para obter o progresso do download e conversão
      const pollProgress = async () => {
        try {
          const progressRes = await fetch(`/api/progress?taskId=${taskId}`);
          if (!progressRes.ok) throw new Error('Falha ao monitorar o progresso.');

          const progressData = await progressRes.json();

          // Atualiza o estado visual com o progresso real
          setDisplayTask(prev => {
            if (!prev) return null;
            return {
              ...prev,
              status: progressData.status,
              progress: progressData.progress,
              error: progressData.error,
            };
          });

          if (progressData.status === 'completed') {
            // Adiciona ao histórico local
            if (info?.title) {
              setHistory(prev => [{ id: taskId, title: info!.title, quality }, ...prev]);
            }

            // Dispara o download automático do arquivo temporário gerado localmente
            const a = document.createElement('a');
            a.href = `/api/download?taskId=${taskId}`;
            a.download = `${info?.title?.replace(/[^a-zA-Z0-9]/g, '_') || 'audio'}.mp3`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);

            setIsLoading(false);
            // Limpa o card após 5 segundos
            setTimeout(() => setDisplayTask(null), 5000);
          } else if (progressData.status === 'error') {
            throw new Error(progressData.error || 'Falha na conversão.');
          } else {
            // Continua fazendo o polling
            setTimeout(pollProgress, 1000);
          }
        } catch (err: any) {
          setDisplayTask(prev => prev ? { ...prev, status: 'error', error: err.message } : null);
          setIsLoading(false);
        }
      };

      // Inicia o polling após 1 segundo
      setTimeout(pollProgress, 1000);
    } catch (err: any) {
      setDisplayTask(prev => prev ? { ...prev, status: 'error', error: err.message } : null);
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
