'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { prisma } from '@/lib/prisma';
import { getCurrentUserProfile } from '@/lib/session';
import { touchPresence } from '@/lib/presence';

const durationOptions = [25, 45, 50] as const;
const activityLabels = [
  'Coding',
  'Debugging',
  'Writing',
  'Learning',
  'Reading',
  'Research',
  'Meeting',
  'Other',
] as const;

const startFocusSessionSchema = z.object({
  plannedMinutes: z
    .number()
    .int()
    .refine((value) => durationOptions.includes(value as never), {
      message: 'Choose a valid focus duration',
    }),
  activityType: z.enum(activityLabels),
  taskId: z.string().trim().min(1).optional().nullable(),
});

const sessionIdSchema = z.object({
  sessionId: z.string().trim().min(1),
});

type ActionResult<T = unknown> =
  | { success: true; message: string; data: T }
  | { success: false; message: string; errors?: z.core.$ZodIssue[] };

type FocusMetadata = {
  elapsedSeconds?: number;
  lastStartedAt?: string | null;
  activityLabel?: string;
  stoppedAt?: string;
  completedAt?: string;
};

async function requireCurrentProfile() {
  const current = await getCurrentUserProfile();

  if (!current) {
    throw new Error('Unauthorized');
  }

  return current.profile;
}

function parseMetadata(notes: string | null): FocusMetadata {
  if (!notes) return {};

  try {
    const parsed = JSON.parse(notes);
    return typeof parsed === 'object' && parsed ? parsed : {};
  } catch {
    return {};
  }
}

function serializeMetadata(metadata: FocusMetadata) {
  return JSON.stringify(metadata);
}

function getElapsedSeconds(session: {
  status: string;
  notes: string | null;
  startedAt: Date | null;
  updatedAt: Date;
}) {
  const metadata = parseMetadata(session.notes);
  const savedElapsed = Math.max(metadata.elapsedSeconds ?? 0, 0);

  if (session.status !== 'ACTIVE') {
    return savedElapsed;
  }

  const lastStartedAt = metadata.lastStartedAt
    ? new Date(metadata.lastStartedAt)
    : (session.startedAt ?? session.updatedAt);
  const activeSeconds = Math.max(Math.floor((Date.now() - lastStartedAt.getTime()) / 1000), 0);

  return savedElapsed + activeSeconds;
}

function mapActivityType(activityType: (typeof activityLabels)[number]) {
  const map = {
    Coding: 'CODING',
    Debugging: 'CODING',
    Writing: 'WRITING',
    Learning: 'STUDY',
    Reading: 'READING',
    Research: 'RESEARCH',
    Meeting: 'OTHER',
    Other: 'OTHER',
  } as const;

  return map[activityType];
}

async function ensureTaskAccess(taskId: string, profileId: string) {
  const task = await prisma.task.findFirst({
    where: {
      id: taskId,
      status: { not: 'ARCHIVED' },
      OR: [
        { createdByProfileId: profileId },
        { assignedToProfileId: profileId },
        {
          team: {
            memberships: {
              some: {
                profileId,
                leftAt: null,
              },
            },
          },
        },
      ],
    },
    select: { id: true, title: true, teamId: true },
  });

  if (!task) {
    throw new Error('Related task was not found or is not available');
  }

  return task;
}

async function getOwnedSession(sessionId: string, profileId: string) {
  const session = await prisma.focusSession.findFirst({
    where: { id: sessionId, profileId },
    include: { task: { select: { id: true, title: true } } },
  });

  if (!session) {
    throw new Error('Focus session was not found');
  }

  return session;
}

function revalidateFocus(taskId?: string | null) {
  revalidatePath('/focus-mode');
  revalidatePath('/dashboard');
  revalidatePath('/activity');
  revalidatePath('/team');
  if (taskId) {
    revalidatePath(`/tasks/${taskId}`);
  }
}

