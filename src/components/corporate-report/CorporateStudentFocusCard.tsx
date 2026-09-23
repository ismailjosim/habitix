import { IconTargetArrow } from '@tabler/icons-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { formatDate, formatDuration, getStatusLabel } from '@/lib/display-helpers';

interface CorporateStudentFocusCardProps {
  focus: {
    sessions: {
      id: string;
      activityType: string;
      actualMinutes: number | null;
      completedAt: Date | null;
      task: { title: string; category: string | null } | null;
    }[];
    activeDays: number;
    completionRate: number;
  };
}

export function CorporateStudentFocusCard({ focus }: CorporateStudentFocusCardProps) {
  return (
    <Card className="break-inside-avoid">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <IconTargetArrow className="size-5 text-primary" /> Focus
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-3 text-center">
          <MiniMetric label="Sessions" value={String(focus.sessions.length)} />
          <MiniMetric label="Active days" value={String(focus.activeDays)} />
          <MiniMetric label="Adherence" value={`${focus.completionRate}%`} />
        </div>
        <Progress value={Math.min(focus.completionRate, 100)} />
        <div className="space-y-3">
          {focus.sessions.slice(0, 6).map((session) => (
            <div
              key={session.id}
              className="flex items-center justify-between gap-3 border-t pt-3 text-sm"
            >
              <div>
                <p className="font-medium">
                  {session.task?.title ?? getStatusLabel(session.activityType)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {session.completedAt ? formatDate(session.completedAt) : 'No completion date'}
                  {session.task?.category ? ` • ${session.task.category}` : ''}
                </p>
              </div>
              <span className="font-semibold">{formatDuration(session.actualMinutes ?? 0)}</span>
            </div>
          ))}
          {!focus.sessions.length && (
            <p className="rounded-lg border border-dashed p-5 text-center text-sm text-muted-foreground">
              No completed focus sessions in this period.
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
