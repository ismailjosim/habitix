export function rankLabel(rank: number | null): string {
  return rank ? `#${rank}` : 'Unranked';
}

export function initials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}

export function formatPeriod(periodKey: string): string {
  const [type, value] = periodKey.split(':');
  return type === 'week' ? `week of ${value}` : type === 'month' ? `month ${value}` : value;
}
