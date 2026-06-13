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

export type UserRole = 'student' | 'mentor' | 'admin' | 'moderator' | 'corporate';

export type NavItem = {
  title: string;
  href: string;
  icon: Icon;
  roles: UserRole[];
};

export const navigationItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: IconHome,
    roles: ['student', 'mentor', 'admin', 'moderator', 'corporate'],
  },
  {
    title: 'Activity',
    href: '/activity',
    icon: IconChartBar,
    roles: ['student', 'mentor', 'admin'],
  },
  {
    title: 'Focus Mode',
    href: '/focus-mode',
    icon: IconTargetArrow,
    roles: ['student', 'mentor'],
  },
  {
    title: 'Tasks',
    href: '/tasks',
    icon: IconChecklist,
    roles: ['student', 'mentor', 'admin'],
  },
  {
    title: 'Help Desk',
    href: '/help-desk',
    icon: IconHelpCircle,
    roles: ['student', 'mentor', 'moderator', 'admin'],
  },
  {
    title: 'Leaderboard',
    href: '/leaderboard',
    icon: IconMedal,
    roles: ['student', 'mentor', 'admin'],
  },
  {
    title: 'Team',
    href: '/team',
    icon: IconUsers,
    roles: ['student', 'mentor', 'admin', 'corporate'],
  },
  {
    title: 'Notifications',
    href: '/notifications',
    icon: IconBell,
    roles: ['student', 'mentor', 'admin', 'moderator', 'corporate'],
  },
  {
    title: 'Profile',
    href: '/profile',
    icon: IconUserSquareRounded,
    roles: ['student', 'mentor', 'admin', 'moderator', 'corporate'],
  },
  {
    title: 'Study Materials',
    href: '/study-materials',
    icon: IconNotebook,
    roles: ['student', 'mentor', 'admin'],
  },
  {
    title: 'Corporate Report',
    href: '/corporate-report',
    icon: IconBriefcase,
    roles: ['mentor', 'admin', 'corporate'],
  },
];
