import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DataPanel } from '@/components/shared';
import { EmptyState } from '@/components/shared';
import { StatusBadge, PriorityBadge } from '@/components/shared';
import { formatDate } from '@/lib/display-helpers';
import type { TeamTask } from '@/lib/queries/team-tasks';

interface TeamTasksProps {
  tasks: TeamTask[];
}

export function TeamTasks({ tasks }: TeamTasksProps) {
  if (tasks.length === 0) {
    return (
      <EmptyState
        title="No assigned tasks"
        description="No mentor-assigned tasks yet for this team"
      />
    );
  }

  return (
    <DataPanel
      title="Assigned Tasks"
      description={`${tasks.length} task${tasks.length !== 1 ? 's' : ''}`}
    >
      <div className="space-y-3">
        {tasks.map((task) => (
          <Card key={task.id} className="border">
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <CardTitle className="text-base">{task.title}</CardTitle>
                  {task.description && (
                    <CardDescription className="mt-1">{task.description}</CardDescription>
                  )}
                </div>
                <div className="flex gap-1">
                  <StatusBadge status={task.status} />
                  <PriorityBadge priority={task.priority} />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between text-sm">
                <div className="text-muted-foreground">
                  <p>
                    From{' '}
                    <span className="font-medium text-foreground">
                      {task.createdBy.displayName}
                    </span>
                  </p>
                  {task.assignedTo && (
                    <p>
                      Assigned to{' '}
                      <span className="font-medium text-foreground">
                        {task.assignedTo.displayName}
                      </span>
                    </p>
                  )}
                </div>
                {task.dueAt && (
                  <div className="text-right">
                    <p className="font-medium">Due {formatDate(task.dueAt)}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </DataPanel>
  );
}
