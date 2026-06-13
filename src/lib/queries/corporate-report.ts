import { notFound } from 'next/navigation';

import { prisma } from '@/lib/prisma';
import { getCurrentUserProfile } from '@/lib/session';
import { canAccessModule } from '@/lib/permissions';
import { summarizeFocus, summarizeHelp } from '@/lib/analytics';

type ReportFilters = {
  studentId?: string;
  from?: string;
  to?: string;
  module?: string;
};

const DAY_MS = 24 * 60 * 60 * 1000;

export async function getCorporateReportData(filters: ReportFilters = {}) {
  const current = await getCurrentUserProfile();
  if (!current || !canAccessModule(current.profile.role, 'corporateReport')) {
    notFound();
  }

  const range = getDateRange(filters.from, filters.to);

  if (current.profile.role === 'CORPORATE_VIEWER') {
    const memberships = await prisma.teamMembership.findMany({
      where: { profileId: current.profile.id, leftAt: null },
      select: { teamId: true },
    });
    const teamIds = memberships.map(({ teamId }) => teamId);
    const snapshots = await prisma.corporateReportSnapshot.findMany({
      where: {
        periodStart: { lte: range.end },
        periodEnd: { gte: range.start },
        ...(teamIds.length
          ? { OR: [{ teamId: null }, { teamId: { in: teamIds } }] }
          : { teamId: null }),
      },
      include: { team: { select: { name: true } } },
      orderBy: [{ periodEnd: 'desc' }, { generatedAt: 'desc' }],
      take: 12,
    });

    return {
      mode: 'aggregate' as const,
      range,
      snapshots,
    };
  }

  const students = await getAuthorizedStudents(current.profile.id, current.profile.role);
  const selectedStudent = filters.studentId
    ? students.find(({ id }) => id === filters.studentId)
    : students[0];

  if (filters.studentId && !selectedStudent) notFound();
  if (!selectedStudent) {
    return {
      mode: 'student' as const,
      range,
      students,
      report: null,
      modules: [],
      selectedModule: 'all',
    };
  }

  const selectedModule = filters.module?.trim() || 'all';
  const moduleFilter = selectedModule === 'all' ? {} : { task: { category: selectedModule } };
  const taskModuleFilter = selectedModule === 'all' ? {} : { category: selectedModule };

  const [focusSessions, tasks, badgeAwards, helpPosts, helpResponses, activity, modules] =
    await Promise.all([
      prisma.focusSession.findMany({
        where: {
          profileId: selectedStudent.id,
          status: 'COMPLETED',
          completedAt: { gte: range.start, lte: range.end },
          ...moduleFilter,
        },
        select: {
          id: true,
          activityType: true,
          actualMinutes: true,
          plannedMinutes: true,
          completedAt: true,
          task: { select: { title: true, category: true } },
        },
        orderBy: { completedAt: 'desc' },
      }),
      prisma.task.findMany({
        where: {
          assignedToProfileId: selectedStudent.id,
          ...taskModuleFilter,
          OR: [
            { createdAt: { gte: range.start, lte: range.end } },
            { completedAt: { gte: range.start, lte: range.end } },
          ],
        },
        select: {
          id: true,
          title: true,
          category: true,
          priority: true,
          status: true,
          dueAt: true,
          completedAt: true,
          createdAt: true,
          comments: {
            where: { author: { role: { in: ['MENTOR', 'ADMIN'] } } },
            select: {
              id: true,
              body: true,
              createdAt: true,
              author: { select: { displayName: true, role: true } },
            },
            orderBy: { createdAt: 'desc' },
            take: 2,
          },
        },
        orderBy: [{ completedAt: 'desc' }, { createdAt: 'desc' }],
      }),
      prisma.badgeAward.findMany({
        where: {
          profileId: selectedStudent.id,
          awardedAt: { gte: range.start, lte: range.end },
        },
        select: {
          id: true,
          reason: true,
          awardedAt: true,
          badge: { select: { name: true, description: true, iconName: true } },
        },
        orderBy: { awardedAt: 'desc' },
      }),
      prisma.helpPost.findMany({
        where: {
          authorProfileId: selectedStudent.id,
          createdAt: { gte: range.start, lte: range.end },
        },
        select: {
          id: true,
          status: true,
          createdAt: true,
          resolvedAt: true,
          responses: { select: { createdAt: true }, orderBy: { createdAt: 'asc' }, take: 1 },
        },
      }),
      prisma.helpResponse.findMany({
        where: {
          authorProfileId: selectedStudent.id,
          createdAt: { gte: range.start, lte: range.end },
        },
        select: { id: true, isAccepted: true, pointsAwarded: true, createdAt: true },
      }),
      prisma.activityEvent.aggregate({
        where: {
          profileId: selectedStudent.id,
          occurredAt: { gte: range.start, lte: range.end },
        },
        _count: { id: true },
        _sum: { points: true },
      }),
      prisma.task.findMany({
        where: { assignedToProfileId: selectedStudent.id, category: { not: null } },
        distinct: ['category'],
        select: { category: true },
        orderBy: { category: 'asc' },
      }),
    ]);

  const focusSummary = summarizeFocus(focusSessions);
  const helpSummary = summarizeHelp(helpPosts, helpResponses);
  const completedTasks = tasks.filter(({ status }) => status === 'DONE').length;
  const feedback = tasks
    .flatMap((task) => task.comments.map((comment) => ({ ...comment, taskTitle: task.title })))
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 6);

  return {
    mode: 'student' as const,
    range,
    students,
    modules: modules.flatMap(({ category }) => (category ? [category] : [])),
    selectedModule,
    report: {
      student: selectedStudent,
      overview: {
        activityEvents: activity._count.id,
        activityPoints: activity._sum.points ?? 0,
        focusMinutes: focusSummary.actualMinutes,
        completedTasks,
        badgesEarned: badgeAwards.length,
        helpPoints: helpSummary.points,
      },
      focus: {
        sessions: focusSessions,
        plannedMinutes: focusSummary.plannedMinutes,
        actualMinutes: focusSummary.actualMinutes,
        completionRate: focusSummary.completionRate,
        activeDays: focusSummary.activeDays,
      },
      tasks: {
        items: tasks,
        completed: completedTasks,
        total: tasks.length,
        completionRate: tasks.length ? Math.round((completedTasks / tasks.length) * 100) : 0,
        overdue: tasks.filter(
          ({ status, dueAt }) => status !== 'DONE' && dueAt && dueAt < range.end
        ).length,
      },
      collaboration: {
        helpPosts: helpSummary.posts,
        resolvedHelpPosts: helpSummary.resolvedPosts,
        resolutionRate: helpSummary.resolutionRate,
        responsesGiven: helpSummary.responses,
        acceptedResponses: helpSummary.acceptedResponses,
        efficiency: helpSummary.efficiency,
        averageFirstResponseMinutes: helpSummary.averageFirstResponseMinutes,
      },
      badgeAwards,
      feedback,
    },
  };
}

