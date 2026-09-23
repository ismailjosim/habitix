import { IconCrown } from '@tabler/icons-react';
import type { LeaderboardRow } from '@/lib/queries/leaderboard';
import { formatDuration } from '@/lib/display-helpers';
import { Card, CardContent } from '@/components/ui/card';

interface LeaderboardChampionsProps {
  topPerformer?: LeaderboardRow;
  topContributor?: LeaderboardRow;
}

export function LeaderboardChampions({ topPerformer, topContributor }: LeaderboardChampionsProps) {
  const performerMetric = topPerformer?.focusMinutes
    ? formatDuration(topPerformer.focusMinutes)
    : 'No activity';

  const contributorMetric = topContributor?.helpPoints
    ? `${topContributor.helpPoints} points`
    : 'No awards';

  return (
    <section className="grid gap-4 md:grid-cols-2">
      <Champion
        title="Focus champion"
        row={topPerformer?.focusMinutes ? topPerformer : undefined}
        metric={performerMetric}
      />
      <Champion
        title="Help champion"
        row={topContributor?.helpPoints ? topContributor : undefined}
        metric={contributorMetric}
      />
    </section>
  );
}

function Champion({ title, row, metric }: { title: string; row?: LeaderboardRow; metric: string }) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-5">
        <span className="grid size-12 place-items-center rounded-full bg-amber-100 text-amber-700">
          <IconCrown />
        </span>
        <div className="min-w-0">
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="truncate text-lg font-semibold">
            {row?.displayName ?? 'Awaiting champion'}
          </p>
          <p className="text-sm text-muted-foreground">{metric}</p>
        </div>
      </CardContent>
    </Card>
  );
}
