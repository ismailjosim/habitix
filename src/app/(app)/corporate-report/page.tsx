import { CorporateReportView } from '@/components/corporate-report/corporate-report-view';
import { LAYOUT_CONSTRAINTS } from '@/lib/layout-constraints';
import { getCorporateReportData } from '@/lib/queries/corporate-report';

export default async function CorporateReportPage({
  searchParams,
}: {
  searchParams: Promise<{ studentId?: string; from?: string; to?: string; module?: string }>;
}) {
  const filters = await searchParams;
  const data = await getCorporateReportData(filters);
  return (
    <div
      className={`${LAYOUT_CONSTRAINTS.pageMaxWidth} ${LAYOUT_CONSTRAINTS.pagePadding} mx-auto py-6 print:p-0`}
    >
      <CorporateReportView data={data} />
    </div>
  );
}
