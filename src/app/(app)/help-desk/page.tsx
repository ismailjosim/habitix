import { HelpDeskBoard } from '@/components/help-desk/help-desk-board';
import { LAYOUT_CONSTRAINTS } from '@/lib/layout-constraints';
import { getHelpDeskData } from '@/lib/queries/help-desk';

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
