'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import {
  addTaskComment,
  changeTaskStatus,
  createSubtask,
  toggleSubtask,
} from '@/lib/actions/tasks';
import { getStatusLabel } from '@/lib/display-helpers';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { TaskDetailHeader } from './TaskDetailHeader';
import { TaskSubtasksCard } from './TaskSubtasksCard';
import { TaskCommentsCard } from './TaskCommentsCard';
import { TaskActivityHistoryCard } from './TaskActivityHistoryCard';
import { TaskMetadataSidebar } from './TaskMetadataSidebar';
import type { TaskDetailViewProps } from './types';

const completionStatuses = ['TODO', 'IN_PROGRESS', 'DONE'] as const;

export function TaskDetailView({ task }: TaskDetailViewProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const doneSubtasks = task.subtasks.filter((subtask) => subtask.isDone).length;
  const totalSubtasks = task.subtasks.length;
  const progress = totalSubtasks ? Math.round((doneSubtasks / totalSubtasks) * 100) : 0;

  function runAction(action: () => Promise<{ success: boolean; message: string }>) {
    setError(null);
    startTransition(async () => {
      const result = await action();

      if (!result.success) {
        setError(result.message);
        return;
      }

      router.refresh();
    });
  }

  function handleComment(formData: FormData) {
    const body = String(formData.get('body') || '');
    runAction(() => addTaskComment({ taskId: task.id, body }));
  }

  function handleCreateSubtask(formData: FormData) {
    const title = String(formData.get('title') || '');
    runAction(() => createSubtask({ taskId: task.id, title }));
  }

  return (
    <div className="space-y-6">
      <TaskDetailHeader
        task={task}
        progress={progress}
        doneSubtasks={doneSubtasks}
        totalSubtasks={totalSubtasks}
        error={error}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <MetricCard label="Focus time" value={`${task.focusMinutes} min`} />
        <MetricCard label="Subtasks" value={`${doneSubtasks}/${totalSubtasks}`} />
        <MetricCard label="Comments" value={task.comments.length} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
        <main className="space-y-6">
          {task.description && (
            <Card>
              <CardContent className="p-6">
                <h2 className="text-base font-semibold">Description</h2>
                <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">
                  {task.description}
                </p>
              </CardContent>
            </Card>
          )}

          {task.canManage && (
            <Card>
              <CardContent className="flex flex-wrap items-center gap-2 p-4">
                <span className="text-sm font-medium">Update status:</span>
                {completionStatuses.map((status) => (
                  <Button
                    key={status}
                    type="button"
                    variant={task.status === status ? 'secondary' : 'outline'}
                    size="sm"
                    disabled={task.status === status || isPending}
                    onClick={() => runAction(() => changeTaskStatus({ taskId: task.id, status }))}
                  >
                    {getStatusLabel(status)}
                  </Button>
                ))}
              </CardContent>
            </Card>
          )}

          <TaskSubtasksCard
            task={task}
            isPending={isPending}
            onToggleSubtask={(subtaskId, isDone) =>
              runAction(() => toggleSubtask({ subtaskId, isDone }))
            }
            onCreateSubtask={handleCreateSubtask}
          />

          <TaskCommentsCard task={task} isPending={isPending} onComment={handleComment} />

          <TaskActivityHistoryCard activities={task.activities} />
        </main>

        <TaskMetadataSidebar task={task} />
      </div>
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string | number }) {
  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <p className="mt-2 text-2xl font-bold">{value}</p>
      </CardContent>
    </Card>
  );
}
