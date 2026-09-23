import type { Metadata } from 'next';
import { LeaderboardDashboard } from '@/components/leaderboard';
import { LAYOUT_CONSTRAINTS } from '@/lib/layout-constraints';
import { getLeaderboardData } from '@/lib/queries/leaderboard';

export const metadata: Metadata = {
  title: 'Leaderboard | Habitix',
  description: 'Team-scoped rankings, performer recognitions, and badge achievements.',
};

export default async function LeaderboardPage() {
  const data = await getLeaderboardData();
  return (
    <div className={`${LAYOUT_CONSTRAINTS.pageMaxWidth} ${LAYOUT_CONSTRAINTS.pagePadding} mx-auto`}>
      <LeaderboardDashboard data={data} />
    </div>
  );
}
