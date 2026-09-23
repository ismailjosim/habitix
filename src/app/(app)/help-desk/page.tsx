import type { Metadata } from 'next';
import { HelpDeskBoard } from '@/components/help-desk';
import { LAYOUT_CONSTRAINTS } from '@/lib/layout-constraints';
import { getHelpDeskData } from '@/lib/queries/help-desk';

export const metadata: Metadata = {
  title: 'Help Desk | Habitix',
  description: 'Peer support board to ask and answer questions with your teammates.',
};

export default async function HelpDeskPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; topic?: string; page?: string }>;
}) {
  const params = await searchParams;
  const filters = {
    q: params.q ?? '',
    status: params.status ?? 'all',
    topic: params.topic ?? 'all',
    page: Number(params.page) || 1,
  };
  const data = await getHelpDeskData(filters);
  return (
    <div className={`${LAYOUT_CONSTRAINTS.pageMaxWidth} ${LAYOUT_CONSTRAINTS.pagePadding} mx-auto`}>
      <HelpDeskBoard data={data} filters={filters} />
    </div>
  );
}
