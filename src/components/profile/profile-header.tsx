import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { RoleBadge } from '@/components/shared';
import type { ProfileData } from '@/lib/queries/profile';

interface ProfileHeaderProps {
  profile: ProfileData;
}

export function ProfileHeader({ profile }: ProfileHeaderProps) {
  const initials = profile.displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="rounded-xl bg-gradient-to-br from-primary via-primary to-primary-hover px-6 py-10 text-primary-foreground shadow-lg shadow-indigo-950/10">
      <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center">
        <Avatar className="h-24 w-24 border-4 border-white">
          <AvatarImage src={profile.avatarUrl || undefined} />
          <AvatarFallback className="bg-primary-hover text-lg font-semibold">{initials}</AvatarFallback>
        </Avatar>

        <div className="flex-1 space-y-2">
          <h1 className="text-3xl font-bold">{profile.displayName}</h1>
          <p className="text-indigo-100">{profile.email}</p>

          <div className="flex flex-wrap gap-2 pt-2">
            <RoleBadge role={profile.role} />
            {profile.team && (
              <Badge variant="secondary" className="bg-white text-primary">
                {profile.team.name}
              </Badge>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
