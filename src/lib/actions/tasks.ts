'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import type { Prisma } from '@/generated/prisma/client';
import { prisma } from '@/lib/prisma';
import { getCurrentUserProfile } from '@/lib/session';
import { awardEligibleBadges } from '@/lib/badges';
import {
  canAssignTask,
  canAccessModule,
  canEditTaskDefinition,
  canManageTask,
  canViewTask,
} from '@/lib/permissions';

const taskStatuses = ['TODO', 'IN_PROGRESS', 'BLOCKED', 'IN_REVIEW', 'DONE', 'ARCHIVED'] as const;
const taskTypes = ['PERSONAL', 'MENTOR_ASSIGNED', 'ADMIN_ASSIGNED', 'TEAM'] as const;
const taskPriorities = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'] as const;

const statusAliases = {
  todo: 'TODO',
  in_progress: 'IN_PROGRESS',
  blocked: 'BLOCKED',
  in_review: 'IN_REVIEW',
  done: 'DONE',
  archived: 'ARCHIVED',
} as const;

const typeAliases = {
  personal: 'PERSONAL',
  mentor: 'MENTOR_ASSIGNED',
  admin: 'ADMIN_ASSIGNED',
  team: 'TEAM',
} as const;

const categories = [
  'Coding',
  'Debugging',
  'Learning',
  'Writing',
  'Backend',
  'Frontend',
  'Database',
  'Styling',
] as const;

const taskStatusSchema = z.preprocess((value) => {
  if (typeof value !== 'string') return value;
  return statusAliases[value as keyof typeof statusAliases] ?? value.toUpperCase();
}, z.enum(taskStatuses));

const taskTypeSchema = z.preprocess((value) => {
  if (typeof value !== 'string') return value;
  return typeAliases[value as keyof typeof typeAliases] ?? value.toUpperCase();
}, z.enum(taskTypes));

const taskPrioritySchema = z.preprocess((value) => {
  if (typeof value !== 'string') return value;
  return value.toUpperCase();
}, z.enum(taskPriorities));

const optionalDateSchema = z
  .union([z.string(), z.date()])
  .optional()
  .nullable()
  .transform((value) => {
    if (value === undefined) return undefined;
    if (!value) return null;
    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) {
      throw new Error('Invalid due date');
    }
    return date;
  });

const categorySchema = z
  .string()
  .trim()
  .min(1)
  .max(60)
  .optional()
  .nullable()
  .transform((value) => {
    if (value === undefined) return undefined;
    return value || null;
  });

const createTaskSchema = z.object({
  title: z.string().trim().min(1, 'Task title is required').max(160),
  description: z.string().trim().max(2000).optional().nullable(),
  type: taskTypeSchema.default('PERSONAL'),
  status: taskStatusSchema.default('TODO'),
  priority: taskPrioritySchema.default('MEDIUM'),
  category: categorySchema,
  dueAt: optionalDateSchema,
  assignedToProfileId: z.string().trim().min(1).optional().nullable(),
  teamId: z.string().trim().min(1).optional().nullable(),
  subtasks: z
    .array(
      z.object({
        title: z.string().trim().min(1).max(160),
      })
    )
    .max(25)
    .optional(),
});

const updateTaskSchema = z.object({
  taskId: z.string().trim().min(1),
  title: z.string().trim().min(1).max(160).optional(),
  description: z.string().trim().max(2000).optional().nullable(),
  status: taskStatusSchema.optional(),
  priority: taskPrioritySchema.optional(),
  category: categorySchema,
  dueAt: optionalDateSchema,
  assignedToProfileId: z.string().trim().min(1).optional().nullable(),
  teamId: z.string().trim().min(1).optional().nullable(),
});

const listTasksSchema = z
  .object({
    status: taskStatusSchema.optional(),
    type: taskTypeSchema.optional(),
    assignedToProfileId: z.string().trim().min(1).optional(),
    teamId: z.string().trim().min(1).optional(),
    includeArchived: z.boolean().default(false),
  })
  .optional();

