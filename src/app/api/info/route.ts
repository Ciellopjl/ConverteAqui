import { NextRequest, NextResponse } from 'next/server';

function extractVideoId(url: string): string | null {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)([^&\n?#]+)/);
  return match ? match[1] : null;
}

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();
    if (!url) {
      return NextResponse.json({ error: 'URL é obrigatória' }, { status: 400 });
    }

    const videoId = extractVideoId(url);

    const oEmbedRes = await fetch(
      `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`,
      { cache: 'no-store' }
    );

    if (!oEmbedRes.ok) {
      throw new Error('Falha ao obter informações. Verifique o link.');
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
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Falha ao buscar informações.' }, { status: 500 });
  }
}
