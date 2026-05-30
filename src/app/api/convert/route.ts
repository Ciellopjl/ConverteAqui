import { NextRequest, NextResponse } from 'next/server';
import { downloadAndConvert } from '@/lib/ytdlp';

export async function POST(req: NextRequest) {
  try {
    const { url, quality = '192' } = await req.json();

    if (!url) {
      return NextResponse.json({ error: 'URL é obrigatória' }, { status: 400 });
    }

    const taskId = downloadAndConvert(url, quality);
    return NextResponse.json({ taskId });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Falha ao iniciar conversão.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
