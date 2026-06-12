import { LeaderboardDashboard } from '@/components/leaderboard/leaderboard-dashboard';
import { LAYOUT_CONSTRAINTS } from '@/lib/layout-constraints';
import { getLeaderboardData } from '@/lib/queries/leaderboard';

export default async function LeaderboardPage() {
  const data = await getLeaderboardData();
  return (
    <div className={`${LAYOUT_CONSTRAINTS.pageMaxWidth} ${LAYOUT_CONSTRAINTS.pagePadding} mx-auto`}>
      <LeaderboardDashboard data={data} />
    </div>
  );
}
