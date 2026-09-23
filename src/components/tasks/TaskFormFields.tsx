import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { taskCategories, taskPriorities } from './tasks.utils';

interface TaskFormFieldsProps {
  error: string | null;
  titleId: string;
  dueDateId: string;
  subtaskId: string;
}

export function TaskFormFields({ error, titleId, dueDateId, subtaskId }: TaskFormFieldsProps) {
  return (
    <>
      {error && (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <label className="text-sm font-medium" htmlFor={titleId}>
          Title
        </label>
        <Input id={titleId} name="title" placeholder="Build API validation" required />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium" htmlFor={`${titleId}-description`}>
          Description
        </label>
        <Textarea
          id={`${titleId}-description`}
          name="description"
          placeholder="Add useful context"
          rows={3}
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="space-y-2">
          <label htmlFor={`${titleId}-category`} className="text-sm font-medium">
            Category
          </label>
          <Select name="category" defaultValue="Coding">
            <SelectTrigger id={`${titleId}-category`} className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {taskCategories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label htmlFor={`${titleId}-priority`} className="text-sm font-medium">
            Priority
          </label>
          <Select name="priority" defaultValue="MEDIUM">
            <SelectTrigger id={`${titleId}-priority`} className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {taskPriorities.map((priority) => (
                <SelectItem key={priority} value={priority}>
                  {priority.charAt(0) + priority.slice(1).toLowerCase()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor={dueDateId}>
            Due date
          </label>
          <Input id={dueDateId} name="dueAt" type="date" />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium" htmlFor={subtaskId}>
          Subtasks
        </label>
        <Textarea id={subtaskId} name="subtasks" placeholder="One subtask per line" rows={3} />
      </div>
    </>
  );
}
