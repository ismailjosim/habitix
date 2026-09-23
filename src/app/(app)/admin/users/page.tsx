import type { Metadata } from 'next';
import { UserManagement } from '@/components/admin';
import { LAYOUT_CONSTRAINTS } from '@/lib/layout-constraints';
import { getAdminUsersData } from '@/lib/queries/admin-users';

export const metadata: Metadata = {
  title: 'User Management | Habitix',
  description: 'Manage platform roles, profile information, and active team access.',
};

export default async function AdminUsersPage() {
  const data = await getAdminUsersData();

  return (
    <div className={`${LAYOUT_CONSTRAINTS.pageMaxWidth} ${LAYOUT_CONSTRAINTS.pagePadding} mx-auto`}>
      <UserManagement data={data} />
    </div>
  );
}
