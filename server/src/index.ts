import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs';
import { getTask, deleteTask } from './tasks.js';
import { getVideoInfo, downloadAndConvert } from './ytdlp.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Habilita CORS para todas as origens para permitir chamadas do frontend na Vercel
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Rota de Health Check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Ciello Upload API is running' });
});

function extractVideoId(url: string): string | null {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : null;
}

// 1. Obter informações do vídeo
app.post('/api/info', async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) {
      return res.status(400).json({ error: 'URL é obrigatória' });
    }

    if (!extractVideoId(url)) {
      return res.status(400).json({ 
        error: 'Link do YouTube inválido ou incompleto. Certifique-se de copiar o link completo do vídeo (ex: contendo watch?v= ou youtu.be/).' 
      });
    }

    const info = await getVideoInfo(url);
    res.json(info);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Falha ao buscar informações.' });
  }
});

// 2. Iniciar conversão
app.post('/api/convert', (req, res) => {
  try {
    const { url, quality = '192' } = req.body;
    if (!url) {
      return res.status(400).json({ error: 'URL é obrigatória' });
    }

    if (!extractVideoId(url)) {
      return res.status(400).json({ 
        error: 'Link do YouTube inválido ou incompleto. Certifique-se de copiar o link completo do vídeo (ex: contendo watch?v= ou youtu.be/).' 
      });
    }

    const taskId = downloadAndConvert(url, quality);
    res.json({ taskId });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Falha ao iniciar conversão.' });
  }
});

// 3. Obter progresso da conversão
app.get('/api/progress', (req, res) => {
  const { taskId } = req.query;
  if (!taskId || typeof taskId !== 'string') {
    return res.status(400).json({ error: 'taskId obrigatório' });
  }

  const task = getTask(taskId);
  if (!task) {
    return res.status(404).json({ error: 'Tarefa não encontrada' });
  }

  res.json(task);
});

// 4. Download do arquivo convertido
app.get('/api/download', (req, res) => {
  const { taskId } = req.query;
  if (!taskId || typeof taskId !== 'string') {
    return res.status(400).json({ error: 'taskId obrigatório' });
  }

  const task = getTask(taskId);
  if (!task || task.status !== 'completed' || !task.filePath) {
    return res.status(404).json({ error: 'Arquivo não disponível ou tarefa incompleta.' });
  }

  try {
    const fileExists = fs.existsSync(task.filePath);
    if (!fileExists) {
      return res.status(404).json({ error: 'Arquivo temporário não encontrado no servidor.' });
    }

    const fileName = `${task.title?.replace(/[^a-zA-Z0-9]/g, '_') || 'audio'}.mp3`;

    res.download(task.filePath, fileName, (err) => {
      if (err) {
        console.error('[server] Error during file transmission:', err);
      }
      
      // Limpa o arquivo temporário após o download (sucesso ou falha)
      try {
        if (task.filePath && fs.existsSync(task.filePath)) {
          fs.unlinkSync(task.filePath);
          console.log(`[server] Cleaned up temporary file: ${task.filePath}`);
        }
      } catch (unlinkErr) {
        console.error('[server] Failed to delete temp file:', unlinkErr);
      }
      
      deleteTask(taskId);
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Erro ao processar o download do arquivo.' });
  }
});

app.listen(PORT, () => {
  console.log(`[server] API Server is running on port ${PORT}`);
});
