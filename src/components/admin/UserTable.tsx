import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UserTableRow } from './UserTableRow';
import type { ManagedProfile } from './admin.types';

interface UserTableProps {
  profiles: ManagedProfile[];
  onView: (profile: ManagedProfile) => void;
  onEdit: (profile: ManagedProfile) => void;
}

export function UserTable({ profiles, onView, onEdit }: UserTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Users</CardTitle>
        <p className="text-sm text-muted-foreground">
          {profiles.length} registered user{profiles.length === 1 ? '' : 's'}
        </p>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto rounded-xl border">
          <table className="w-full min-w-190 text-left text-sm">
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
              {profiles.map((profile) => (
                <UserTableRow key={profile.id} profile={profile} onView={onView} onEdit={onEdit} />
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
