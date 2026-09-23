'use client';

import { useState } from 'react';
import { IconMessageCircle, IconPhoto, IconX } from '@tabler/icons-react';
import type { TaskDetail } from '@/lib/queries/task-detail';
import { formatDateTime } from '@/lib/display-helpers';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { ImageUploadDropzone } from '@/components/ui/image-upload-dropzone';
import { uploadFile } from '@/lib/upload-client';

interface TaskCommentsCardProps {
  task: TaskDetail;
  isPending: boolean;
  onComment: (formData: FormData) => void;
}

export function TaskCommentsCard({ task, isPending, onComment }: TaskCommentsCardProps) {
  const [showAttach, setShowAttach] = useState(false);
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [commentText, setCommentText] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!commentText.trim() && !attachedFile) return;

    setUploading(true);
    setUploadError(null);

    let finalBody = commentText.trim();

    try {
      if (attachedFile) {
        const uploadRes = await uploadFile(attachedFile, 'help-desk');
        if (uploadRes?.url) {
          finalBody = finalBody
            ? `${finalBody}\n\n![Screenshot](${uploadRes.url})`
            : `![Screenshot](${uploadRes.url})`;
        }
      }

      const formData = new FormData();
      formData.set('body', finalBody);
      onComment(formData);
      setCommentText('');
      setAttachedFile(null);
      setShowAttach(false);
    } catch (err: unknown) {
      setUploadError(err instanceof Error ? err.message : 'Failed to upload attachment');
    } finally {
      setUploading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Comments</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="space-y-3">
          <Textarea
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Add a comment or explanation..."
            rows={3}
            required={!attachedFile}
          />

          {showAttach && (
            <div className="rounded-xl border border-dashed border-border bg-muted/30 p-3">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-semibold text-foreground">Attach Screenshot</span>
                <button
                  type="button"
                  onClick={() => {
                    setShowAttach(false);
                    setAttachedFile(null);
                  }}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <IconX className="size-4" />
                </button>
              </div>
              <ImageUploadDropzone
                onChange={(file) => setAttachedFile(file)}
                aspectRatio="video"
                label=""
                description="Drag & drop or click to attach image/screenshot to this comment"
                maxSizeMB={8}
                disabled={uploading || isPending}
              />
            </div>
          )}

          {uploadError && <p className="text-xs font-medium text-destructive">{uploadError}</p>}

          <div className="flex items-center gap-2">
            <Button type="submit" disabled={isPending || uploading}>
              <IconMessageCircle />
              {uploading ? 'Uploading image...' : 'Comment'}
            </Button>
            {!showAttach && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowAttach(true)}
                disabled={isPending || uploading}
              >
                <IconPhoto className="mr-1.5 size-4" />
                Attach Screenshot
              </Button>
            )}
          </div>
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
                  <div className="mt-1">{renderCommentBody(comment.body)}</div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function renderCommentBody(body: string) {
  const imgRegex = /!\[([^\]]*)\]\((https?:\/\/[^\s)]+)\)/g;
  const images: string[] = [];
  let match;
  while ((match = imgRegex.exec(body)) !== null) {
    images.push(match[2]);
  }
  const cleanText = body.replace(imgRegex, '').trim();

  return (
    <div className="space-y-2">
      {cleanText && (
        <p className="whitespace-pre-wrap text-sm text-muted-foreground">{cleanText}</p>
      )}
      {images.map((url, i) => (
        <a
          key={i}
          href={url}
          target="_blank"
          rel="noreferrer"
          className="block max-w-sm overflow-hidden rounded-xl border border-border bg-card shadow-xs transition hover:opacity-90"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={url}
            alt="Attached screenshot"
            className="max-h-56 w-auto rounded-lg object-contain"
          />
        </a>
      ))}
    </div>
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
