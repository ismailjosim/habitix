import type { FocusTaskOption } from '@/lib/queries/focus';
import { Button } from '@/components/ui/button';
import { CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { activityTypes, durationOptions } from './focus.utils';
import type { TimerState } from './types';

interface FocusTimerControlsProps {
  durationMinutes: number;
  activityType: string;
  taskId: string;
  tasks: FocusTaskOption[];
  timerState: TimerState;
  isPending: boolean;
  onDurationChange: (duration: number) => void;
  onActivityChange: (activity: string) => void;
  onTaskChange: (taskId: string) => void;
}

export function FocusTimerControls({
  durationMinutes,
  activityType,
  taskId,
  tasks,
  timerState,
  isPending,
  onDurationChange,
  onActivityChange,
  onTaskChange,
}: FocusTimerControlsProps) {
  const isLocked = timerState === 'running' || timerState === 'paused' || isPending;

  return (
    <CardHeader className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <CardTitle className="text-base">Timer</CardTitle>
        <div className="flex flex-wrap gap-2">
          {durationOptions.map((duration) => (
            <Button
              key={duration}
              type="button"
              variant={durationMinutes === duration ? 'secondary' : 'outline'}
              disabled={isLocked}
              onClick={() => onDurationChange(duration)}
            >
              {duration}m
            </Button>
          ))}
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="focus-activity" className="text-sm font-medium">
            Activity
          </label>
          <Select value={activityType} onValueChange={onActivityChange} disabled={isLocked}>
            <SelectTrigger id="focus-activity" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {activityTypes.map((activity) => (
                <SelectItem key={activity} value={activity}>
                  {activity}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label htmlFor="focus-task" className="text-sm font-medium">
            Related task
          </label>
          <Select value={taskId} onValueChange={onTaskChange} disabled={isLocked}>
            <SelectTrigger id="focus-task" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No task</SelectItem>
              {tasks.map((task) => (
                <SelectItem key={task.id} value={task.id}>
                  {task.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </CardHeader>
  );
}
