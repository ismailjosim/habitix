import { IconUsers } from '@tabler/icons-react';
import { Card, CardContent } from '@/components/ui/card';
import type { getCorporateReportData } from '@/lib/queries/corporate-report';
import { CorporateAggregateReport } from './CorporateAggregateReport';
import { CorporateReportHeader } from './CorporateReportHeader';
import { CorporateReportFilters } from './CorporateReportFilters';
import { CorporateStudentHero } from './CorporateStudentHero';
import { CorporateMetricsGrid } from './CorporateMetricsGrid';
import { CorporateStudentFocusCard } from './CorporateStudentFocusCard';
import { CorporateStudentTasksCard } from './CorporateStudentTasksCard';
import { CorporateStudentCollabCard } from './CorporateStudentCollabCard';
import { CorporateStudentBadgesCard } from './CorporateStudentBadgesCard';
import { CorporateStudentFeedbackCard } from './CorporateStudentFeedbackCard';

type ReportData = Awaited<ReturnType<typeof getCorporateReportData>>;

export function CorporateReportView({ data }: { data: ReportData }) {
  if (data.mode === 'aggregate') return <CorporateAggregateReport data={data} />;

  const report = data.report;

  return (
    <main className="mx-auto max-w-7xl space-y-6 print:max-w-none print:space-y-4">
      <CorporateReportHeader range={data.range} />

      <CorporateReportFilters
        students={data.students}
        selectedStudentId={report?.student.id}
        range={data.range}
        modules={data.modules}
        selectedModule={data.selectedModule}
      />

      {!report ? (
        <Card>
          <CardContent className="p-12 text-center">
            <IconUsers className="mx-auto mb-3 size-10 text-muted-foreground" />
            <h2 className="font-semibold">No authorized students</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Active mentor assignments or student profiles are required before a report can be
              shown.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6 print:space-y-4">
          <CorporateStudentHero student={report.student} />
          <CorporateMetricsGrid overview={report.overview} />

          <section className="grid gap-6 lg:grid-cols-2 print:grid-cols-2 print:gap-4">
            <CorporateStudentFocusCard focus={report.focus} />
            <CorporateStudentTasksCard tasks={report.tasks} />
            <CorporateStudentCollabCard collaboration={report.collaboration} />
            <CorporateStudentBadgesCard badgeAwards={report.badgeAwards} />
          </section>

          <CorporateStudentFeedbackCard feedback={report.feedback} />
        </div>
      )}
    </main>
  );
}
