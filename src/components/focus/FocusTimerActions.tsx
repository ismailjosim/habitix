import { IconPlayerPause, IconPlayerPlay, IconPlayerStop, IconRefresh } from '@tabler/icons-react';
import { Button } from '@/components/ui/button';
import type { TimerState } from './types';

interface FocusTimerActionsProps {
  timerState: TimerState;
  canStart: boolean;
  isPending: boolean;
  onResume: () => void;
  onStart: () => void;
  onPause: () => void;
  onStop: () => void;
  onReset: () => void;
}

export function FocusTimerActions({
  timerState,
  canStart,
  isPending,
  onResume,
  onStart,
  onPause,
  onStop,
  onReset,
}: FocusTimerActionsProps) {
  return (
    <div className="flex flex-wrap justify-center gap-2">
      {timerState === 'paused' ? (
        <Button type="button" disabled={isPending} onClick={onResume}>
          <IconPlayerPlay />
          Resume
        </Button>
      ) : (
        <Button type="button" disabled={!canStart || isPending} onClick={onStart}>
          <IconPlayerPlay />
          Start
        </Button>
      )}

      <Button
        type="button"
        variant="outline"
        disabled={timerState !== 'running' || isPending}
        onClick={onPause}
      >
        <IconPlayerPause />
        Pause
      </Button>

      <Button
        type="button"
        variant="outline"
        disabled={(timerState !== 'running' && timerState !== 'paused') || isPending}
        onClick={onStop}
      >
        <IconPlayerStop />
        Stop
      </Button>

      <Button type="button" variant="ghost" disabled={isPending} onClick={onReset}>
        <IconRefresh />
        Reset
      </Button>
    </div>
  );
}
