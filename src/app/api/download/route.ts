import { NextRequest, NextResponse } from 'next/server';
import { getTask, deleteTask } from '@/lib/tasks';
import fs from 'fs';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const taskId = searchParams.get('taskId');

  if (!taskId) {
    return NextResponse.json({ error: 'taskId obrigatório' }, { status: 400 });
  }

  const isLocalDev = process.env.NODE_ENV === 'development' && !process.env.BACKEND_URL;
  const backendUrl = process.env.BACKEND_URL || (isLocalDev ? null : 'https://ciello-upload.onrender.com');

  if (backendUrl) {
    return NextResponse.redirect(`${backendUrl}/api/download?taskId=${taskId}`);
  }

  const task = getTask(taskId);

  if (!task || task.status !== 'completed' || !task.filePath) {
    return NextResponse.json({ error: 'Arquivo não disponível' }, { status: 404 });
  }

  try {
    const fileBuffer = fs.readFileSync(task.filePath);
    const fileName = `${task.title?.replace(/[^a-zA-Z0-9]/g, '_') || 'audio'}.mp3`;

    // Limpar arquivo temporário e tarefa da memória
    fs.unlinkSync(task.filePath);
    deleteTask(taskId);

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Disposition': `attachment; filename="${fileName}"`,
      },
    });
  } catch {
    return NextResponse.json({ error: 'Erro ao ler arquivo' }, { status: 500 });
  }
}
