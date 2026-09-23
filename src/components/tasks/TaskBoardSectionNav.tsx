import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { BoardSection } from './types';

interface TaskBoardSectionNavProps {
  activeSection: BoardSection;
  setActiveSection: (section: BoardSection) => void;
  personalTasksCount: number;
  assignedTasksCount: number;
  blockedCount: number;
  reviewCount: number;
  visibleCount: number;
}

export function TaskBoardSectionNav({
  activeSection,
  setActiveSection,
  personalTasksCount,
  assignedTasksCount,
  blockedCount,
  reviewCount,
  visibleCount,
}: TaskBoardSectionNavProps) {
  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <div className="inline-flex w-full rounded-lg border bg-background p-1 sm:w-fit">
        <Button
          type="button"
          variant={activeSection === 'personal' ? 'secondary' : 'ghost'}
          className="flex-1 sm:flex-none"
          onClick={() => setActiveSection('personal')}
        >
          My Tasks
          <Badge variant="secondary">{personalTasksCount}</Badge>
        </Button>
        <Button
          type="button"
          variant={activeSection === 'assigned' ? 'secondary' : 'ghost'}
          className="flex-1 sm:flex-none"
          onClick={() => setActiveSection('assigned')}
        >
          Mentor/Admin Tasks
          <Badge variant="secondary">{assignedTasksCount}</Badge>
        </Button>
      </div>

      <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
        <Badge variant="outline">{blockedCount} blocked</Badge>
        <Badge variant="outline">{reviewCount} in review</Badge>
        <Badge variant="outline">{visibleCount} visible</Badge>
      </div>
    </div>
  );
}
