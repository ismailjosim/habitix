'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { createManagedTeam, updateManagedUser } from '@/lib/actions/admin-users';
import { CreateTeamCard } from './CreateTeamCard';
import { UserTable } from './UserTable';
import { UserDetailsModal } from './UserDetailsModal';
import { EditUserModal } from './EditUserModal';
import type {
  adminRoles,
  AdminUsersData,
  DialogMode,
  ManagedProfile,
  teamRoles,
} from './admin.types';

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
        role: String(formData.get('role') ?? 'STUDENT') as (typeof adminRoles)[number],
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

  function handleView(profile: ManagedProfile) {
    setSelectedProfile(profile);
    setDialogMode('view');
  }

  function handleEdit(profile: ManagedProfile) {
    setSelectedProfile(profile);
    setDialogMode('edit');
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

      <CreateTeamCard onCreateTeam={createTeam} isPending={isPending} />

      <UserTable profiles={data.profiles} onView={handleView} onEdit={handleEdit} />

      <UserDetailsModal
        open={dialogMode === 'view'}
        onOpenChange={(open) => !open && setDialogMode(null)}
        profile={selectedProfile}
      />

      <EditUserModal
        open={dialogMode === 'edit'}
        onOpenChange={(open) => !open && setDialogMode(null)}
        profile={selectedProfile}
        teams={data.teams}
        isPending={isPending}
        onUpdateUser={updateUser}
      />
    </div>
  );
}
