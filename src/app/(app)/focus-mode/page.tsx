import { FocusModeTimer } from '@/components/focus/focus-mode-timer';
import { getFocusModeData } from '@/lib/queries/focus';

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
