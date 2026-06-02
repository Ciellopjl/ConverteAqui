export type TaskStatus = 'pending' | 'downloading' | 'converting' | 'completed' | 'error';

export interface Task {
  id: string;
  status: TaskStatus;
  progress: number;
  title?: string;
  thumbnail?: string;
  duration?: number;
  filePath?: string;
  error?: string;
}

// In-memory store (shared across Next.js API routes using globalThis in development)
const globalTasks = globalThis as any;
if (!globalTasks._tasks) {
  globalTasks._tasks = {};
}
const tasks: Record<string, Task> = globalTasks._tasks;

export function getTask(id: string): Task | undefined {
  return tasks[id];
}

export function setTask(id: string, task: Partial<Task>) {
  if (!tasks[id]) {
    tasks[id] = { id, status: 'pending', progress: 0, ...task } as Task;
  } else {
    tasks[id] = { ...tasks[id], ...task };
  }
}

export function deleteTask(id: string) {
  delete tasks[id];
}
