import { NextRequest, NextResponse } from 'next/server';

// Increase timeout for Vercel hobby plan (up to 60s)
export const maxDuration = 60;

// Public cobalt instances to try in order
const COBALT_INSTANCES = [
  'https://cobalt.tools',
  'https://co.wuk.sh',
  'https://cobalt.api.lostless.de',
];

export async function POST(req: NextRequest) {
  try {
    const { url, quality = '192' } = await req.json();

    if (!url) {
      return NextResponse.json({ error: 'URL é obrigatória' }, { status: 400 });
    }

    let lastError = 'Não foi possível obter o link de download.';

    for (const instance of COBALT_INSTANCES) {
      try {
        const res = await fetch(instance, {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            url,
            downloadMode: 'audio',
            audioFormat: 'mp3',
            audioBitrate: quality,
          }),
          signal: AbortSignal.timeout(15000),
        });

        if (!res.ok) continue;

        const data = await res.json();

        if ((data.status === 'tunnel' || data.status === 'redirect') && data.url) {
          return NextResponse.json({
            downloadUrl: data.url,
            filename: data.filename || 'audio.mp3',
          });
        }

        if (data.status === 'error' && data.error?.code) {
          lastError = `Erro: ${data.error.code}`;
        }
      } catch {
        // Try next instance
        continue;
      }
    }

    return NextResponse.json({ error: lastError }, { status: 502 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Falha ao iniciar conversão.' }, { status: 500 });
  }
}
