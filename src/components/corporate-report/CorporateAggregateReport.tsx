import { IconBriefcase } from '@tabler/icons-react';
import { BrandLogo } from '@/components/app/brand-logo';
import { PrintButton } from '@/components/corporate-report/print-button';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { formatDate, formatDuration } from '@/lib/display-helpers';
import type { getCorporateReportData } from '@/lib/queries/corporate-report';
import { dateInput } from './corporate-report.utils';

type ReportData = Awaited<ReturnType<typeof getCorporateReportData>>;
type AggregateData = Extract<ReportData, { mode: 'aggregate' }>;

export function CorporateAggregateReport({ data }: { data: AggregateData }) {
  return (
    <main className="mx-auto max-w-6xl space-y-6 print:max-w-none">
      <header className="flex flex-col gap-4 border-b pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <BrandLogo className="mb-4 hidden h-9 w-auto print:block" />
          <p className="text-sm font-medium text-primary">Approved aggregate reporting</p>
          <h1 className="text-3xl font-bold">Corporate Program Report</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Corporate viewers see cohort snapshots only; individual learner records remain private.
          </p>
        </div>
        <PrintButton />
      </header>

      <form className="grid gap-3 rounded-xl border bg-card p-4 sm:grid-cols-[1fr_1fr_auto] print:hidden">
        <label className="space-y-1 text-xs font-medium">
          From
          <Input name="from" type="date" defaultValue={dateInput(data.range.start)} />
        </label>
        <label className="space-y-1 text-xs font-medium">
          To
          <Input name="to" type="date" defaultValue={dateInput(data.range.end)} />
        </label>
        <Button className="self-end" type="submit">
          Apply dates
        </Button>
      </form>

      {data.snapshots.length ? (
        <div className="space-y-5">
          {data.snapshots.map((snapshot) => (
            <Card key={snapshot.id} className="break-inside-avoid">
              <CardHeader>
                <CardTitle>{snapshot.team?.name ?? 'Organization-wide cohort'}</CardTitle>
                <p className="text-xs text-muted-foreground">
                  {formatDate(snapshot.periodStart)} - {formatDate(snapshot.periodEnd)}
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
                  <MiniMetric label="Active students" value={String(snapshot.activeStudents)} />
                  <MiniMetric
                    label="Engagement"
                    value={`${Math.round(snapshot.averageEngagement)}%`}
                  />
                  <MiniMetric label="Tasks complete" value={String(snapshot.tasksCompleted)} />
                  <MiniMetric label="Focus time" value={formatDuration(snapshot.focusMinutes)} />
                  <MiniMetric
                    label="Help resolution"
                    value={`${Math.round(snapshot.helpDeskResolutionRate)}%`}
                  />
                </div>
                {snapshot.summary && (
                  <p className="text-sm leading-6 text-muted-foreground">{snapshot.summary}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <IconBriefcase className="mx-auto mb-3 size-10 text-muted-foreground" />
            <h2 className="font-semibold">No approved snapshots</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              No aggregate report overlaps the selected reporting period.
            </p>
          </CardContent>
        </Card>
      )}
    </main>
  );
}

function MiniMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-muted/50 p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-lg font-bold">{value}</p>
    </div>
  );
}
