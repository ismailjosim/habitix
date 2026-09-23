import Image from 'next/image';
import type { HelpDeskPost } from '@/lib/queries/help-desk';
import { formatDateTime } from '@/lib/display-helpers';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { formatLabel } from './help-desk.utils';

interface HelpPostCardProps {
  post: HelpDeskPost;
  expanded: boolean;
  currentProfileId: string | null;
  currentRole: string | null;
  canParticipate: boolean;
  disabled: boolean;
  onToggle: () => void;
  onRespond: (postId: string, formData: FormData) => void;
  onResolve: (postId: string, responseId?: string) => void;
}

export function HelpPostCard({
  post,
  expanded,
  currentProfileId,
  currentRole,
  canParticipate,
  disabled,
  onToggle,
  onRespond,
  onResolve,
}: HelpPostCardProps) {
  const canRespond =
    canParticipate && post.author.id !== currentProfileId && post.status !== 'RESOLVED';
  const canResolve =
    post.status !== 'RESOLVED' &&
    (post.author.id === currentProfileId ||
      ['ADMIN', 'MODERATOR', 'MENTOR'].includes(currentRole ?? ''));

  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={post.status === 'RESOLVED' ? 'secondary' : 'outline'}>
                {formatLabel(post.status)}
              </Badge>
              <Badge variant="outline">{formatLabel(post.urgency)}</Badge>
              {post.tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
            <h2 className="mt-3 text-lg font-semibold">{post.title}</h2>
            <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{post.body}</p>
            <p className="mt-3 text-xs text-muted-foreground">
              {post.author.displayName} • {formatDateTime(post.createdAt)} • {post.helperCount} peer
              helper{post.helperCount === 1 ? '' : 's'}
            </p>
          </div>
          <Button type="button" variant="outline" onClick={onToggle}>
            {expanded ? 'Close' : `View ${post.responses.length} responses`}
          </Button>
        </div>

        {expanded && (
          <div className="mt-5 space-y-4 border-t pt-5">
            <p className="whitespace-pre-wrap text-sm leading-6">{post.body}</p>
            {post.imageUrl && (
              <a
                href={post.imageUrl}
                target="_blank"
                rel="noreferrer"
                className="relative block aspect-video overflow-hidden rounded-xl border bg-muted"
              >
                <Image
                  src={post.imageUrl}
                  alt={`Attachment for ${post.title}`}
                  fill
                  sizes="(min-width: 1024px) 800px, 100vw"
                  className="object-contain"
                />
              </a>
            )}
            {post.responses.map((response) => (
              <div key={response.id} className="rounded-lg border bg-muted/30 p-3">
                <div className="flex items-center gap-2">
                  <Avatar className="size-7">
                    <AvatarImage src={response.author.avatarUrl ?? ''} />
                    <AvatarFallback>{response.author.displayName[0]}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium">{response.author.displayName}</span>
                  <Badge variant="outline" className="text-xs">
                    {formatLabel(response.author.role)}
                  </Badge>
                  {response.isAccepted && <Badge>Helpful</Badge>}
                </div>
                <p className="mt-2 whitespace-pre-wrap text-sm">{response.body}</p>
                <p className="mt-2 text-xs text-muted-foreground">
                  {formatDateTime(response.createdAt)}
                </p>
                {canResolve && response.author.id !== post.author.id && (
                  <Button
                    type="button"
                    size="sm"
                    className="mt-3"
                    disabled={disabled}
                    onClick={() => onResolve(post.id, response.id)}
                  >
                    Resolve + award 2 points
                  </Button>
                )}
              </div>
            ))}
            {canResolve && (
              <Button
                type="button"
                variant="outline"
                disabled={disabled}
                onClick={() => onResolve(post.id)}
              >
                Mark as resolved
              </Button>
            )}
            {canRespond && (
              <form action={(formData) => onRespond(post.id, formData)} className="space-y-2">
                <Textarea
                  name="body"
                  placeholder="Share a useful answer or next step..."
                  required
                />
                <Button type="submit" disabled={disabled}>
                  Help
                </Button>
              </form>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
