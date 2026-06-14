'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { IconEdit, IconEye } from '@tabler/icons-react';

import { createManagedTeam, updateManagedUser } from '@/lib/actions/admin-users';
import type { getAdminUsersData } from '@/lib/queries/admin-users';
import { formatDuration } from '@/lib/display-helpers';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

type AdminUsersData = Awaited<ReturnType<typeof getAdminUsersData>>;
type ManagedProfile = AdminUsersData['profiles'][number];
type DialogMode = 'view' | 'edit' | null;

const roles = ['STUDENT', 'MENTOR', 'ADMIN', 'MODERATOR', 'CORPORATE_VIEWER'] as const;
const teamRoles = ['MEMBER', 'LEAD', 'MENTOR', 'ADMIN', 'VIEWER'] as const;
const selectClassName = 'h-9 w-full rounded-md border bg-background px-3 text-sm';

export function UserManagement({ data }: { data: AdminUsersData }) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [selectedProfile, setSelectedProfile] = useState<ManagedProfile | null>(null);
  const [dialogMode, setDialogMode] = useState<DialogMode>(null);
  const [isPending, startTransition] = useTransition();

  function createTeam(formData: FormData) {
    startTransition(async () => {
      const result = await createManagedTeam({
        name: String(formData.get('name') ?? ''),
        slug: String(formData.get('slug') ?? ''),
      });
      setMessage(result.message);
      if (result.success) router.refresh();
    });
  }

  function updateUser(formData: FormData) {
    startTransition(async () => {
      const result = await updateManagedUser({
        profileId: String(formData.get('profileId') ?? ''),
        displayName: String(formData.get('displayName') ?? ''),
        role: String(formData.get('role') ?? 'STUDENT') as (typeof roles)[number],
        institution: String(formData.get('institution') ?? ''),
        department: String(formData.get('department') ?? ''),
        teamId: String(formData.get('teamId') ?? ''),
        teamRole: String(formData.get('teamRole') ?? 'MEMBER') as (typeof teamRoles)[number],
      });
      setMessage(result.message);
      if (result.success) {
        setDialogMode(null);
        router.refresh();
      }
    });
  }

  function openDialog(profile: ManagedProfile, mode: Exclude<DialogMode, null>) {
    setSelectedProfile(profile);
    setDialogMode(mode);
  }

  return (
    <div className="space-y-6 py-6 sm:py-8 lg:py-10">
      <header>
        <p className="text-sm font-medium text-muted-foreground">Administration</p>
        <h1 className="text-3xl font-bold">User Management</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage platform roles, profile information, and active team access.
        </p>
      </header>

      {message && <div className="rounded-lg border bg-card px-4 py-3 text-sm">{message}</div>}

      <Card>
        <CardHeader>
          <CardTitle>Create team</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createTeam} className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
            <Input name="name" placeholder="Team name" required />
            <Input name="slug" placeholder="team-slug" required />
            <Button type="submit" disabled={isPending}>
              Create team
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
          <p className="text-sm text-muted-foreground">
            {data.profiles.length} registered user{data.profiles.length === 1 ? '' : 's'}
          </p>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-xl border">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="border-b bg-muted/60 text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-semibold">User</th>
                  <th className="px-4 py-3 font-semibold">Role</th>
                  <th className="px-4 py-3 font-semibold">Team</th>
                  <th className="px-4 py-3 font-semibold">Institution</th>
                  <th className="px-4 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {data.profiles.map((profile) => {
                  const membership = profile.memberships[0];
                  return (
                    <tr key={profile.id} className="transition-colors hover:bg-muted/35">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <UserAvatar profile={profile} />
                          <div className="min-w-0">
                            <p className="truncate font-medium">{profile.displayName}</p>
                            <p className="truncate text-xs text-muted-foreground">
                              {profile.authUser.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="outline">{formatLabel(profile.role)}</Badge>
                      </td>
                      <td className="px-4 py-3">
                        <p>{membership?.team.name ?? 'No team'}</p>
                        {membership && (
                          <p className="text-xs text-muted-foreground">
                            {formatLabel(membership.role)}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {profile.institution ?? 'Not provided'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => openDialog(profile, 'view')}
                            aria-label={`View ${profile.displayName}`}
                            title="View full information"
                          >
                            <IconEye />
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => openDialog(profile, 'edit')}
                          >
                            <IconEdit data-icon="inline-start" />
                            Update
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={dialogMode === 'view'} onOpenChange={(open) => !open && setDialogMode(null)}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
          {selectedProfile && <UserDetails profile={selectedProfile} />}
        </DialogContent>
      </Dialog>

      <Dialog open={dialogMode === 'edit'} onOpenChange={(open) => !open && setDialogMode(null)}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
          {selectedProfile && (
            <EditUserForm
              key={selectedProfile.id}
              profile={selectedProfile}
              teams={data.teams}
              isPending={isPending}
              action={updateUser}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function UserDetails({ profile }: { profile: ManagedProfile }) {
  const membership = profile.memberships[0];

  return (
    <>
      <DialogHeader>
        <div className="flex items-center gap-3">
          <UserAvatar profile={profile} large />
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
    </>
  );
}

function EditUserForm({
  profile,
  teams,
  isPending,
  action,
}: {
  profile: ManagedProfile;
  teams: AdminUsersData['teams'];
  isPending: boolean;
  action: (formData: FormData) => void;
}) {
  const membership = profile.memberships[0];

  return (
    <form action={action} className="space-y-5">
      <DialogHeader>
        <DialogTitle>Update user</DialogTitle>
        <DialogDescription>Edit profile fields, platform role, and team access.</DialogDescription>
      </DialogHeader>
      <input type="hidden" name="profileId" value={profile.id} />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Display name">
          <Input name="displayName" defaultValue={profile.displayName} required />
        </Field>
        <Field label="Platform role">
          <select name="role" defaultValue={profile.role} className={selectClassName}>
            {roles.map((role) => (
              <option key={role}>{role}</option>
            ))}
          </select>
        </Field>
        <Field label="Active team">
          <select name="teamId" defaultValue={membership?.teamId ?? ''} className={selectClassName}>
            <option value="">No active team</option>
            {teams.map((team) => (
              <option key={team.id} value={team.id}>
                {team.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Team role">
          <select
            name="teamRole"
            defaultValue={membership?.role ?? 'MEMBER'}
            className={selectClassName}
          >
            {teamRoles.map((role) => (
              <option key={role}>{role}</option>
            ))}
          </select>
        </Field>
        <Field label="Institution">
          <Input name="institution" defaultValue={profile.institution ?? ''} />
        </Field>
        <Field label="Department">
          <Input name="department" defaultValue={profile.department ?? ''} />
        </Field>
      </div>
      <DialogFooter>
        <Button type="submit" disabled={isPending}>
          {isPending ? 'Saving...' : 'Save changes'}
        </Button>
      </DialogFooter>
    </form>
  );
}

function UserAvatar({ profile, large = false }: { profile: ManagedProfile; large?: boolean }) {
  return (
    <Avatar className={large ? 'h-12 w-12' : 'h-9 w-9'}>
      <AvatarImage src={profile.avatarUrl || undefined} />
      <AvatarFallback className="bg-primary-soft text-primary">
        {profile.displayName.slice(0, 2).toUpperCase()}
      </AvatarFallback>
    </Avatar>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1 rounded-xl bg-muted/55 px-4 py-3">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="break-words text-sm font-medium">{value}</p>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="space-y-1.5 text-sm">
      <span className="font-medium">{label}</span>
      {children}
    </label>
  );
}

function formatLabel(value: string) {
  return value
    .toLowerCase()
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}
