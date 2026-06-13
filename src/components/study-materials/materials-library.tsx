'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { IconBook2, IconFileTypePdf, IconPlus } from '@tabler/icons-react';
import { createStudyMaterial } from '@/lib/actions/study-materials';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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

type LibraryData = Awaited<
  ReturnType<typeof import('@/lib/queries/study-materials').getStudyMaterials>
>;

export function MaterialsLibrary({
  data,
  search,
  module,
}: {
  data: LibraryData;
  search: string;
  module: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  function create(formData: FormData) {
    startTransition(async () => {
      const result = await createStudyMaterial({
        title: String(formData.get('title') || ''),
        author: String(formData.get('author') || ''),
        description: String(formData.get('description') || ''),
        url: String(formData.get('url') || ''),
        module: String(formData.get('module') || ''),
        milestone: String(formData.get('milestone') || ''),
        isPublished: formData.get('published') === 'on',
        tags: String(formData.get('tags') || '')
          .split(',')
          .map((x) => x.trim())
          .filter(Boolean),
      });
      if (!result.success) return setError(result.message);
      setOpen(false);
      setError(null);
      router.refresh();
    });
  }
  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">PDF books and resources</p>
          <h1 className="text-3xl font-bold">Study Materials</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Browse mentor-curated books by module and milestone.
          </p>
        </div>
        {data.canManage && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <IconPlus /> Add material
              </Button>
            </DialogTrigger>
            <DialogContent>
              <form action={create} className="space-y-3">
                <DialogHeader>
                  <DialogTitle>Create PDF resource</DialogTitle>
                  <DialogDescription>Add metadata and an external PDF URL.</DialogDescription>
                </DialogHeader>
                <Input name="title" placeholder="Resource title" required />
                <Input name="author" placeholder="Book author" />
                <Textarea name="description" placeholder="Description" />
                <Input name="url" type="url" placeholder="https://.../book.pdf" required />
                <div className="grid gap-3 sm:grid-cols-2">
                  <Input name="module" placeholder="Module" required />
                  <Input name="milestone" placeholder="Milestone" />
                </div>
                <Input name="tags" placeholder="Tags, comma separated" />
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" name="published" /> Publish now
                </label>
                {error && <p className="text-sm text-destructive">{error}</p>}
                <DialogFooter>
                  <Button disabled={pending}>Create</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </header>
      <form className="flex flex-col gap-2 sm:flex-row">
        <Input name="search" defaultValue={search} placeholder="Search books, modules..." />
        <select
          name="module"
          defaultValue={module}
          className="h-8 rounded-lg border bg-background px-3 text-sm"
        >
          <option value="all">All modules</option>
          {data.modules.map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>
        <Button type="submit" variant="outline">
          Filter
        </Button>
      </form>
      {data.materials.length === 0 ? (
        <Card>
          <CardContent className="p-10 text-center text-sm text-muted-foreground">
            No materials match this view.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {data.materials.map((item) => (
            <Card key={item.id}>
              <CardContent className="space-y-4 p-5">
                <div className="flex items-start justify-between">
                  <span className="grid size-11 place-items-center rounded-xl bg-red-100 text-red-700">
                    <IconFileTypePdf />
                  </span>
                  <Badge variant={item.isPublished ? 'secondary' : 'outline'}>
                    {item.isPublished ? 'Published' : 'Draft'}
                  </Badge>
                </div>
                <div>
                  <p className="text-xs font-medium text-primary">
                    {item.module ?? 'General'}
                    {item.milestone ? ` · ${item.milestone}` : ''}
                  </p>
                  <h2 className="mt-1 font-semibold">{item.title}</h2>
                  {item.author && <p className="text-xs text-muted-foreground">by {item.author}</p>}
                  <p className="mt-1 line-clamp-3 text-sm text-muted-foreground">
                    {item.description || 'PDF learning resource'}
                  </p>
                </div>
                <div className="flex flex-wrap gap-1">
                  {item.tags.map((tag) => (
                    <Badge key={tag.tag} variant="outline">
                      {tag.tag}
                    </Badge>
                  ))}
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{item.owner.displayName}</span>
                  <span>{item._count.views} actions</span>
                </div>
                <Button asChild className="w-full">
                  <Link href={`/study-materials/${item.id}`}>
                    <IconBook2 /> View resource
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
