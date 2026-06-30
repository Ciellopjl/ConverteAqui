import { spawn } from 'child_process';
import path from 'path';
import os from 'os';
import crypto from 'crypto';
import fs from 'fs';
import ffmpegStatic from 'ffmpeg-static';

const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

// O binário (bin/yt-dlp ou bin/yt-dlp.exe) é garantido por scripts/setup-ytdlp.mjs no build
// e incluído explicitamente via outputFileTracingIncludes (next.config.ts). Não usamos
// fs.existsSync aqui de propósito: um caminho dinâmico passado a uma chamada de fs faz o
// Node File Trace rastrear o projeto inteiro (incluindo .git) por segurança.
const getDlpPath = () => {
  if (process.env.YTDLP_PATH) return process.env.YTDLP_PATH;
  const isWin = process.platform === 'win32';
  return path.join(process.cwd(), 'bin', isWin ? 'yt-dlp.exe' : 'yt-dlp');
};

const getFfmpegPath = () => {
  const customPath = process.env.FFMPEG_PATH;
  if (customPath) return customPath;
  if (ffmpegStatic) return ffmpegStatic;
  return 'ffmpeg'; // fallback global
};

// O YouTube passou a bloquear/exigir login para IPs de datacenter (Vercel inclusive),
// retornando "Sign in to confirm you're not a bot". A correção é autenticar o yt-dlp com
// cookies de uma sessão real, passados via env var (YTDLP_COOKIES) em vez de um arquivo
// versionado no repo. Escrevemos o conteúdo uma vez por instância da function em /tmp.
let cookiesFilePath: string | null = null;

const getCookiesArgs = (): string[] => {
  if (process.env.YTDLP_COOKIES_FILE) {
    return ['--cookies', process.env.YTDLP_COOKIES_FILE];
  }

  if (process.env.YTDLP_COOKIES) {
    if (!cookiesFilePath) {
      cookiesFilePath = path.join(os.tmpdir(), 'yt-dlp-cookies.txt');
      fs.writeFileSync(cookiesFilePath, process.env.YTDLP_COOKIES, 'utf8');
    }
    return ['--cookies', cookiesFilePath];
  }

  return [];
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
      '--user-agent', USER_AGENT,
      '--referer', 'https://www.youtube.com/',
      ...getCookiesArgs(),
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

    ytdlp.on('error', (err) => {
      console.error('[ytdlp] getVideoInfo spawn error:', err);
      reject(err);
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

export interface DownloadResult {
  filePath: string;
  fileName: string;
  contentType: string;
}

export function downloadAndConvert(
  url: string,
  quality: string = '192',
  format: string = 'mp3',
  info?: { title?: string }
): Promise<DownloadResult> {
  return new Promise((resolve, reject) => {
    const id = crypto.randomUUID();
    const tmpDir = os.tmpdir();
    const outputTemplate = path.join(tmpDir, `${id}.%(ext)s`);
    const finalFilePath = path.join(tmpDir, `${id}.${format}`);

    const commonArgs = [
      '--ffmpeg-location', getFfmpegPath(),
      '-o', outputTemplate,
      '--newline',
      '--no-check-certificates',
      '--geo-bypass',
      '--user-agent', USER_AGENT,
      '--referer', 'https://www.youtube.com/',
      ...getCookiesArgs(),
    ];

    // yt-dlp faz o download e usa ffmpeg automaticamente para converter/mesclar
    const args = format === 'mp4'
      ? [url, '-f', 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best', ...commonArgs]
      : [url, '--extract-audio', '--audio-format', 'mp3', '--audio-quality', `${quality}K`, ...commonArgs];

    const dlpPath = getDlpPath();
    console.log(`[ytdlp] downloadAndConvert: Running command: "${dlpPath}" ${args.join(' ')}`);
    const ytdlp = spawn(dlpPath, args);
    let errorOutput = '';

    ytdlp.stderr.on('data', (data) => {
      const str = data.toString();
      errorOutput += str;
      console.error(`[ytdlp] downloadAndConvert STDERR:`, str.trim());
    });

    ytdlp.on('close', (code) => {
      const fileExists = fs.existsSync(finalFilePath);
      console.log(`[ytdlp] downloadAndConvert closed with code ${code}, file exists: ${fileExists}`);
      if (code === 0 && fileExists) {
        const safeName = (info?.title || 'download').replace(/[^a-zA-Z0-9\-_ ]/g, '_');
        resolve({
          filePath: finalFilePath,
          fileName: `${safeName}.${format}`,
          contentType: format === 'mp4' ? 'video/mp4' : 'audio/mpeg',
        });
      } else {
        console.error(`[ytdlp] downloadAndConvert failed. Stderr:`, errorOutput);
        const cleanErr = errorOutput.split('\n').filter(line => line.includes('ERROR:')).join(' ') || errorOutput.trim();
        reject(new Error(cleanErr || `Falha durante o download ou conversão (código ${code}).`));
      }
    });

    ytdlp.on('error', (err) => {
      console.error(`[ytdlp] downloadAndConvert spawn error:`, err);
      reject(err);
    });
  });
}
