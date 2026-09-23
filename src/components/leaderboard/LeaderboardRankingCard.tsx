import type { LeaderboardRow } from '@/lib/queries/leaderboard';
import { formatDuration } from '@/lib/display-helpers';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { initials } from './leaderboard.utils';

interface LeaderboardRankingCardProps {
  title: string;
  rows: LeaderboardRow[];
  mode: 'focus' | 'help';
}

export function LeaderboardRankingCard({ title, rows, mode }: LeaderboardRankingCardProps) {
  const hasData = rows.some((row) => (mode === 'focus' ? row.focusMinutes : row.helpPoints) > 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {!rows.length ? (
          <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
            No team members to rank yet.
          </div>
        ) : (
          rows.map((row) => (
            <div
              key={row.profileId}
              className={cn(
                'flex items-center gap-3 rounded-lg border p-3',
                row.isCurrentUser && 'border-primary bg-primary/5'
              )}
            >
              <Rank rank={row.rank} />
              <Avatar className="size-9">
                <AvatarImage src={row.avatarUrl ?? ''} />
                <AvatarFallback>{initials(row.displayName)}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">
                  {row.displayName}
                  {row.isCurrentUser ? ' (You)' : ''}
                </p>
                <p className="text-xs text-muted-foreground">
                  {mode === 'focus'
                    ? `${row.helpPoints} help points`
                    : `${row.resolutions} awarded resolution${row.resolutions === 1 ? '' : 's'}`}
                </p>
              </div>
              <span className="text-sm font-semibold">
                {mode === 'focus' ? formatDuration(row.focusMinutes) : `${row.helpPoints} pts`}
              </span>
            </div>
          ))
        )}
        {rows.length > 0 && !hasData && (
          <p className="pt-2 text-xs text-muted-foreground">
            No qualifying activity in this period yet; rows are ordered deterministically by name.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function Rank({ rank }: { rank: number }) {
  const tones = [
    'bg-amber-100 text-amber-700',
    'bg-slate-200 text-slate-700',
    'bg-orange-100 text-orange-700',
  ];
  return (
    <span
      className={cn(
        'grid size-8 shrink-0 place-items-center rounded-full text-sm font-bold',
        tones[rank - 1] ?? 'bg-muted text-muted-foreground'
      )}
    >
      {rank}
    </span>
  );
}
