'use server';

import { prisma } from '@/lib/prisma';
import { getCurrentSession } from '@/lib/session';
import { getTeamPresence } from '@/lib/queries/presence';

export async function getDashboardData() {
  const session = await getCurrentSession();
  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  const authUserId = session.user.id;

  // Get user profile
  const userProfile = await prisma.userProfile.findUnique({
    where: { authUserId },
  });

  if (!userProfile) {
    throw new Error('User profile not found');
  }
  if (userProfile.role === 'CORPORATE_VIEWER') {
    throw new Error('Corporate viewers must use approved aggregate reports');
  }

  const profileId = userProfile.id;

  // Get today's date range
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // Fetch today's focus time (sum of actualMinutes from completed sessions)
  const todayFocusSessions = await prisma.focusSession.aggregate({
    where: {
      profileId,
      completedAt: {
        gte: today,
        lt: tomorrow,
      },
      status: 'COMPLETED',
    },
    _sum: {
      actualMinutes: true,
    },
  });

  const focusTimeToday = todayFocusSessions._sum.actualMinutes ?? 0;
  const currentStreak = userProfile.currentStreak;
  const helpPoints = userProfile.helpPoints;

  // Fetch completed tasks for today
  const completedTasksToday = await prisma.task.count({
    where: {
      assignedToProfileId: profileId,
      status: 'DONE',
      completedAt: {
        gte: today,
        lt: tomorrow,
      },
    },
  });

  // Fetch recent notifications (last 5)
  const notifications = await prisma.notification.findMany({
    where: { recipientProfileId: profileId },
    orderBy: { createdAt: 'desc' },
    take: 5,
  });

  // Fetch user's team memberships to get team and peers
  const teamMembership = await prisma.teamMembership.findFirst({
    where: { profileId, leftAt: null },
    select: { teamId: true },
  });

  const onlinePeers = teamMembership
    ? await getTeamPresence({
        teamId: teamMembership.teamId,
        viewerProfileId: profileId,
        includeViewer: false,
      })
    : [];

  // Fetch recent activity events (last 7 days for heatmap)
  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const recentActivity = await prisma.activityEvent.findMany({
    where: {
      profileId,
      occurredAt: {
        gte: sevenDaysAgo,
      },
    },
    orderBy: { occurredAt: 'desc' },
  });

  return {
    stats: {
      focusTimeToday,
      currentStreak,
      completedTasksToday,
      helpPoints,
    },
    notifications,
    onlinePeers,
    recentActivity,
  };
}