async function recordTaskActivity({
  taskId,
  actorProfileId,
  eventType,
  elapsedSeconds,
  sessionId,
}: {
  taskId: string;
  actorProfileId: string;
  eventType: string;
  elapsedSeconds?: number;
  sessionId: string;
}) {
  await prisma.taskActivity.create({
    data: {
      taskId,
      actorProfileId,
      eventType,
      metadata: {
        source: 'focus_session',
        focusSessionId: sessionId,
        elapsedSeconds,
      },
    },
  });
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

export async function startFocusSession(
  input: z.input<typeof startFocusSessionSchema>
): Promise<ActionResult> {
  try {
    const profile = await requireCurrentProfile();
    const data = startFocusSessionSchema.parse(input);

    const existingActiveSession = await prisma.focusSession.findFirst({
      where: { profileId: profile.id, status: { in: ['ACTIVE', 'PAUSED'] } },
      select: { id: true },
    });

    if (existingActiveSession) {
      throw new Error('Finish or stop the active focus session before starting another one');
    }

    const task = data.taskId ? await ensureTaskAccess(data.taskId, profile.id) : null;
    const now = new Date();

    const session = await prisma.focusSession.create({
      data: {
        profileId: profile.id,
        taskId: task?.id ?? null,
        teamId: task?.teamId ?? null,
        activityType: mapActivityType(data.activityType),
        status: 'ACTIVE',
        plannedMinutes: data.plannedMinutes,
        startedAt: now,
        source: 'web',
        notes: serializeMetadata({
          elapsedSeconds: 0,
          lastStartedAt: now.toISOString(),
          activityLabel: data.activityType,
        }),
      },
      include: { task: { select: { id: true, title: true } } },
    });

    if (task) {
      await recordTaskActivity({
        taskId: task.id,
        actorProfileId: profile.id,
        eventType: 'focus_started',
        sessionId: session.id,
      });
    }

    await touchPresence(profile.id);
    revalidateFocus(task?.id);
    return { success: true, message: 'Focus session started', data: session };
  } catch (error) {
    return handleActionError(error, 'Failed to start focus session');
  }
}

export async function pauseFocusSession(
  input: z.input<typeof sessionIdSchema>
): Promise<ActionResult> {
  try {
    const profile = await requireCurrentProfile();
    const data = sessionIdSchema.parse(input);
    const session = await getOwnedSession(data.sessionId, profile.id);

    if (session.status !== 'ACTIVE') {
      throw new Error('Only active focus sessions can be paused');
    }

    const elapsedSeconds = getElapsedSeconds(session);
    const paused = await prisma.focusSession.update({
      where: { id: session.id },
      data: {
        status: 'PAUSED',
        pausedAt: new Date(),
        notes: serializeMetadata({
          ...parseMetadata(session.notes),
          elapsedSeconds,
          lastStartedAt: null,
        }),
      },
      include: { task: { select: { id: true, title: true } } },
    });

    await touchPresence(profile.id);
    revalidateFocus(session.taskId);
    return { success: true, message: 'Focus session paused', data: paused };
  } catch (error) {
    return handleActionError(error, 'Failed to pause focus session');
  }
}

export async function resumeFocusSession(
  input: z.input<typeof sessionIdSchema>
): Promise<ActionResult> {
  try {
    const profile = await requireCurrentProfile();
    const data = sessionIdSchema.parse(input);
    const session = await getOwnedSession(data.sessionId, profile.id);

    if (session.status !== 'PAUSED') {
      throw new Error('Only paused focus sessions can be resumed');
    }

    const now = new Date();
    const resumed = await prisma.focusSession.update({
      where: { id: session.id },
      data: {
        status: 'ACTIVE',
        pausedAt: null,
        notes: serializeMetadata({
          ...parseMetadata(session.notes),
          lastStartedAt: now.toISOString(),
        }),
      },
      include: { task: { select: { id: true, title: true } } },
    });

    await touchPresence(profile.id);
    revalidateFocus(session.taskId);
    return { success: true, message: 'Focus session resumed', data: resumed };
  } catch (error) {
    return handleActionError(error, 'Failed to resume focus session');
  }
}

export async function stopFocusSession(
  input: z.input<typeof sessionIdSchema>
): Promise<ActionResult> {
  try {
    const profile = await requireCurrentProfile();
    const data = sessionIdSchema.parse(input);
    const session = await getOwnedSession(data.sessionId, profile.id);

    if (!['ACTIVE', 'PAUSED'].includes(session.status)) {
      throw new Error('Only active or paused focus sessions can be stopped');
    }

    const elapsedSeconds = getElapsedSeconds(session);
    const stopped = await prisma.focusSession.update({
      where: { id: session.id },
      data: {
        status: 'ABANDONED',
        actualMinutes: Math.ceil(elapsedSeconds / 60),
        completedAt: new Date(),
        notes: serializeMetadata({
          ...parseMetadata(session.notes),
          elapsedSeconds,
          lastStartedAt: null,
          stoppedAt: new Date().toISOString(),
        }),
      },
      include: { task: { select: { id: true, title: true } } },
    });

    if (session.taskId) {
      await recordTaskActivity({
        taskId: session.taskId,
        actorProfileId: profile.id,
        eventType: 'focus_stopped',
        elapsedSeconds,
        sessionId: session.id,
      });
    }

    await touchPresence(profile.id);
    revalidateFocus(session.taskId);
    return { success: true, message: 'Focus session stopped', data: stopped };
  } catch (error) {
    return handleActionError(error, 'Failed to stop focus session');
  }
}

export async function completeFocusSession(
  input: z.input<typeof sessionIdSchema>
): Promise<ActionResult> {
  try {
    const profile = await requireCurrentProfile();
    const data = sessionIdSchema.parse(input);
    const session = await getOwnedSession(data.sessionId, profile.id);

    if (!['ACTIVE', 'PAUSED'].includes(session.status)) {
      throw new Error('Only active or paused focus sessions can be completed');
    }

    const elapsedSeconds = Math.max(getElapsedSeconds(session), session.plannedMinutes * 60);
    const actualMinutes = Math.ceil(elapsedSeconds / 60);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const completed = await prisma.$transaction(async (tx) => {
      const completedToday = await tx.focusSession.count({
        where: {
          profileId: profile.id,
          status: 'COMPLETED',
          completedAt: {
            gte: today,
            lt: tomorrow,
          },
        },
      });
      const updated = await tx.focusSession.update({
        where: { id: session.id },
        data: {
          status: 'COMPLETED',
          actualMinutes,
          completedAt: new Date(),
          notes: serializeMetadata({
            ...parseMetadata(session.notes),
            elapsedSeconds,
            lastStartedAt: null,
            completedAt: new Date().toISOString(),
          }),
        },
        include: { task: { select: { id: true, title: true } } },
      });

      await tx.userProfile.update({
        where: { id: profile.id },
        data: {
          totalFocusMinutes: { increment: actualMinutes },
          ...(completedToday === 0 ? { currentStreak: { increment: 1 } } : {}),
        },
      });

      await tx.activityEvent.create({
        data: {
          profileId: profile.id,
          teamId: session.teamId,
          type: 'focus_completed',
          sourceType: 'FOCUS_SESSION',
          sourceId: session.id,
          points: actualMinutes,
        },
      });

      if (session.taskId) {
        await tx.taskActivity.create({
          data: {
            taskId: session.taskId,
            actorProfileId: profile.id,
            eventType: 'focus_completed',
            metadata: {
              source: 'focus_session',
              focusSessionId: session.id,
              elapsedSeconds,
              actualMinutes,
            },
          },
        });
      }

      return updated;
    });

    await touchPresence(profile.id);
    revalidateFocus(session.taskId);
    return { success: true, message: 'Focus session completed', data: completed };
  } catch (error) {
    return handleActionError(error, 'Failed to complete focus session');
  }
}
