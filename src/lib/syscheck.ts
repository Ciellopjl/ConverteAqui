import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function checkDependencies() {
  const deps = {
    ytdlp: false,
    ffmpeg: false
  };

  try {
    await execAsync('yt-dlp --version');
    deps.ytdlp = true;
  } catch (e) {
    console.error('yt-dlp não encontrado no PATH');
  }

  try {
    await execAsync('ffmpeg -version');
    deps.ffmpeg = true;
  } catch (e) {
    console.error('ffmpeg não encontrado no PATH');
  }

  return deps;
}
