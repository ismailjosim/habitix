import type { Icon } from '@tabler/icons-react';
import {
  IconBell,
  IconBriefcase,
  IconChartBar,
  IconChecklist,
  IconHelpCircle,
  IconHome,
  IconMedal,
  IconNotebook,
  IconTargetArrow,
  IconUsers,
  IconUserSquareRounded,
} from '@tabler/icons-react';
import type { AppModule } from '@/lib/permissions';

export type NavItem = {
  title: string;
  href: string;
  icon: Icon;
  module: AppModule;
};

export const navigationItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: IconHome,
    module: 'dashboard',
  },
  {
    title: 'Activity',
    href: '/activity',
    icon: IconChartBar,
    module: 'activity',
  },
  {
    title: 'Focus Mode',
    href: '/focus-mode',
    icon: IconTargetArrow,
    module: 'focus',
  },
  {
    title: 'Tasks',
    href: '/tasks',
    icon: IconChecklist,
    module: 'tasks',
  },
  {
    title: 'Help Desk',
    href: '/help-desk',
    icon: IconHelpCircle,
    module: 'help',
  },
  {
    title: 'Leaderboard',
    href: '/leaderboard',
    icon: IconMedal,
    module: 'leaderboard',
  },
  {
    title: 'Team',
    href: '/team',
    icon: IconUsers,
    module: 'team',
  },
  {
    title: 'Notifications',
    href: '/notifications',
    icon: IconBell,
    module: 'notifications',
  },
  {
    title: 'Profile',
    href: '/profile',
    icon: IconUserSquareRounded,
    module: 'profile',
  },
  {
    title: 'Study Materials',
    href: '/study-materials',
    icon: IconNotebook,
    module: 'materials',
  },
  {
    title: 'Corporate Report',
    href: '/corporate-report',
    icon: IconBriefcase,
    module: 'corporateReport',
  },
];
