import type { IconChecklist } from '@tabler/icons-react';
import type { AssignableStudent, AssignableTeam, BoardTask } from '@/lib/queries/tasks';
import type { TaskDetail } from '@/lib/queries/task-detail';

export type BoardSection = 'personal' | 'assigned';
export type BoardStatus = 'TODO' | 'IN_PROGRESS' | 'DONE';

export interface BoardStatusConfig {
  value: BoardStatus;
  title: string;
  icon: typeof IconChecklist;
  tone: string;
}

export interface TaskBoardFiltersState {
  q?: string;
  status?: string;
  category?: string;
}

export interface TaskBoardProps {
  personalTasks: BoardTask[];
  assignedTasks: BoardTask[];
  assignableStudents: AssignableStudent[];
  assignableTeams: AssignableTeam[];
  currentRole: string | null;
  currentProfileId: string | null;
  canAssignTasks: boolean;
  filters: TaskBoardFiltersState;
  total: number;
  page: number;
  pageSize: number;
  categories: string[];
}

export interface TaskDetailViewProps {
  task: TaskDetail;
}
