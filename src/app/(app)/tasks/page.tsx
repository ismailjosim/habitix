import { TaskBoard } from '@/components/tasks/task-board';
import { LAYOUT_CONSTRAINTS } from '@/lib/layout-constraints';
import { getTaskBoardData } from '@/lib/queries/tasks';

export default async function TasksPage() {
  const {
    personalTasks,
    assignedTasks,
    assignableStudents,
    assignableTeams,
    currentRole,
    currentProfileId,
    canAssignTasks,
  } = await getTaskBoardData();

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
      />
    </div>
  );
}
