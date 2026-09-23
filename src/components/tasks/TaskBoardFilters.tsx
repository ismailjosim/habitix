import Link from 'next/link';
import { getStatusLabel } from '@/lib/display-helpers';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { TaskBoardFiltersState } from './types';

interface TaskBoardFiltersProps {
  filters: TaskBoardFiltersState;
  filterCategories: string[];
}

export function TaskBoardFilters({ filters, filterCategories }: TaskBoardFiltersProps) {
  return (
    <form className="grid gap-2 rounded-xl border bg-card p-3 sm:grid-cols-[minmax(12rem,1fr)_12rem_12rem_auto_auto]">
      <Input
        aria-label="Search tasks"
        name="q"
        defaultValue={filters.q}
        placeholder="Search task title, details, or category"
      />
      <select
        name="status"
        defaultValue={filters.status ?? 'all'}
        className="h-8 rounded-lg border bg-background px-3 text-sm"
      >
        <option value="all">All statuses</option>
        {['TODO', 'IN_PROGRESS', 'BLOCKED', 'IN_REVIEW', 'DONE'].map((status) => (
          <option key={status} value={status}>
            {getStatusLabel(status)}
          </option>
        ))}
      </select>
      <select
        name="category"
        defaultValue={filters.category ?? 'all'}
        className="h-8 rounded-lg border bg-background px-3 text-sm"
      >
        <option value="all">All categories</option>
        {filterCategories.map((category) => (
          <option key={category}>{category}</option>
        ))}
      </select>
      <Button type="submit" variant="outline">
        Filter
      </Button>
      <Button asChild type="button" variant="ghost">
        <Link href="/tasks">Reset</Link>
      </Button>
    </form>
  );
}
