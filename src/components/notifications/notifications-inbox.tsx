'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import {
  IconAward,
  IconBell,
  IconChecklist,
  IconChecks,
  IconHelp,
  IconMessage,
  IconSchool,
} from '@tabler/icons-react';

import { markAllNotificationsRead, markNotificationRead } from '@/lib/actions/notifications';
import type { NotificationCategory, NotificationsData } from '@/lib/queries/notifications';
import { formatDateTime } from '@/lib/display-helpers';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const categories: { value: NotificationCategory; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'tasks', label: 'Task Updates' },
  { value: 'help', label: 'Help Requests' },
  { value: 'responses', label: 'Responses' },
  { value: 'mentorship', label: 'Mentorship' },
  { value: 'awards', label: 'Awards' },
];

export function NotificationsInbox({
  data,
  category,
}: {
  data: NotificationsData;
  category: NotificationCategory;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function read(id: string) {
    startTransition(async () => {
      await markNotificationRead({ notificationId: id });
      router.refresh();
    });
  }

  function readAll() {
    startTransition(async () => {
      await markAllNotificationsRead();
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">Updates</p>
          <h1 className="text-3xl font-bold">Notifications</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Task, help, mentorship, and achievement updates in one place.
          </p>
        </div>
        <Button variant="outline" disabled={!data.unreadCount || pending} onClick={readAll}>
          <IconChecks /> Mark all as read
        </Button>
      </header>

      <div className="flex flex-wrap gap-2">
        {categories.map((item) => (
          <Button
            key={item.value}
            asChild
            variant={category === item.value ? 'secondary' : 'outline'}
            size="sm"
          >
            <Link href={`/notifications?category=${item.value}`}>{item.label}</Link>
          </Button>
        ))}
      </div>

      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Badge variant="secondary">{data.unreadCount} unread</Badge>
        <span>{data.total} in this category</span>
      </div>

      <section className="space-y-3">
        {data.notifications.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-sm text-muted-foreground">
              No notifications match this filter.
            </CardContent>
          </Card>
        ) : (
          data.notifications.map((notification) => {
            const Icon = notificationIcon(notification.type);
            return (
              <Card
                key={notification.id}
                className={cn(!notification.readAt && 'border-primary/40 bg-primary/[0.03]')}
              >
                <CardContent className="flex gap-3 p-4">
                  <div className="relative shrink-0">
                    {notification.actor ? (
                      <Avatar className="size-10">
                        <AvatarImage src={notification.actor.avatarUrl ?? ''} />
                        <AvatarFallback>{notification.actor.displayName[0]}</AvatarFallback>
                      </Avatar>
                    ) : (
                      <span className="grid size-10 place-items-center rounded-full bg-muted">
                        <Icon className="size-5" />
                      </span>
                    )}
                    {!notification.readAt && (
                      <span className="absolute -right-0.5 -top-0.5 size-2.5 rounded-full bg-primary ring-2 ring-card" />
                    )}
                  </div>
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => read(notification.id)}
                    className="min-w-0 flex-1 text-left"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-medium">{notification.title}</p>
                      <time className="text-xs text-muted-foreground">
                        {formatDateTime(notification.createdAt)}
                      </time>
                    </div>
                    {notification.body && (
                      <p className="mt-1 text-sm text-muted-foreground">{notification.body}</p>
                    )}
                    <p className="mt-2 text-xs text-muted-foreground">
                      {labelType(notification.type)}
                    </p>
                  </button>
                </CardContent>
              </Card>
            );
          })
        )}
      </section>
    </div>
  );
}

function notificationIcon(type: string) {
  if (type.startsWith('TASK')) return IconChecklist;
  if (type === 'BADGE_AWARDED') return IconAward;
  if (type === 'MENTOR_FEEDBACK') return IconSchool;
  if (type === 'HELP_RESPONSE' || type === 'HELP_RESOLVED') return IconMessage;
  if (type === 'TEAM_UPDATE') return IconHelp;
  return IconBell;
}

function labelType(type: string) {
  return type
    .toLowerCase()
    .split('_')
    .map((part) => part[0]?.toUpperCase() + part.slice(1))
    .join(' ');
}
