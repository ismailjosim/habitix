import { beforeEach, describe, expect, it, vi } from 'vitest';

import { currentUserFixture } from '@/test/fixtures';

const mocks = vi.hoisted(() => ({
  getCurrentUserProfile: vi.fn(),
  taskCreate: vi.fn(),
  taskFindUnique: vi.fn(),
  taskUpdate: vi.fn(),
  subtaskFindUnique: vi.fn(),
  subtaskUpdate: vi.fn(),
  taskActivityCreate: vi.fn(),
  revalidatePath: vi.fn(),
}));

vi.mock('@/lib/session', () => ({ getCurrentUserProfile: mocks.getCurrentUserProfile }));
vi.mock('@/lib/badges', () => ({ awardEligibleBadges: vi.fn() }));
vi.mock('next/cache', () => ({ revalidatePath: mocks.revalidatePath }));
vi.mock('@/lib/prisma', () => ({
  prisma: {
    task: {
      create: mocks.taskCreate,
      findUnique: mocks.taskFindUnique,
      update: mocks.taskUpdate,
    },
    subtask: {
      findUnique: mocks.subtaskFindUnique,
      update: mocks.subtaskUpdate,
    },
    taskActivity: { create: mocks.taskActivityCreate },
    userProfile: { findUnique: vi.fn().mockResolvedValue({ id: 'student-profile' }) },
    teamMembership: { findMany: vi.fn().mockResolvedValue([]) },
  },
}));

import { createTask, toggleSubtask } from '@/lib/actions/tasks';

describe('task actions', () => {
  beforeEach(() => {
    mocks.getCurrentUserProfile.mockResolvedValue(currentUserFixture());
    mocks.taskActivityCreate.mockResolvedValue({ id: 'activity-1' });
  });

  it('prevents students from assigning mentor tasks', async () => {
    const result = await createTask({
      title: 'Mentor assignment',
      type: 'MENTOR_ASSIGNED',
      assignedToProfileId: 'other-student',
    });

    expect(result).toMatchObject({
      success: false,
      message: 'Only mentors and admins can create mentor tasks',
    });
    expect(mocks.taskCreate).not.toHaveBeenCalled();
  });

  it('creates personal tasks with ordered subtasks', async () => {
    mocks.taskCreate.mockResolvedValue({
      id: 'task-1',
      title: 'Ship tests',
      type: 'PERSONAL',
      status: 'TODO',
      category: 'Coding',
      subtasks: [],
    });

    const result = await createTask({
      title: 'Ship tests',
      category: 'Coding',
      subtasks: [{ title: 'Write tests' }, { title: 'Run tests' }],
    });

    expect(result.success).toBe(true);
    expect(mocks.taskCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          assignedToProfileId: 'student-profile',
          subtasks: {
            create: [
              { title: 'Write tests', position: 0 },
              { title: 'Run tests', position: 1 },
            ],
          },
        }),
      })
    );
  });

  it('completes a task when its final subtask is checked', async () => {
    mocks.subtaskFindUnique.mockResolvedValue({
      id: 'subtask-2',
      taskId: 'task-1',
      title: 'Run tests',
      isDone: false,
    });
    mocks.subtaskUpdate.mockResolvedValue({
      id: 'subtask-2',
      taskId: 'task-1',
      title: 'Run tests',
      isDone: true,
    });
    mocks.taskFindUnique
      .mockResolvedValueOnce({
        id: 'task-1',
        status: 'IN_PROGRESS',
        createdByProfileId: 'student-profile',
        assignedToProfileId: 'student-profile',
        team: null,
      })
      .mockResolvedValueOnce({
        id: 'task-1',
        status: 'IN_PROGRESS',
        subtasks: [
          { id: 'subtask-1', isDone: true },
          { id: 'subtask-2', isDone: true },
        ],
      });
    mocks.taskUpdate.mockResolvedValue({ id: 'task-1', status: 'DONE' });

    const result = await toggleSubtask({ subtaskId: 'subtask-2', isDone: true });

    expect(result.success).toBe(true);
    expect(mocks.taskUpdate).toHaveBeenCalledWith({
      where: { id: 'task-1' },
      data: { status: 'DONE', completedAt: expect.any(Date) },
    });
  });
});
