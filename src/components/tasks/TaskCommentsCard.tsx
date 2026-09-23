import { IconMessageCircle } from '@tabler/icons-react';
import type { TaskDetail } from '@/lib/queries/task-detail';
import { formatDateTime } from '@/lib/display-helpers';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';

interface TaskCommentsCardProps {
  task: TaskDetail;
  isPending: boolean;
  onComment: (formData: FormData) => void;
}

export function TaskCommentsCard({ task, isPending, onComment }: TaskCommentsCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Comments</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <form action={onComment} className="space-y-3">
          <Textarea name="body" placeholder="Add a comment" rows={3} required />
          <Button type="submit" disabled={isPending}>
            <IconMessageCircle />
            Comment
          </Button>
        </form>

        <Separator />

        <div className="space-y-4">
          {task.comments.length === 0 ? (
            <p className="text-sm text-muted-foreground">No comments yet.</p>
          ) : (
            task.comments.map((comment) => (
              <div key={comment.id} className="flex gap-3">
                <Avatar>
                  <AvatarImage src={comment.author.avatarUrl ?? undefined} />
                  <AvatarFallback>{getInitials(comment.author.displayName)}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1 rounded-lg bg-muted/50 p-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-semibold">{comment.author.displayName}</span>
                    <span className="text-xs text-muted-foreground">
                      {formatDateTime(comment.createdAt)}
                    </span>
                  </div>
                  <p className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground">
                    {comment.body}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function getInitials(name: string) {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}
