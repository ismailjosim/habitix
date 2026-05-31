import { IconUsers } from '@tabler/icons-react';

import { ModulePage } from '@/components/app/module-page';

export default function TeamPage() {
  return (
    <ModulePage
      title="Team"
      eyebrow="Collaboration"
      description="View team members, mentor relationships, shared progress, team assignments, and group support activity."
      icon={IconUsers}
      metrics={[
        { label: 'Members', value: '24' },
        { label: 'Mentors', value: '2' },
        { label: 'Shared tasks', value: '18' },
      ]}
      nextSteps={[
        'Model teams, memberships, roles, mentors, admins, and corporate viewer access.',
        'Support membership history and invitation states for later onboarding flows.',
        'Add team-level progress summaries backed by tasks and focus sessions.',
        'Keep private student data out of corporate reporting surfaces.',
      ]}
    />
  );
}
