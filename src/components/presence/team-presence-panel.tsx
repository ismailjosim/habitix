import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { TeamPresence } from '@/lib/queries/presence';

export function TeamPresencePanel({
  members,
  title = 'Live Team Status',
}: {
  members: TeamPresence[];
  title?: string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {members.length === 0 ? (
          <p className="text-sm text-muted-foreground">No teammates are available.</p>
        ) : (
          members.map((member) => (
            <div
              key={member.profileId}
              className="flex items-center justify-between gap-3 border-b pb-3 last:border-0 last:pb-0"
            >
              <div className="flex min-w-0 items-center gap-3">
                <div className="relative shrink-0">
                  <Avatar className="size-9">
                    <AvatarImage src={member.avatarUrl ?? ''} alt={member.displayName} />
                    <AvatarFallback>{initials(member.displayName)}</AvatarFallback>
                  </Avatar>
                  <span
                    className={`absolute bottom-0 right-0 size-2.5 rounded-full ring-2 ring-card ${
                      member.focus
                        ? 'bg-blue-500'
                        : member.isOnline
                          ? 'bg-emerald-500'
                          : 'bg-slate-400'
                    }`}
                    aria-label={
                      member.focus ? 'In focus mode' : member.isOnline ? 'Online' : 'Offline'
                    }
                  />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{member.displayName}</p>
                  <p className="truncate text-xs text-muted-foreground">{statusText(member)}</p>
                  {member.focus?.taskTitle && (
                    <p className="truncate text-xs text-muted-foreground">
                      Team task: {member.focus.taskTitle}
                    </p>
                  )}
                </div>
              </div>
              <Badge variant={member.focus ? 'secondary' : 'outline'} className="shrink-0 text-xs">
                {member.focus ? member.focus.activityLabel : formatRole(member.role)}
              </Badge>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}

function statusText(member: TeamPresence) {
  if (member.focus) {
    return `${member.focus.status === 'PAUSED' ? 'Focus paused' : 'Focus Mode'} - ${member.focus.activityLabel}`;
  }
  if (member.isOnline) return 'Online';
  if (!member.lastSeenAt) return 'Offline';

  return `Last seen ${formatRelativeLastSeen(member.lastSeenAt)}`;
}

function formatRelativeLastSeen(lastSeenAt: Date) {
  const minutes = Math.max(Math.floor((Date.now() - lastSeenAt.getTime()) / 60_000), 1);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function formatRole(role: string) {
  return role.charAt(0) + role.slice(1).toLowerCase();
}

function initials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}
