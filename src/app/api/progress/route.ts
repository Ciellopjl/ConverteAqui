import { NextRequest, NextResponse } from 'next/server';
import { getTask } from '@/lib/tasks';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const taskId = searchParams.get('taskId');

  if (!taskId) {
    return NextResponse.json({ error: 'taskId obrigatório' }, { status: 400 });
  }

  const isLocalDev = process.env.NODE_ENV === 'development' && !process.env.BACKEND_URL;
  const backendUrl = process.env.BACKEND_URL || (isLocalDev ? null : 'https://ciello-upload.onrender.com');

  if (backendUrl) {
    const res = await fetch(`${backendUrl}/api/progress?taskId=${taskId}`);
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      return NextResponse.json({ error: errorData.error || 'Erro no servidor remoto.' }, { status: res.status });
    }
    const data = await res.json();
    return NextResponse.json(data);
  }

  const task = getTask(taskId);

  if (!task) {
    return NextResponse.json({ error: 'Tarefa não encontrada' }, { status: 404 });
  }

  return NextResponse.json(task);
}
