import { prisma } from '@/lib/prisma';
import { getCurrentSession } from '@/lib/session';
import { notFound } from 'next/navigation';

export interface TeamTask {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  type: string;
  dueAt: Date | null;
  createdBy: {
    displayName: string;
    id: string;
  };
  assignedTo: {
    displayName: string;
    id: string;
  } | null;
}

export async function getTeamTasks(teamId: string): Promise<TeamTask[]> {
  const session = await getCurrentSession();
  if (!session) {
    notFound();
  }

  const profile = await prisma.userProfile.findUnique({
    where: { authUserId: session.user.id },
  });

  if (!profile) {
    notFound();
  }

  // Get team-assigned tasks (where team is set)
  const teamTasks = await prisma.task.findMany({
    where: {
      teamId,
      type: 'MENTOR_ASSIGNED',
      status: { not: 'ARCHIVED' },
    },
    include: {
      createdBy: {
        select: { displayName: true, id: true },
      },
      assignedTo: {
        select: { displayName: true, id: true },
      },
    },
    orderBy: [{ dueAt: 'asc' }, { createdAt: 'desc' }],
    take: 10,
  });

  // Get tasks assigned directly to user from the team
  const userTasks = await prisma.task.findMany({
    where: {
      assignedToProfileId: profile.id,
      teamId,
      status: { not: 'ARCHIVED' },
    },
    include: {
      createdBy: {
        select: { displayName: true, id: true },
      },
      assignedTo: {
        select: { displayName: true, id: true },
      },
    },
    orderBy: [{ dueAt: 'asc' }, { createdAt: 'desc' }],
  });

  // Combine and deduplicate
  const taskMap = new Map<string, TeamTask>();

  [...teamTasks, ...userTasks].forEach((task) => {
    if (!taskMap.has(task.id)) {
      taskMap.set(task.id, {
        id: task.id,
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        type: task.type,
        dueAt: task.dueAt,
        createdBy: task.createdBy,
        assignedTo: task.assignedTo,
      });
    }
  });

  return Array.from(taskMap.values()).slice(0, 10);
}
