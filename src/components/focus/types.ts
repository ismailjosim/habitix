import type { ActiveFocusSession, FocusSessionSummary, FocusTaskOption } from '@/lib/queries/focus';

export type TimerState = 'idle' | 'running' | 'paused' | 'completed' | 'stopped';

export interface FocusModeTimerProps {
  tasks: FocusTaskOption[];
  todaySessions: FocusSessionSummary[];
  activeSession: ActiveFocusSession | null;
  todayFocusMinutes: number;
}
