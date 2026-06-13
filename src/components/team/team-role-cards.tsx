import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
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
  color: 'indigo' | 'cyan';
}) {
  if (members.length === 0) {
    return null;
  }

  const colorClasses = {
    indigo: 'border-indigo-200 bg-indigo-50/70 dark:border-indigo-900 dark:bg-indigo-950/40',
    cyan: 'border-cyan-200 bg-cyan-50/70 dark:border-cyan-900 dark:bg-cyan-950/40',
  };

  const badgeClasses = {
    indigo: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
    cyan: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200',
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
      <RoleSection title="Team Leaders" members={leaders} color="indigo" />
      <RoleSection title="Mentors" members={mentors} color="cyan" />
    </div>
  );
}
