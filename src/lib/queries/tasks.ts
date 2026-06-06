import { prisma } from '@/lib/prisma';
import { getCurrentUserProfile } from '@/lib/session';

export type BoardTask = {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  type: string;
  category: string | null;
  dueAt: Date | null;
  createdAt: Date;
  assignedTo: {
    id: string;
    displayName: string;
    avatarUrl: string | null;
  } | null;
  createdBy: {
    id: string;
    displayName: string;
    avatarUrl: string | null;
  };
  subtasks: {
    id: string;
    title: string;
    isDone: boolean;
  }[];
};

export type TaskBoardData = {
  personalTasks: BoardTask[];
  assignedTasks: BoardTask[];
};

export async function getTaskBoardData(): Promise<TaskBoardData> {
  const current = await getCurrentUserProfile();

  if (!current) {
    return {
      personalTasks: [],
      assignedTasks: [],
    };
  }

  const { profile } = current;

  const tasks = await prisma.task.findMany({
    where: {
      status: { not: 'ARCHIVED' },
      OR: [
        {
          type: 'PERSONAL',
          OR: [{ createdByProfileId: profile.id }, { assignedToProfileId: profile.id }],
        },
        {
          type: { in: ['MENTOR_ASSIGNED', 'ADMIN_ASSIGNED', 'TEAM'] },
          OR: [
            { createdByProfileId: profile.id },
            { assignedToProfileId: profile.id },
            {
              team: {
                memberships: {
                  some: {
                    profileId: profile.id,
                    leftAt: null,
                  },
                },
              },
            },
          ],
        },
      ],
    },
    include: {
      createdBy: { select: { id: true, displayName: true, avatarUrl: true } },
      assignedTo: { select: { id: true, displayName: true, avatarUrl: true } },
      subtasks: {
        select: { id: true, title: true, isDone: true },
        orderBy: { position: 'asc' },
      },
    },
    orderBy: [{ dueAt: 'asc' }, { createdAt: 'desc' }],
  });

  return {
    personalTasks: tasks.filter((task) => task.type === 'PERSONAL'),
    assignedTasks: tasks.filter((task) => task.type !== 'PERSONAL'),
  };
}
