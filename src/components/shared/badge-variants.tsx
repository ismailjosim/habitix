import React from 'react';
import { Badge } from '@/components/ui/badge';
import {
  statusColors,
  priorityColors,
  roleColors,
  getStatusLabel,
  getPriorityLabel,
} from '@/lib/display-helpers';

interface StatusBadgeProps {
  status: string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const colorClass = statusColors[status as keyof typeof statusColors] || statusColors.TODO;
  return <Badge className={colorClass}>{getStatusLabel(status)}</Badge>;
}

interface PriorityBadgeProps {
  priority: string;
}

export function PriorityBadge({ priority }: PriorityBadgeProps) {
  const colorClass =
    priorityColors[priority as keyof typeof priorityColors] || priorityColors.MEDIUM;
  return <Badge className={colorClass}>{getPriorityLabel(priority)}</Badge>;
}

interface RoleBadgeProps {
  role: string;
}

export function RoleBadge({ role }: RoleBadgeProps) {
  const colorClass = roleColors[role as keyof typeof roleColors] || roleColors.STUDENT;
  const label = role
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
  return <Badge className={colorClass}>{label}</Badge>;
}