const taskIdSchema = z.object({
  taskId: z.string().trim().min(1),
});

const statusChangeSchema = taskIdSchema.extend({
  status: taskStatusSchema,
});

const subtaskCreateSchema = taskIdSchema.extend({
  title: z.string().trim().min(1).max(160),
});

const subtaskUpdateSchema = z.object({
  subtaskId: z.string().trim().min(1),
  title: z.string().trim().min(1).max(160).optional(),
  isDone: z.boolean().optional(),
});

const subtaskToggleSchema = z.object({
  subtaskId: z.string().trim().min(1),
  isDone: z.boolean().optional(),
});

const commentSchema = taskIdSchema.extend({
  body: z.string().trim().min(1).max(1000),
});

type ActionResult<T = unknown> =
  | { success: true; message: string; data: T }
  | { success: false; message: string; errors?: z.core.$ZodIssue[] };

type CurrentProfile = Awaited<ReturnType<typeof requireCurrentProfile>>;

async function requireCurrentProfile() {
  const current = await getCurrentUserProfile();

  if (!current) {
    throw new Error('Unauthorized');
  }
  if (!canAccessModule(current.profile.role, 'tasks')) {
    throw new Error('You do not have permission to use tasks');
  }

  return current.profile;
}

function isPlatformAdmin(profile: CurrentProfile) {
  return profile.role === 'ADMIN';
}

function canCreateMentorTask(profile: CurrentProfile) {
  return canAssignTask(profile.role);
}

function canCreateAdminTask(profile: CurrentProfile) {
  return isPlatformAdmin(profile);
}

async function ensureActiveProfile(profileId: string) {
  const profile = await prisma.userProfile.findUnique({
    where: { id: profileId },
    select: { id: true },
  });

  if (!profile) {
    throw new Error('Assigned user was not found');
  }
}

async function ensureTeamAssignment(teamId: string, profileId: string) {
  const membership = await prisma.teamMembership.findUnique({
    where: {
      teamId_profileId: {
        teamId,
        profileId,
      },
    },
    select: { leftAt: true },
  });

  if (!membership || membership.leftAt) {
    throw new Error('Assigned user must be an active member of the selected team');
  }
}

async function ensureMentorCanManageTeam(profile: CurrentProfile, teamId: string) {
  if (isPlatformAdmin(profile)) return;

  const team = await prisma.team.findUnique({
    where: { id: teamId },
    select: {
      ownerProfileId: true,
      memberships: {
        where: { profileId: profile.id, leftAt: null },
        select: { role: true },
      },
    },
  });

  const role = team?.memberships[0]?.role;
  const hasManagerRole = Boolean(role && ['LEAD', 'MENTOR', 'ADMIN'].includes(role));

  if (!team || (team.ownerProfileId !== profile.id && !hasManagerRole)) {
    throw new Error('Mentor team tasks can only be assigned inside teams you manage');
  }
}

async function ensureTeamCreatorRole(teamId: string, profile: CurrentProfile) {
  if (isPlatformAdmin(profile)) return;

  const membership = await prisma.teamMembership.findUnique({
    where: {
      teamId_profileId: {
        teamId,
        profileId: profile.id,
      },
    },
    select: { role: true, leftAt: true },
  });

  if (!membership || membership.leftAt) {
    throw new Error('You must belong to this team to create team tasks');
  }

  if (!['LEAD', 'MENTOR', 'ADMIN'].includes(membership.role)) {
    throw new Error('Only team leads, mentors, and admins can create team tasks');
  }
}

