'use client';

import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  IconBrandVscode,
  IconPlayerPause,
  IconPlayerPlay,
  IconPlayerStop,
  IconRefresh,
  IconTargetArrow,
} from '@tabler/icons-react';

import {
  completeFocusSession,
  pauseFocusSession,
  resumeFocusSession,
  startFocusSession,
  stopFocusSession,
} from '@/lib/actions/focus';
import type { ActiveFocusSession, FocusSessionSummary, FocusTaskOption } from '@/lib/queries/focus';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type TimerState = 'idle' | 'running' | 'paused' | 'completed' | 'stopped';

const durationOptions = [25, 45, 50] as const;

const activityTypes = [
  'Coding',
  'Debugging',
  'Writing',
  'Learning',
  'Reading',
  'Research',
  'Meeting',
  'Other',
] as const;

interface FocusModeTimerProps {
  tasks: FocusTaskOption[];
  todaySessions: FocusSessionSummary[];
  activeSession: ActiveFocusSession | null;
  todayFocusMinutes: number;
}

export function FocusModeTimer({
  tasks,
  todaySessions,
  activeSession,
  todayFocusMinutes,
}: FocusModeTimerProps) {
  const router = useRouter();
  const completingRef = useRef(false);
  const [isPending, startTransition] = useTransition();
  const [sessionId, setSessionId] = useState<string | null>(activeSession?.id ?? null);
  const [durationMinutes, setDurationMinutes] = useState<number>(
    activeSession?.plannedMinutes ?? 25
  );
  const [activityType, setActivityType] = useState<string>(
    activeSession?.activityLabel ?? 'Coding'
  );
  const [taskId, setTaskId] = useState<string>(activeSession?.taskId ?? 'none');
  const [timerState, setTimerState] = useState<TimerState>(
    activeSession?.status === 'ACTIVE'
      ? 'running'
      : activeSession?.status === 'PAUSED'
        ? 'paused'
        : 'idle'
  );
  const [remainingSeconds, setRemainingSeconds] = useState(
    activeSession?.remainingSeconds ?? (activeSession?.plannedMinutes ?? 25) * 60
  );
  const [error, setError] = useState<string | null>(null);

  const totalSeconds = durationMinutes * 60;
  const elapsedSeconds = Math.max(totalSeconds - remainingSeconds, 0);
  const progress = totalSeconds ? Math.round((elapsedSeconds / totalSeconds) * 100) : 0;
  const selectedTask = useMemo(
    () => tasks.find((task) => task.id === taskId) ?? null,
    [taskId, tasks]
  );
  const canStart = timerState !== 'running' && timerState !== 'paused';

  const completeCurrentSession = useCallback(() => {
    if (!sessionId || completingRef.current) return;
    completingRef.current = true;

    startTransition(async () => {
      const result = await completeFocusSession({ sessionId });

      if (!result.success) {
        completingRef.current = false;
        setError(result.message);
        return;
      }

      setError(null);
      setTimerState('completed');
      setSessionId(null);
      setRemainingSeconds(0);
      completingRef.current = false;
      router.refresh();
    });
  }, [router, sessionId]);

  useEffect(() => {
    if (timerState !== 'running') return;

    const intervalId = window.setInterval(() => {
      setRemainingSeconds((current) => {
        if (current <= 1) {
          window.clearInterval(intervalId);
          completeCurrentSession();
          return 0;
        }

        return current - 1;
      });
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [completeCurrentSession, timerState]);

  function changeDuration(duration: number) {
    if (timerState === 'running' || timerState === 'paused') return;
    setDurationMinutes(duration);
    setRemainingSeconds(duration * 60);
  }

  function startSession() {
    if (!canStart) {
      setError('Stop or finish the active session before starting another one.');
      return;
    }

    if (!durationOptions.includes(durationMinutes as (typeof durationOptions)[number])) {
      setError('Choose a valid focus duration.');
      return;
    }

    if (!activityTypes.includes(activityType as (typeof activityTypes)[number])) {
      setError('Choose a valid activity type.');
      return;
    }

    setError(null);
    startTransition(async () => {
      const result = await startFocusSession({
        plannedMinutes: durationMinutes,
        activityType: activityType as (typeof activityTypes)[number],
        taskId: taskId === 'none' ? null : taskId,
      });

      if (!result.success) {
        setError(result.message);
        return;
      }

      const session = result.data as { id: string };
      setSessionId(session.id);
      setRemainingSeconds(totalSeconds);
      setTimerState('running');
      router.refresh();
    });
  }

  function pauseSession() {
    if (timerState !== 'running' || !sessionId) return;

    startTransition(async () => {
      const result = await pauseFocusSession({ sessionId });

      if (!result.success) {
        setError(result.message);
        return;
      }

      setError(null);
      setTimerState('paused');
      router.refresh();
    });
  }

  function resumeSession() {
    if (timerState !== 'paused' || !sessionId) return;

    startTransition(async () => {
      const result = await resumeFocusSession({ sessionId });

      if (!result.success) {
        setError(result.message);
        return;
      }

      setError(null);
      setTimerState('running');
      router.refresh();
    });
  }

  function stopSession() {
    if ((timerState !== 'running' && timerState !== 'paused') || !sessionId) return;

    startTransition(async () => {
      const result = await stopFocusSession({ sessionId });

      if (!result.success) {
        setError(result.message);
        return;
      }

      setError(null);
      setTimerState('stopped');
      setSessionId(null);
      setRemainingSeconds(totalSeconds);
      router.refresh();
    });
  }

  function resetSession() {
    if (timerState === 'running' || timerState === 'paused') {
      setError('Stop or complete the active session before resetting.');
      return;
    }

    setError(null);
    setSessionId(null);
    setTimerState('idle');
    setRemainingSeconds(totalSeconds);
  }

  return (
    <section className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">Deep work</p>
          <h1 className="text-3xl font-bold tracking-normal">Focus Mode</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Start timed sessions tied to activities and active tasks.
          </p>
          <p className="mt-2 text-sm font-medium">
            {todayFocusMinutes}m completed today
            {activeSession ? ' · active session restored from the database' : ''}
          </p>
        </div>
        <Badge variant="outline" className="w-fit capitalize">
          {timerState}
        </Badge>
      </div>

      {error && (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="grid gap-5 xl:grid-cols-[18rem_minmax(0,1fr)_20rem]">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Sessions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {todaySessions.length === 0 ? (
              <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                No saved sessions today.
              </div>
            ) : (
              todaySessions.slice(0, 6).map((session) => (
                <div key={session.id} className="rounded-lg border p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{session.activityLabel}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {session.taskTitle ?? 'No related task'}
                      </p>
                    </div>
                    <Badge variant={session.status === 'COMPLETED' ? 'secondary' : 'outline'}>
                      {formatStatus(session.status)}
                    </Badge>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                    <span>{session.plannedMinutes}m planned</span>
                    <span>{formatElapsed(session.elapsedSeconds)}</span>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="space-y-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <CardTitle className="text-base">Timer</CardTitle>
              <div className="flex flex-wrap gap-2">
                {durationOptions.map((duration) => (
                  <Button
                    key={duration}
                    type="button"
                    variant={durationMinutes === duration ? 'secondary' : 'outline'}
                    disabled={timerState === 'running' || timerState === 'paused' || isPending}
                    onClick={() => changeDuration(duration)}
                  >
                    {duration}m
                  </Button>
                ))}
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Activity</label>
                <Select
                  value={activityType}
                  onValueChange={setActivityType}
                  disabled={timerState === 'running' || timerState === 'paused' || isPending}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {activityTypes.map((activity) => (
                      <SelectItem key={activity} value={activity}>
                        {activity}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Related task</label>
                <Select
                  value={taskId}
                  onValueChange={setTaskId}
                  disabled={timerState === 'running' || timerState === 'paused' || isPending}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No task</SelectItem>
                    {tasks.map((task) => (
                      <SelectItem key={task.id} value={task.id}>
                        {task.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-8">
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
                    <p className="font-mono text-5xl font-semibold tabular-nums sm:text-6xl">
                      {formatClock(remainingSeconds)}
                    </p>
                    <p className="mt-2 text-sm text-muted-foreground">{progress}% complete</p>
                  </div>
                </div>
              </div>
            </div>

            <Progress value={progress} className="h-2" />

            <div className="flex flex-wrap justify-center gap-2">
              {timerState === 'paused' ? (
                <Button type="button" disabled={isPending} onClick={resumeSession}>
                  <IconPlayerPlay />
                  Resume
                </Button>
              ) : (
                <Button type="button" disabled={!canStart || isPending} onClick={startSession}>
                  <IconPlayerPlay />
                  Start
                </Button>
              )}
              <Button
                type="button"
                variant="outline"
                disabled={timerState !== 'running' || isPending}
                onClick={pauseSession}
              >
                <IconPlayerPause />
                Pause
              </Button>
              <Button
                type="button"
                variant="outline"
                disabled={(timerState !== 'running' && timerState !== 'paused') || isPending}
                onClick={stopSession}
              >
                <IconPlayerStop />
                Stop
              </Button>
              <Button type="button" variant="ghost" disabled={isPending} onClick={resetSession}>
                <IconRefresh />
                Reset
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <IconBrandVscode className="size-5" />
              VS Code
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <StatusRow label="Extension" value="Not connected" tone="muted" />
            <StatusRow
              label="Session sync"
              value={sessionId ? 'Persisting' : 'Ready'}
              tone="ready"
            />
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
                  <span className="font-medium text-foreground">
                    {formatElapsed(elapsedSeconds)}
                  </span>
                </div>
                <div className="flex justify-between gap-3">
                  <span>State</span>
                  <span className="font-medium text-foreground capitalize">{timerState}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
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
          tone === 'ready' ? 'text-emerald-700' : 'text-muted-foreground'
        )}
      >
        {value}
      </span>
    </div>
  );
}

function formatClock(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remaining = seconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${remaining.toString().padStart(2, '0')}`;
}

function formatStatus(status: string) {
  return status
    .split('_')
    .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
    .join(' ');
}

function formatElapsed(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remaining = seconds % 60;

  if (minutes === 0) {
    return `${remaining}s`;
  }

  return `${minutes}m ${remaining.toString().padStart(2, '0')}s`;
}
