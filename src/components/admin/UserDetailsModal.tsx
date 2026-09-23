import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { formatDuration } from '@/lib/display-helpers';
import { formatLabel } from './admin.utils';
import type { ManagedProfile } from './admin.types';

interface UserDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile: ManagedProfile | null;
}

export function UserDetailsModal({ open, onOpenChange, profile }: UserDetailsModalProps) {
  if (!profile) return null;
  const membership = profile.memberships[0];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={profile.avatarUrl || undefined} />
              <AvatarFallback className="bg-primary-soft text-primary">
                {profile.displayName.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <DialogTitle>{profile.displayName}</DialogTitle>
              <DialogDescription className="truncate">{profile.authUser.email}</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="grid gap-x-6 gap-y-4 sm:grid-cols-2">
          <Detail label="Platform role" value={formatLabel(profile.role)} />
          <Detail label="Team" value={membership?.team.name ?? 'No active team'} />
          <Detail
            label="Team role"
            value={membership ? formatLabel(membership.role) : 'Not assigned'}
          />
          <Detail label="Timezone" value={profile.timezone || 'Not provided'} />
          <Detail label="Institution" value={profile.institution || 'Not provided'} />
          <Detail label="Department" value={profile.department || 'Not provided'} />
          <Detail label="Total focus" value={formatDuration(profile.totalFocusMinutes)} />
          <Detail label="Current streak" value={`${profile.currentStreak} days`} />
          <Detail label="Help points" value={profile.helpPoints.toString()} />
          <Detail
            label="Joined"
            value={new Intl.DateTimeFormat('en', { dateStyle: 'medium' }).format(profile.createdAt)}
          />
          <div className="sm:col-span-2">
            <Detail label="Bio" value={profile.bio || 'No bio provided'} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1 rounded-xl bg-muted/55 px-4 py-3">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="wrap-break-word text-sm font-medium">{value}</p>
    </div>
  );
}