async function ensureMentorCanAssign(profile: CurrentProfile, assignedToProfileId: string) {
  if (isPlatformAdmin(profile)) return;

  const assignment = await prisma.mentorAssignment.findFirst({
    where: {
      mentorProfileId: profile.id,
      studentProfileId: assignedToProfileId,
      endsAt: null,
    },
    select: { id: true },
  });

  if (!assignment) {
    const sharedTeam = await prisma.team.findFirst({
      where: {
        AND: [
          {
            memberships: {
              some: {
                profileId: assignedToProfileId,
                leftAt: null,
              },
            },
          },
          {
            OR: [
              { ownerProfileId: profile.id },
              {
                memberships: {
                  some: {
                    profileId: profile.id,
                    leftAt: null,
                    role: { in: ['LEAD', 'MENTOR', 'ADMIN'] },
                  },
                },
              },
            ],
          },
        ],
      },
      select: { id: true },
    });

    if (!sharedTeam) {
      throw new Error(
        'Mentor tasks can only be assigned to active mentees or managed team members'
      );
    }
  }
}

async function canAccessTask(taskId: string, profile: CurrentProfile) {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: {
      team: {
        include: {
          memberships: {
            where: { profileId: profile.id, leftAt: null },
            select: { id: true, role: true },
          },
        },
      },
    },
  });

  if (!task) {
    throw new Error('Task was not found');
  }

  const isTeamMember = Boolean(task.team?.memberships.length);

  if (
    !canViewTask({
      role: profile.role,
      profileId: profile.id,
      createdByProfileId: task.createdByProfileId,
      assignedToProfileId: task.assignedToProfileId,
      isActiveTeamMember: isTeamMember,
    })
  ) {
    throw new Error('You do not have access to this task');
  }

  return task;
}

function requireTaskManagement(
  task: Awaited<ReturnType<typeof canAccessTask>>,
  profile: CurrentProfile
) {
  if (
    !canManageTask({
      role: profile.role,
      profileId: profile.id,
      createdByProfileId: task.createdByProfileId,
      assignedToProfileId: task.assignedToProfileId,
      teamRole: task.team?.memberships[0]?.role,
    })
  ) {
    throw new Error('You may view this task but cannot modify it');
  }
}

async function recordActivity({
  taskId,
  actorProfileId,
  eventType,
  fromStatus,
  toStatus,
  metadata,
}: {
  taskId: string;
  actorProfileId: string;
  eventType: string;
  fromStatus?: (typeof taskStatuses)[number] | null;
  toStatus?: (typeof taskStatuses)[number] | null;
  metadata?: Prisma.InputJsonValue;
}) {
  return prisma.taskActivity.create({
    data: {
      taskId,
      actorProfileId,
      eventType,
      fromStatus,
      toStatus,
      metadata,
    },
  });
}

async function notifyTaskRecipients({
  taskId,
  actorProfileId,
  assignedToProfileId,
  teamId,
  title,
  event,
}: {
  taskId: string;
  actorProfileId: string;
  assignedToProfileId?: string | null;
  teamId?: string | null;
  title: string;
  event: 'assigned' | 'updated';
}) {
  const recipientIds = new Set<string>();

  if (assignedToProfileId && assignedToProfileId !== actorProfileId) {
    recipientIds.add(assignedToProfileId);
  }

  if (teamId) {
    const teamMembers = await prisma.teamMembership.findMany({
      where: { teamId, leftAt: null, profileId: { not: actorProfileId } },
      select: { profileId: true },
    });

    teamMembers.forEach((member) => recipientIds.add(member.profileId));
  }

  if (recipientIds.size === 0) return;

  await prisma.notification.createMany({
    data: [...recipientIds].map((recipientProfileId) => ({
      recipientProfileId,
      actorProfileId,
      type: event === 'assigned' ? 'TASK_ASSIGNED' : 'TEAM_UPDATE',
      title: event === 'assigned' ? 'Task assigned' : 'Task updated',
      body:
        event === 'assigned'
          ? `You have been assigned "${title}".`
          : `"${title}" was updated by your mentor or admin.`,
      targetType: 'TASK',
      targetId: taskId,
    })),
  });
}

