import { UserManagement } from '@/components/admin/user-management';
import { LAYOUT_CONSTRAINTS } from '@/lib/layout-constraints';
import { getAdminUsersData } from '@/lib/queries/admin-users';

export default async function AdminUsersPage() {
  const data = await getAdminUsersData();

  return (
    <div className={`${LAYOUT_CONSTRAINTS.pageMaxWidth} ${LAYOUT_CONSTRAINTS.pagePadding} mx-auto`}>
      <UserManagement data={data} />
    </div>
  );
}
