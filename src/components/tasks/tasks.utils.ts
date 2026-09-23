import { IconChecklist, IconCircleCheck, IconClockHour4 } from '@tabler/icons-react';
import type { BoardTask } from '@/lib/queries/tasks';
import type { BoardStatus, BoardStatusConfig } from './types';

export const boardStatuses: BoardStatusConfig[] = [
  {
    value: 'TODO',
    title: 'To Do',
    icon: IconChecklist,
    tone: 'border-slate-200 bg-slate-50/70',
  },
  {
    value: 'IN_PROGRESS',
    title: 'In Progress',
    icon: IconClockHour4,
    tone: 'border-sky-200 bg-sky-50/70',
  },
  {
    value: 'DONE',
    title: 'Done',
    icon: IconCircleCheck,
    tone: 'border-emerald-200 bg-emerald-50/70',
  },
];

export const taskCategories = [
  'Coding',
  'Debugging',
  'Learning',
  'Writing',
  'Backend',
  'Frontend',
  'Database',
  'Styling',
];

export const taskPriorities = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];

export function groupTasks(tasks: BoardTask[]): Record<BoardStatus, BoardTask[]> {
  return {
    TODO: tasks.filter((task) => task.status === 'TODO' || task.status === 'BLOCKED'),
    IN_PROGRESS: tasks.filter(
      (task) => task.status === 'IN_PROGRESS' || task.status === 'IN_REVIEW'
    ),
    DONE: tasks.filter((task) => task.status === 'DONE'),
  };
}

export function normalizedFilter(value?: string) {
  return value && value !== 'all' ? value : undefined;
}
