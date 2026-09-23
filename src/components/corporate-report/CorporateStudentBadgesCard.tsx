import { IconAward } from '@tabler/icons-react';
import { BadgeIcon } from '@/components/badges/badge-icon';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDate } from '@/lib/display-helpers';

interface CorporateStudentBadgesCardProps {
  badgeAwards: {
    id: string;
    awardedAt: Date;
    reason: string | null;
    badge: {
      name: string;
      description: string | null;
      iconName: string;
    };
  }[];
}

export function CorporateStudentBadgesCard({ badgeAwards }: CorporateStudentBadgesCardProps) {
  return (
    <Card className="break-inside-avoid">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <IconAward className="size-5 text-primary" /> Badges
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          {badgeAwards.slice(0, 6).map((award) => (
            <div key={award.id} className="flex gap-3 border-b pb-3 last:border-0">
              <BadgeIcon name={award.badge.iconName} className="size-9 [&>svg]:size-5" />
              <div>
                <p className="font-medium">{award.badge.name}</p>
                <p className="text-xs text-muted-foreground">
                  {award.reason || award.badge.description || 'Platform achievement'} •{' '}
                  {formatDate(award.awardedAt)}
                </p>
              </div>
            </div>
          ))}
          {!badgeAwards.length && (
            <p className="rounded-lg border border-dashed p-5 text-center text-sm text-muted-foreground">
              No badges awarded in this period.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
