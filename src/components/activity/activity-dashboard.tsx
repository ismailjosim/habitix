import Link from 'next/link';
import {
  IconCalendarStats,
  IconCheck,
  IconClock,
  IconFlame,
  IconSparkles,
  IconTargetArrow,
} from '@tabler/icons-react';

import type { ActivityData } from '@/lib/queries/activity';
import { formatDate, formatDateTime, formatDuration } from '@/lib/display-helpers';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const heatmapTones = [
  'bg-muted',
  'bg-emerald-200 dark:bg-emerald-950',
  'bg-emerald-400 dark:bg-emerald-800',
  'bg-emerald-600 dark:bg-emerald-600',
  'bg-emerald-800 dark:bg-emerald-400',
];

export function ActivityDashboard({ data }: { data: ActivityData }) {
  const { stats } = data;

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">Progress history</p>
          <h1 className="text-3xl font-bold tracking-normal">Activity</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            See how focused work, completed tasks, and helping others add up over time.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {[30, 90, 180, 365].map((days) => (
            <Button
              key={days}
              asChild
              size="sm"
              variant={data.rangeDays === days ? 'secondary' : 'outline'}
            >
              <Link href={`/activity?days=${days}`}>
                {days === 365 ? '1 year' : `${days} days`}
              </Link>
            </Button>
          ))}
          <Badge variant="outline" className="gap-1.5 px-3 py-1.5">
            <IconFlame className="size-4 text-orange-500" />
            {stats.currentStreak} day streak
          </Badge>
          <Badge variant="outline" className="gap-1.5 px-3 py-1.5">
            <IconCalendarStats className="size-4 text-primary" />
            Best: {stats.bestDay ? formatDate(stats.bestDay.date) : 'No activity yet'}
          </Badge>
        </div>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard icon={IconTargetArrow} label="Focus sessions" value={stats.totalSessions} />
        <MetricCard
          icon={IconClock}
          label="Raw focus time"
          value={formatDuration(stats.totalFocusMinutes)}
        />
        <MetricCard icon={IconCheck} label="Tasks completed" value={stats.tasksCompleted} />
        <MetricCard
          icon={IconSparkles}
          label="Help points"
          value={stats.helpPoints}
          detail={`${formatDuration(stats.helpCreditMinutes)} activity credit`}
        />
      </section>

      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div>
            <CardTitle>Yearly activity</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              Daily focus time plus help credit for the selected period. Each help point contributes
              10 minutes.
            </p>
          </div>
          <div className="hidden items-center gap-1 text-xs text-muted-foreground sm:flex">
            <span>Less</span>
            {heatmapTones.map((tone) => (
              <span key={tone} className={`size-3 rounded-sm ${tone}`} />
            ))}
            <span>More</span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto pb-2">
            <div
              className="grid w-max grid-flow-col grid-rows-7 gap-1"
              role="img"
              aria-label={`Daily activity heatmap for the last ${data.rangeDays} days`}
            >
              {data.heatmap.map((day) => (
                <span
                  key={day.date}
                  className={`size-3 rounded-sm ${heatmapTones[getIntensity(day.totalMinutes)]}`}
                  title={`${formatDate(day.date)}: ${day.focusMinutes} focus minutes, ${day.helpCreditMinutes} help-credit minutes`}
                  aria-label={`${formatDate(day.date)}, ${day.totalMinutes} activity minutes`}
                />
              ))}
            </div>
          </div>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
            <span>Last {data.rangeDays} days</span>
            <span>
              {stats.bestDay
                ? `Best focus day: ${formatDuration(stats.bestDay.focusMinutes)} on ${formatDate(stats.bestDay.date)}`
                : 'Complete a focus session to begin your activity history.'}
            </span>
          </div>
        </CardContent>
      </Card>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(20rem,0.85fr)]">
        <Card>
          <CardHeader>
            <CardTitle>Recent focus sessions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.recentSessions.length === 0 ? (
              <EmptyMessage message="No completed focus sessions yet." />
            ) : (
              data.recentSessions.map((session) => (
                <div
                  key={session.id}
                  className="flex flex-col gap-2 rounded-lg border p-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{session.activityLabel}</span>
                      <Badge variant="secondary">{formatDuration(session.actualMinutes)}</Badge>
                    </div>
                    <p className="mt-1 truncate text-sm text-muted-foreground">
                      {session.task ? (
                        <Link
                          className="hover:text-foreground hover:underline"
                          href={`/tasks/${session.task.id}`}
                        >
                          {session.task.title}
                        </Link>
                      ) : (
                        'No related task'
                      )}
                    </p>
                  </div>
                  <time className="shrink-0 text-xs text-muted-foreground">
                    {formatDateTime(session.completedAt)}
                  </time>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Focus breakdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.breakdown.length === 0 ? (
              <EmptyMessage message="Activity types will appear after your first completed session." />
            ) : (
              data.breakdown.map((item) => (
                <div key={item.activityType} className="space-y-2">
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="font-medium">{item.label}</span>
                    <span className="text-muted-foreground">
                      {formatDuration(item.minutes)} · {item.percentage}%
                    </span>
                  </div>
                  <div
                    className="h-2 overflow-hidden rounded-full bg-muted"
                    role="progressbar"
                    aria-label={`${item.label} focus share`}
                    aria-valuenow={item.percentage}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  >
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${Math.max(item.percentage, 2)}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
  detail,
}: {
  icon: typeof IconClock;
  label: string;
  value: string | number;
  detail?: string;
}) {
  return (
    <Card>
      <CardContent className="flex items-start justify-between gap-4 p-5">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="mt-1 text-2xl font-bold">{value}</p>
          {detail && <p className="mt-1 text-xs text-muted-foreground">{detail}</p>}
        </div>
        <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
          <Icon className="size-5" />
        </span>
      </CardContent>
    </Card>
  );
}

function EmptyMessage({ message }: { message: string }) {
  return (
    <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
      {message}
    </div>
  );
}

function getIntensity(minutes: number) {
  if (minutes === 0) return 0;
  if (minutes < 25) return 1;
  if (minutes < 60) return 2;
  if (minutes < 120) return 3;
  return 4;
}
