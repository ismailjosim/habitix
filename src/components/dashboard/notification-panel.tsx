import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { NotificationModel } from '@/generated/prisma/models';

interface NotificationPanelProps {
  notifications: NotificationModel[];
}

export function NotificationPanel({ notifications }: NotificationPanelProps) {
  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'TASK_ASSIGNED':
      case 'TASK_DUE':
        return 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-200';
      case 'BADGE_AWARDED':
        return 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-200';
      case 'HELP_RESPONSE':
      case 'HELP_RESOLVED':
        return 'bg-cyan-50 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-200';
      default:
        return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200';
    }
  };

  if (notifications.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent Notifications</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No notifications yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Recent Notifications</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className="flex items-start justify-between gap-3 border-b pb-3 last:border-0"
          >
            <div className="flex-1">
              <Badge className={getNotificationColor(notification.type)}>
                {notification.type.replace(/_/g, ' ')}
              </Badge>
              <p className="mt-1 text-sm font-medium text-foreground">{notification.title}</p>
              {notification.body && (
                <p className="mt-1 text-sm text-muted-foreground">{notification.body}</p>
              )}
              <p className="mt-1 text-xs text-muted-foreground">
                {new Date(notification.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
