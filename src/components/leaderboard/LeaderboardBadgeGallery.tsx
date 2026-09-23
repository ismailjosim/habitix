import type { LeaderboardData } from '@/lib/queries/leaderboard';
import { formatDate } from '@/lib/display-helpers';
import { cn } from '@/lib/utils';
import { BadgeIcon } from '@/components/badges/badge-icon';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatPeriod } from './leaderboard.utils';

interface LeaderboardBadgeGalleryProps {
  badges: LeaderboardData['badges'];
}

export function LeaderboardBadgeGallery({ badges }: LeaderboardBadgeGalleryProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Team badge awards</CardTitle>
      </CardHeader>
      <CardContent>
        {badges.length === 0 ? (
          <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
            No badges have been earned yet.
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {badges.map((award) => (
              <div
                key={award.id}
                className={cn(
                  'flex gap-3 rounded-lg border p-4',
                  award.isCurrentUser && 'border-primary bg-primary/5'
                )}
              >
                <BadgeIcon name={award.iconName} />
                <div className="min-w-0">
                  <p className="font-semibold">{award.badgeName}</p>
                  <p className="text-sm text-muted-foreground">
                    {award.displayName}
                    {award.isCurrentUser ? ' (You)' : ''}
                  </p>
                  <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                    {award.badgeDescription}
                  </p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Earned {formatDate(award.awardedAt)}
                    {award.periodKey !== 'lifetime' ? ` • ${formatPeriod(award.periodKey)}` : ''}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
