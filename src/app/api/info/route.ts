import { NextRequest, NextResponse } from 'next/server';
import { getVideoInfo } from '@/lib/ytdlp';

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

    const isLocalDev = process.env.NODE_ENV === 'development' && !process.env.BACKEND_URL;
    const backendUrl = process.env.BACKEND_URL || (isLocalDev ? null : 'https://ciello-upload.onrender.com');

    if (backendUrl) {
      const res = await fetch(`${backendUrl}/api/info`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Falha ao buscar informações no servidor remoto.');
      }
      const data = await res.json();
      return NextResponse.json(data);
    }

    // Tenta usar yt-dlp local (ambiente local de dev)
    try {
      const info = await getVideoInfo(url);
      return NextResponse.json({
        id: info.id,
        title: info.title,
        thumbnail: info.thumbnail,
        duration: info.duration,
      });
    } catch (ytDlpError: any) {
      console.warn('[info] Local yt-dlp failed, falling back to oEmbed:', ytDlpError.message);

      // Se falhar (ex: rodando no Vercel sem BACKEND_URL), tenta o oEmbed oficial como fallback
      const videoId = extractVideoId(url);
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
        thumbnail: videoId
          ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
          : oEmbed.thumbnail_url,
        duration: 0,
      });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Falha ao buscar informações.' }, { status: 500 });
  }
}
