import { IconMessageCircle } from '@tabler/icons-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDate, getStatusLabel } from '@/lib/display-helpers';

interface CorporateStudentFeedbackCardProps {
  feedback: {
    id: string;
    body: string;
    taskTitle: string;
    createdAt: Date;
    author: {
      displayName: string;
      role: string;
    };
  }[];
}

export function CorporateStudentFeedbackCard({ feedback }: CorporateStudentFeedbackCardProps) {
  return (
    <Card className="break-inside-avoid">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <IconMessageCircle className="size-5 text-primary" /> Team Feedback
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 md:grid-cols-2 print:grid-cols-2">
          {feedback.map((comment) => (
            <blockquote key={comment.id} className="rounded-lg border bg-muted/30 p-4">
              <p className="text-sm leading-6">&quot;{comment.body}&quot;</p>
              <footer className="mt-2 text-xs text-muted-foreground">
                {comment.author.displayName} • {getStatusLabel(comment.author.role)} •{' '}
                {comment.taskTitle} • {formatDate(comment.createdAt)}
              </footer>
            </blockquote>
          ))}
          {!feedback.length && (
            <p className="rounded-lg border border-dashed p-5 text-center text-sm text-muted-foreground">
              No mentor or admin feedback in this period.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
