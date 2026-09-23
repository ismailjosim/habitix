'use client';

import { useRouter } from 'next/navigation';
import { useMemo, useState, useTransition } from 'react';
import { createTask, changeTaskStatus } from '@/lib/actions/tasks';
import { PaginationLinks } from '@/components/shared';
import { TaskBoardHeader } from './TaskBoardHeader';
import { TaskBoardFilters } from './TaskBoardFilters';
import { TaskBoardSectionNav } from './TaskBoardSectionNav';
import { TaskBoardColumn } from './TaskBoardColumn';
import { boardStatuses, groupTasks, normalizedFilter } from './tasks.utils';
import type { BoardSection, BoardStatus, TaskBoardProps } from './types';

export function TaskBoard({
  personalTasks,
  assignedTasks,
  assignableStudents,
  assignableTeams,
  currentRole,
  currentProfileId,
  canAssignTasks,
  filters,
  total,
  page,
  pageSize,
  categories: filterCategories,
}: TaskBoardProps) {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState<BoardSection>('personal');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const activeTasks = activeSection === 'personal' ? personalTasks : assignedTasks;
  const groupedTasks = useMemo(() => groupTasks(activeTasks), [activeTasks]);
  const assignedByMe = assignedTasks.filter((task) => task.createdBy.id === currentProfileId);
  const assignedByMeDone = assignedByMe.filter((task) => task.status === 'DONE').length;
  const blockedCount = activeTasks.filter((task) => task.status === 'BLOCKED').length;
  const reviewCount = activeTasks.filter((task) => task.status === 'IN_REVIEW').length;

  function handleCreateTask(formData: FormData) {
    setError(null);

    startTransition(async () => {
      const title = String(formData.get('title') || '');
      const result = await createTask({
        title,
        description: String(formData.get('description') || ''),
        category: String(formData.get('category') || ''),
        priority: String(formData.get('priority') || 'MEDIUM'),
        dueAt: String(formData.get('dueAt') || ''),
        type: 'personal',
        subtasks: String(formData.get('subtasks') || '')
          .split('\n')
          .map((line) => line.trim())
          .filter(Boolean)
          .map((line) => ({ title: line })),
      });

      if (!result.success) {
        setError(result.message);
        return;
      }

      setDialogOpen(false);
      router.refresh();
    });
  }

  function handleAssignTask(formData: FormData) {
    setError(null);

    startTransition(async () => {
      const target = String(formData.get('target') || '');
      const [targetType, targetId] = target.split(':');

      if (!targetId || !['student', 'team'].includes(targetType)) {
        setError('Choose a student or team assignee');
        return;
      }

      const result = await createTask({
        title: String(formData.get('title') || ''),
        description: String(formData.get('description') || ''),
        category: String(formData.get('category') || ''),
        priority: String(formData.get('priority') || 'MEDIUM'),
        dueAt: String(formData.get('dueAt') || ''),
        type:
          targetType === 'team'
            ? 'team'
            : currentRole === 'ADMIN' || currentRole === 'MODERATOR'
              ? 'admin'
              : 'mentor',
        assignedToProfileId: targetType === 'student' ? targetId : null,
        teamId: targetType === 'team' ? targetId : null,
        subtasks: String(formData.get('subtasks') || '')
          .split('\n')
          .map((line) => line.trim())
          .filter(Boolean)
          .map((line) => ({ title: line })),
      });

      if (!result.success) {
        setError(result.message);
        return;
      }

      setAssignDialogOpen(false);
      setActiveSection('assigned');
      router.refresh();
    });
  }

  function moveTask(taskId: string, status: BoardStatus) {
    startTransition(async () => {
      const result = await changeTaskStatus({ taskId, status });

      if (!result.success) {
        setError(result.message);
        return;
      }

      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      <TaskBoardHeader
        canAssignTasks={canAssignTasks}
        assignDialogOpen={assignDialogOpen}
        setAssignDialogOpen={setAssignDialogOpen}
        dialogOpen={dialogOpen}
        setDialogOpen={setDialogOpen}
        handleAssignTask={handleAssignTask}
        handleCreateTask={handleCreateTask}
        isPending={isPending}
        error={error}
        assignableStudents={assignableStudents}
        assignableTeams={assignableTeams}
        assignedByMeCount={assignedByMe.length}
        assignedByMeDoneCount={assignedByMeDone}
      />

      <TaskBoardFilters filters={filters} filterCategories={filterCategories} />

      <TaskBoardSectionNav
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        personalTasksCount={personalTasks.length}
        assignedTasksCount={assignedTasks.length}
        blockedCount={blockedCount}
        reviewCount={reviewCount}
        visibleCount={activeTasks.length}
      />

      {error && !dialogOpen && !assignDialogOpen && (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="grid gap-4 xl:grid-cols-3">
        {boardStatuses.map((column) => (
          <TaskBoardColumn
            key={column.value}
            column={column}
            tasks={groupedTasks[column.value]}
            isPending={isPending}
            onMove={moveTask}
          />
        ))}
      </div>

      <PaginationLinks
        page={page}
        pageSize={pageSize}
        total={total}
        params={{
          q: filters.q,
          status: normalizedFilter(filters.status),
          category: normalizedFilter(filters.category),
        }}
      />
    </div>
  );
}
