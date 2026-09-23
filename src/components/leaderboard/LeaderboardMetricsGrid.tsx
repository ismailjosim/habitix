import { IconClock, IconMedal, IconTrophy, IconUsers } from '@tabler/icons-react';
import type { LeaderboardRow } from '@/lib/queries/leaderboard';
import { formatDuration } from '@/lib/display-helpers';
import { Card, CardContent } from '@/components/ui/card';
import { rankLabel } from './leaderboard.utils';

interface LeaderboardMetricsGridProps {
  currentUserPerformerRank: number | null;
  currentUserContributorRank: number | null;
  current: LeaderboardRow | undefined;
}

export function LeaderboardMetricsGrid({
  currentUserPerformerRank,
  currentUserContributorRank,
  current,
}: LeaderboardMetricsGridProps) {
  return (
    <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Metric icon={IconMedal} label="Focus Rank" value={rankLabel(currentUserPerformerRank)} />
      <Metric
        icon={IconUsers}
        label="Help Contributor Rank"
        value={rankLabel(currentUserContributorRank)}
      />
      <Metric
        icon={IconClock}
        label="Your Focus Hours"
        value={formatDuration(current?.focusMinutes ?? 0)}
      />
      <Metric icon={IconTrophy} label="Your Help Points" value={current?.helpPoints ?? 0} />
    </section>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof IconMedal;
  label: string;
  value: string | number;
}) {
  return (
    <Card>
      <CardContent className="flex items-center justify-between p-4">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
        <Icon className="size-5 text-primary" />
      </CardContent>
    </Card>
  );
}
