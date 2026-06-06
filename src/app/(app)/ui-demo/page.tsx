import { Button } from '@/components/ui/button';
import {
  PageHeader,
  EmptyState,
  LoadingState,
  DataPanel,
  DataRow,
  StatusBadge,
  PriorityBadge,
  RoleBadge,
} from '@/components/shared';
import {
  formatDate,
  formatDateTime,
  formatDuration,
  formatRelativeTime,
} from '@/lib/display-helpers';
import { LAYOUT_CONSTRAINTS } from '@/lib/layout-constraints';

const sampleDate = new Date('2026-05-15');
const sampleDateTime = new Date('2026-05-15T14:30:00');

export default function UISystemDemoPage() {
  return (
    <div className={`${LAYOUT_CONSTRAINTS.pageMaxWidth} ${LAYOUT_CONSTRAINTS.pagePadding} mx-auto`}>
      <div className={LAYOUT_CONSTRAINTS.pageVerticalSpacing}>
        {/* Page Header Example */}
        <PageHeader
          eyebrow="Component Library"
          title="UI System Components"
          description="Reusable components and design patterns for consistent UI across Habitix"
          actions={<Button>Create New</Button>}
        />

        {/* Display Helpers Examples */}
        <section className={LAYOUT_CONSTRAINTS.sectionSpacing}>
          <h2 className="text-xl font-semibold">Display Helpers</h2>
          <DataPanel title="Date & Time Formatting">
            <div className={LAYOUT_CONSTRAINTS.elementSpacing}>
              <DataRow label="formatDate()" value={formatDate(sampleDate)} />
              <DataRow label="formatDateTime()" value={formatDateTime(sampleDateTime)} />
              <DataRow label="formatDuration(145)" value={formatDuration(145)} />
              <DataRow
                label="formatRelativeTime()"
                value={formatRelativeTime(new Date(Date.now() - 3600000))}
              />
            </div>
          </DataPanel>
        </section>

        {/* Badge Examples */}
        <section className={LAYOUT_CONSTRAINTS.sectionSpacing}>
          <h2 className="text-xl font-semibold">Badges</h2>
          <DataPanel title="Status & Role Badges">
            <div className="space-y-3">
              <div>
                <p className="mb-2 text-sm font-medium text-muted-foreground">Status</p>
                <div className="flex gap-2">
                  <StatusBadge status="TODO" />
                  <StatusBadge status="IN_PROGRESS" />
                  <StatusBadge status="DONE" />
                  <StatusBadge status="BLOCKED" />
                </div>
              </div>
              <div>
                <p className="mb-2 text-sm font-medium text-muted-foreground">Priority</p>
                <div className="flex gap-2">
                  <PriorityBadge priority="LOW" />
                  <PriorityBadge priority="MEDIUM" />
                  <PriorityBadge priority="HIGH" />
                  <PriorityBadge priority="URGENT" />
                </div>
              </div>
              <div>
                <p className="mb-2 text-sm font-medium text-muted-foreground">Role</p>
                <div className="flex gap-2">
                  <RoleBadge role="STUDENT" />
                  <RoleBadge role="MENTOR" />
                  <RoleBadge role="ADMIN" />
                </div>
              </div>
            </div>
          </DataPanel>
        </section>

        {/* Empty State Example */}
        <section className={LAYOUT_CONSTRAINTS.sectionSpacing}>
          <h2 className="text-xl font-semibold">Empty State</h2>
          <EmptyState
            title="No items found"
            description="Create a new item to get started"
            action={<Button>Create Item</Button>}
          />
        </section>

        {/* Loading State Example */}
        <section className={LAYOUT_CONSTRAINTS.sectionSpacing}>
          <h2 className="text-xl font-semibold">Loading State</h2>
          <LoadingState title="Loading data..." count={2} />
        </section>

        {/* Layout Grid Examples */}
        <section className={LAYOUT_CONSTRAINTS.sectionSpacing}>
          <h2 className="text-xl font-semibold">Layout Grid</h2>
          <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4`}>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <DataPanel key={i} title={`Card ${i}`}>
                <p className="text-sm text-muted-foreground">Responsive grid with gap-4 spacing</p>
              </DataPanel>
            ))}
          </div>
        </section>

        {/* Data Panel with Multiple Rows */}
        <section className={LAYOUT_CONSTRAINTS.sectionSpacing}>
          <h2 className="text-xl font-semibold">Data Display</h2>
          <DataPanel
            title="User Statistics"
            description="Summary of user activity and progress"
            actions={
              <Button variant="outline" size="sm">
                Export
              </Button>
            }
          >
            <div className={LAYOUT_CONSTRAINTS.elementSpacing}>
              <DataRow label="Total Focus Time" value={formatDuration(2145)} />
              <DataRow label="Tasks Completed" value="42" />
              <DataRow label="Current Streak" value="7 days" />
              <DataRow label="Team Role" value={<RoleBadge role="MENTOR" />} />
              <DataRow
                label="Last Active"
                value={formatRelativeTime(new Date(Date.now() - 3600000))}
              />
            </div>
          </DataPanel>
        </section>
      </div>
    </div>
  );
}
