'use client';

import { useState } from 'react';
import { IconClock, IconCrown, IconMedal, IconTrophy, IconUsers } from '@tabler/icons-react';

import type { LeaderboardData, LeaderboardRow } from '@/lib/queries/leaderboard';
import { formatDuration } from '@/lib/display-helpers';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BadgeIcon } from '@/components/badges/badge-icon';
import { formatDate } from '@/lib/display-helpers';

export function LeaderboardDashboard({ data }: { data: LeaderboardData }) {
  const [period, setPeriod] = useState<'weekly' | 'monthly'>('weekly');
  const [view, setView] = useState<'rankings' | 'badges'>('rankings');
  const active = data[period];
  const current = active.performers.find((row) => row.isCurrentUser);

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">Recognition</p>
          <h1 className="text-3xl font-bold">Leaderboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {data.teamName
              ? `Team-scoped rankings for ${data.teamName}.`
              : 'Join a team to view rankings.'}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="inline-flex rounded-lg border bg-background p-1">
            <Button
              variant={view === 'rankings' ? 'secondary' : 'ghost'}
              onClick={() => setView('rankings')}
            >
              Rankings
            </Button>
            <Button
              variant={view === 'badges' ? 'secondary' : 'ghost'}
              onClick={() => setView('badges')}
            >
              Badges
            </Button>
          </div>
          {view === 'rankings' && (
            <div className="inline-flex rounded-lg border bg-background p-1">
              <Button
                variant={period === 'weekly' ? 'secondary' : 'ghost'}
                onClick={() => setPeriod('weekly')}
              >
                Weekly
              </Button>
              <Button
                variant={period === 'monthly' ? 'secondary' : 'ghost'}
                onClick={() => setPeriod('monthly')}
              >
                Monthly
              </Button>
            </div>
          )}
        </div>
      </header>

      {view === 'badges' ? (
        <BadgeGallery badges={data.badges} />
      ) : (
        <>
          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Metric
              icon={IconMedal}
              label="Focus Rank"
              value={rankLabel(active.currentUserPerformerRank)}
            />
            <Metric
              icon={IconUsers}
              label="Help Contributor Rank"
              value={rankLabel(active.currentUserContributorRank)}
            />
            <Metric
              icon={IconClock}
              label="Your Focus Hours"
              value={formatDuration(current?.focusMinutes ?? 0)}
            />
            <Metric icon={IconTrophy} label="Your Help Points" value={current?.helpPoints ?? 0} />
          </section>

          <section className="grid gap-4 md:grid-cols-2">
            <Champion
              title="Focus champion"
              row={active.performers[0]?.focusMinutes ? active.performers[0] : undefined}
              metric={
                active.performers[0]?.focusMinutes
                  ? formatDuration(active.performers[0].focusMinutes)
                  : 'No activity'
              }
            />
            <Champion
              title="Help champion"
              row={active.contributors[0]?.helpPoints ? active.contributors[0] : undefined}
              metric={
                active.contributors[0]?.helpPoints
                  ? `${active.contributors[0].helpPoints} points`
                  : 'No awards'
              }
            />
          </section>

          <section className="grid gap-6 xl:grid-cols-2">
            <RankingCard
              title={`Top performers · ${active.label}`}
              rows={active.performers}
              mode="focus"
            />
            <RankingCard
              title={`Top contributors · ${active.label}`}
              rows={active.contributors}
              mode="help"
            />
          </section>
        </>
      )}
    </div>
  );
}

function BadgeGallery({ badges }: { badges: LeaderboardData['badges'] }) {
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
                    {award.periodKey !== 'lifetime' ? ` · ${formatPeriod(award.periodKey)}` : ''}
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

function RankingCard({
  title,
  rows,
  mode,
}: {
  title: string;
  rows: LeaderboardRow[];
  mode: 'focus' | 'help';
}) {
  const hasData = rows.some((row) => (mode === 'focus' ? row.focusMinutes : row.helpPoints) > 0);
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {!rows.length ? (
          <Empty />
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

function Empty() {
  return (
    <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
      No team members to rank yet.
    </div>
  );
}
function rankLabel(rank: number | null) {
  return rank ? `#${rank}` : 'Unranked';
}
function initials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}

function formatPeriod(periodKey: string) {
  const [type, value] = periodKey.split(':');
  return type === 'week' ? `week of ${value}` : type === 'month' ? `month ${value}` : value;
}
