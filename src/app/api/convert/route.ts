import { NextRequest, NextResponse } from 'next/server';
import { downloadAndConvert } from '@/lib/ytdlp';

export async function POST(req: NextRequest) {
  try {
    const { url, quality = '192' } = await req.json();

    if (!url) {
      return NextResponse.json({ error: 'URL é obrigatória' }, { status: 400 });
    }

    const hasValidId = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/.test(url);
    if (!hasValidId) {
      return NextResponse.json({ 
        error: 'Link do YouTube inválido ou incompleto. Certifique-se de copiar o link completo do vídeo (ex: contendo watch?v= ou youtu.be/).' 
      }, { status: 400 });
    }

    const isLocalDev = process.env.NODE_ENV === 'development' && !process.env.BACKEND_URL;
    const backendUrl = process.env.BACKEND_URL || (isLocalDev ? null : 'https://ciello-upload.onrender.com');

    if (backendUrl) {
      const res = await fetch(`${backendUrl}/api/convert`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, quality }),
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Falha ao iniciar conversão no servidor remoto.');
      }
      const data = await res.json();
      return NextResponse.json(data);
    }

    // Se estiver rodando na Vercel e não tiver BACKEND_URL configurado
    if (process.env.VERCEL) {
      return NextResponse.json({ 
        error: 'Para converter no Vercel, você precisa configurar a variável de ambiente BACKEND_URL apontando para o seu servidor Express.' 
      }, { status: 503 });
    }

    const taskId = downloadAndConvert(url, quality);

    return NextResponse.json({ taskId });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Falha ao iniciar conversão.' }, { status: 500 });
  }
}
