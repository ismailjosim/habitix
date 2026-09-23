'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { IconHelp } from '@tabler/icons-react';

import { createHelpPost, createHelpResponse, resolveHelpPost } from '@/lib/actions/help-desk';
import { EmptyState, PaginationLinks } from '@/components/shared';
import { HelpDeskHeader } from './HelpDeskHeader';
import { HelpDeskStatsGrid } from './HelpDeskStatsGrid';
import { HelpDeskFilters } from './HelpDeskFilters';
import { HelpPostCard } from './HelpPostCard';
import type { HelpDeskBoardProps, HelpDeskTopic, HelpDeskUrgency } from './types';

export function HelpDeskBoard({ data, filters }: HelpDeskBoardProps) {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(data.posts[0]?.id ?? null);
  const [error, setError] = useState<string | null>(null);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function submitPost(formData: FormData) {
    startTransition(async () => {
      const file =
        formData.get('image') instanceof File && (formData.get('image') as File).size > 0
          ? (formData.get('image') as File)
          : selectedImageFile;

      const result = await createHelpPost({
        title: String(formData.get('title') ?? ''),
        body: String(formData.get('body') ?? ''),
        topic: String(formData.get('topic') ?? 'Other') as HelpDeskTopic,
        urgency: String(formData.get('urgency') ?? 'MEDIUM') as HelpDeskUrgency,
        tags: String(formData.get('tags') ?? '')
          .split(',')
          .map((tag) => tag.trim())
          .filter(Boolean),
        image: file,
      });
      if (!result.success) return setError(result.message);
      setError(null);
      if (imagePreview) URL.revokeObjectURL(imagePreview);
      setImagePreview(null);
      setSelectedImageFile(null);
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

  function handleImageChange(file: File | null) {
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview(file ? URL.createObjectURL(file) : null);
    setSelectedImageFile(file);
  }

  return (
    <div className="space-y-6">
      <HelpDeskHeader
        teamName={data.teamName}
        canCreatePost={data.canCreatePost}
        dialogOpen={dialogOpen}
        setDialogOpen={setDialogOpen}
        submitPost={submitPost}
        isPending={isPending}
        error={error}
        imagePreview={imagePreview}
        onImageChange={handleImageChange}
      />

      <HelpDeskStatsGrid stats={data.stats} />

      <HelpDeskFilters filters={filters} topics={data.topics} />

      {error && !dialogOpen && (
        <div
          role="alert"
          className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          {error}
        </div>
      )}

      <section className="space-y-4">
        {data.posts.length === 0 ? (
          <EmptyState
            icon={<IconHelp className="size-10" />}
            title="No matching help requests"
            description={
              data.canCreatePost
                ? 'Try clearing a filter or start a new conversation.'
                : 'Try clearing a filter. An admin must assign you to a team before you can post.'
            }
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
