import { IconBrandVscode } from '@tabler/icons-react';
import type { FocusTaskOption } from '@/lib/queries/focus';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatElapsed } from './focus.utils';
import type { TimerState } from './types';

interface FocusVsCodeIntegrationCardProps {
  sessionId: string | null;
  activityType: string;
  selectedTask: FocusTaskOption | null;
  durationMinutes: number;
  elapsedSeconds: number;
  timerState: TimerState;
}

export function FocusVsCodeIntegrationCard({
  sessionId,
  activityType,
  selectedTask,
  durationMinutes,
  elapsedSeconds,
  timerState,
}: FocusVsCodeIntegrationCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <IconBrandVscode className="size-5" />
          VS Code
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <StatusRow label="Extension" value="Not connected" tone="muted" />
        <StatusRow label="Session sync" value={sessionId ? 'Persisting' : 'Ready'} tone="ready" />
        <StatusRow label="Activity" value={activityType} tone="ready" />
        <StatusRow
          label="Task link"
          value={selectedTask ? selectedTask.title : 'Optional'}
          tone={selectedTask ? 'ready' : 'muted'}
        />
        <div className="rounded-lg border bg-muted/40 p-3">
          <p className="text-sm font-medium">Current session</p>
          <div className="mt-3 space-y-2 text-sm text-muted-foreground">
            <div className="flex justify-between gap-3">
              <span>Duration</span>
              <span className="font-medium text-foreground">{durationMinutes}m</span>
            </div>
            <div className="flex justify-between gap-3">
              <span>Elapsed</span>
              <span className="font-medium text-foreground">{formatElapsed(elapsedSeconds)}</span>
            </div>
            <div className="flex justify-between gap-3">
              <span>State</span>
              <span className="font-medium text-foreground capitalize">{timerState}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function StatusRow({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: 'ready' | 'muted';
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border p-3 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span
        className={cn(
          'max-w-40 truncate text-right font-medium',
          tone === 'ready' ? 'text-success' : 'text-muted-foreground'
        )}
      >
        {value}
      </span>
    </div>
  );
}
