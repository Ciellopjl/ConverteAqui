import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { pipeline } from 'stream/promises';
import { Readable } from 'stream';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const YTDLP_LINUX_URL = 'https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp_linux';

async function main() {
  if (process.platform !== 'linux') {
    console.log('[setup-ytdlp] Plataforma não-Linux detectada, usando bin/yt-dlp.exe do repositório.');
    return;
  }

  const binDir = path.join(__dirname, '..', 'bin');
  const targetPath = path.join(binDir, 'yt-dlp');

  if (fs.existsSync(targetPath) && !process.env.FORCE_YTDLP_DOWNLOAD) {
    console.log('[setup-ytdlp] bin/yt-dlp já presente, pulando download.');
    return;
  }

  fs.mkdirSync(binDir, { recursive: true });
  console.log('[setup-ytdlp] Baixando binário Linux do yt-dlp...');

  const res = await fetch(YTDLP_LINUX_URL, { redirect: 'follow' });
  if (!res.ok || !res.body) {
    throw new Error(`[setup-ytdlp] Falha ao baixar yt-dlp: HTTP ${res.status}`);
  }

  await pipeline(Readable.fromWeb(res.body), fs.createWriteStream(targetPath));
  fs.chmodSync(targetPath, 0o755);

  console.log('[setup-ytdlp] yt-dlp pronto em', targetPath);
}

main().catch((err) => {
  console.error('[setup-ytdlp] Erro:', err);
  process.exit(1);
});
