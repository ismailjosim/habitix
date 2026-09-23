import { IconCheck, IconPlus } from '@tabler/icons-react';
import type { TaskDetail } from '@/lib/queries/task-detail';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

interface TaskSubtasksCardProps {
  task: TaskDetail;
  isPending: boolean;
  onToggleSubtask: (subtaskId: string, isDone: boolean) => void;
  onCreateSubtask: (formData: FormData) => void;
}

export function TaskSubtasksCard({
  task,
  isPending,
  onToggleSubtask,
  onCreateSubtask,
}: TaskSubtasksCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Subtasks</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          {task.subtasks.length === 0 ? (
            <p className="text-sm text-muted-foreground">No subtasks yet.</p>
          ) : (
            task.subtasks.map((subtask) => (
              <div
                key={subtask.id}
                className={cn(
                  'flex items-center justify-between gap-3 rounded-lg border p-3 text-sm',
                  subtask.isDone && 'bg-muted/40 text-muted-foreground'
                )}
              >
                <div className="flex items-center gap-3">
                  <Button
                    type="button"
                    variant={subtask.isDone ? 'secondary' : 'outline'}
                    size="icon-xs"
                    disabled={!task.canManage || isPending}
                    aria-label={`Mark subtask ${subtask.title} as ${subtask.isDone ? 'incomplete' : 'complete'}`}
                    onClick={() => onToggleSubtask(subtask.id, !subtask.isDone)}
                  >
                    <IconCheck className={cn('size-3.5', !subtask.isDone && 'opacity-0')} />
                  </Button>
                  <span className={cn(subtask.isDone && 'line-through')}>{subtask.title}</span>
                </div>
              </div>
            ))
          )}
        </div>

        {task.canManage && (
          <form action={onCreateSubtask} className="flex gap-2">
            <Input name="title" placeholder="Add a new subtask" required />
            <Button type="submit" variant="outline" disabled={isPending}>
              <IconPlus />
              Add
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
