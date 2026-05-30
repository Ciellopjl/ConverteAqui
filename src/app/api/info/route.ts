import { NextRequest, NextResponse } from 'next/server';
import { getVideoInfo } from '@/lib/ytdlp';

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();

    if (!url) {
      return NextResponse.json({ error: 'URL é obrigatória' }, { status: 400 });
    }

    const info = await getVideoInfo(url);
    return NextResponse.json(info);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Falha ao buscar informações.' }, { status: 500 });
  }
}
