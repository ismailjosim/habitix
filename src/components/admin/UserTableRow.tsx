import { IconEdit, IconEye } from '@tabler/icons-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatLabel } from './admin.utils';
import type { ManagedProfile } from './admin.types';

interface UserTableRowProps {
  profile: ManagedProfile;
  onView: (profile: ManagedProfile) => void;
  onEdit: (profile: ManagedProfile) => void;
}

export function UserTableRow({ profile, onView, onEdit }: UserTableRowProps) {
  const membership = profile.memberships[0];

  return (
    <tr className="hover:bg-muted/30">
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9">
            <AvatarImage src={profile.avatarUrl || undefined} />
            <AvatarFallback className="bg-primary-soft text-primary">
              {profile.displayName.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate font-medium">{profile.displayName}</p>
            <p className="truncate text-xs text-muted-foreground">{profile.authUser.email}</p>
          </div>
        </div>
      </td>
      <td className="px-4 py-3">
        <Badge variant="outline">{formatLabel(profile.role)}</Badge>
      </td>
      <td className="px-4 py-3">
        <p>{membership?.team.name ?? 'No team'}</p>
        {membership && (
          <p className="text-xs text-muted-foreground">{formatLabel(membership.role)}</p>
        )}
      </td>
      <td className="px-4 py-3 text-muted-foreground">{profile.institution ?? 'Not provided'}</td>
      <td className="px-4 py-3">
        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={() => onView(profile)}
            aria-label={`View ${profile.displayName}`}
            title="View full information"
          >
            <IconEye />
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={() => onEdit(profile)}>
            <IconEdit data-icon="inline-start" />
            Update
          </Button>
        </div>
      </td>
    </tr>
  );
}
