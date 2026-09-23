import type { FocusSessionSummary } from '@/lib/queries/focus';
import { formatDuration } from '@/lib/display-helpers';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatStatus } from './focus.utils';

interface FocusSessionsHistoryCardProps {
  todaySessions: FocusSessionSummary[];
  todayFocusMinutes: number;
}

export function FocusSessionsHistoryCard({
  todaySessions,
  todayFocusMinutes,
}: FocusSessionsHistoryCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Today&apos;s Focus Sessions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {todaySessions.length === 0 ? (
          <p className="text-sm text-muted-foreground">No sessions logged yet today.</p>
        ) : (
          todaySessions.map((session) => (
            <div
              key={session.id}
              className="flex items-center justify-between gap-3 rounded-lg border p-3 text-sm"
            >
              <div>
                <p className="font-medium">
                  {session.taskTitle ? session.taskTitle : session.activityLabel}
                </p>
                <p className="text-xs text-muted-foreground">
                  {session.taskTitle ? `${session.activityLabel} • ` : ''}
                  {formatDuration(session.actualMinutes ?? 0)}
                </p>
              </div>
              <Badge variant={session.status === 'COMPLETED' ? 'secondary' : 'outline'}>
                {formatStatus(session.status)}
              </Badge>
            </div>
          ))
        )}

        <div className="rounded-lg bg-muted/50 p-3 text-sm">
          <div className="flex justify-between gap-3">
            <span className="text-muted-foreground">Total focus today</span>
            <span className="font-semibold">{formatDuration(todayFocusMinutes)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
