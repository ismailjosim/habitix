import { notFound } from 'next/navigation';

import { prisma } from '@/lib/prisma';
import { requireModuleAccess } from '@/lib/authorization';
import { canManageTask, canViewTask } from '@/lib/permissions';

export type TaskDetail = NonNullable<Awaited<ReturnType<typeof getTaskDetail>>>;

export async function getTaskDetail(taskId: string) {
  const current = await requireModuleAccess('tasks');

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

  const isTeamMember = Boolean(
    task.team?.memberships.some((membership) => membership.profileId === profile.id)
  );
  const currentMembership = task.team?.memberships.find(
    (membership) => membership.profileId === profile.id
  );

  if (
    !canViewTask({
      role: profile.role,
      profileId: profile.id,
      createdByProfileId: task.createdByProfileId,
      assignedToProfileId: task.assignedToProfileId,
      isActiveTeamMember: isTeamMember,
    })
  ) {
    notFound();
  }

  const focusMinutes = task.focusSessions.reduce(
    (total, session) => total + (session.actualMinutes ?? session.plannedMinutes),
    0
  );

  const assignedMembers = [
    task.assignedTo,
    ...(task.team?.memberships.map((membership) => membership.profile) ?? []),
  ]
    .filter((member): member is NonNullable<typeof member> => Boolean(member))
    .filter(
      (member, index, members) =>
        members.findIndex((candidate) => candidate.id === member.id) === index
    );

  return {
    ...task,
    focusMinutes,
    assignedMembers,
    currentProfileId: profile.id,
    canManage: canManageTask({
      role: profile.role,
      profileId: profile.id,
      createdByProfileId: task.createdByProfileId,
      assignedToProfileId: task.assignedToProfileId,
      teamRole: currentMembership?.role,
    }),
  };
}
