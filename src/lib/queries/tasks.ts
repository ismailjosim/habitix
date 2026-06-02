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
  assignableStudents: AssignableStudent[];
  assignableTeams: AssignableTeam[];
  currentRole: string | null;
  currentProfileId: string | null;
  canAssignTasks: boolean;
};

export type AssignableStudent = {
  id: string;
  displayName: string;
  role: string;
  teamName: string | null;
};

export type AssignableTeam = {
  id: string;
  name: string;
  memberCount: number;
};

export async function getTaskBoardData(): Promise<TaskBoardData> {
  const current = await getCurrentUserProfile();

  if (!current) {
    return {
      personalTasks: [],
      assignedTasks: [],
      assignableStudents: [],
      assignableTeams: [],
      currentRole: null,
      currentProfileId: null,
      canAssignTasks: false,
    };
  }

  const { profile } = current;
  const isPlatformAdmin = profile.role === 'ADMIN' || profile.role === 'MODERATOR';
  const canAssignTasks = profile.role === 'MENTOR' || isPlatformAdmin;

  const [tasks, assignmentTargets] = await Promise.all([
    prisma.task.findMany({
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
    }),
    canAssignTasks
      ? getAssignmentTargets(profile.id, isPlatformAdmin)
      : Promise.resolve({ assignableStudents: [], assignableTeams: [] }),
  ]);

  return {
    personalTasks: tasks.filter((task) => task.type === 'PERSONAL'),
    assignedTasks: tasks.filter((task) => task.type !== 'PERSONAL'),
    assignableStudents: assignmentTargets.assignableStudents,
    assignableTeams: assignmentTargets.assignableTeams,
    currentRole: profile.role,
    currentProfileId: profile.id,
    canAssignTasks,
  };
}

async function getAssignmentTargets(profileId: string, isPlatformAdmin: boolean) {
  if (isPlatformAdmin) {
    const [students, teams] = await Promise.all([
      prisma.userProfile.findMany({
        where: { id: { not: profileId }, role: 'STUDENT' },
        select: { id: true, displayName: true, role: true },
        orderBy: { displayName: 'asc' },
      }),
      prisma.team.findMany({
        select: {
          id: true,
          name: true,
          _count: { select: { memberships: { where: { leftAt: null } } } },
        },
        orderBy: { name: 'asc' },
      }),
    ]);

    return {
      assignableStudents: students.map((student) => ({ ...student, teamName: null })),
      assignableTeams: teams.map((team) => ({
        id: team.id,
        name: team.name,
        memberCount: team._count.memberships,
      })),
    };
  }

  const [directAssignments, managedTeams] = await Promise.all([
    prisma.mentorAssignment.findMany({
      where: { mentorProfileId: profileId, endsAt: null },
      include: {
        team: { select: { name: true } },
        student: { select: { id: true, displayName: true, role: true } },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.team.findMany({
      where: {
        OR: [
          { ownerProfileId: profileId },
          {
            memberships: {
              some: {
                profileId,
                leftAt: null,
                role: { in: ['LEAD', 'MENTOR', 'ADMIN'] },
              },
            },
          },
        ],
      },
      include: {
        memberships: {
          where: { leftAt: null },
          include: {
            profile: { select: { id: true, displayName: true, role: true } },
          },
          orderBy: { joinedAt: 'asc' },
        },
      },
      orderBy: { name: 'asc' },
    }),
  ]);

  const students = new Map<string, AssignableStudent>();

  directAssignments.forEach((assignment) => {
    students.set(assignment.student.id, {
      ...assignment.student,
      teamName: assignment.team?.name ?? null,
    });
  });

  managedTeams.forEach((team) => {
    team.memberships.forEach((membership) => {
      if (membership.profile.id === profileId) return;
      students.set(membership.profile.id, {
        ...membership.profile,
        teamName: team.name,
      });
    });
  });

  return {
    assignableStudents: [...students.values()].sort((a, b) =>
      a.displayName.localeCompare(b.displayName)
    ),
    assignableTeams: managedTeams.map((team) => ({
      id: team.id,
      name: team.name,
      memberCount: team.memberships.length,
    })),
  };
}
