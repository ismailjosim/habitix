import Link from 'next/link';
import { IconArrowLeft } from '@tabler/icons-react';
import type { TaskDetail } from '@/lib/queries/task-detail';
import { formatDate } from '@/lib/display-helpers';
import { PriorityBadge, StatusBadge } from '@/components/shared/badge-variants';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface TaskDetailHeaderProps {
  task: TaskDetail;
  progress: number;
  doneSubtasks: number;
  totalSubtasks: number;
  error: string | null;
}

export function TaskDetailHeader({
  task,
  progress,
  doneSubtasks,
  totalSubtasks,
  error,
}: TaskDetailHeaderProps) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
      <div className="space-y-3">
        <Button asChild variant="ghost" className="w-fit px-0">
          <Link href="/tasks">
            <IconArrowLeft />
            Back to tasks
          </Link>
        </Button>

        <div className="space-y-2">
          <div className="flex flex-wrap gap-2">
            <StatusBadge status={task.status} />
            <PriorityBadge priority={task.priority} />
            {task.category && <Badge variant="outline">{task.category}</Badge>}
          </div>
          <h1 className="max-w-4xl text-3xl font-bold tracking-normal">{task.title}</h1>
          <p className="text-sm text-muted-foreground">
            Created by {task.createdBy.displayName}
            {task.dueAt ? ` • due ${formatDate(task.dueAt)}` : ''}
          </p>
        </div>
      </div>

      <Card className="lg:sticky lg:top-20 lg:w-80">
        <CardHeader>
          <CardTitle className="text-base">Completion</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          )}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Subtask progress</span>
              <span className="font-semibold">{progress}%</span>
            </div>
            <Progress value={progress} />
            <p className="text-xs text-muted-foreground">
              {doneSubtasks} of {totalSubtasks} subtasks complete
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
