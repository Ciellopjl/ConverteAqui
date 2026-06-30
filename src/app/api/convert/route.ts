import { NextRequest } from 'next/server';
import { Readable } from 'stream';
import fs from 'fs';
import { downloadAndConvert, getVideoInfo } from '@/lib/ytdlp';

export const maxDuration = 60;

const YT_URL_RE = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/;

export async function POST(req: NextRequest) {
  try {
    const { url, quality = '192', format = 'mp3' } = await req.json();

    if (!url || !YT_URL_RE.test(url)) {
      return Response.json({
        error: 'Link do YouTube inválido ou incompleto. Certifique-se de copiar o link completo do vídeo (ex: contendo watch?v= ou youtu.be/).',
      }, { status: 400 });
    }

    const info = await getVideoInfo(url).catch(() => undefined);
    const { filePath, fileName, contentType } = await downloadAndConvert(url, quality, format, info);

    const fileStream = fs.createReadStream(filePath);
    fileStream.on('close', () => fs.unlink(filePath, () => {}));

    return new Response(Readable.toWeb(fileStream) as ReadableStream, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Content-Length': fs.statSync(filePath).size.toString(),
      },
    });
  } catch (error) {
    console.error('[convert] erro:', error);
    const message = error instanceof Error ? error.message : 'Falha ao converter o vídeo.';
    return Response.json({ error: message }, { status: 500 });
  }
}
