import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/shared';
import { formatRelativeTime } from '@/lib/display-helpers';
import type { ProfileData } from '@/lib/queries/profile';

interface ProfileBadgesProps {
  profile: ProfileData;
}

export function ProfileBadges({ profile }: ProfileBadgesProps) {
  if (profile.badges.length === 0) {
    return (
      <div className="col-span-full">
        <EmptyState
          title="No badges yet"
          description="Earn badges by completing challenges and milestones"
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Earned Badges</h2>
        <Badge variant="outline">{profile.badges.length} badges</Badge>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
        {profile.badges.map((badge) => (
          <Card key={badge.id} className="flex flex-col">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="text-3xl">{badge.badgeIcon}</div>
                <Badge variant="secondary" className="text-xs">
                  {formatRelativeTime(badge.awardedAt)}
                </Badge>
              </div>
              <CardTitle className="text-base">{badge.badgeName}</CardTitle>
            </CardHeader>
            {badge.badgeDescription && (
              <CardContent className="flex-1 text-sm text-muted-foreground">
                {badge.badgeDescription}
              </CardContent>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
