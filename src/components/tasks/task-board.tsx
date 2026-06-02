'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState, useTransition } from 'react';
import {
  IconArrowRight,
  IconCalendarDue,
  IconChecklist,
  IconCircleCheck,
  IconClockHour4,
  IconPlus,
  IconUserPlus,
  IconUsers,
} from '@tabler/icons-react';

import { createTask, changeTaskStatus } from '@/lib/actions/tasks';
import type { AssignableStudent, AssignableTeam, BoardTask } from '@/lib/queries/tasks';
import { formatDate, getStatusLabel } from '@/lib/display-helpers';
import { cn } from '@/lib/utils';
import { EmptyState } from '@/components/shared';
import { PriorityBadge } from '@/components/shared/badge-variants';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

type BoardSection = 'personal' | 'assigned';
type BoardStatus = 'TODO' | 'IN_PROGRESS' | 'DONE';

const boardStatuses: {
  value: BoardStatus;
  title: string;
  icon: typeof IconChecklist;
  tone: string;
}[] = [
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

const categories = [
  'Coding',
  'Debugging',
  'Learning',
  'Writing',
  'Backend',
  'Frontend',
  'Database',
  'Styling',
];

const priorities = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];

interface TaskBoardProps {
  personalTasks: BoardTask[];
  assignedTasks: BoardTask[];
  assignableStudents: AssignableStudent[];
  assignableTeams: AssignableTeam[];
  currentRole: string | null;
  currentProfileId: string | null;
  canAssignTasks: boolean;
}

