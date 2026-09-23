import type { Metadata } from 'next';
import { ActivityDashboard } from '@/components/activity';
import { LAYOUT_CONSTRAINTS } from '@/lib/layout-constraints';
import { getActivityData } from '@/lib/queries/activity';

export const metadata: Metadata = {
  title: 'Activity | Habitix',
  description: 'Detailed activity history, daily heatmaps, and focus breakdown.',
};

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
