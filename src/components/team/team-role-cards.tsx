import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RoleBadge } from '@/components/shared';
import { EmptyState } from '@/components/shared';
import type { TeamMember } from '@/lib/queries/team';

interface TeamRoleCardsProps {
  leaders: TeamMember[];
  mentors: TeamMember[];
}

function RoleSection({
  title,
  members,
  color,
}: {
  title: string;
  members: TeamMember[];
  color: 'purple' | 'blue' | 'green';
}) {
  if (members.length === 0) {
    return null;
  }

  const colorClasses = {
    purple: 'border-purple-200 bg-purple-50',
    blue: 'border-blue-200 bg-blue-50',
    green: 'border-green-200 bg-green-50',
  };

  const badgeClasses = {
    purple: 'bg-purple-100 text-purple-800',
    blue: 'bg-blue-100 text-blue-800',
    green: 'bg-green-100 text-green-800',
  };

  return (
    <div className="space-y-2">
      <h3 className="font-semibold text-lg">{title}</h3>
      <div className="grid gap-3 sm:grid-cols-2">
        {members.map((member) => (
          <Card key={member.id} className={`border-2 ${colorClasses[color]}`}>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={member.avatarUrl || undefined} />
                  <AvatarFallback className={badgeClasses[color]}>
                    {member.displayName.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <CardTitle className="text-sm">{member.displayName}</CardTitle>
                  <p className="text-xs text-muted-foreground">{member.email}</p>
                </div>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );
}

export function TeamRoleCards({ leaders, mentors }: TeamRoleCardsProps) {
  if (leaders.length === 0 && mentors.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      <RoleSection title="Team Leaders" members={leaders} color="purple" />
      <RoleSection title="Mentors" members={mentors} color="blue" />
    </div>
  );
}
