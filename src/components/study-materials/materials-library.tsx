'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useTransition, useRef } from 'react';
import { IconBook2, IconFileTypePdf, IconPlus, IconUpload, IconX } from '@tabler/icons-react';
import { createStudyMaterialWithUpload } from '@/lib/actions/study-materials';
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
import { EmptyState, PaginationLinks } from '@/components/shared';

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
  const [file, setFile] = useState<File | null>(null);
  const [pending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0];
    if (selected) {
      if (selected.size > 15 * 1024 * 1024) {
        setError('File size must be under 15MB.');
        return;
      }
      setFile(selected);
      setError(null);
    }
  }

  function create(formData: FormData) {
    startTransition(async () => {
      if (file) {
        formData.set('file', file);
      }
      const result = await createStudyMaterialWithUpload(formData);
      if (!result.success) return setError(result.message);
      setOpen(false);
      setError(null);
      setFile(null);
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
          <Dialog
            open={open}
            onOpenChange={(v) => {
              setOpen(v);
              if (!v) {
                setError(null);
                setFile(null);
              }
            }}
          >
            <DialogTrigger asChild>
              <Button>
                <IconPlus /> Add material
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
              <form action={create} className="space-y-3">
                <DialogHeader>
                  <DialogTitle>Create Study Resource</DialogTitle>
                  <DialogDescription>
                    Upload a PDF or document to Cloudinary, or enter an external URL.
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Title *</label>
                  <Input
                    aria-label="Resource title"
                    name="title"
                    placeholder="e.g. System Design Handbook"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Author</label>
                  <Input aria-label="Book author" name="author" placeholder="e.g. Alex Xu" />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Description</label>
                  <Textarea
                    aria-label="Description"
                    name="description"
                    placeholder="Brief description of the material..."
                    rows={2}
                  />
                </div>

                {/* Cloudinary File Upload section */}
                <div className="rounded-xl border border-dashed border-border bg-muted/30 p-3.5">
                  <label className="mb-1 block text-xs font-semibold text-foreground">
                    Upload File to Cloudinary (PDF, Docs up to 15MB)
                  </label>
                  {file ? (
                    <div className="flex items-center justify-between rounded-lg bg-card p-2.5 border text-xs">
                      <div className="flex items-center gap-2 overflow-hidden">
                        <IconFileTypePdf className="size-5 shrink-0 text-red-500" />
                        <span className="truncate font-medium">{file.name}</span>
                        <span className="shrink-0 text-muted-foreground">
                          ({(file.size / (1024 * 1024)).toFixed(2)} MB)
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setFile(null);
                          if (fileInputRef.current) fileInputRef.current.value = '';
                        }}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <IconX className="size-4" />
                      </button>
                    </div>
                  ) : (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="flex cursor-pointer flex-col items-center justify-center gap-1.5 py-3 text-center transition hover:opacity-80"
                    >
                      <IconUpload className="size-6 text-muted-foreground" />
                      <p className="text-xs font-medium text-foreground">
                        Click or drag to upload document
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        PDF, EPUB, DOCX up to 15MB
                      </p>
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.epub,.doc,.docx,application/pdf"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </div>

                <div className="relative flex py-1 items-center">
                  <div className="flex-grow border-t border-border"></div>
                  <span className="flex-shrink mx-3 text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
                    Or External URL
                  </span>
                  <div className="flex-grow border-t border-border"></div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">
                    Resource URL {file ? '(Optional if file uploaded)' : '*'}
                  </label>
                  <Input
                    aria-label="Resource URL"
                    name="url"
                    type="url"
                    placeholder="https://example.com/handbook.pdf"
                    required={!file}
                  />
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground">Module *</label>
                    <Input aria-label="Module" name="module" placeholder="e.g. Next.js" required />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground">Milestone</label>
                    <Input aria-label="Milestone" name="milestone" placeholder="e.g. Milestone 3" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Tags</label>
                  <Input aria-label="Tags" name="tags" placeholder="e.g. react, nextjs, advanced" />
                </div>

                <label className="flex items-center gap-2 pt-1 text-sm">
                  <input type="checkbox" name="published" defaultChecked /> Publish immediately
                </label>

                {error && (
                  <p role="alert" className="text-xs font-medium text-destructive">
                    {error}
                  </p>
                )}

                <DialogFooter className="pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setOpen(false)}
                    disabled={pending}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={pending}>
                    {pending ? 'Uploading & Creating...' : 'Create Resource'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </header>
      <form className="flex flex-col gap-2 sm:flex-row">
        <Input
          aria-label="Search study materials"
          name="search"
          defaultValue={search}
          placeholder="Search books, modules..."
        />
        <select
          aria-label="Filter by module"
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
        <EmptyState
          icon={<IconBook2 className="size-10" />}
          title="No matching materials"
          description="Try another search or module filter."
        />
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
      <PaginationLinks
        page={data.page}
        pageSize={data.pageSize}
        total={data.total}
        params={{ search: search || undefined, module: module === 'all' ? undefined : module }}
      />
    </div>
  );
}
