'use client';

import { useState } from 'react';
import type { LeaderboardData } from '@/lib/queries/leaderboard';
import { LeaderboardHeader } from './LeaderboardHeader';
import { LeaderboardMetricsGrid } from './LeaderboardMetricsGrid';
import { LeaderboardChampions } from './LeaderboardChampions';
import { LeaderboardRankingCard } from './LeaderboardRankingCard';
import { LeaderboardBadgeGallery } from './LeaderboardBadgeGallery';

export function LeaderboardDashboard({ data }: { data: LeaderboardData }) {
  const [period, setPeriod] = useState<'weekly' | 'monthly'>('weekly');
  const [view, setView] = useState<'rankings' | 'badges'>('rankings');
  const active = data[period];
  const current = active.performers.find((row) => row.isCurrentUser);

  return (
    <div className="space-y-6">
      <LeaderboardHeader
        teamName={data.teamName}
        view={view}
        setView={setView}
        period={period}
        setPeriod={setPeriod}
      />

      {view === 'badges' ? (
        <LeaderboardBadgeGallery badges={data.badges} />
      ) : (
        <>
          <LeaderboardMetricsGrid
            currentUserPerformerRank={active.currentUserPerformerRank}
            currentUserContributorRank={active.currentUserContributorRank}
            current={current}
          />

          <LeaderboardChampions
            topPerformer={active.performers[0]}
            topContributor={active.contributors[0]}
          />

          <section className="grid gap-6 xl:grid-cols-2">
            <LeaderboardRankingCard
              title={`Top performers • ${active.label}`}
              rows={active.performers}
              mode="focus"
            />
            <LeaderboardRankingCard
              title={`Top contributors • ${active.label}`}
              rows={active.contributors}
              mode="help"
            />
          </section>
        </>
      )}
    </div>
  );
}
