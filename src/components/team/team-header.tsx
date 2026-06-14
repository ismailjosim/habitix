import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import type { TeamData } from '@/lib/queries/team';

interface TeamHeaderProps {
  team: TeamData;
}

export function TeamHeader({ team }: TeamHeaderProps) {
  const initials = team.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary to-primary-hover px-6 py-10 text-primary-foreground shadow-[0_24px_60px_rgba(249,115,91,0.22)]">
      <div className="pointer-events-none absolute -right-16 -top-24 size-72 rounded-full bg-white/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-28 left-1/3 size-64 rounded-full bg-warning/20 blur-3xl" />
      <div className="relative flex flex-col items-start gap-6 sm:flex-row sm:items-center">
        <Avatar className="h-24 w-24 border-4 border-white/90 shadow-xl">
          <AvatarImage src={team.avatarUrl || undefined} />
          <AvatarFallback className="bg-primary text-lg font-semibold text-primary-foreground">
            {initials}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">{team.name}</h1>
          {team.description && (
            <p className="max-w-2xl text-primary-foreground/80">{team.description}</p>
          )}

          <div className="flex flex-wrap gap-2 pt-2">
            <Badge
              variant="secondary"
              className="border border-white/30 bg-white/90 text-slate-800 shadow-sm"
            >
              {team.memberCount} members
            </Badge>
            <Badge
              variant="secondary"
              className="border border-white/30 bg-white/90 text-slate-800 shadow-sm"
            >
              {team.roles.leaders.length} leader{team.roles.leaders.length !== 1 ? 's' : ''}
            </Badge>
            <Badge
              variant="secondary"
              className="border border-white/30 bg-white/90 text-slate-800 shadow-sm"
            >
              {team.roles.mentors.length} mentor{team.roles.mentors.length !== 1 ? 's' : ''}
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );
}
