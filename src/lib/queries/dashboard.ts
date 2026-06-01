'use server';

import { prisma } from '@/lib/prisma';
import { getCurrentSession } from '@/lib/session';

export async function getDashboardData() {
  const session = await getCurrentSession();
  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  const userId = session.user.id;

  // Get today's date range
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // Fetch today's focus time
  const todayFocusSessions = await prisma.focusSession.aggregate({
    where: {
      userId,
      createdAt: {
        gte: today,
        lt: tomorrow,
      },
      status: 'COMPLETED',
    },
    _sum: {
      duration: true,
    },
  });

  // Fetch current streak (consecutive days with focus)
  const userProfile = await prisma.userProfile.findUnique({
    where: { userId },
  });

  const currentStreak = userProfile?.currentStreak ?? 0;

  // Fetch completed tasks for today
  const completedTasksToday = await prisma.task.count({
    where: {
      assignedToId: userId,
      status: 'DONE',
      updatedAt: {
        gte: today,
        lt: tomorrow,
      },
    },
  });

  // Fetch help points (earned from answering help posts)
  const helpPoints = userProfile?.helpPoints ?? 0;

  // Fetch recent notifications (last 5)
  const notifications = await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 5,
  });

  // Fetch user's team and currently online peers
  const userTeam = await prisma.teamMembership.findFirst({
    where: { userId },
    include: {
      team: {
        include: {
          members: {
            include: {
              user: {
                include: {
                  profile: true,
                },
              },
            },
          },
        },
      },
    },
  });

  const onlinePeers = userTeam?.team?.members?.filter((member) => member.userId !== userId) ?? [];

  // Fetch recent activity events (last 7 days for heatmap)
  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const recentActivity = await prisma.activityEvent.findMany({
    where: {
      userId,
      createdAt: {
        gte: sevenDaysAgo,
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return {
    stats: {
      focusTimeToday: todayFocusSessions._sum.duration ?? 0,
      currentStreak,
      completedTasksToday,
      helpPoints,
    },
    notifications,
    onlinePeers,
    recentActivity,
  };
}
