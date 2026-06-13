import { beforeEach, describe, expect, it, vi } from 'vitest';

import { currentUserFixture } from '@/test/fixtures';

const mocks = vi.hoisted(() => ({
  getCurrentUserProfile: vi.fn(),
  postFindUnique: vi.fn(),
  membershipFindFirst: vi.fn(),
  transaction: vi.fn(),
  awardEligibleBadges: vi.fn(),
}));

vi.mock('@/lib/session', () => ({ getCurrentUserProfile: mocks.getCurrentUserProfile }));
vi.mock('@/lib/badges', () => ({ awardEligibleBadges: mocks.awardEligibleBadges }));
vi.mock('@/lib/queries/help-desk', () => ({ MAX_PEER_HELPERS: 3 }));
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));
vi.mock('@/lib/prisma', () => ({
  prisma: {
    helpPost: { findUnique: mocks.postFindUnique },
    teamMembership: { findFirst: mocks.membershipFindFirst },
    $transaction: mocks.transaction,
  },
}));

import { resolveHelpPost } from '@/lib/actions/help-desk';

describe('help awards', () => {
  beforeEach(() => {
    mocks.getCurrentUserProfile.mockResolvedValue(currentUserFixture());
    mocks.membershipFindFirst.mockResolvedValue({ role: 'MEMBER' });
    mocks.postFindUnique.mockResolvedValue({
      id: 'post-1',
      teamId: 'team-1',
      authorProfileId: 'student-profile',
      title: 'Need help',
      status: 'ANSWERED',
      responses: [
        {
          id: 'response-1',
          authorProfileId: 'helper-profile',
          pointsAwarded: 0,
        },
      ],
    });
  });

  it('claims resolution before awarding points once', async () => {
    const tx = {
      helpPost: { updateMany: vi.fn().mockResolvedValue({ count: 1 }) },
      helpResponse: { update: vi.fn().mockResolvedValue({}) },
      userProfile: { update: vi.fn().mockResolvedValue({}) },
      activityEvent: { create: vi.fn().mockResolvedValue({}) },
      notification: { create: vi.fn().mockResolvedValue({}) },
    };
    mocks.transaction.mockImplementation((callback) => callback(tx));

    const result = await resolveHelpPost({ postId: 'post-1', responseId: 'response-1' });

    expect(result).toEqual({ success: true, message: 'Resolved and contributor awarded' });
    expect(tx.helpPost.updateMany).toHaveBeenCalledWith({
      where: { id: 'post-1', status: { not: 'RESOLVED' }, awardedResponseId: null },
      data: {
        status: 'RESOLVED',
        resolvedAt: expect.any(Date),
        awardedResponseId: 'response-1',
      },
    });
    expect(tx.userProfile.update).toHaveBeenCalledWith({
      where: { id: 'helper-profile' },
      data: { helpPoints: { increment: 2 } },
    });
    expect(tx.activityEvent.create).toHaveBeenCalledTimes(1);
  });

  it('does not award when another request already claimed resolution', async () => {
    const tx = {
      helpPost: { updateMany: vi.fn().mockResolvedValue({ count: 0 }) },
      helpResponse: { update: vi.fn() },
      userProfile: { update: vi.fn() },
      activityEvent: { create: vi.fn() },
      notification: { create: vi.fn() },
    };
    mocks.transaction.mockImplementation((callback) => callback(tx));

    const result = await resolveHelpPost({ postId: 'post-1', responseId: 'response-1' });

    expect(result).toEqual({
      success: false,
      message: 'This help request was already resolved or awarded',
    });
    expect(tx.userProfile.update).not.toHaveBeenCalled();
  });
});
