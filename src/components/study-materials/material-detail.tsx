'use client';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { IconDownload, IconEdit, IconExternalLink, IconFileTypePdf } from '@tabler/icons-react';
import { trackStudyMaterial, updateStudyMaterial } from '@/lib/actions/study-materials';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import { Textarea } from '@/components/ui/textarea';

type Detail = Awaited<ReturnType<typeof import('@/lib/queries/study-materials').getStudyMaterial>>;
export function MaterialDetail({ data }: { data: Detail }) {
  const { material } = data;
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  function open(action: 'view' | 'download') {
    void trackStudyMaterial({ materialId: material.id, action });
  }
  function update(formData: FormData) {
    startTransition(async () => {
      const result = await updateStudyMaterial({
        materialId: material.id,
        title: String(formData.get('title') || ''),
        author: String(formData.get('author') || ''),
        description: String(formData.get('description') || ''),
        url: String(formData.get('url') || ''),
        module: String(formData.get('module') || ''),
        milestone: String(formData.get('milestone') || ''),
        isPublished: formData.get('published') === 'on',
        tags: String(formData.get('tags') || '')
          .split(',')
          .map((tag) => tag.trim())
          .filter(Boolean),
      });
      if (!result.success) return setError(result.message);
      setEditOpen(false);
      setError(null);
      router.refresh();
    });
  }
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-start gap-4">
        <span className="grid size-14 place-items-center rounded-xl bg-red-100 text-red-700">
          <IconFileTypePdf className="size-7" />
        </span>
        <div>
          <p className="text-sm text-primary">
            {material.module ?? 'General'}
            {material.milestone ? ` · ${material.milestone}` : ''}
          </p>
          <h1 className="text-3xl font-bold">{material.title}</h1>
          {material.author && <p className="text-sm text-muted-foreground">by {material.author}</p>}
          <p className="mt-1 text-sm text-muted-foreground">
            Curated by {material.owner.displayName} · {material._count.views} tracked actions
          </p>
        </div>
      </div>
      <Card>
        <CardContent className="space-y-5 p-6">
          <p className="whitespace-pre-wrap leading-7">
            {material.description || 'No description provided.'}
          </p>
          <div className="flex flex-wrap gap-2">
            {material.tags.map((tag) => (
              <Badge key={tag.id} variant="outline">
                {tag.tag}
              </Badge>
            ))}
          </div>
          {material.url ? (
            <div className="flex gap-2">
              <Button asChild onClick={() => open('view')}>
                <a href={material.url} target="_blank" rel="noreferrer">
                  <IconExternalLink /> Open PDF
                </a>
              </Button>
              <Button asChild variant="outline" onClick={() => open('download')}>
                <a href={material.url} download>
                  <IconDownload /> Download
                </a>
              </Button>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No file URL is available.</p>
          )}
          {data.canEdit && (
            <Dialog open={editOpen} onOpenChange={setEditOpen}>
              <DialogTrigger asChild>
                <Button variant="secondary">
                  <IconEdit /> Edit material
                </Button>
              </DialogTrigger>
              <DialogContent>
                <form action={update} className="space-y-3">
                  <DialogHeader>
                    <DialogTitle>Edit PDF resource</DialogTitle>
                    <DialogDescription>
                      Update its metadata, URL, and publication status.
                    </DialogDescription>
                  </DialogHeader>
                  <Input name="title" defaultValue={material.title} required />
                  <Input
                    name="author"
                    defaultValue={material.author ?? ''}
                    placeholder="Book author"
                  />
                  <Textarea name="description" defaultValue={material.description ?? ''} />
                  <Input name="url" type="url" defaultValue={material.url ?? ''} required />
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Input name="module" defaultValue={material.module ?? ''} required />
                    <Input name="milestone" defaultValue={material.milestone ?? ''} />
                  </div>
                  <Input
                    name="tags"
                    defaultValue={material.tags.map(({ tag }) => tag).join(', ')}
                    placeholder="Tags, comma separated"
                  />
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" name="published" defaultChecked={material.isPublished} />
                    Published
                  </label>
                  {error && <p className="text-sm text-destructive">{error}</p>}
                  <DialogFooter>
                    <Button disabled={pending}>Save changes</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
