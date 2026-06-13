import { NotificationsInbox } from '@/components/notifications/notifications-inbox';
import { LAYOUT_CONSTRAINTS } from '@/lib/layout-constraints';
import { getNotificationsData, type NotificationCategory } from '@/lib/queries/notifications';

export default async function NotificationsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; page?: string }>;
}) {
  const params = await searchParams;
  const allowed: NotificationCategory[] = [
    'all',
    'tasks',
    'help',
    'responses',
    'mentorship',
    'awards',
  ];
  const category = allowed.includes(params.category as NotificationCategory)
    ? (params.category as NotificationCategory)
    : 'all';
  const page = Math.max(1, Number(params.page) || 1);
  const data = await getNotificationsData({ category, page });
  return (
    <div className={`${LAYOUT_CONSTRAINTS.pageMaxWidth} ${LAYOUT_CONSTRAINTS.pagePadding} mx-auto`}>
      <NotificationsInbox data={data} category={category} />
    </div>
  );
}
