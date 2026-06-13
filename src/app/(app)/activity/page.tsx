import { ActivityDashboard } from '@/components/activity/activity-dashboard';
import { LAYOUT_CONSTRAINTS } from '@/lib/layout-constraints';
import { getActivityData } from '@/lib/queries/activity';

export default async function ActivityPage({
  searchParams,
}: {
  searchParams: Promise<{ days?: string }>;
}) {
  const params = await searchParams;
  const data = await getActivityData(Number(params.days) || 365);

  return (
    <div className={`${LAYOUT_CONSTRAINTS.pageMaxWidth} ${LAYOUT_CONSTRAINTS.pagePadding} mx-auto`}>
      <ActivityDashboard data={data} />
    </div>
  );
}
