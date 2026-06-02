import { prisma } from '@/lib/prisma';
import { getCurrentUserProfile } from '@/lib/session';

export type FocusTaskOption = {
  id: string;
  title: string;
  type: string;
  status: string;
};

export type FocusModeData = {
  tasks: FocusTaskOption[];
};

export async function getFocusModeData(): Promise<FocusModeData> {
  const current = await getCurrentUserProfile();

  if (!current) {
    return { tasks: [] };
  }

  const { profile } = current;

  const tasks = await prisma.task.findMany({
    where: {
      status: { notIn: ['DONE', 'ARCHIVED'] },
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
    select: {
      id: true,
      title: true,
      type: true,
      status: true,
    },
    orderBy: [{ dueAt: 'asc' }, { createdAt: 'desc' }],
    take: 25,
  });

  return { tasks };
}
