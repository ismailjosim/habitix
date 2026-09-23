import type { HelpDeskTopic, HelpDeskUrgency } from './types';

export const helpDeskTopics: readonly HelpDeskTopic[] = [
  'Coding',
  'Styling',
  'Frontend',
  'Backend',
  'Database',
  'Learning',
  'Other',
];

export const helpDeskUrgencies: readonly HelpDeskUrgency[] = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];

export function formatMinutes(minutes: number | null): string {
  if (minutes === null) return 'No data';
  if (minutes < 60) return `${minutes}m`;
  return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
}

export function formatLabel(value: string): string {
  return value
    .toLowerCase()
    .split('_')
    .map((part) => part[0]?.toUpperCase() + part.slice(1))
    .join(' ');
}
