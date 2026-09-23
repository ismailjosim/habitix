import type { Metadata } from 'next';
import { FocusModeTimer } from '@/components/focus';
import { getFocusModeData } from '@/lib/queries/focus';

export const metadata: Metadata = {
  title: 'Focus Mode | Habitix',
  description: 'Deep work timer with live session sync, activity logging, and task linking.',
};

export default async function FocusModePage() {
  const { tasks, todaySessions, activeSession, todayFocusMinutes } = await getFocusModeData();

  return (
    <FocusModeTimer
      tasks={tasks}
      todaySessions={todaySessions}
      activeSession={activeSession}
      todayFocusMinutes={todayFocusMinutes}
    />
  );
}
