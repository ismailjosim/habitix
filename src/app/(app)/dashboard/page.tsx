import { IconActivity } from '@tabler/icons-react';

import { ModulePage } from '@/components/app/module-page';

export default function DashboardPage() {
  return (
    <ModulePage
      title="Dashboard"
      eyebrow="Student overview"
      description="A compact command center for focus minutes, assigned work, team progress, and the day's collaboration signals."
      icon={IconActivity}
      metrics={[
        { label: 'Focus time today', value: '2h 35m' },
        { label: 'Open tasks', value: '8' },
        { label: 'Team rank', value: '#3' },
      ]}
      nextSteps={[
        'Connect focus sessions, tasks, help points, and leaderboard snapshots to database-backed metrics.',
        'Add role-specific cards for students, mentors, admins, moderators, and corporate viewers.',
        'Render recent activity and upcoming deadlines from seeded MVP data.',
        'Match the dashboard panels against the provided SCE screenshots.',
      ]}
    />
  );
}
