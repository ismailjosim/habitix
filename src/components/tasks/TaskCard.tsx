import Link from 'next/link';
import { IconArrowRight, IconCalendarDue } from '@tabler/icons-react';
import type { BoardTask } from '@/lib/queries/tasks';
import { formatDate, getStatusLabel } from '@/lib/display-helpers';
import { cn } from '@/lib/utils';
import { PriorityBadge } from '@/components/shared/badge-variants';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { boardStatuses } from './tasks.utils';
import type { BoardStatus } from './types';

interface TaskCardProps {
  task: BoardTask;
  currentStatus: BoardStatus;
  disabled: boolean;
  onMove: (taskId: string, status: BoardStatus) => void;
}

export function TaskCard({ task, currentStatus, disabled, onMove }: TaskCardProps) {
  const doneSubtasks = task.subtasks.filter((subtask) => subtask.isDone).length;
  const totalSubtasks = task.subtasks.length;
  const progress = totalSubtasks ? Math.round((doneSubtasks / totalSubtasks) * 100) : 0;
  const movementOptions = boardStatuses.filter((status) => status.value !== currentStatus);

  return (
    <Card
      className={cn('border bg-background shadow-xs', currentStatus === 'DONE' && 'opacity-80')}
    >
      <CardHeader className="space-y-3 pb-3">
        <div className="flex items-start justify-between gap-2">
          <Link href={`/tasks/${task.id}`} className="min-w-0 flex-1 hover:underline">
            <CardTitle className="line-clamp-2 text-base">{task.title}</CardTitle>
          </Link>
          <PriorityBadge priority={task.priority} />
        </div>

        <div className="flex flex-wrap gap-1.5">
          {task.category && <Badge variant="outline">{task.category}</Badge>}
          {task.type !== 'PERSONAL' && (
            <Badge variant="secondary">{task.type.split('_').join(' ').toLowerCase()}</Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {task.description && (
          <p className="line-clamp-2 text-sm text-muted-foreground">{task.description}</p>
        )}

        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              {doneSubtasks}/{totalSubtasks} subtasks
            </span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
          <div className="flex min-w-0 flex-col gap-1">
            {task.assignedTo && <span>Assigned to {task.assignedTo.displayName}</span>}
            <span>By {task.createdBy.displayName}</span>
          </div>
          {task.dueAt && (
            <span className="inline-flex items-center gap-1 font-medium text-foreground">
              <IconCalendarDue className="size-3.5" />
              {formatDate(task.dueAt)}
            </span>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {movementOptions.map(
            (status) =>
              task.canManage && (
                <Button
                  key={status.value}
                  type="button"
                  variant="outline"
                  size="xs"
                  disabled={disabled}
                  onClick={() => onMove(task.id, status.value)}
                >
                  <IconArrowRight />
                  {getStatusLabel(status.value)}
                </Button>
              )
          )}
        </div>
      </CardContent>
    </Card>
  );
}
