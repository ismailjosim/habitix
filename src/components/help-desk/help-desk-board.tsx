'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { IconHelp, IconMessage, IconPlus, IconUsers } from '@tabler/icons-react';

import { createHelpPost, createHelpResponse, resolveHelpPost } from '@/lib/actions/help-desk';
import type { HelpDeskData, HelpDeskPost } from '@/lib/queries/help-desk';
import { formatDateTime } from '@/lib/display-helpers';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { EmptyState, PaginationLinks } from '@/components/shared';

const topics = [
  'Coding',
  'Styling',
  'Frontend',
  'Backend',
  'Database',
  'Learning',
  'Other',
] as const;
const urgencies = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'] as const;

export function HelpDeskBoard({
  data,
  filters,
}: {
  data: HelpDeskData;
  filters: { q: string; status: string; topic: string };
}) {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(data.posts[0]?.id ?? null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function submitPost(formData: FormData) {
    startTransition(async () => {
      const result = await createHelpPost({
        title: String(formData.get('title') ?? ''),
        body: String(formData.get('body') ?? ''),
        topic: String(formData.get('topic') ?? 'Other') as (typeof topics)[number],
        urgency: String(formData.get('urgency') ?? 'MEDIUM') as (typeof urgencies)[number],
        tags: String(formData.get('tags') ?? '')
          .split(',')
          .map((tag) => tag.trim())
          .filter(Boolean),
      });
      if (!result.success) return setError(result.message);
      setError(null);
      setDialogOpen(false);
      router.refresh();
    });
  }

  function submitResponse(postId: string, formData: FormData) {
    startTransition(async () => {
      const result = await createHelpResponse({ postId, body: String(formData.get('body') ?? '') });
      if (!result.success) return setError(result.message);
      setError(null);
      router.refresh();
    });
  }

  function resolve(postId: string, responseId?: string) {
    startTransition(async () => {
      const result = await resolveHelpPost({ postId, responseId });
      if (!result.success) return setError(result.message);
      setError(null);
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">Peer support</p>
          <h1 className="text-3xl font-bold">Help Desk</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {data.teamName
              ? `Ask and answer questions inside ${data.teamName}.`
              : 'Join a team to use peer support.'}
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button disabled={!data.canCreatePost}>
              <IconPlus /> Ask for help
            </Button>
          </DialogTrigger>
          <DialogContent>
            <form action={submitPost} className="space-y-4">
              <DialogHeader>
                <DialogTitle>Ask your team for help</DialogTitle>
                <DialogDescription>
                  Share enough context for a teammate to get started.
                </DialogDescription>
              </DialogHeader>
              <Input name="title" placeholder="What are you stuck on?" required />
              <Textarea
                name="body"
                placeholder="Describe the issue, what you tried, and the result..."
                rows={6}
                required
              />
              <div className="grid gap-3 sm:grid-cols-2">
                <Select name="topic" defaultValue="Coding">
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {topics.map((topic) => (
                      <SelectItem key={topic} value={topic}>
                        {topic}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select name="urgency" defaultValue="MEDIUM">
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {urgencies.map((urgency) => (
                      <SelectItem key={urgency} value={urgency}>
                        {label(urgency)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Input name="tags" placeholder="Optional tags, comma separated" />
              {error && <ErrorMessage message={error} />}
              <DialogFooter>
                <Button type="submit" disabled={isPending}>
                  Post request
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
        <Stat icon={IconHelp} label="Open requests" value={data.stats.open} />
        <Stat icon={IconMessage} label="Resolved" value={data.stats.resolved} />
        <Stat icon={IconUsers} label="Contributors" value={data.stats.helpers} />
        <Stat icon={IconHelp} label="Points awarded" value={data.stats.awardedPoints} />
        <Stat
          icon={IconMessage}
          label="First response"
          value={formatMinutes(data.stats.averageFirstResponseMinutes)}
        />
        <Stat
          icon={IconUsers}
          label="Resolution time"
          value={formatMinutes(data.stats.averageResolutionMinutes)}
        />
      </section>

      <form className="grid gap-2 rounded-xl border bg-card p-3 sm:grid-cols-[minmax(12rem,1fr)_11rem_11rem_auto_auto]">
        <Input name="q" defaultValue={filters.q} placeholder="Search requests, topics, or tags" />
        <select
          name="status"
          defaultValue={filters.status}
          className="h-8 rounded-lg border bg-background px-3 text-sm"
        >
          <option value="all">All statuses</option>
          {['OPEN', 'ANSWERED', 'RESOLVED'].map((status) => (
            <option key={status} value={status}>
              {label(status)}
            </option>
          ))}
        </select>
        <select
          name="topic"
          defaultValue={filters.topic}
          className="h-8 rounded-lg border bg-background px-3 text-sm"
        >
          <option value="all">All topics</option>
          {data.topics.map((topic) => (
            <option key={topic}>{topic}</option>
          ))}
        </select>
        <Button type="submit" variant="outline">
          Filter
        </Button>
        <Button asChild type="button" variant="ghost">
          <a href="/help-desk">Reset</a>
        </Button>
      </form>

      {error && !dialogOpen && <ErrorMessage message={error} />}

      <section className="space-y-4">
        {data.posts.length === 0 ? (
          <EmptyState
            icon={<IconHelp className="size-10" />}
            title="No matching help requests"
            description="Try clearing a filter or start a new conversation."
          />
        ) : (
          data.posts.map((post) => (
            <HelpPostCard
              key={post.id}
              post={post}
              expanded={expandedId === post.id}
              currentProfileId={data.currentProfileId}
              currentRole={data.currentRole}
              canParticipate={data.canParticipate}
              disabled={isPending}
              onToggle={() => setExpandedId(expandedId === post.id ? null : post.id)}
              onRespond={submitResponse}
              onResolve={resolve}
            />
          ))
        )}
      </section>
      <PaginationLinks
        page={data.page}
        pageSize={data.pageSize}
        total={data.total}
        params={{
          q: filters.q || undefined,
          status: filters.status === 'all' ? undefined : filters.status,
          topic: filters.topic === 'all' ? undefined : filters.topic,
        }}
      />
    </div>
  );
}

function HelpPostCard({
  post,
  expanded,
  currentProfileId,
  currentRole,
  canParticipate,
  disabled,
  onToggle,
  onRespond,
  onResolve,
}: {
  post: HelpDeskPost;
  expanded: boolean;
  currentProfileId: string | null;
  currentRole: string | null;
  canParticipate: boolean;
  disabled: boolean;
  onToggle: () => void;
  onRespond: (postId: string, formData: FormData) => void;
  onResolve: (postId: string, responseId?: string) => void;
}) {
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
                {label(post.status)}
              </Badge>
              <Badge variant="outline">{label(post.urgency)}</Badge>
              {post.tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
            <h2 className="mt-3 text-lg font-semibold">{post.title}</h2>
            <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{post.body}</p>
            <p className="mt-3 text-xs text-muted-foreground">
              {post.author.displayName} · {formatDateTime(post.createdAt)} · {post.helperCount} peer
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
            {post.responses.map((response) => (
              <div key={response.id} className="rounded-lg border bg-muted/30 p-3">
                <div className="flex items-center gap-2">
                  <Avatar className="size-7">
                    <AvatarImage src={response.author.avatarUrl ?? ''} />
                    <AvatarFallback>{response.author.displayName[0]}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium">{response.author.displayName}</span>
                  <Badge variant="outline" className="text-xs">
                    {label(response.author.role)}
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

function Stat({
  icon: Icon,
  label: text,
  value,
}: {
  icon: typeof IconHelp;
  label: string;
  value: string | number;
}) {
  return (
    <Card>
      <CardContent className="flex items-center justify-between p-4">
        <div>
          <p className="text-sm text-muted-foreground">{text}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
        <Icon className="size-5 text-primary" />
      </CardContent>
    </Card>
  );
}

function formatMinutes(minutes: number | null) {
  if (minutes === null) return 'No data';
  if (minutes < 60) return `${minutes}m`;
  return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
}

function ErrorMessage({ message }: { message: string }) {
  return (
    <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
      {message}
    </div>
  );
}

function label(value: string) {
  return value
    .toLowerCase()
    .split('_')
    .map((part) => part[0]?.toUpperCase() + part.slice(1))
    .join(' ');
}
