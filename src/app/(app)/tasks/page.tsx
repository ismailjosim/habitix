import { TaskBoard } from '@/components/tasks/task-board';
import { LAYOUT_CONSTRAINTS } from '@/lib/layout-constraints';
import { getTaskBoardData } from '@/lib/queries/tasks';

export default async function TasksPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; category?: string; page?: string }>;
}) {
  const params = await searchParams;
  const filters = {
    q: params.q,
    status: params.status,
    category: params.category,
    page: Number(params.page) || 1,
  };
  const {
    personalTasks,
    assignedTasks,
    assignableStudents,
    assignableTeams,
    currentRole,
    currentProfileId,
    canAssignTasks,
    total,
    page,
    pageSize,
    categories,
  } = await getTaskBoardData(filters);

  return (
    <div className={`${LAYOUT_CONSTRAINTS.pageMaxWidth} ${LAYOUT_CONSTRAINTS.pagePadding} mx-auto`}>
      <TaskBoard
        personalTasks={personalTasks}
        assignedTasks={assignedTasks}
        assignableStudents={assignableStudents}
        assignableTeams={assignableTeams}
        currentRole={currentRole}
        currentProfileId={currentProfileId}
        canAssignTasks={canAssignTasks}
        filters={filters}
        total={total}
        page={page}
        pageSize={pageSize}
        categories={categories}
      />
    </div>
  );
}
