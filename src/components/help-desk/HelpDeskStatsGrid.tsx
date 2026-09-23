import { IconHelp, IconMessage, IconUsers } from '@tabler/icons-react';
import type { HelpDeskData } from '@/lib/queries/help-desk';
import { Card, CardContent } from '@/components/ui/card';
import { formatMinutes } from './help-desk.utils';

interface HelpDeskStatsGridProps {
  stats: HelpDeskData['stats'];
}

export function HelpDeskStatsGrid({ stats }: HelpDeskStatsGridProps) {
  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
      <Stat icon={IconHelp} label="Open requests" value={stats.open} />
      <Stat icon={IconMessage} label="Resolved" value={stats.resolved} />
      <Stat icon={IconUsers} label="Contributors" value={stats.helpers} />
      <Stat icon={IconHelp} label="Points awarded" value={stats.awardedPoints} />
      <Stat
        icon={IconMessage}
        label="First response"
        value={formatMinutes(stats.averageFirstResponseMinutes)}
      />
      <Stat
        icon={IconHelp}
        label="Resolution rate"
        value={`${stats.open + stats.resolved ? Math.round((stats.resolved / (stats.open + stats.resolved)) * 100) : 0}%`}
      />
    </section>
  );
}

function Stat({
  icon: Icon,
  label: text,
  value,
}: {
  icon: typeof IconHelp;
  label: string;
  value: string | number;
}) {
  return (
    <Card>
      <CardContent className="flex items-center justify-between p-4">
        <div>
          <p className="text-sm text-muted-foreground">{text}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
        <Icon className="size-5 text-focus" />
      </CardContent>
    </Card>
  );
}
