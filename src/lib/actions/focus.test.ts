import { beforeEach, describe, expect, it, vi } from 'vitest';

import { currentUserFixture } from '@/test/fixtures';

const mocks = vi.hoisted(() => ({
  getCurrentUserProfile: vi.fn(),
  findFirst: vi.fn(),
  transaction: vi.fn(),
  awardEligibleBadges: vi.fn(),
  touchPresence: vi.fn(),
}));

vi.mock('@/lib/session', () => ({ getCurrentUserProfile: mocks.getCurrentUserProfile }));
vi.mock('@/lib/badges', () => ({ awardEligibleBadges: mocks.awardEligibleBadges }));
vi.mock('@/lib/presence', () => ({ touchPresence: mocks.touchPresence }));
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));
vi.mock('@/lib/prisma', () => ({
  prisma: {
    focusSession: { findFirst: mocks.findFirst },
    $transaction: mocks.transaction,
  },
}));

import { completeFocusSession } from '@/lib/actions/focus';

describe('focus session completion', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-06-13T12:00:00Z'));
    mocks.getCurrentUserProfile.mockResolvedValue(currentUserFixture());
    mocks.findFirst.mockResolvedValue({
      id: 'focus-1',
      profileId: 'student-profile',
      taskId: null,
      teamId: null,
      status: 'ACTIVE',
      plannedMinutes: 25,
      notes: JSON.stringify({
        elapsedSeconds: 600,
        lastStartedAt: '2026-06-13T11:50:00.000Z',
        activityLabel: 'Coding',
      }),
      startedAt: new Date('2026-06-13T11:50:00Z'),
      updatedAt: new Date('2026-06-13T11:50:00Z'),
      task: null,
    });
  });

  it('records completion and updates activity totals atomically', async () => {
    const tx = {
      focusSession: {
        count: vi.fn().mockResolvedValue(0),
        update: vi
          .fn()
          .mockResolvedValue({ id: 'focus-1', status: 'COMPLETED', actualMinutes: 25 }),
      },
      userProfile: { update: vi.fn().mockResolvedValue({}) },
      activityEvent: { create: vi.fn().mockResolvedValue({}) },
      taskActivity: { create: vi.fn() },
    };
    mocks.transaction.mockImplementation((callback) => callback(tx));

    const result = await completeFocusSession({ sessionId: 'focus-1' });

    expect(result.success).toBe(true);
    expect(tx.focusSession.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'focus-1' },
        data: expect.objectContaining({ status: 'COMPLETED', actualMinutes: 25 }),
      })
    );
    expect(tx.userProfile.update).toHaveBeenCalledWith({
      where: { id: 'student-profile' },
      data: {
        totalFocusMinutes: { increment: 25 },
        currentStreak: { increment: 1 },
      },
    });
    expect(tx.activityEvent.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        profileId: 'student-profile',
        sourceId: 'focus-1',
        points: 25,
      }),
    });
  });
});
