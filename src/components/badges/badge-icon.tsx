import {
  IconCode,
  IconCrown,
  IconFlame,
  IconHeartHandshake,
  IconRosetteDiscountCheck,
  IconStar,
  IconTargetArrow,
  IconTrophy,
} from '@tabler/icons-react';

import { cn } from '@/lib/utils';

const icons = {
  flame: IconFlame,
  target: IconTargetArrow,
  code: IconCode,
  star: IconStar,
  'heart-handshake': IconHeartHandshake,
  crown: IconCrown,
  trophy: IconTrophy,
};

const tones = {
  flame: 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300',
  target: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
  code: 'bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300',
  star: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
  'heart-handshake': 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300',
  crown: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300',
  trophy: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
};

export function BadgeIcon({ name, className }: { name: string; className?: string }) {
  const Icon = icons[name as keyof typeof icons] ?? IconRosetteDiscountCheck;
  const tone = tones[name as keyof typeof tones] ?? 'bg-muted text-muted-foreground';

  return (
    <span className={cn('grid size-11 shrink-0 place-items-center rounded-xl', tone, className)}>
      <Icon className="size-6" />
    </span>
  );
}
