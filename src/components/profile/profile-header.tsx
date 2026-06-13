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
    <div className="relative overflow-hidden rounded-2xl bg-sidebar px-6 py-10 text-sidebar-foreground shadow-[0_24px_60px_rgba(15,23,42,0.16)]">
      <div className="pointer-events-none absolute -right-16 -top-24 size-72 rounded-full bg-primary/35 blur-3xl" />
      <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center">
        <Avatar className="relative h-24 w-24 border-4 border-white/90 shadow-xl">
          <AvatarImage src={profile.avatarUrl || undefined} />
          <AvatarFallback className="bg-primary text-lg font-semibold text-primary-foreground">
            {initials}
          </AvatarFallback>
        </Avatar>

        <div className="relative flex-1 space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-white">{profile.displayName}</h1>
          <p className="text-white/60">{profile.email}</p>

          <div className="flex flex-wrap gap-2 pt-2">
            <RoleBadge role={profile.role} />
            {profile.team && (
              <Badge variant="secondary" className="border-0 bg-white text-sidebar">
                {profile.team.name}
              </Badge>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