export function TaskBoard({
  personalTasks,
  assignedTasks,
  assignableStudents,
  assignableTeams,
  currentRole,
  currentProfileId,
  canAssignTasks,
}: TaskBoardProps) {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState<BoardSection>('personal');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const activeTasks = activeSection === 'personal' ? personalTasks : assignedTasks;
  const groupedTasks = useMemo(() => groupTasks(activeTasks), [activeTasks]);
  const assignedByMe = assignedTasks.filter((task) => task.createdBy.id === currentProfileId);
  const assignedByMeDone = assignedByMe.filter((task) => task.status === 'DONE').length;
  const blockedCount = activeTasks.filter((task) => task.status === 'BLOCKED').length;
  const reviewCount = activeTasks.filter((task) => task.status === 'IN_REVIEW').length;
  const assignmentTargetCount = assignableStudents.length + assignableTeams.length;

  function handleCreateTask(formData: FormData) {
    setError(null);

    startTransition(async () => {
      const title = String(formData.get('title') || '');
      const result = await createTask({
        title,
        description: String(formData.get('description') || ''),
        category: String(formData.get('category') || ''),
        priority: String(formData.get('priority') || 'MEDIUM'),
        dueAt: String(formData.get('dueAt') || ''),
        type: 'personal',
        subtasks: String(formData.get('subtasks') || '')
          .split('\n')
          .map((line) => line.trim())
          .filter(Boolean)
          .map((line) => ({ title: line })),
      });

      if (!result.success) {
        setError(result.message);
        return;
      }

      setDialogOpen(false);
      router.refresh();
    });
  }

  function handleAssignTask(formData: FormData) {
    setError(null);

    startTransition(async () => {
      const target = String(formData.get('target') || '');
      const [targetType, targetId] = target.split(':');

      if (!targetId || !['student', 'team'].includes(targetType)) {
        setError('Choose a student or team assignee');
        return;
      }

      const result = await createTask({
        title: String(formData.get('title') || ''),
        description: String(formData.get('description') || ''),
        category: String(formData.get('category') || ''),
        priority: String(formData.get('priority') || 'MEDIUM'),
        dueAt: String(formData.get('dueAt') || ''),
        type:
          targetType === 'team'
            ? 'team'
            : currentRole === 'ADMIN' || currentRole === 'MODERATOR'
              ? 'admin'
              : 'mentor',
        assignedToProfileId: targetType === 'student' ? targetId : null,
        teamId: targetType === 'team' ? targetId : null,
        subtasks: String(formData.get('subtasks') || '')
          .split('\n')
          .map((line) => line.trim())
          .filter(Boolean)
          .map((line) => ({ title: line })),
      });

      if (!result.success) {
        setError(result.message);
        return;
      }

      setAssignDialogOpen(false);
      setActiveSection('assigned');
      router.refresh();
    });
  }

  function moveTask(taskId: string, status: BoardStatus) {
    startTransition(async () => {
      const result = await changeTaskStatus({ taskId, status });

      if (!result.success) {
        setError(result.message);
        return;
      }

      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">Work management</p>
          <h1 className="text-3xl font-bold tracking-normal">Tasks</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Plan personal work, track assigned tasks, and move active work across the board.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {canAssignTasks && (
            <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" disabled={assignmentTargetCount === 0}>
                  <IconUserPlus />
                  Assign task
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <form action={handleAssignTask} className="space-y-4">
                  <DialogHeader>
                    <DialogTitle>Assign mentor/admin task</DialogTitle>
                    <DialogDescription>
                      Send work to a scoped student or managed team.
                    </DialogDescription>
                  </DialogHeader>

                  <TaskFormFields
                    error={error}
                    titleId="assigned-task-title"
                    dueDateId="assigned-task-due-at"
                    subtaskId="assigned-task-subtasks"
                  />

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Assignee</label>
                    <Select name="target" required>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Choose student or team" />
                      </SelectTrigger>
                      <SelectContent>
                        {assignableStudents.map((student) => (
                          <SelectItem key={student.id} value={`student:${student.id}`}>
                            {student.displayName}
                            {student.teamName ? ` - ${student.teamName}` : ''}
                          </SelectItem>
                        ))}
                        {assignableTeams.map((team) => (
                          <SelectItem key={team.id} value={`team:${team.id}`}>
                            {team.name} team ({team.memberCount})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <DialogFooter>
                    <DialogClose asChild>
                      <Button type="button" variant="outline">
                        Cancel
                      </Button>
                    </DialogClose>
                    <Button type="submit" disabled={isPending}>
                      Assign task
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          )}

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <IconPlus />
                New task
              </Button>
            </DialogTrigger>
            <DialogContent>
              <form action={handleCreateTask} className="space-y-4">
                <DialogHeader>
                  <DialogTitle>Create personal task</DialogTitle>
                  <DialogDescription>
                    Add a task to your private board with optional subtasks.
                  </DialogDescription>
                </DialogHeader>

                <TaskFormFields
                  error={error}
                  titleId="task-title"
                  dueDateId="task-due-at"
                  subtaskId="task-subtasks"
                />

                <DialogFooter>
                  <DialogClose asChild>
                    <Button type="button" variant="outline">
                      Cancel
                    </Button>
                  </DialogClose>
                  <Button type="submit" disabled={isPending}>
                    Create task
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {canAssignTasks && (
        <div className="grid gap-3 md:grid-cols-3">
          <AssignmentMetric
            icon={IconUserPlus}
            label="Assigned by you"
            value={assignedByMe.length}
          />
          <AssignmentMetric icon={IconCircleCheck} label="Completed" value={assignedByMeDone} />
          <AssignmentMetric
            icon={IconUsers}
            label="Assignable targets"
            value={assignmentTargetCount}
          />
        </div>
      )}

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="inline-flex w-full rounded-lg border bg-background p-1 sm:w-fit">
          <Button
            type="button"
            variant={activeSection === 'personal' ? 'secondary' : 'ghost'}
            className="flex-1 sm:flex-none"
            onClick={() => setActiveSection('personal')}
          >
            My Tasks
            <Badge variant="secondary">{personalTasks.length}</Badge>
          </Button>
          <Button
            type="button"
            variant={activeSection === 'assigned' ? 'secondary' : 'ghost'}
            className="flex-1 sm:flex-none"
            onClick={() => setActiveSection('assigned')}
          >
            Mentor/Admin Tasks
            <Badge variant="secondary">{assignedTasks.length}</Badge>
          </Button>
        </div>

        <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
          <Badge variant="outline">{blockedCount} blocked</Badge>
          <Badge variant="outline">{reviewCount} in review</Badge>
          <Badge variant="outline">{activeTasks.length} visible</Badge>
        </div>
      </div>

      {error && !dialogOpen && (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="grid gap-4 xl:grid-cols-3">
        {boardStatuses.map((column) => {
          const tasks = groupedTasks[column.value];
          const Icon = column.icon;

          return (
            <section
              key={column.value}
              className={cn('min-h-80 rounded-lg border p-3', column.tone)}
            >
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
                      onMove={moveTask}
                    />
                  ))
                )}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}

function TaskFormFields({
  error,
  titleId,
  dueDateId,
  subtaskId,
}: {
  error: string | null;
  titleId: string;
  dueDateId: string;
  subtaskId: string;
}) {
  return (
    <>
      {error && (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <label className="text-sm font-medium" htmlFor={titleId}>
          Title
        </label>
        <Input id={titleId} name="title" placeholder="Build API validation" required />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium" htmlFor={`${titleId}-description`}>
          Description
        </label>
        <Textarea
          id={`${titleId}-description`}
          name="description"
          placeholder="Add useful context"
          rows={3}
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="space-y-2">
          <label className="text-sm font-medium">Category</label>
          <Select name="category" defaultValue="Coding">
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Priority</label>
          <Select name="priority" defaultValue="MEDIUM">
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {priorities.map((priority) => (
                <SelectItem key={priority} value={priority}>
                  {priority.charAt(0) + priority.slice(1).toLowerCase()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor={dueDateId}>
            Due date
          </label>
          <Input id={dueDateId} name="dueAt" type="date" />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium" htmlFor={subtaskId}>
          Subtasks
        </label>
        <Textarea id={subtaskId} name="subtasks" placeholder="One subtask per line" rows={3} />
      </div>
    </>
  );
}

function AssignmentMetric({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof IconUserPlus;
  label: string;
  value: number;
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border bg-background p-3">
      <span className="flex size-8 items-center justify-center rounded-md bg-muted">
        <Icon className="size-4" />
      </span>
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">{value} total</p>
      </div>
    </div>
  );
}

function TaskCard({
  task,
  currentStatus,
  disabled,
  onMove,
}: {
  task: BoardTask;
  currentStatus: BoardStatus;
  disabled: boolean;
  onMove: (taskId: string, status: BoardStatus) => void;
}) {
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
          {movementOptions.map((status) => (
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
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function groupTasks(tasks: BoardTask[]): Record<BoardStatus, BoardTask[]> {
  return {
    TODO: tasks.filter((task) => task.status === 'TODO' || task.status === 'BLOCKED'),
    IN_PROGRESS: tasks.filter(
      (task) => task.status === 'IN_PROGRESS' || task.status === 'IN_REVIEW'
    ),
    DONE: tasks.filter((task) => task.status === 'DONE'),
  };
}
