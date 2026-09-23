import type { BoardTask } from '@/lib/queries/tasks';
import { cn } from '@/lib/utils';
import { EmptyState } from '@/components/shared';
import { Badge } from '@/components/ui/badge';
import { TaskCard } from './TaskCard';
import type { BoardStatus, BoardStatusConfig } from './types';

interface TaskBoardColumnProps {
  column: BoardStatusConfig;
  tasks: BoardTask[];
  isPending: boolean;
  onMove: (taskId: string, status: BoardStatus) => void;
}

export function TaskBoardColumn({ column, tasks, isPending, onMove }: TaskBoardColumnProps) {
  const Icon = column.icon;

  return (
    <section className={cn('min-h-80 rounded-lg border p-3', column.tone)}>
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex size-7 items-center justify-center rounded-md bg-background">
            <Icon className="size-4" />
          </span>
          <h2 className="text-sm font-semibold">{column.title}</h2>
        </div>
        <Badge variant="secondary">{tasks.length}</Badge>
      </div>

      <div className="max-h-180 space-y-3 overflow-y-auto pr-1">
        {tasks.length === 0 ? (
          <EmptyState title={`No ${column.title.toLowerCase()} tasks`} />
        ) : (
          tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              currentStatus={column.value}
              disabled={isPending}
              onMove={onMove}
            />
          ))
        )}
      </div>
    </section>
  );
}
