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
  color: 'primary' | 'accent';
}) {
  if (members.length === 0) {
    return null;
  }

  const colorClasses = {
    primary: 'border-primary/25 bg-primary-soft/70',
    accent: 'border-accent-foreground/20 bg-accent/55',
  };

  const badgeClasses = {
    primary: 'bg-primary text-primary-foreground',
    accent: 'bg-accent text-accent-foreground',
  };

  return (
    <section className="min-w-0 space-y-3">
      <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
        {members.map((member) => (
          <Card key={member.id} size="sm" className={`h-full ${colorClasses[color]}`}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 shrink-0">
                  <AvatarImage src={member.avatarUrl || undefined} />
                  <AvatarFallback className={badgeClasses[color]}>
                    {member.displayName.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <CardTitle className="truncate text-sm">{member.displayName}</CardTitle>
                  <p className="truncate text-xs text-muted-foreground">{member.email}</p>
                </div>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>
    </section>
  );
}

export function TeamRoleCards({ leaders, mentors }: TeamRoleCardsProps) {
  if (leaders.length === 0 && mentors.length === 0) {
    return null;
  }

  return (
    <div className="grid items-start gap-6 lg:grid-cols-2">
      <RoleSection title="Team Leaders" members={leaders} color="primary" />
      <RoleSection title="Mentors" members={mentors} color="accent" />
    </div>
  );
}
