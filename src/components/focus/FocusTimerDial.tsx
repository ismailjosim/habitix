import { IconTargetArrow } from '@tabler/icons-react';
import { Progress } from '@/components/ui/progress';
import { formatClock } from './focus.utils';

interface FocusTimerDialProps {
  remainingSeconds: number;
  progress: number;
}

export function FocusTimerDial({ remainingSeconds, progress }: FocusTimerDialProps) {
  return (
    <div className="space-y-8">
      <div className="flex justify-center">
        <div
          className="grid size-64 place-items-center rounded-full p-3 sm:size-80"
          style={{
            background: `conic-gradient(var(--primary) ${progress * 3.6}deg, var(--muted) 0deg)`,
          }}
        >
          <div className="grid size-full place-items-center rounded-full bg-card">
            <div className="text-center">
              <IconTargetArrow className="mx-auto mb-3 size-8 text-primary" />
              <p
                aria-label={`${formatClock(remainingSeconds)} remaining`}
                className="font-mono text-5xl font-semibold tabular-nums sm:text-6xl"
              >
                {formatClock(remainingSeconds)}
              </p>
              <p className="mt-2 text-sm text-muted-foreground">{progress}% complete</p>
            </div>
          </div>
        </div>
      </div>

      <Progress value={progress} className="h-2" />
    </div>
  );
}
