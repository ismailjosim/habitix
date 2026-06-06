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
        return 'bg-blue-100 text-blue-800';
      case 'BADGE_AWARDED':
        return 'bg-yellow-100 text-yellow-800';
      case 'HELP_RESPONSE':
      case 'HELP_RESOLVED':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
