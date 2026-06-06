import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { DataPanel } from '@/components/shared';
import { EmptyState } from '@/components/shared';
import type { TeamMember } from '@/lib/queries/team';

interface TeamMembersProps {
  members: TeamMember[];
}

export function TeamMembers({ members }: TeamMembersProps) {
  if (members.length === 0) {
    return <EmptyState title="No team members" description="This team has no active members yet" />;
  }

  return (
    <DataPanel
      title="Team Members"
      description={`${members.length} active member${members.length !== 1 ? 's' : ''}`}
    >
      <div className="divide-y">
        {members.map((member) => (
          <div key={member.id} className="flex items-center justify-between py-3 px-0.5">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={member.avatarUrl || undefined} />
                <AvatarFallback>{member.displayName.slice(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="font-medium text-sm">{member.displayName}</p>
                <p className="text-xs text-muted-foreground">{member.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {member.role === 'LEAD'
                  ? 'Leader'
                  : member.role === 'MENTOR'
                    ? 'Mentor'
                    : member.role === 'ADMIN'
                      ? 'Admin'
                      : 'Member'}
              </Badge>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">{member.helpPoints} pts</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </DataPanel>
  );
}
