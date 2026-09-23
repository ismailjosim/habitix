import { IconCircleCheck, IconUserPlus, IconUsers } from '@tabler/icons-react';
import type { AssignableStudent, AssignableTeam } from '@/lib/queries/tasks';
import { AssignTaskModal } from './AssignTaskModal';
import { CreateTaskModal } from './CreateTaskModal';

interface TaskBoardHeaderProps {
  canAssignTasks: boolean;
  assignDialogOpen: boolean;
  setAssignDialogOpen: (open: boolean) => void;
  dialogOpen: boolean;
  setDialogOpen: (open: boolean) => void;
  handleAssignTask: (formData: FormData) => void;
  handleCreateTask: (formData: FormData) => void;
  isPending: boolean;
  error: string | null;
  assignableStudents: AssignableStudent[];
  assignableTeams: AssignableTeam[];
  assignedByMeCount: number;
  assignedByMeDoneCount: number;
}

export function TaskBoardHeader({
  canAssignTasks,
  assignDialogOpen,
  setAssignDialogOpen,
  dialogOpen,
  setDialogOpen,
  handleAssignTask,
  handleCreateTask,
  isPending,
  error,
  assignableStudents,
  assignableTeams,
  assignedByMeCount,
  assignedByMeDoneCount,
}: TaskBoardHeaderProps) {
  const assignmentTargetCount = assignableStudents.length + assignableTeams.length;

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
            <AssignTaskModal
              open={assignDialogOpen}
              onOpenChange={setAssignDialogOpen}
              onSubmit={handleAssignTask}
              isPending={isPending}
              error={error}
              assignableStudents={assignableStudents}
              assignableTeams={assignableTeams}
            />
          )}

          <CreateTaskModal
            open={dialogOpen}
            onOpenChange={setDialogOpen}
            onSubmit={handleCreateTask}
            isPending={isPending}
            error={error}
          />
        </div>
      </div>

      {canAssignTasks && (
        <div className="grid gap-3 md:grid-cols-3">
          <AssignmentMetric icon={IconUserPlus} label="Assigned by you" value={assignedByMeCount} />
          <AssignmentMetric
            icon={IconCircleCheck}
            label="Completed"
            value={assignedByMeDoneCount}
          />
          <AssignmentMetric
            icon={IconUsers}
            label="Assignable targets"
            value={assignmentTargetCount}
          />
        </div>
      )}
    </div>
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
