import { prisma } from '@/lib/prisma';
import { getCurrentUserProfile } from '@/lib/session';

type Period = 'weekly' | 'monthly';

export type LeaderboardRow = {
  profileId: string;
  displayName: string;
  avatarUrl: string | null;
  rank: number;
  focusMinutes: number;
  helpPoints: number;
  resolutions: number;
  isCurrentUser: boolean;
};

export type LeaderboardPeriodData = {
  label: string;
  performers: LeaderboardRow[];
  contributors: LeaderboardRow[];
  currentUserPerformerRank: number | null;
  currentUserContributorRank: number | null;
};

export type LeaderboardData = {
  teamName: string | null;
  currentProfileId: string | null;
  weekly: LeaderboardPeriodData;
  monthly: LeaderboardPeriodData;
};

export async function getLeaderboardData(): Promise<LeaderboardData> {
  const current = await getCurrentUserProfile();
  if (!current) return emptyData();

  const membership = await prisma.teamMembership.findFirst({
    where: { profileId: current.profile.id, leftAt: null },
    select: { teamId: true, team: { select: { name: true } } },
  });
  if (!membership) return { ...emptyData(), currentProfileId: current.profile.id };

  const now = new Date();
  const weekStart = startOfWeek(now);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const queryStart = weekStart < monthStart ? weekStart : monthStart;
  const members = await prisma.teamMembership.findMany({
    where: { teamId: membership.teamId, leftAt: null },
    select: {
      profile: {
        select: {
          id: true,
          displayName: true,
          avatarUrl: true,
          focusSessions: {
            where: { status: 'COMPLETED', completedAt: { gte: queryStart } },
            select: { actualMinutes: true, completedAt: true },
          },
          helpResponses: {
            where: { pointsAwarded: { gt: 0 }, updatedAt: { gte: queryStart } },
            select: { pointsAwarded: true, updatedAt: true, isAccepted: true },
          },
        },
      },
    },
  });

  const baseRows = members.map(({ profile }) => ({
    profileId: profile.id,
    displayName: profile.displayName,
    avatarUrl: profile.avatarUrl,
    focusSessions: profile.focusSessions,
    helpResponses: profile.helpResponses,
  }));

  return {
    teamName: membership.team.name,
    currentProfileId: current.profile.id,
    weekly: buildPeriod(baseRows, current.profile.id, weekStart, 'weekly'),
    monthly: buildPeriod(baseRows, current.profile.id, monthStart, 'monthly'),
  };
}

function buildPeriod(
  rows: Array<{
    profileId: string;
    displayName: string;
    avatarUrl: string | null;
    focusSessions: { actualMinutes: number | null; completedAt: Date | null }[];
    helpResponses: { pointsAwarded: number; updatedAt: Date; isAccepted: boolean }[];
  }>,
  currentProfileId: string,
  periodStart: Date,
  period: Period
): LeaderboardPeriodData {
  const totals = rows.map((row) => ({
    profileId: row.profileId,
    displayName: row.displayName,
    avatarUrl: row.avatarUrl,
    focusMinutes: row.focusSessions
      .filter((session) => session.completedAt && session.completedAt >= periodStart)
      .reduce((total, session) => total + (session.actualMinutes ?? 0), 0),
    helpPoints: row.helpResponses
      .filter((response) => response.updatedAt >= periodStart)
      .reduce((total, response) => total + response.pointsAwarded, 0),
    resolutions: row.helpResponses.filter(
      (response) => response.updatedAt >= periodStart && response.isAccepted
    ).length,
    isCurrentUser: row.profileId === currentProfileId,
  }));

  const performers = rankRows(totals, (a, b) => b.focusMinutes - a.focusMinutes);
  const contributors = rankRows(
    totals,
    (a, b) => b.helpPoints - a.helpPoints || b.resolutions - a.resolutions
  );

  return {
    label: period === 'weekly' ? 'This week' : 'This month',
    performers,
    contributors,
    currentUserPerformerRank: performers.find((row) => row.isCurrentUser)?.rank ?? null,
    currentUserContributorRank: contributors.find((row) => row.isCurrentUser)?.rank ?? null,
  };
}

function rankRows(
  rows: Omit<LeaderboardRow, 'rank'>[],
  compareMetric: (a: Omit<LeaderboardRow, 'rank'>, b: Omit<LeaderboardRow, 'rank'>) => number
) {
  return [...rows]
    .sort(
      (a, b) =>
        compareMetric(a, b) ||
        a.displayName.localeCompare(b.displayName) ||
        a.profileId.localeCompare(b.profileId)
    )
    .map((row, index) => ({ ...row, rank: index + 1 }));
}

function startOfWeek(date: Date) {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const day = start.getDay();
  start.setDate(start.getDate() - (day === 0 ? 6 : day - 1));
  return start;
}

function emptyPeriod(label: string): LeaderboardPeriodData {
  return {
    label,
    performers: [],
    contributors: [],
    currentUserPerformerRank: null,
    currentUserContributorRank: null,
  };
}

function emptyData(): LeaderboardData {
  return {
    teamName: null,
    currentProfileId: null,
    weekly: emptyPeriod('This week'),
    monthly: emptyPeriod('This month'),
  };
}
