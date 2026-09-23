import { IconUserPlus } from '@tabler/icons-react';
import type { AssignableStudent, AssignableTeam } from '@/lib/queries/tasks';
import { Button } from '@/components/ui/button';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { TaskFormFields } from './TaskFormFields';

interface AssignTaskModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (formData: FormData) => void;
  isPending: boolean;
  error: string | null;
  assignableStudents: AssignableStudent[];
  assignableTeams: AssignableTeam[];
}

export function AssignTaskModal({
  open,
  onOpenChange,
  onSubmit,
  isPending,
  error,
  assignableStudents,
  assignableTeams,
}: AssignTaskModalProps) {
  const assignmentTargetCount = assignableStudents.length + assignableTeams.length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" disabled={assignmentTargetCount === 0}>
          <IconUserPlus />
          Assign task
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <form action={onSubmit} className="space-y-4">
          <DialogHeader>
            <DialogTitle>Assign mentor/admin task</DialogTitle>
            <DialogDescription>Send work to a scoped student or managed team.</DialogDescription>
          </DialogHeader>

          <TaskFormFields
            error={error}
            titleId="assigned-task-title"
            dueDateId="assigned-task-due-at"
            subtaskId="assigned-task-subtasks"
          />

          <div className="space-y-2">
            <label htmlFor="assigned-task-target" className="text-sm font-medium">
              Assignee
            </label>
            <Select name="target" required>
              <SelectTrigger id="assigned-task-target" className="w-full">
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
  );
}
