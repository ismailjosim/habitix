import { prisma } from '@/lib/prisma';
import { getTeamPresence } from '@/lib/queries/presence';
import { getCurrentUserProfile } from '@/lib/session';
import {
  buildDailyAnalytics,
  calculateCurrentStreak,
  dateKey,
  percentChange,
  previousRange,
  rollingRange,
  summarizeFocus,
  summarizeHelp,
} from '@/lib/analytics';

export async function getDashboardData() {
  const current = await getCurrentUserProfile();
  if (!current) throw new Error('Unauthorized');
  if (current.profile.role === 'CORPORATE_VIEWER') {
    throw new Error('Corporate viewers must use approved aggregate reports');
  }

  const profileId = current.profile.id;
  const range = rollingRange(7);
  const previous = previousRange(range);
  const queryStart = previous.start;

  const [focusRows, helpResponses, tasks, notifications, membership] = await Promise.all([
    prisma.focusSession.findMany({
      where: { profileId, status: 'COMPLETED', completedAt: { gte: queryStart, lte: range.end } },
      select: { actualMinutes: true, plannedMinutes: true, completedAt: true },
    }),
    prisma.helpResponse.findMany({
      where: { authorProfileId: profileId, updatedAt: { gte: queryStart, lte: range.end } },
      select: { pointsAwarded: true, isAccepted: true, updatedAt: true },
    }),
    prisma.task.findMany({
      where: {
        assignedToProfileId: profileId,
        status: 'DONE',
        completedAt: { gte: queryStart, lte: range.end },
      },
      select: { completedAt: true },
    }),
    prisma.notification.findMany({
      where: { recipientProfileId: profileId },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
    prisma.teamMembership.findFirst({
      where: { profileId, leftAt: null },
      select: { teamId: true },
    }),
  ]);

  const currentFocusRows = focusRows.filter(
    ({ completedAt }) => completedAt && completedAt >= range.start
  );
  const previousFocusRows = focusRows.filter(
    ({ completedAt }) => completedAt && completedAt < range.start
  );
  const currentHelpRows = helpResponses.filter(({ updatedAt }) => updatedAt >= range.start);
  const previousHelpRows = helpResponses.filter(({ updatedAt }) => updatedAt < range.start);
  const currentTasks = tasks.filter(({ completedAt }) => completedAt && completedAt >= range.start);
  const previousTasks = tasks.filter(({ completedAt }) => completedAt && completedAt < range.start);
  const currentFocus = summarizeFocus(currentFocusRows);
  const previousFocus = summarizeFocus(previousFocusRows);
  const currentHelp = summarizeHelp([], currentHelpRows);
  const previousHelp = summarizeHelp([], previousHelpRows);

  const streakStart = rollingRange(365).start;
  const streakRows = await prisma.focusSession.findMany({
    where: { profileId, status: 'COMPLETED', completedAt: { gte: streakStart } },
    select: { completedAt: true },
  });
  const onlinePeers = membership
    ? await getTeamPresence({
        teamId: membership.teamId,
        viewerProfileId: profileId,
        includeViewer: false,
      })
    : [];

  return {
    range,
    stats: {
      focusMinutes: currentFocus.actualMinutes,
      focusSessions: currentFocus.sessions,
      currentStreak: calculateCurrentStreak(
        new Set(
          streakRows.flatMap(({ completedAt }) => (completedAt ? [dateKey(completedAt)] : []))
        )
      ),
      completedTasks: currentTasks.length,
      helpPoints: currentHelp.points,
      helpEfficiency: currentHelp.efficiency,
      trends: {
        focus: percentChange(currentFocus.actualMinutes, previousFocus.actualMinutes),
        tasks: percentChange(currentTasks.length, previousTasks.length),
        help: percentChange(currentHelp.points, previousHelp.points),
      },
    },
    daily: buildDailyAnalytics(range, currentFocusRows, currentHelpRows),
    notifications,
    onlinePeers,
  };
}
