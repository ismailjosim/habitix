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
    <div className="bg-gradient-to-r from-purple-600 to-purple-400 px-6 py-12 text-white">
      <div className="flex items-start gap-6">
        <Avatar className="h-24 w-24 border-4 border-white">
          <AvatarImage src={team.avatarUrl || undefined} />
          <AvatarFallback className="bg-purple-800 text-lg font-semibold">
            {initials}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 space-y-2">
          <h1 className="text-3xl font-bold">{team.name}</h1>
          {team.description && <p className="text-purple-100">{team.description}</p>}

          <div className="flex flex-wrap gap-2 pt-2">
            <Badge variant="secondary" className="bg-white text-purple-600">
              {team.memberCount} members
            </Badge>
            <Badge variant="secondary" className="bg-white text-purple-600">
              {team.roles.leaders.length} leader{team.roles.leaders.length !== 1 ? 's' : ''}
            </Badge>
            <Badge variant="secondary" className="bg-white text-purple-600">
              {team.roles.mentors.length} mentor{team.roles.mentors.length !== 1 ? 's' : ''}
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );
}
