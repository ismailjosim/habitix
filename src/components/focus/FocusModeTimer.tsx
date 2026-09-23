'use client';

import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  completeFocusSession,
  pauseFocusSession,
  resumeFocusSession,
  startFocusSession,
  stopFocusSession,
} from '@/lib/actions/focus';
import { Card, CardContent } from '@/components/ui/card';
import { FocusTimerControls } from './FocusTimerControls';
import { FocusTimerDial } from './FocusTimerDial';
import { FocusTimerActions } from './FocusTimerActions';
import { FocusVsCodeIntegrationCard } from './FocusVsCodeIntegrationCard';
import { FocusSessionsHistoryCard } from './FocusSessionsHistoryCard';
import { activityTypes, durationOptions } from './focus.utils';
import type { FocusModeTimerProps, TimerState } from './types';

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
    <section className="space-y-6">
      <header>
        <p className="text-sm font-medium text-muted-foreground">Deep work</p>
        <h1 className="text-3xl font-bold tracking-normal">Focus Mode</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Dedicated study blocks with live timer sync, activity logging, and task linking.
        </p>
      </header>

      {error && (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_24rem]">
        <Card className="flex flex-col justify-between">
          <FocusTimerControls
            durationMinutes={durationMinutes}
            activityType={activityType}
            taskId={taskId}
            tasks={tasks}
            timerState={timerState}
            isPending={isPending}
            onDurationChange={changeDuration}
            onActivityChange={setActivityType}
            onTaskChange={setTaskId}
          />

          <CardContent className="space-y-8">
            <FocusTimerDial remainingSeconds={remainingSeconds} progress={progress} />

            <FocusTimerActions
              timerState={timerState}
              canStart={canStart}
              isPending={isPending}
              onResume={resumeSession}
              onStart={startSession}
              onPause={pauseSession}
              onStop={stopSession}
              onReset={resetSession}
            />
          </CardContent>
        </Card>

        <div className="space-y-6">
          <FocusVsCodeIntegrationCard
            sessionId={sessionId}
            activityType={activityType}
            selectedTask={selectedTask}
            durationMinutes={durationMinutes}
            elapsedSeconds={elapsedSeconds}
            timerState={timerState}
          />

          <FocusSessionsHistoryCard
            todaySessions={todaySessions}
            todayFocusMinutes={todayFocusMinutes}
          />
        </div>
      </div>
    </section>
  );
}
