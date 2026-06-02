import { FocusModeTimer } from '@/components/focus/focus-mode-timer';
import { getFocusModeData } from '@/lib/queries/focus';

export default async function FocusModePage() {
  const { tasks } = await getFocusModeData();

  return <FocusModeTimer tasks={tasks} />;
}
