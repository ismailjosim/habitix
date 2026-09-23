import { IconChecklist } from '@tabler/icons-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { formatDate, getStatusLabel } from '@/lib/display-helpers';

interface CorporateStudentTasksCardProps {
  tasks: {
    items: {
      id: string;
      title: string;
      category: string | null;
      createdAt: Date;
      status: string;
    }[];
    completed: number;
    total: number;
    completionRate: number;
    overdue: number;
  };
}

export function CorporateStudentTasksCard({ tasks }: CorporateStudentTasksCardProps) {
  return (
    <Card className="break-inside-avoid">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <IconChecklist className="size-5 text-primary" /> Tasks
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-3 text-center">
          <MiniMetric label="Completed" value={`${tasks.completed}/${tasks.total}`} />
          <MiniMetric label="Completion" value={`${tasks.completionRate}%`} />
          <MiniMetric label="Overdue" value={String(tasks.overdue)} />
        </div>
        <Progress value={tasks.completionRate} />
        <div className="space-y-3">
          {tasks.items.slice(0, 8).map((task) => (
            <div
              key={task.id}
              className="flex items-center justify-between gap-3 border-t pt-3 text-sm"
            >
              <div>
                <p className="font-medium">{task.title}</p>
                <p className="text-xs text-muted-foreground">
                  {task.category ?? 'General'} • Created {formatDate(task.createdAt)}
                </p>
              </div>
              <Badge variant={task.status === 'DONE' ? 'secondary' : 'outline'}>
                {getStatusLabel(task.status)}
              </Badge>
            </div>
          ))}
          {!tasks.items.length && (
            <p className="rounded-lg border border-dashed p-5 text-center text-sm text-muted-foreground">
              No task activity in this period.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function MiniMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-muted/50 p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-lg font-bold">{value}</p>
    </div>
  );
}
