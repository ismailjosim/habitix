import {
  IconActivity,
  IconAward,
  IconChecklist,
  IconClock,
  IconHelpHexagon,
  IconTargetArrow,
} from '@tabler/icons-react';
import { Card, CardContent } from '@/components/ui/card';
import { formatDuration } from '@/lib/display-helpers';

interface CorporateMetricsGridProps {
  overview: {
    activityEvents: number;
    focusMinutes: number;
    completedTasks: number;
    badgesEarned: number;
    helpPoints: number;
    activityPoints: number;
  };
}

export function CorporateMetricsGrid({ overview }: CorporateMetricsGridProps) {
  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6 print:grid-cols-3">
      <Metric icon={IconActivity} label="Activity events" value={String(overview.activityEvents)} />
      <Metric
        icon={IconTargetArrow}
        label="Focus time"
        value={formatDuration(overview.focusMinutes)}
      />
      <Metric
        icon={IconChecklist}
        label="Tasks completed"
        value={String(overview.completedTasks)}
      />
      <Metric icon={IconAward} label="Badges earned" value={String(overview.badgesEarned)} />
      <Metric icon={IconHelpHexagon} label="Help points" value={String(overview.helpPoints)} />
      <Metric icon={IconActivity} label="Activity points" value={String(overview.activityPoints)} />
    </section>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof IconClock;
  label: string;
  value: string;
}) {
  return (
    <Card size="sm" className="break-inside-avoid">
      <CardContent className="flex items-center gap-3">
        <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
          <Icon className="size-5" />
        </span>
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-lg font-bold">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}
