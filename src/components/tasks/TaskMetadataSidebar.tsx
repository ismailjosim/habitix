import { IconCalendarDue } from '@tabler/icons-react';
import type { TaskDetail } from '@/lib/queries/task-detail';
import { formatDate, formatDuration } from '@/lib/display-helpers';
import { RoleBadge } from '@/components/shared/badge-variants';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

interface TaskMetadataSidebarProps {
  task: TaskDetail;
}

export function TaskMetadataSidebar({ task }: TaskMetadataSidebarProps) {
  return (
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
      <Avatar>
        <AvatarImage src={user.avatarUrl ?? undefined} />
        <AvatarFallback>{getInitials(user.displayName)}</AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{user.displayName}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
      <RoleBadge role={user.role} />
    </div>
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