async function refreshTaskProgress(taskId: string, actorProfileId: string) {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: { subtasks: true },
  });

  if (!task || task.subtasks.length === 0 || task.status === 'ARCHIVED') {
    return task;
  }

  const doneCount = task.subtasks.filter((subtask) => subtask.isDone).length;
  const nextStatus =
    doneCount === task.subtasks.length ? 'DONE' : doneCount > 0 ? 'IN_PROGRESS' : task.status;

  if (nextStatus === task.status) {
    return task;
  }

  const updated = await prisma.task.update({
    where: { id: taskId },
    data: {
      status: nextStatus,
      completedAt: nextStatus === 'DONE' ? new Date() : null,
    },
  });

  await recordActivity({
    taskId,
    actorProfileId,
    eventType: 'status_changed',
    fromStatus: task.status,
    toStatus: nextStatus,
    metadata: { source: 'subtasks', doneCount, totalCount: task.subtasks.length },
  });

  return updated;
}

function revalidateTasks(taskId?: string) {
  revalidatePath('/tasks');
  revalidatePath('/team');
  if (taskId) {
    revalidatePath(`/tasks/${taskId}`);
  }
}

function handleActionError(error: unknown, fallback: string): ActionResult {
  if (error instanceof z.ZodError) {
    return {
      success: false,
      message: 'Validation error',
      errors: error.issues,
    };
  }

  console.error(fallback, error);

  return {
    success: false,
    message: error instanceof Error ? error.message : fallback,
  };
}

