import {
  IconActivity,
  IconAward,
  IconBriefcase,
  IconChecklist,
  IconClock,
  IconHelpHexagon,
  IconMessageCircle,
  IconTargetArrow,
  IconUsers,
} from '@tabler/icons-react';

import { BadgeIcon } from '@/components/badges/badge-icon';
import { PrintButton } from '@/components/corporate-report/print-button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { formatDate, formatDuration, getStatusLabel } from '@/lib/display-helpers';
import type { getCorporateReportData } from '@/lib/queries/corporate-report';
import { BrandLogo } from '@/components/app/brand-logo';

type ReportData = Awaited<ReturnType<typeof getCorporateReportData>>;

export function CorporateReportView({ data }: { data: ReportData }) {
  if (data.mode === 'aggregate') return <AggregateReport data={data} />;

  const report = data.report;
  return (
    <main className="mx-auto max-w-7xl space-y-6 print:max-w-none print:space-y-4">
      <header className="flex flex-col gap-4 border-b pb-5 sm:flex-row sm:items-end sm:justify-between print:pb-3">
        <div>
          <BrandLogo className="mb-4 hidden h-9 w-auto print:block" />
          <p className="text-sm font-medium text-primary">Learner performance report</p>
          <h1 className="text-3xl font-bold">Corporate Student Report</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Measured platform activity from {formatDate(data.range.start)} to{' '}
            {formatDate(data.range.end)}.
          </p>
        </div>
        <PrintButton />
      </header>

      <form className="grid gap-3 rounded-xl border bg-card p-4 sm:grid-cols-2 lg:grid-cols-5 print:hidden">
        <label className="space-y-1 text-xs font-medium">
          Student
          <select
            name="studentId"
            defaultValue={report?.student.id}
            className="h-8 w-full rounded-lg border bg-background px-3 text-sm"
          >
            {data.students.map((student) => (
              <option key={student.id} value={student.id}>
                {student.displayName}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-1 text-xs font-medium">
          From
          <Input name="from" type="date" defaultValue={dateInput(data.range.start)} />
        </label>
        <label className="space-y-1 text-xs font-medium">
          To
          <Input name="to" type="date" defaultValue={dateInput(data.range.end)} />
        </label>
        <label className="space-y-1 text-xs font-medium">
          Module
          <select
            name="module"
            defaultValue={data.selectedModule}
            className="h-8 w-full rounded-lg border bg-background px-3 text-sm"
          >
            <option value="all">All modules</option>
            {data.modules.map((module) => (
              <option key={module} value={module}>
                {module}
              </option>
            ))}
          </select>
        </label>
        <Button className="self-end" type="submit">
          Apply filters
        </Button>
      </form>

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
        <StudentReport report={report} />
      )}
    </main>
  );
}

function StudentReport({
  report,
}: {
  report: NonNullable<Extract<ReportData, { mode: 'student' }>['report']>;
}) {
  const { student } = report;
  return (
    <div className="space-y-6 print:space-y-4">
      <section className="flex flex-col gap-4 rounded-xl bg-primary p-6 text-primary-foreground sm:flex-row sm:items-center sm:justify-between print:border print:bg-white print:text-black">
        <div className="flex items-center gap-4">
          <Avatar className="size-14">
            <AvatarImage src={student.avatarUrl ?? undefined} alt="" />
            <AvatarFallback>{initials(student.displayName)}</AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-2xl font-bold">{student.displayName}</h2>
            <p className="text-sm opacity-80">
              {[student.department, student.institution].filter(Boolean).join(' · ') || 'Student'}
            </p>
            <p className="text-xs opacity-70">
              {student.memberships[0]?.team.name ?? 'No active team'} · {student.currentStreak} day
              streak
            </p>
          </div>
        </div>
        <p className="max-w-md text-sm opacity-80">
          This report contains operational learning metrics only. Contact details and private
          profile fields are excluded.
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6 print:grid-cols-3">
        <Metric
          icon={IconActivity}
          label="Activity events"
          value={String(report.overview.activityEvents)}
        />
        <Metric
          icon={IconTargetArrow}
          label="Focus time"
          value={formatDuration(report.overview.focusMinutes)}
        />
        <Metric
          icon={IconChecklist}
          label="Tasks completed"
          value={String(report.overview.completedTasks)}
        />
        <Metric
          icon={IconAward}
          label="Badges earned"
          value={String(report.overview.badgesEarned)}
        />
        <Metric
          icon={IconHelpHexagon}
          label="Help points"
          value={String(report.overview.helpPoints)}
        />
        <Metric
          icon={IconActivity}
          label="Activity points"
          value={String(report.overview.activityPoints)}
        />
      </section>

      <section className="grid gap-6 lg:grid-cols-2 print:grid-cols-2 print:gap-4">
        <ReportCard title="Focus" icon={IconTargetArrow}>
          <div className="grid grid-cols-3 gap-3 text-center">
            <MiniMetric label="Sessions" value={String(report.focus.sessions.length)} />
            <MiniMetric label="Active days" value={String(report.focus.activeDays)} />
            <MiniMetric label="Adherence" value={`${report.focus.completionRate}%`} />
          </div>
          <Progress value={Math.min(report.focus.completionRate, 100)} />
          <div className="space-y-3">
            {report.focus.sessions.slice(0, 6).map((session) => (
              <div
                key={session.id}
                className="flex items-center justify-between gap-3 border-t pt-3 text-sm"
              >
                <div>
                  <p className="font-medium">
                    {session.task?.title ?? getStatusLabel(session.activityType)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {session.completedAt ? formatDate(session.completedAt) : 'No completion date'}
                    {session.task?.category ? ` · ${session.task.category}` : ''}
                  </p>
                </div>
                <span className="font-semibold">{formatDuration(session.actualMinutes ?? 0)}</span>
              </div>
            ))}
            {!report.focus.sessions.length && (
              <EmptyLine text="No completed focus sessions in this period." />
            )}
          </div>
        </ReportCard>

        <ReportCard title="Tasks" icon={IconChecklist}>
          <div className="grid grid-cols-3 gap-3 text-center">
            <MiniMetric
              label="Completed"
              value={`${report.tasks.completed}/${report.tasks.total}`}
            />
            <MiniMetric label="Completion" value={`${report.tasks.completionRate}%`} />
            <MiniMetric label="Overdue" value={String(report.tasks.overdue)} />
          </div>
          <Progress value={report.tasks.completionRate} />
          <div className="space-y-3">
            {report.tasks.items.slice(0, 8).map((task) => (
              <div
                key={task.id}
                className="flex items-center justify-between gap-3 border-t pt-3 text-sm"
              >
                <div>
                  <p className="font-medium">{task.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {task.category ?? 'General'} · Created {formatDate(task.createdAt)}
                  </p>
                </div>
                <Badge variant={task.status === 'DONE' ? 'secondary' : 'outline'}>
                  {getStatusLabel(task.status)}
                </Badge>
              </div>
            ))}
            {!report.tasks.items.length && <EmptyLine text="No task activity in this period." />}
          </div>
        </ReportCard>

        <ReportCard title="Collaboration" icon={IconHelpHexagon}>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <MiniMetric label="Questions" value={String(report.collaboration.helpPosts)} />
            <MiniMetric label="Resolved" value={`${report.collaboration.resolutionRate}%`} />
            <MiniMetric label="Responses" value={String(report.collaboration.responsesGiven)} />
            <MiniMetric label="Accepted" value={String(report.collaboration.acceptedResponses)} />
            <MiniMetric label="Efficiency" value={`${report.collaboration.efficiency}%`} />
            <MiniMetric
              label="First response"
              value={
                report.collaboration.averageFirstResponseMinutes === null
                  ? 'N/A'
                  : formatDuration(report.collaboration.averageFirstResponseMinutes)
              }
            />
          </div>
          <p className="text-xs leading-5 text-muted-foreground">
            Help efficiency is the share of the learner&apos;s responses accepted as resolutions.
            First response measures requests created by the learner.
          </p>
        </ReportCard>

        <ReportCard title="Badges" icon={IconAward}>
          <div className="space-y-3">
            {report.badgeAwards.slice(0, 6).map((award) => (
              <div key={award.id} className="flex gap-3 border-b pb-3 last:border-0">
                <BadgeIcon name={award.badge.iconName} className="size-9 [&>svg]:size-5" />
                <div>
                  <p className="font-medium">{award.badge.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {award.reason || award.badge.description || 'Platform achievement'} ·{' '}
                    {formatDate(award.awardedAt)}
                  </p>
                </div>
              </div>
            ))}
            {!report.badgeAwards.length && <EmptyLine text="No badges awarded in this period." />}
          </div>
        </ReportCard>
      </section>

      <ReportCard title="Team Feedback" icon={IconMessageCircle}>
        <div className="grid gap-3 md:grid-cols-2 print:grid-cols-2">
          {report.feedback.map((comment) => (
            <blockquote key={comment.id} className="rounded-lg border bg-muted/30 p-4">
              <p className="text-sm leading-6">“{comment.body}”</p>
              <footer className="mt-2 text-xs text-muted-foreground">
                {comment.author.displayName} · {getStatusLabel(comment.author.role)} ·{' '}
                {comment.taskTitle} · {formatDate(comment.createdAt)}
              </footer>
            </blockquote>
          ))}
          {!report.feedback.length && (
            <EmptyLine text="No mentor or admin feedback in this period." />
          )}
        </div>
      </ReportCard>
    </div>
  );
}

function AggregateReport({ data }: { data: Extract<ReportData, { mode: 'aggregate' }> }) {
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
                  {formatDate(snapshot.periodStart)} – {formatDate(snapshot.periodEnd)}
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

function ReportCard({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: typeof IconClock;
  children: React.ReactNode;
}) {
  return (
    <Card className="break-inside-avoid">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon className="size-5 text-primary" /> {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">{children}</CardContent>
    </Card>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof IconClock;
  label: string;
  value: string;
}) {
  return (
    <Card size="sm" className="break-inside-avoid">
      <CardContent className="flex items-center gap-3">
        <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
          <Icon className="size-5" />
        </span>
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-lg font-bold">{value}</p>
        </div>
      </CardContent>
    </Card>
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

function EmptyLine({ text }: { text: string }) {
  return (
    <p className="rounded-lg border border-dashed p-5 text-center text-sm text-muted-foreground">
      {text}
    </p>
  );
}

function initials(name: string) {
  return name
    .split(' ')
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
}

function dateInput(date: Date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-');
}