async function getAuthorizedStudents(profileId: string, role: string) {
  return prisma.userProfile.findMany({
    where: {
      role: 'STUDENT',
      ...(role === 'MENTOR'
        ? { studentAssignments: { some: { mentorProfileId: profileId, endsAt: null } } }
        : {}),
    },
    select: {
      id: true,
      displayName: true,
      avatarUrl: true,
      institution: true,
      department: true,
      currentStreak: true,
      memberships: {
        where: { leftAt: null },
        select: { team: { select: { name: true } } },
        take: 1,
      },
    },
    orderBy: { displayName: 'asc' },
  });
}

function getDateRange(from?: string, to?: string) {
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  const defaultStart = new Date(today.getTime() - 29 * DAY_MS);
  defaultStart.setHours(0, 0, 0, 0);
  const start = parseDate(from, false) ?? defaultStart;
  const end = parseDate(to, true) ?? today;

  if (start > end || end.getTime() - start.getTime() > 366 * DAY_MS) {
    return { start: defaultStart, end: today };
  }
  return { start, end };
}

function parseDate(value: string | undefined, endOfDay: boolean) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return null;
  date.setHours(endOfDay ? 23 : 0, endOfDay ? 59 : 0, endOfDay ? 59 : 0, endOfDay ? 999 : 0);
  return date;
}
