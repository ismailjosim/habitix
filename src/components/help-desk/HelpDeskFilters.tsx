import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { HelpDeskFiltersState } from './types';

interface HelpDeskFiltersProps {
  filters: HelpDeskFiltersState;
  topics: string[];
}

export function HelpDeskFilters({ filters, topics }: HelpDeskFiltersProps) {
  return (
    <form className="grid gap-3 rounded-xl border bg-card p-4 sm:grid-cols-[1fr_12rem_12rem_auto_auto]">
      <Input
        name="q"
        defaultValue={filters.q}
        placeholder="Search questions, answers, or tags..."
      />
      <select
        name="status"
        defaultValue={filters.status}
        className="h-8 rounded-lg border bg-background px-3 text-sm"
      >
        <option value="all">All statuses</option>
        <option value="OPEN">Open</option>
        <option value="RESOLVED">Resolved</option>
      </select>
      <select
        name="topic"
        defaultValue={filters.topic}
        className="h-8 rounded-lg border bg-background px-3 text-sm"
      >
        <option value="all">All topics</option>
        {topics.map((topic) => (
          <option key={topic}>{topic}</option>
        ))}
      </select>
      <Button type="submit" variant="outline">
        Filter
      </Button>
      <Button asChild type="button" variant="ghost">
        <a href="/help-desk">Reset</a>
      </Button>
    </form>
  );
}
