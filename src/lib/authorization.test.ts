import { beforeEach, describe, expect, it, vi } from 'vitest';

import { currentUserFixture } from '@/test/fixtures';

const mocks = vi.hoisted(() => ({
  getCurrentUserProfile: vi.fn(),
  notFound: vi.fn(() => {
    throw new Error('NEXT_NOT_FOUND');
  }),
}));

vi.mock('@/lib/session', () => ({ getCurrentUserProfile: mocks.getCurrentUserProfile }));
vi.mock('next/navigation', () => ({ notFound: mocks.notFound }));

import { requireModuleAccess } from '@/lib/authorization';

describe('protected module authorization', () => {
  beforeEach(() => {
    mocks.getCurrentUserProfile.mockResolvedValue(currentUserFixture());
  });

  it('rejects unauthenticated requests', async () => {
    mocks.getCurrentUserProfile.mockResolvedValue(null);
    await expect(requireModuleAccess('activity')).rejects.toThrow('NEXT_NOT_FOUND');
  });

  it('rejects authenticated roles without module permission', async () => {
    mocks.getCurrentUserProfile.mockResolvedValue(currentUserFixture('CORPORATE_VIEWER'));
    await expect(requireModuleAccess('activity')).rejects.toThrow('NEXT_NOT_FOUND');
  });

  it('returns an authorized session and profile', async () => {
    await expect(requireModuleAccess('activity')).resolves.toMatchObject({
      profile: { id: 'student-profile', role: 'STUDENT' },
    });
  });
});
