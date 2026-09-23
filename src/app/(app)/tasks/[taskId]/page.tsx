import type { Metadata } from 'next';
import { TaskDetailView } from '@/components/tasks';
import { LAYOUT_CONSTRAINTS } from '@/lib/layout-constraints';
import { getTaskDetail } from '@/lib/queries/task-detail';

interface TaskDetailPageProps {
  params: Promise<{
    taskId: string;
  }>;
}

export async function generateMetadata({ params }: TaskDetailPageProps): Promise<Metadata> {
  const { taskId } = await params;
  try {
    const task = await getTaskDetail(taskId);
    return {
      title: `${task.title} | Habitix`,
      description: task.description || 'Task details and progress in Habitix',
    };
  } catch {
    return {
      title: 'Task Details | Habitix',
    };
  }
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
