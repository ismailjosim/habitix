import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { dateInput } from './corporate-report.utils';

interface CorporateReportFiltersProps {
  students: { id: string; displayName: string }[];
  selectedStudentId?: string;
  range: { start: Date; end: Date };
  modules: string[];
  selectedModule: string;
}

export function CorporateReportFilters({
  students,
  selectedStudentId,
  range,
  modules,
  selectedModule,
}: CorporateReportFiltersProps) {
  return (
    <form className="grid gap-3 rounded-xl border bg-card p-4 sm:grid-cols-2 lg:grid-cols-5 print:hidden">
      <label className="space-y-1 text-xs font-medium">
        Student
        <select
          name="studentId"
          defaultValue={selectedStudentId}
          className="h-8 w-full rounded-lg border bg-background px-3 text-sm"
        >
          {students.map((student) => (
            <option key={student.id} value={student.id}>
              {student.displayName}
            </option>
          ))}
        </select>
      </label>
      <label className="space-y-1 text-xs font-medium">
        From
        <Input name="from" type="date" defaultValue={dateInput(range.start)} />
      </label>
      <label className="space-y-1 text-xs font-medium">
        To
        <Input name="to" type="date" defaultValue={dateInput(range.end)} />
      </label>
      <label className="space-y-1 text-xs font-medium">
        Module
        <select
          name="module"
          defaultValue={selectedModule}
          className="h-8 w-full rounded-lg border bg-background px-3 text-sm"
        >
          <option value="all">All modules</option>
          {modules.map((module) => (
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
  );
}
