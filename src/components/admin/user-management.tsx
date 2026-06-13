'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

import { createManagedTeam, updateManagedUser } from '@/lib/actions/admin-users';
import type { getAdminUsersData } from '@/lib/queries/admin-users';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

type AdminUsersData = Awaited<ReturnType<typeof getAdminUsersData>>;

const roles = ['STUDENT', 'MENTOR', 'ADMIN', 'MODERATOR', 'CORPORATE_VIEWER'] as const;
const teamRoles = ['MEMBER', 'LEAD', 'MENTOR', 'ADMIN', 'VIEWER'] as const;

export function UserManagement({ data }: { data: AdminUsersData }) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
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
      if (result.success) router.refresh();
    });
  }

  return (
    <div className="space-y-6">
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

      <div className="space-y-4">
        {data.profiles.map((profile) => {
          const membership = profile.memberships[0];
          return (
            <Card key={profile.id}>
              <CardContent className="p-5">
                <form action={updateUser} className="space-y-4">
                  <input type="hidden" name="profileId" value={profile.id} />
                  <div>
                    <p className="font-semibold">{profile.authUser.email}</p>
                    <p className="text-xs text-muted-foreground">
                      Current team: {membership?.team.name ?? 'None'}
                    </p>
                  </div>
                  <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                    <Field label="Display name">
                      <Input name="displayName" defaultValue={profile.displayName} required />
                    </Field>
                    <Field label="Platform role">
                      <select
                        name="role"
                        defaultValue={profile.role}
                        className="h-9 w-full rounded-md border bg-background px-3 text-sm"
                      >
                        {roles.map((role) => (
                          <option key={role}>{role}</option>
                        ))}
                      </select>
                    </Field>
                    <Field label="Active team">
                      <select
                        name="teamId"
                        defaultValue={membership?.teamId ?? ''}
                        className="h-9 w-full rounded-md border bg-background px-3 text-sm"
                      >
                        <option value="">No active team</option>
                        {data.teams.map((team) => (
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
                        className="h-9 w-full rounded-md border bg-background px-3 text-sm"
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
                  <Button type="submit" disabled={isPending}>
                    Save user
                  </Button>
                </form>
              </CardContent>
            </Card>
          );
        })}
      </div>
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
