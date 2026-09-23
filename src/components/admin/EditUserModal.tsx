import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { adminRoles, teamRoles, type AdminUsersData, type ManagedProfile } from './admin.types';

interface EditUserModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile: ManagedProfile | null;
  teams: AdminUsersData['teams'];
  isPending: boolean;
  onUpdateUser: (formData: FormData) => void;
}

const selectClassName = 'h-9 w-full rounded-md border bg-background px-3 text-sm';

export function EditUserModal({
  open,
  onOpenChange,
  profile,
  teams,
  isPending,
  onUpdateUser,
}: EditUserModalProps) {
  if (!profile) return null;
  const membership = profile.memberships[0];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
        <form key={profile.id} action={onUpdateUser} className="space-y-5">
          <DialogHeader>
            <DialogTitle>Update user</DialogTitle>
            <DialogDescription>
              Edit profile fields, platform role, and team access.
            </DialogDescription>
          </DialogHeader>

          <input type="hidden" name="profileId" value={profile.id} />

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Display name">
              <Input name="displayName" defaultValue={profile.displayName} required />
            </Field>

            <Field label="Platform role">
              <select name="role" defaultValue={profile.role} className={selectClassName}>
                {adminRoles.map((role) => (
                  <option key={role}>{role}</option>
                ))}
              </select>
            </Field>

            <Field label="Active team">
              <select
                name="teamId"
                defaultValue={membership?.teamId ?? ''}
                className={selectClassName}
              >
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
      </DialogContent>
    </Dialog>
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
