import { TaskDetailView } from '@/components/tasks/task-detail-view';
import { LAYOUT_CONSTRAINTS } from '@/lib/layout-constraints';
import { getTaskDetail } from '@/lib/queries/task-detail';

interface TaskDetailPageProps {
  params: Promise<{
    taskId: string;
  }>;
}

export default async function TaskDetailPage({ params }: TaskDetailPageProps) {
  const { taskId } = await params;
  const task = await getTaskDetail(taskId);

  return (
    <div className={`${LAYOUT_CONSTRAINTS.pageMaxWidth} ${LAYOUT_CONSTRAINTS.pagePadding} mx-auto`}>
      <TaskDetailView task={task} />
    </div>
  );
}
