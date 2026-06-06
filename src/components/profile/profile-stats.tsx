import { DataPanel, DataRow } from '@/components/shared';
import { formatDuration } from '@/lib/display-helpers';
import type { ProfileData } from '@/lib/queries/profile';

interface ProfileStatsProps {
  profile: ProfileData;
}

export function ProfileStats({ profile }: ProfileStatsProps) {
  return (
    <DataPanel title="Statistics" description="Your progress at a glance">
      <div className="space-y-3">
        <DataRow label="Total Focus Time" value={formatDuration(profile.totalFocusMinutes)} />
        <DataRow label="Current Streak" value={`${profile.currentStreak} days`} />
        <DataRow label="Help Points" value={profile.helpPoints.toString()} />
        <DataRow label="Badges Earned" value={profile.badges.length.toString()} />
      </div>
    </DataPanel>
  );
}
