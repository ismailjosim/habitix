import { describe, expect, it } from 'vitest';

import {
  aggregateLeaderboardMetrics,
  buildDailyAnalytics,
  calculateCurrentStreak,
  parseCustomDateRange,
  percentChange,
  summarizeFocus,
  summarizeHelp,
} from '@/lib/analytics';

describe('analytics helpers', () => {
  it('summarizes focus and help credit from source rows', () => {
    const focus = summarizeFocus([
      { actualMinutes: 30, plannedMinutes: 25, completedAt: new Date(2026, 5, 10) },
      { actualMinutes: 20, plannedMinutes: 25, completedAt: new Date(2026, 5, 10) },
    ]);
    const help = summarizeHelp(
      [
        {
          status: 'RESOLVED',
          createdAt: new Date('2026-06-10T10:00:00Z'),
          resolvedAt: new Date('2026-06-10T10:30:00Z'),
          responses: [{ createdAt: new Date('2026-06-10T10:10:00Z') }],
        },
      ],
      [{ pointsAwarded: 2, isAccepted: true }]
    );

    expect(focus).toMatchObject({ sessions: 2, actualMinutes: 50, activeDays: 1, completionRate: 100 });
    expect(help).toMatchObject({
      resolvedPosts: 1,
      resolutionRate: 100,
      efficiency: 100,
      points: 2,
      creditMinutes: 20,
      averageFirstResponseMinutes: 10,
    });
  });

  it('builds zero-filled daily totals and calculates streaks', () => {
    const range = {
      start: new Date(2026, 5, 10, 0, 0, 0),
      end: new Date(2026, 5, 12, 23, 59, 59),
    };
    const daily = buildDailyAnalytics(
      range,
      [{ actualMinutes: 25, plannedMinutes: 25, completedAt: new Date(2026, 5, 11, 12) }],
      [{ pointsAwarded: 2, isAccepted: true, updatedAt: new Date(2026, 5, 11, 13) }]
    );

    expect(daily).toHaveLength(3);
    expect(daily[1]).toMatchObject({ focusMinutes: 25, helpCreditMinutes: 20, totalMinutes: 45 });
    expect(
      calculateCurrentStreak(new Set(['2026-06-10', '2026-06-11', '2026-06-12']), new Date(2026, 5, 12))
    ).toBe(3);
  });

  it('ranks leaderboard source metrics with stable profile ids', () => {
    const [row] = aggregateLeaderboardMetrics(
      [
        {
          profileId: 'profile-1',
          displayName: 'Student',
          avatarUrl: null,
          focusSessions: [{ actualMinutes: 45, completedAt: new Date('2026-06-12T10:00:00Z') }],
          helpResponses: [
            {
              pointsAwarded: 2,
              isAccepted: true,
              updatedAt: new Date('2026-06-12T11:00:00Z'),
            },
          ],
        },
      ],
      new Date('2026-06-10T00:00:00Z')
    );

    expect(row).toMatchObject({ profileId: 'profile-1', focusMinutes: 45, helpPoints: 2, resolutions: 1 });
  });

  it('handles comparison and invalid custom ranges', () => {
    expect(percentChange(10, 0)).toBe(100);
    expect(percentChange(0, 0)).toBe(0);
    const range = parseCustomDateRange('2026-07-01', '2026-06-01', 30);
    expect(range.start.getTime()).toBeLessThan(range.end.getTime());
  });
});
