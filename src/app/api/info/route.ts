import { NextRequest, NextResponse } from 'next/server';
import { getVideoInfo } from '@/lib/ytdlp';

export const maxDuration = 30;

function extractVideoId(url: string): string | null {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : null;
}

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();
    if (!url) {
      return NextResponse.json({ error: 'URL é obrigatória' }, { status: 400 });
    }

    const videoId = extractVideoId(url);
    if (!videoId) {
      return NextResponse.json({
        error: 'Link do YouTube inválido ou incompleto. Certifique-se de copiar o link completo do vídeo (ex: contendo watch?v= ou youtu.be/).'
      }, { status: 400 });
    }

    try {
      const info = await getVideoInfo(url);
      return NextResponse.json(info);
    } catch (ytDlpError) {
      const ytDlpMessage = ytDlpError instanceof Error ? ytDlpError.message : String(ytDlpError);
      console.warn('[info] yt-dlp falhou, usando fallback oEmbed:', ytDlpMessage);

      const oEmbedRes = await fetch(
        `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`,
        { cache: 'no-store' }
      );

      if (!oEmbedRes.ok) {
        throw new Error('Falha ao obter informações do vídeo. Verifique o link.');
      }

      const oEmbed = await oEmbedRes.json();
      return NextResponse.json({
        id: videoId,
        title: oEmbed.title,
        thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
        duration: 0,
      });
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Falha ao buscar informações.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
