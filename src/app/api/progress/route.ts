import { NextRequest, NextResponse } from 'next/server';
import { getTask } from '@/lib/tasks';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const taskId = searchParams.get('taskId');

  if (!taskId) {
    return NextResponse.json({ error: 'taskId obrigatório' }, { status: 400 });
  }

  const task = getTask(taskId);

  if (!task) {
    return NextResponse.json({ error: 'Tarefa não encontrada' }, { status: 404 });
  }

  return NextResponse.json(task);
}
