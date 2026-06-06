'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import {
  IconArrowLeft,
  IconCalendarDue,
  IconCheck,
  IconClockHour4,
  IconMessageCircle,
  IconPlus,
  IconUserCircle,
} from '@tabler/icons-react';

import {
  addTaskComment,
  changeTaskStatus,
  createSubtask,
  toggleSubtask,
} from '@/lib/actions/tasks';
import type { TaskDetail } from '@/lib/queries/task-detail';
import { formatDate, formatDateTime, formatDuration, getStatusLabel } from '@/lib/display-helpers';
import { cn } from '@/lib/utils';
import { PriorityBadge, RoleBadge, StatusBadge } from '@/components/shared/badge-variants';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';

interface TaskDetailViewProps {
  task: TaskDetail;
}

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
              {task.dueAt ? ` · due ${formatDate(task.dueAt)}` : ''}
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
            <div className="grid grid-cols-3 gap-2">
              {completionStatuses.map((status) => (
                <Button
                  key={status}
                  type="button"
                  variant={task.status === status ? 'secondary' : 'outline'}
                  size="sm"
                  disabled={isPending || task.status === status}
                  onClick={() => runAction(() => changeTaskStatus({ taskId: task.id, status }))}
                >
                  {status === 'DONE' ? <IconCheck /> : null}
                  {status === 'IN_PROGRESS' ? <IconClockHour4 /> : null}
                  {status === 'TODO' ? <IconUserCircle /> : null}
                  {getStatusLabel(status)}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <main className="space-y-6">
          <div className="grid gap-3 md:grid-cols-3">
            <MetricCard label="Status" value={getStatusLabel(task.status)} />
            <MetricCard label="Focus time" value={formatDuration(task.focusMinutes)} />
            <MetricCard label="Comments" value={task.comments.length} />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              {task.description ? (
                <p className="whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
                  {task.description}
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">No description has been added.</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="space-y-1">
              <CardTitle>Subtasks</CardTitle>
              <p className="text-sm text-muted-foreground">
                Toggle checklist items to update task progress.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {task.subtasks.length === 0 ? (
                <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                  No subtasks yet.
                </div>
              ) : (
                <div className="space-y-2">
                  {task.subtasks.map((subtask) => (
                    <label
                      key={subtask.id}
                      className={cn(
                        'flex items-center gap-3 rounded-lg border p-3 text-sm',
                        subtask.isDone && 'bg-muted/50 text-muted-foreground'
                      )}
                    >
                      <input
                        type="checkbox"
                        checked={subtask.isDone}
                        disabled={isPending}
                        onChange={(event) =>
                          runAction(() =>
                            toggleSubtask({
                              subtaskId: subtask.id,
                              isDone: event.currentTarget.checked,
                            })
                          )
                        }
                        className="size-4 rounded border-border"
                      />
                      <span className={cn(subtask.isDone && 'line-through')}>{subtask.title}</span>
                    </label>
                  ))}
                </div>
              )}

              <form action={handleCreateSubtask} className="flex gap-2">
                <Input name="title" placeholder="Add subtask" required />
                <Button type="submit" disabled={isPending}>
                  <IconPlus />
                  Add
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Comments</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <form action={handleComment} className="space-y-3">
                <Textarea name="body" placeholder="Add a comment" rows={3} required />
                <Button type="submit" disabled={isPending}>
                  <IconMessageCircle />
                  Comment
                </Button>
              </form>

              <Separator />

              <div className="space-y-4">
                {task.comments.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No comments yet.</p>
                ) : (
                  task.comments.map((comment) => (
                    <div key={comment.id} className="flex gap-3">
                      <UserAvatar user={comment.author} />
                      <div className="min-w-0 flex-1 rounded-lg bg-muted/50 p-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-semibold">
                            {comment.author.displayName}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {formatDateTime(comment.createdAt)}
                          </span>
                        </div>
                        <p className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground">
                          {comment.body}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Activity History</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {task.activities.length === 0 ? (
                <p className="text-sm text-muted-foreground">No activity recorded yet.</p>
              ) : (
                task.activities.map((activity) => (
                  <div key={activity.id} className="flex gap-3">
                    <UserAvatar user={activity.actor} />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm">
                        <span className="font-semibold">{activity.actor.displayName}</span>{' '}
                        {formatActivity(activity.eventType)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {activity.fromStatus && activity.toStatus
                          ? `${getStatusLabel(activity.fromStatus)} to ${getStatusLabel(
                              activity.toStatus
                            )} · `
                          : ''}
                        {formatDateTime(activity.createdAt)}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </main>

        <aside className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Task Metadata</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <MetadataRow label="Type" value={task.type.split('_').join(' ').toLowerCase()} />
              <MetadataRow label="Category" value={task.category ?? 'Uncategorized'} />
              <MetadataRow label="Due date" value={task.dueAt ? formatDate(task.dueAt) : 'None'} />
              <MetadataRow label="Created" value={formatDate(task.createdAt)} />
              {task.completedAt && (
                <MetadataRow label="Completed" value={formatDate(task.completedAt)} />
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Assigned Members</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <MemberRow label="Assigner" user={task.createdBy} />
              {task.assignedTo ? (
                <MemberRow label="Assignee" user={task.assignedTo} />
              ) : (
                <p className="text-sm text-muted-foreground">No direct assignee.</p>
              )}

              {task.assignedMembers.length > 0 && (
                <>
                  <Separator />
                  <div className="space-y-3">
                    {task.assignedMembers.map((member) => (
                      <MemberRow key={member.id} label="Member" user={member} />
                    ))}
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Focus Sessions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
                <span className="text-sm text-muted-foreground">Total time spent</span>
                <span className="font-semibold">{formatDuration(task.focusMinutes)}</span>
              </div>
              <div className="space-y-2">
                {task.focusSessions.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No completed focus sessions.</p>
                ) : (
                  task.focusSessions.slice(0, 5).map((session) => (
                    <div
                      key={session.id}
                      className="flex items-center justify-between text-sm text-muted-foreground"
                    >
                      <span className="inline-flex items-center gap-1">
                        <IconCalendarDue className="size-3.5" />
                        {session.startedAt ? formatDate(session.startedAt) : 'Unscheduled'}
                      </span>
                      <span>{formatDuration(session.actualMinutes ?? session.plannedMinutes)}</span>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </aside>
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

function MetadataRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium capitalize">{value}</span>
    </div>
  );
}

function MemberRow({
  label,
  user,
}: {
  label: string;
  user: {
    displayName: string;
    avatarUrl: string | null;
    role: string;
  };
}) {
  return (
    <div className="flex items-center gap-3">
      <UserAvatar user={user} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{user.displayName}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
      <RoleBadge role={user.role} />
    </div>
  );
}

function UserAvatar({
  user,
}: {
  user: {
    displayName: string;
    avatarUrl: string | null;
  };
}) {
  return (
    <Avatar>
      <AvatarImage src={user.avatarUrl ?? undefined} />
      <AvatarFallback>{getInitials(user.displayName)}</AvatarFallback>
    </Avatar>
  );
}

function getInitials(name: string) {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function formatActivity(eventType: string) {
  return eventType.split('_').join(' ');
}
