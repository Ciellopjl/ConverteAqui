import { spawn } from 'child_process';
import { setTask } from './tasks';
import path from 'path';
import os from 'os';
import crypto from 'crypto';
import fs from 'fs';

const getDlpPath = () => {
  const customPath = process.env.YTDLP_PATH;
  if (customPath) return customPath;
  const localExe = path.join(process.cwd(), 'bin', 'yt-dlp.exe');
  if (fs.existsSync(localExe)) return localExe;
  return 'yt-dlp'; // fallback global
};

const getFfmpegPath = () => {
  const customPath = process.env.FFMPEG_PATH;
  if (customPath) return customPath;

  // Tenta localizar no node_modules relativo ao diretório de trabalho atual (evita problemas de empacotamento no Next.js)
  const isWin = os.platform() === 'win32';
  const localFfmpeg = path.join(process.cwd(), 'node_modules', 'ffmpeg-static', isWin ? 'ffmpeg.exe' : 'ffmpeg');
  if (fs.existsSync(localFfmpeg)) {
    return localFfmpeg;
  }

  try {
    const ffmpegStatic = require('ffmpeg-static');
    if (ffmpegStatic) return ffmpegStatic;
  } catch {
    // ignore
  }
  return 'ffmpeg'; // fallback global
};

export interface VideoInfo {
  id: string;
  title: string;
  thumbnail: string;
  duration: number;
}

export async function getVideoInfo(url: string): Promise<VideoInfo> {
  return new Promise((resolve, reject) => {
    const dlpPath = getDlpPath();
    const args = [
      '--dump-json',
      '--no-playlist',
      '--no-check-certificates',
      '--geo-bypass',
      '--user-agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      '--referer', 'https://www.youtube.com/',
      url
    ];
    console.log(`[ytdlp] getVideoInfo: Running command: "${dlpPath}" ${args.join(' ')}`);
    const ytdlp = spawn(dlpPath, args);
    let output = '';
    let errorOutput = '';

    ytdlp.stdout.on('data', (data) => {
      output += data.toString();
    });

    ytdlp.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    ytdlp.on('close', (code) => {
      console.log(`[ytdlp] getVideoInfo process closed with code ${code}`);
      if (code === 0) {
        try {
          const info = JSON.parse(output);
          resolve({
            id: info.id,
            title: info.title,
            thumbnail: info.thumbnail || `https://img.youtube.com/vi/${info.id}/maxresdefault.jpg`,
            duration: info.duration,
          });
        } catch (e) {
          console.error('[ytdlp] getVideoInfo failed to parse JSON:', e);
          reject(new Error('Falha ao parsear informações do vídeo.'));
        }
      } else {
        console.error(`[ytdlp] getVideoInfo failed with code ${code}. Stderr:`, errorOutput);
        const cleanErr = errorOutput.split('\n').filter(line => line.includes('ERROR:')).join(' ') || errorOutput.trim();
        reject(new Error(`Falha ao obter informações do vídeo: ${cleanErr || 'Erro no yt-dlp.'}`));
      }
    });
  });
}

export function downloadAndConvert(url: string, quality: string = '192'): string {
  const taskId = crypto.randomUUID();
  const tmpDir = os.tmpdir();
  const outputTemplate = path.join(tmpDir, `${taskId}.%(ext)s`);
  const finalFilePath = path.join(tmpDir, `${taskId}.mp3`);

  setTask(taskId, { status: 'pending', progress: 0 });

  // Pegamos info primeiro para salvar no task
  getVideoInfo(url).then(info => {
    setTask(taskId, { title: info.title, thumbnail: info.thumbnail, duration: info.duration, status: 'downloading' });
    
    // yt-dlp faz o download e usa ffmpeg automaticamente para converter
    const args = [
      url,
      '--extract-audio',
      '--audio-format', 'mp3',
      '--audio-quality', `${quality}K`,
      '--ffmpeg-location', getFfmpegPath(),
      '-o', outputTemplate,
      '--newline',
      '--no-check-certificates',
      '--geo-bypass',
      '--user-agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      '--referer', 'https://www.youtube.com/'
    ];

    const dlpPath = getDlpPath();
    console.log(`[ytdlp] downloadAndConvert: Running command: "${dlpPath}" ${args.join(' ')}`);
    const ytdlp = spawn(dlpPath, args);
    let errorOutput = '';

    ytdlp.stdout.on('data', (data) => {
      const output = data.toString();
      // Parse de progresso de download ex: [download]  45.0% of 10.00MiB
      const downloadMatch = output.match(/\[download\]\s+([\d.]+)%/);
      if (downloadMatch && downloadMatch[1]) {
        const progress = parseFloat(downloadMatch[1]);
        setTask(taskId, { status: 'downloading', progress });
      }

      // Se começar a extrair o áudio (converter)
      if (output.includes('[ExtractAudio]')) {
        setTask(taskId, { status: 'converting', progress: 100 });
      }
    });

    ytdlp.stderr.on('data', (data) => {
      const str = data.toString();
      errorOutput += str;
      console.error(`[ytdlp] downloadAndConvert STDERR:`, str.trim());
    });

    ytdlp.on('close', (code) => {
      console.log(`[ytdlp] downloadAndConvert process closed with code ${code}`);
      const fileExists = fs.existsSync(finalFilePath);
      console.log(`[ytdlp] finalFilePath: ${finalFilePath}, exists: ${fileExists}`);
      if (code === 0 && fileExists) {
        setTask(taskId, { status: 'completed', progress: 100, filePath: finalFilePath });
      } else {
        const errMsg = `Falha durante o download ou conversão. Código de saída: ${code}. Arquivo existe: ${fileExists}.`;
        console.error(`[ytdlp] downloadAndConvert failed. Stderr:`, errorOutput);
        setTask(taskId, { status: 'error', error: errMsg });
      }
    });
    
    ytdlp.on('error', (err) => {
       console.error(`[ytdlp] downloadAndConvert spawn error:`, err);
       setTask(taskId, { status: 'error', error: err.message });
     });

  }).catch(err => {
    console.error(`[ytdlp] getVideoInfo catch block error:`, err);
    setTask(taskId, { status: 'error', error: err.message });
  });

  return taskId;
}