export async function listTasks(input?: z.input<typeof listTasksSchema>): Promise<ActionResult> {
  try {
    const profile = await requireCurrentProfile();
    const filters = listTasksSchema.parse(input) ?? { includeArchived: false };

    const tasks = await prisma.task.findMany({
      where: {
        ...(filters.status ? { status: filters.status } : {}),
        ...(filters.type ? { type: filters.type } : {}),
        ...(filters.assignedToProfileId
          ? { assignedToProfileId: filters.assignedToProfileId }
          : {}),
        ...(filters.teamId ? { teamId: filters.teamId } : {}),
        ...(filters.includeArchived ? {} : { status: { not: 'ARCHIVED' } }),
        OR: isPlatformAdmin(profile)
          ? undefined
          : [
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
      include: {
        createdBy: { select: { id: true, displayName: true, avatarUrl: true } },
        assignedTo: { select: { id: true, displayName: true, avatarUrl: true } },
        subtasks: { orderBy: { position: 'asc' } },
        activities: { orderBy: { createdAt: 'desc' }, take: 10 },
      },
      orderBy: [{ dueAt: 'asc' }, { createdAt: 'desc' }],
    });

    return { success: true, message: 'Tasks loaded', data: tasks };
  } catch (error) {
    return handleActionError(error, 'Failed to list tasks');
  }
}

export async function createTask(input: z.input<typeof createTaskSchema>): Promise<ActionResult> {
  try {
    const profile = await requireCurrentProfile();
    const data = createTaskSchema.parse(input);
    const assignedToProfileId =
      data.type === 'PERSONAL' ? profile.id : (data.assignedToProfileId ?? null);

    if (data.type === 'MENTOR_ASSIGNED') {
      if (!canCreateMentorTask(profile)) {
        throw new Error('Only mentors and admins can create mentor tasks');
      }
      if (!assignedToProfileId) {
        throw new Error('Mentor tasks require an assignee');
      }
      await ensureMentorCanAssign(profile, assignedToProfileId);
    }

    if (data.type === 'ADMIN_ASSIGNED' && !canCreateAdminTask(profile)) {
      throw new Error('Only admins can create admin tasks');
    }

    if (data.type === 'TEAM') {
      if (!data.teamId) {
        throw new Error('Team tasks require a team');
      }
      await ensureTeamCreatorRole(data.teamId, profile);
      if (data.type === 'TEAM' && canCreateMentorTask(profile)) {
        await ensureMentorCanManageTeam(profile, data.teamId);
      }
    }

    if (assignedToProfileId) {
      await ensureActiveProfile(assignedToProfileId);
    }

    if (data.teamId && assignedToProfileId) {
      await ensureTeamAssignment(data.teamId, assignedToProfileId);
    }

    const task = await prisma.task.create({
      data: {
        title: data.title,
        description: data.description || null,
        type: data.type,
        status: data.status,
        priority: data.priority,
        category: data.category,
        createdByProfileId: profile.id,
        assignedToProfileId,
        teamId: data.teamId ?? null,
        dueAt: data.dueAt,
        completedAt: data.status === 'DONE' ? new Date() : null,
        subtasks: data.subtasks?.length
          ? {
              create: data.subtasks.map((subtask, index) => ({
                title: subtask.title,
                position: index,
              })),
            }
          : undefined,
      },
      include: { subtasks: true },
    });

    await recordActivity({
      taskId: task.id,
      actorProfileId: profile.id,
      eventType: 'created',
      toStatus: task.status,
      metadata: {
        type: task.type,
        category: task.category,
        assignedToProfileId,
        supportedCategories: categories,
      },
    });

    if (assignedToProfileId && assignedToProfileId !== profile.id) {
      await recordActivity({
        taskId: task.id,
        actorProfileId: profile.id,
        eventType: 'assigned',
        metadata: { assignedToProfileId },
      });
    }

    if (data.type !== 'PERSONAL') {
      await notifyTaskRecipients({
        taskId: task.id,
        actorProfileId: profile.id,
        assignedToProfileId,
        teamId: task.teamId,
        title: task.title,
        event: 'assigned',
      });
    }

    if (task.status === 'DONE') {
      await awardEligibleBadges(task.assignedToProfileId ?? task.createdByProfileId);
    }

    revalidateTasks(task.id);
    return { success: true, message: 'Task created', data: task };
  } catch (error) {
    return handleActionError(error, 'Failed to create task');
  }
}

export async function updateTask(input: z.input<typeof updateTaskSchema>): Promise<ActionResult> {
  try {
    const profile = await requireCurrentProfile();
    const data = updateTaskSchema.parse(input);
    const existing = await canAccessTask(data.taskId, profile);
    const canManageDefinition = canEditTaskDefinition(
      profile.role,
      profile.id,
      existing.createdByProfileId
    );

    if (!canManageDefinition) {
      throw new Error('Only the assigner or an admin can update task assignment details');
    }

    if (data.assignedToProfileId) {
      await ensureActiveProfile(data.assignedToProfileId);
    }

    if (data.teamId && data.assignedToProfileId) {
      await ensureTeamAssignment(data.teamId, data.assignedToProfileId);
    }

    if (existing.type === 'MENTOR_ASSIGNED' && data.assignedToProfileId) {
      await ensureMentorCanAssign(profile, data.assignedToProfileId);
    }

    const task = await prisma.task.update({
      where: { id: data.taskId },
      data: {
        ...(data.title !== undefined ? { title: data.title } : {}),
        ...(data.description !== undefined ? { description: data.description || null } : {}),
        ...(data.status !== undefined
          ? { status: data.status, completedAt: data.status === 'DONE' ? new Date() : null }
          : {}),
        ...(data.priority !== undefined ? { priority: data.priority } : {}),
        ...(data.category !== undefined ? { category: data.category } : {}),
        ...(data.dueAt !== undefined ? { dueAt: data.dueAt } : {}),
        ...(data.assignedToProfileId !== undefined
          ? { assignedToProfileId: data.assignedToProfileId }
          : {}),
        ...(data.teamId !== undefined ? { teamId: data.teamId } : {}),
      },
    });

    if (data.status && data.status !== existing.status) {
      await recordActivity({
        taskId: task.id,
        actorProfileId: profile.id,
        eventType: 'status_changed',
        fromStatus: existing.status,
        toStatus: data.status,
      });
    } else {
      await recordActivity({
        taskId: task.id,
        actorProfileId: profile.id,
        eventType: 'updated',
      });
    }

    if (
      data.assignedToProfileId !== undefined &&
      data.assignedToProfileId !== existing.assignedToProfileId
    ) {
      await recordActivity({
        taskId: task.id,
        actorProfileId: profile.id,
        eventType: 'assigned',
        metadata: {
          fromProfileId: existing.assignedToProfileId,
          toProfileId: data.assignedToProfileId,
        },
      });
    }

    await notifyTaskRecipients({
      taskId: task.id,
      actorProfileId: profile.id,
      assignedToProfileId: task.assignedToProfileId,
      teamId: task.teamId,
      title: task.title,
      event:
        data.assignedToProfileId !== undefined &&
        data.assignedToProfileId !== existing.assignedToProfileId
          ? 'assigned'
          : 'updated',
    });

    if (data.status === 'DONE' && existing.status !== 'DONE') {
      await awardEligibleBadges(task.assignedToProfileId ?? task.createdByProfileId);
    }

    revalidateTasks(task.id);
    return { success: true, message: 'Task updated', data: task };
  } catch (error) {
    return handleActionError(error, 'Failed to update task');
  }
}

export async function changeTaskStatus(
  input: z.input<typeof statusChangeSchema>
): Promise<ActionResult> {
  try {
    const profile = await requireCurrentProfile();
    const data = statusChangeSchema.parse(input);
    const existing = await canAccessTask(data.taskId, profile);
    if (data.status === 'ARCHIVED') {
      if (!canEditTaskDefinition(profile.role, profile.id, existing.createdByProfileId)) {
        throw new Error('Only the task creator or an admin can archive this task');
      }
    } else {
      requireTaskManagement(existing, profile);
    }

    const task = await prisma.task.update({
      where: { id: data.taskId },
      data: {
        status: data.status,
        completedAt: data.status === 'DONE' ? new Date() : null,
      },
    });

    await recordActivity({
      taskId: task.id,
      actorProfileId: profile.id,
      eventType: data.status === 'ARCHIVED' ? 'archived' : 'status_changed',
      fromStatus: existing.status,
      toStatus: data.status,
    });

    if (data.status === 'DONE' && existing.status !== 'DONE') {
      await awardEligibleBadges(task.assignedToProfileId ?? task.createdByProfileId);
    }

    revalidateTasks(task.id);
    return { success: true, message: 'Task status updated', data: task };
  } catch (error) {
    return handleActionError(error, 'Failed to update task status');
  }
}

export async function archiveTask(input: z.input<typeof taskIdSchema>): Promise<ActionResult> {
  try {
    const parsed = taskIdSchema.parse(input);
    return changeTaskStatus({ taskId: parsed.taskId, status: 'ARCHIVED' });
  } catch (error) {
    return handleActionError(error, 'Failed to archive task');
  }
}

export async function deleteTask(input: z.input<typeof taskIdSchema>): Promise<ActionResult> {
  try {
    const profile = await requireCurrentProfile();
    const data = taskIdSchema.parse(input);
    const task = await canAccessTask(data.taskId, profile);

    if (!canEditTaskDefinition(profile.role, profile.id, task.createdByProfileId)) {
      throw new Error('Only the creator or an admin can delete a task');
    }

    await prisma.task.delete({ where: { id: data.taskId } });

    revalidateTasks();
    return { success: true, message: 'Task deleted', data: { id: data.taskId } };
  } catch (error) {
    return handleActionError(error, 'Failed to delete task');
  }
}

export async function createSubtask(
  input: z.input<typeof subtaskCreateSchema>
): Promise<ActionResult> {
  try {
    const profile = await requireCurrentProfile();
    const data = subtaskCreateSchema.parse(input);
    const task = await canAccessTask(data.taskId, profile);
    requireTaskManagement(task, profile);
    const count = await prisma.subtask.count({ where: { taskId: task.id } });

    const subtask = await prisma.subtask.create({
      data: {
        taskId: task.id,
        title: data.title,
        position: count,
      },
    });

    await recordActivity({
      taskId: task.id,
      actorProfileId: profile.id,
      eventType: 'subtask_created',
      metadata: { subtaskId: subtask.id },
    });

    revalidateTasks(task.id);
    return { success: true, message: 'Subtask created', data: subtask };
  } catch (error) {
    return handleActionError(error, 'Failed to create subtask');
  }
}

export async function updateSubtask(
  input: z.input<typeof subtaskUpdateSchema>
): Promise<ActionResult> {
  try {
    const profile = await requireCurrentProfile();
    const data = subtaskUpdateSchema.parse(input);
    const existing = await prisma.subtask.findUnique({
      where: { id: data.subtaskId },
    });

    if (!existing) {
      throw new Error('Subtask was not found');
    }

    const task = await canAccessTask(existing.taskId, profile);
    requireTaskManagement(task, profile);

    const subtask = await prisma.subtask.update({
      where: { id: data.subtaskId },
      data: {
        ...(data.title !== undefined ? { title: data.title } : {}),
        ...(data.isDone !== undefined ? { isDone: data.isDone } : {}),
      },
    });

    await recordActivity({
      taskId: subtask.taskId,
      actorProfileId: profile.id,
      eventType:
        data.isDone !== undefined && data.isDone !== existing.isDone
          ? 'subtask_toggled'
          : 'subtask_updated',
      metadata: { subtaskId: subtask.id, isDone: subtask.isDone },
    });

    if (data.isDone !== undefined && data.isDone !== existing.isDone) {
      await refreshTaskProgress(subtask.taskId, profile.id);
    }

    revalidateTasks(subtask.taskId);
    return { success: true, message: 'Subtask updated', data: subtask };
  } catch (error) {
    return handleActionError(error, 'Failed to update subtask');
  }
}

export async function toggleSubtask(
  input: z.input<typeof subtaskToggleSchema>
): Promise<ActionResult> {
  try {
    const profile = await requireCurrentProfile();
    const data = subtaskToggleSchema.parse(input);
    const existing = await prisma.subtask.findUnique({
      where: { id: data.subtaskId },
    });

    if (!existing) {
      throw new Error('Subtask was not found');
    }

    const task = await canAccessTask(existing.taskId, profile);
    requireTaskManagement(task, profile);

    const isDone = data.isDone ?? !existing.isDone;
    const subtask = await prisma.subtask.update({
      where: { id: data.subtaskId },
      data: { isDone },
    });

    await recordActivity({
      taskId: subtask.taskId,
      actorProfileId: profile.id,
      eventType: 'subtask_toggled',
      metadata: { subtaskId: subtask.id, isDone },
    });

    await refreshTaskProgress(subtask.taskId, profile.id);

    revalidateTasks(subtask.taskId);
    return { success: true, message: 'Subtask toggled', data: subtask };
  } catch (error) {
    return handleActionError(error, 'Failed to toggle subtask');
  }
}

export async function addTaskComment(input: z.input<typeof commentSchema>): Promise<ActionResult> {
  try {
    const profile = await requireCurrentProfile();
    const data = commentSchema.parse(input);
    const task = await canAccessTask(data.taskId, profile);

    const comment = await prisma.taskComment.create({
      data: {
        taskId: task.id,
        authorProfileId: profile.id,
        body: data.body,
      },
    });

    await recordActivity({
      taskId: task.id,
      actorProfileId: profile.id,
      eventType: 'commented',
      metadata: { commentId: comment.id },
    });

    revalidateTasks(task.id);
    return { success: true, message: 'Comment added', data: comment };
  } catch (error) {
    return handleActionError(error, 'Failed to add task comment');
  }
}
