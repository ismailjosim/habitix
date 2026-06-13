/**
 * Display helpers for formatting common data types
 */

export function formatDuration(minutes: number): string {
  if (minutes === 0) return '0m';
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hours === 0) return `${mins}m`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: d.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
  });
}

export function formatDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatRelativeTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return formatDate(d);
}

export const statusColors = {
  TODO: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200',
  IN_PROGRESS: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-200',
  BLOCKED: 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-200',
  IN_REVIEW: 'bg-cyan-50 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-200',
  DONE: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-200',
  ARCHIVED: 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
};

export const priorityColors = {
  LOW: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-200',
  MEDIUM: 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-200',
  HIGH: 'bg-orange-50 text-orange-700 dark:bg-orange-950 dark:text-orange-200',
  URGENT: 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-200',
};

export const roleColors = {
  STUDENT: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-200',
  MENTOR: 'bg-cyan-50 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-200',
  ADMIN: 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-200',
  MODERATOR: 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-200',
  CORPORATE_VIEWER: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200',
};

export function getStatusLabel(status: string): string {
  return status
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

export function getPriorityLabel(priority: string): string {
  return priority.charAt(0).toUpperCase() + priority.slice(1).toLowerCase();
}
