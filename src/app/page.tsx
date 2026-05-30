'use client';

import { useState, useEffect, useRef } from 'react';
import TypewriterTitle from '@/components/TypewriterTitle';
import DownloadForm from '@/components/DownloadForm';
import VideoCard from '@/components/VideoCard';
import HistoryList from '@/components/HistoryList';
import { Task } from '@/lib/tasks';

export default function Home() {
  const [currentTask, setCurrentTask] = useState<Task | null>(null);
  const [history, setHistory] = useState<{id: string, title: string, quality: string}[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  const startPolling = (taskId: string, quality: string) => {
    if (pollingRef.current) clearInterval(pollingRef.current);

    pollingRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/progress?taskId=${taskId}`);
        if (!res.ok) throw new Error('Falha ao buscar progresso');
        
        const task: Task = await res.json();
        setCurrentTask(task);

        if (task.status === 'completed' || task.status === 'error') {
          clearInterval(pollingRef.current!);
          setIsLoading(false);

          if (task.status === 'completed') {
            // Trigger download
            window.location.href = `/api/download?taskId=${taskId}`;
            
            // Add to history
            if (task.title) {
              const title = task.title;
              setHistory(prev => [{ id: taskId, title, quality }, ...prev]);
            }
            
            // Clear current task after a delay
            setTimeout(() => {
              setCurrentTask(null);
            }, 5000);
          }
        }
      } catch {
        clearInterval(pollingRef.current!);
        setIsLoading(false);
        setCurrentTask(prev => prev ? { ...prev, status: 'error', error: 'Erro de conexão com o servidor.' } : null);
      }
    }, 1000);
  };

  const handleConvert = async (url: string, quality: string) => {
    setIsLoading(true);
    setCurrentTask({ id: 'temp', status: 'pending', progress: 0 }); // Placeholder

    try {
      // Opt: In a real app we might fetch info first to show the card immediately, 
      // but our API does it and updates the task shortly.
      const res = await fetch('/api/convert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, quality }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Erro ao iniciar conversão');
      }

      const data = await res.json();
      startPolling(data.taskId, quality);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro';
      setCurrentTask({ id: 'error', status: 'error', progress: 0, error: message });
      setIsLoading(false);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, []);

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

        {currentTask && (currentTask.title || currentTask.status === 'error' || currentTask.status === 'pending') && (
          <VideoCard 
            title={currentTask.title || 'Carregando informações...'}
            thumbnail={currentTask.thumbnail || 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=640&auto=format&fit=crop'}
            duration={currentTask.duration || 0}
            progress={currentTask.progress}
            status={currentTask.status}
            error={currentTask.error}
          />
        )}

        <HistoryList items={history} />
      </div>
    </main>
  );
}
