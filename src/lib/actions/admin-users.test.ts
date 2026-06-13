import { beforeEach, describe, expect, it, vi } from 'vitest';

import { currentUserFixture } from '@/test/fixtures';

const mocks = vi.hoisted(() => ({
  requireModuleAccess: vi.fn(),
  transaction: vi.fn(),
  count: vi.fn(),
  revalidatePath: vi.fn(),
}));

vi.mock('@/lib/authorization', () => ({ requireModuleAccess: mocks.requireModuleAccess }));
vi.mock('next/cache', () => ({ revalidatePath: mocks.revalidatePath }));
vi.mock('@/lib/prisma', () => ({
  prisma: {
    userProfile: { count: mocks.count },
    $transaction: mocks.transaction,
    team: { create: vi.fn() },
  },
}));

import { updateManagedUser } from '@/lib/actions/admin-users';

describe('admin user management', () => {
  beforeEach(() => {
    mocks.requireModuleAccess.mockResolvedValue(currentUserFixture('ADMIN'));
  });

  it('updates profile access and activates the selected team membership', async () => {
    const tx = {
      userProfile: { update: vi.fn().mockResolvedValue({}) },
      teamMembership: {
        updateMany: vi.fn().mockResolvedValue({ count: 0 }),
        upsert: vi.fn().mockResolvedValue({}),
      },
    };
    mocks.transaction.mockImplementation((callback) => callback(tx));

    const result = await updateManagedUser({
      profileId: 'student-profile',
      displayName: 'Student',
      role: 'STUDENT',
      institution: 'Habitix Academy',
      department: 'Engineering',
      teamId: 'team-1',
      teamRole: 'MEMBER',
    });

    expect(result.success).toBe(true);
    expect(tx.teamMembership.upsert).toHaveBeenCalledWith({
      where: { teamId_profileId: { teamId: 'team-1', profileId: 'student-profile' } },
      update: { role: 'MEMBER', leftAt: null },
      create: { teamId: 'team-1', profileId: 'student-profile', role: 'MEMBER' },
    });
  });

  it('does not allow the final admin to demote themselves', async () => {
    mocks.count.mockResolvedValue(1);
    const result = await updateManagedUser({
      profileId: 'admin-profile',
      displayName: 'Admin',
      role: 'STUDENT',
      teamRole: 'MEMBER',
    });

    expect(result).toEqual({
      success: false,
      message: 'The last admin cannot remove their own admin role',
    });
    expect(mocks.transaction).not.toHaveBeenCalled();
  });
});
