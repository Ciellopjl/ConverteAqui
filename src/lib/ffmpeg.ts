import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

/**
 * Utilitário para verificar a presença do ffmpeg no sistema.
 * O yt-dlp utiliza o ffmpeg internamente para converter o áudio para MP3
 * de forma otimizada.
 */
export async function checkFfmpeg(): Promise<boolean> {
  try {
    await execAsync('ffmpeg -version');
    return true;
  } catch (e) {
    return false;
  }
}
