import { BrandLogo } from '@/components/app/brand-logo';
import { PrintButton } from '@/components/corporate-report/print-button';
import { formatDate } from '@/lib/display-helpers';

interface CorporateReportHeaderProps {
  range: { start: Date; end: Date };
}

export function CorporateReportHeader({ range }: CorporateReportHeaderProps) {
  return (
    <header className="flex flex-col gap-4 border-b pb-5 sm:flex-row sm:items-end sm:justify-between print:pb-3">
      <div>
        <BrandLogo className="mb-4 hidden h-9 w-auto print:block" />
        <p className="text-sm font-medium text-primary">Learner performance report</p>
        <h1 className="text-3xl font-bold">Corporate Student Report</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Measured platform activity from {formatDate(range.start)} to {formatDate(range.end)}.
        </p>
      </div>
      <PrintButton />
    </header>
  );
}
