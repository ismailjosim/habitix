import { ActivityDashboard } from '@/components/activity/activity-dashboard';
import { LAYOUT_CONSTRAINTS } from '@/lib/layout-constraints';
import { getActivityData } from '@/lib/queries/activity';

export default async function ActivityPage() {
  const data = await getActivityData();

  return (
    <div className={`${LAYOUT_CONSTRAINTS.pageMaxWidth} ${LAYOUT_CONSTRAINTS.pagePadding} mx-auto`}>
      <ActivityDashboard data={data} />
    </div>
  );
}
