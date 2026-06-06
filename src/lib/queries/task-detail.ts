import { notFound } from 'next/navigation';

import { prisma } from '@/lib/prisma';
import { getCurrentUserProfile } from '@/lib/session';

export type TaskDetail = NonNullable<Awaited<ReturnType<typeof getTaskDetail>>>;

export async function getTaskDetail(taskId: string) {
  const current = await getCurrentUserProfile();

  if (!current) {
    notFound();
  }

  const { profile } = current;

  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: {
      createdBy: {
        select: { id: true, displayName: true, avatarUrl: true, role: true },
      },
      assignedTo: {
        select: { id: true, displayName: true, avatarUrl: true, role: true },
      },
      team: {
        include: {
          memberships: {
            where: { leftAt: null },
            include: {
              profile: {
                select: { id: true, displayName: true, avatarUrl: true, role: true },
              },
            },
            orderBy: { joinedAt: 'asc' },
          },
        },
      },
      subtasks: {
        orderBy: { position: 'asc' },
      },
      comments: {
        include: {
          author: {
            select: { id: true, displayName: true, avatarUrl: true, role: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      },
      activities: {
        include: {
          actor: {
            select: { id: true, displayName: true, avatarUrl: true, role: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      },
      focusSessions: {
        where: {
          status: 'COMPLETED',
        },
        select: {
          id: true,
          actualMinutes: true,
          plannedMinutes: true,
          startedAt: true,
        },
        orderBy: { startedAt: 'desc' },
      },
    },
  });

  if (!task) {
    notFound();
  }

  const isPlatformAdmin = profile.role === 'ADMIN' || profile.role === 'MODERATOR';
  const isDirectUser =
    task.createdByProfileId === profile.id || task.assignedToProfileId === profile.id;
  const isTeamMember = Boolean(
    task.team?.memberships.some((membership) => membership.profileId === profile.id),
  );

  if (!isDirectUser && !isTeamMember && !isPlatformAdmin) {
    notFound();
  }

  const focusMinutes = task.focusSessions.reduce(
    (total, session) => total + (session.actualMinutes ?? session.plannedMinutes),
    0,
  );

  const assignedMembers = [
    task.assignedTo,
    ...(task.team?.memberships.map((membership) => membership.profile) ?? []),
  ]
    .filter((member): member is NonNullable<typeof member> => Boolean(member))
    .filter(
      (member, index, members) =>
        members.findIndex((candidate) => candidate.id === member.id) === index,
    );

  return {
    ...task,
    focusMinutes,
    assignedMembers,
    currentProfileId: profile.id,
  };
}
