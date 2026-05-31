import { IconUserSquareRounded } from '@tabler/icons-react';

import { ModulePage } from '@/components/app/module-page';

export default function ProfilePage() {
  return (
    <ModulePage
      title="Profile"
      eyebrow="Identity"
      description="Manage user identity, role metadata, badges, skill interests, account preferences, and public profile details."
      icon={IconUserSquareRounded}
      metrics={[
        { label: 'Role', value: 'Student' },
        { label: 'Current streak', value: '5' },
        { label: 'Skill areas', value: '4' },
      ]}
      nextSteps={[
        'Keep auth user records compatible with Better Auth and Prisma.',
        'Split private account fields from profile fields shown to peers or mentors.',
        'Add badge and achievement summaries from the leaderboard system.',
        'Prepare editable profile settings after auth is installed.',
      ]}
    />
  );
}
