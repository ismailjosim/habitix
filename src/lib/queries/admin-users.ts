import { requireModuleAccess } from '@/lib/authorization';
import { prisma } from '@/lib/prisma';

export async function getAdminUsersData() {
  await requireModuleAccess('admin');

  const [profiles, teams] = await Promise.all([
    prisma.userProfile.findMany({
      select: {
        id: true,
        displayName: true,
        role: true,
        institution: true,
        department: true,
        authUser: { select: { email: true } },
        memberships: {
          where: { leftAt: null },
          select: { teamId: true, role: true, team: { select: { name: true } } },
          take: 1,
        },
      },
      orderBy: { displayName: 'asc' },
    }),
    prisma.team.findMany({
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    }),
  ]);

  return { profiles, teams };
}
