import { IconTargetArrow } from '@tabler/icons-react';

import { ModulePage } from '@/components/app/module-page';

export default function FocusModePage() {
  return (
    <ModulePage
      title="Focus Mode"
      eyebrow="Deep work"
      description="Start and review timed sessions connected to tasks, study activities, and personal productivity goals."
      icon={IconTargetArrow}
      metrics={[
        { label: 'Current goal', value: '90m' },
        { label: 'Sessions this week', value: '12' },
        { label: 'Completion rate', value: '84%' },
      ]}
      nextSteps={[
        'Model focus sessions with duration, status, source, and optional task links.',
        'Add timer states for active, paused, completed, and abandoned sessions.',
        'Show personal and team focus totals without exposing private notes.',
        'Plan notification triggers for missed or completed focus goals.',
      ]}
    />
  );
}
