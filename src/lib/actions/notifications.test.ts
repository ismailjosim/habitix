import { beforeEach, describe, expect, it, vi } from 'vitest';

import { currentUserFixture } from '@/test/fixtures';

const mocks = vi.hoisted(() => ({
  getCurrentUserProfile: vi.fn(),
  updateMany: vi.fn(),
  revalidatePath: vi.fn(),
}));

vi.mock('@/lib/session', () => ({ getCurrentUserProfile: mocks.getCurrentUserProfile }));
vi.mock('@/lib/prisma', () => ({ prisma: { notification: { updateMany: mocks.updateMany } } }));
vi.mock('next/cache', () => ({ revalidatePath: mocks.revalidatePath }));

import { markAllNotificationsRead, markNotificationRead } from '@/lib/actions/notifications';

describe('notification actions', () => {
  beforeEach(() => {
    mocks.getCurrentUserProfile.mockResolvedValue(currentUserFixture());
    mocks.updateMany.mockResolvedValue({ count: 1 });
  });

  it('requires authentication', async () => {
    mocks.getCurrentUserProfile.mockResolvedValue(null);
    await expect(markNotificationRead({ notificationId: 'notification-1' })).resolves.toEqual({
      success: false,
      message: 'Unauthorized',
    });
    expect(mocks.updateMany).not.toHaveBeenCalled();
  });

  it('only marks a notification owned by the current profile', async () => {
    await markNotificationRead({ notificationId: 'notification-1' });
    expect(mocks.updateMany).toHaveBeenCalledWith({
      where: {
        id: 'notification-1',
        recipientProfileId: 'student-profile',
        readAt: null,
      },
      data: { readAt: expect.any(Date) },
    });
  });

  it('marks all unread notifications for the current profile', async () => {
    await markAllNotificationsRead();
    expect(mocks.updateMany).toHaveBeenCalledWith({
      where: { recipientProfileId: 'student-profile', readAt: null },
      data: { readAt: expect.any(Date) },
    });
  });
});
