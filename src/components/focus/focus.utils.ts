export const durationOptions = [25, 45, 50] as const;

export const activityTypes = [
  'Coding',
  'Debugging',
  'Writing',
  'Learning',
  'Reading',
  'Research',
  'Meeting',
  'Other',
] as const;

export function formatClock(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remaining = seconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${remaining.toString().padStart(2, '0')}`;
}

export function formatStatus(status: string): string {
  return status
    .split('_')
    .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
    .join(' ');
}

export function formatElapsed(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remaining = seconds % 60;

  if (minutes === 0) {
    return `${remaining}s`;
  }

  return `${minutes}m ${remaining.toString().padStart(2, '0')}s`;
}
