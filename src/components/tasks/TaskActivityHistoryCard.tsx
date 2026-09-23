import type { TaskDetail } from '@/lib/queries/task-detail';
import { formatDateTime, getStatusLabel } from '@/lib/display-helpers';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface TaskActivityHistoryCardProps {
  activities: TaskDetail['activities'];
}

export function TaskActivityHistoryCard({ activities }: TaskActivityHistoryCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Activity History</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {activities.length === 0 ? (
          <p className="text-sm text-muted-foreground">No activity recorded yet.</p>
        ) : (
          activities.map((activity) => (
            <div key={activity.id} className="flex gap-3">
              <Avatar>
                <AvatarImage src={activity.actor.avatarUrl ?? undefined} />
                <AvatarFallback>{getInitials(activity.actor.displayName)}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="text-sm">
                  <span className="font-semibold">{activity.actor.displayName}</span>{' '}
                  {formatActivity(activity.eventType)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {activity.fromStatus && activity.toStatus
                    ? `${getStatusLabel(activity.fromStatus)} to ${getStatusLabel(
                        activity.toStatus
                      )} • `
                    : ''}
                  {formatDateTime(activity.createdAt)}
                </p>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}

function getInitials(name: string) {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function formatActivity(eventType: string) {
  return eventType.split('_').join(' ');
}
