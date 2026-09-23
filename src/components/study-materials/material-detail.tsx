'use client';
import { useRouter } from 'next/navigation';
import { useRef, useState, useTransition } from 'react';
import {
  IconDownload,
  IconEdit,
  IconExternalLink,
  IconFileTypePdf,
  IconUpload,
  IconX,
} from '@tabler/icons-react';
import { trackStudyMaterial, updateStudyMaterialWithUpload } from '@/lib/actions/study-materials';
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
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [pending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0];
    if (selected) {
      if (selected.size > 15 * 1024 * 1024) {
        setError('File size must be under 15MB.');
        return;
      }
      setSelectedFile(selected);
      setError(null);
    }
  }

  function open(action: 'view' | 'download') {
    void trackStudyMaterial({ materialId: material.id, action });
  }

  function update(formData: FormData) {
    startTransition(async () => {
      formData.set('materialId', material.id);
      if (selectedFile) {
        formData.set('file', selectedFile);
      }
      const result = await updateStudyMaterialWithUpload(formData);
      if (!result.success) return setError(result.message);
      setEditOpen(false);
      setError(null);
      setSelectedFile(null);
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
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground">Title *</label>
                    <Input name="title" defaultValue={material.title} required />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground">Author</label>
                    <Input
                      name="author"
                      defaultValue={material.author ?? ''}
                      placeholder="Book author"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground">Description</label>
                    <Textarea
                      name="description"
                      defaultValue={material.description ?? ''}
                      rows={2}
                    />
                  </div>

                  {/* Cloudinary replacement file upload */}
                  <div className="rounded-xl border border-dashed border-border bg-muted/30 p-3.5">
                    <label className="mb-1 block text-xs font-semibold text-foreground">
                      Upload Replacement File (PDF, Docs up to 15MB)
                    </label>
                    {selectedFile ? (
                      <div className="flex items-center justify-between rounded-lg bg-card p-2.5 border text-xs">
                        <div className="flex items-center gap-2 overflow-hidden">
                          <IconFileTypePdf className="size-5 shrink-0 text-red-500" />
                          <span className="truncate font-medium">{selectedFile.name}</span>
                          <span className="shrink-0 text-muted-foreground">
                            ({(selectedFile.size / (1024 * 1024)).toFixed(2)} MB)
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedFile(null);
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
                          Click or drag to upload new PDF/document
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          Replaces existing file on Cloudinary
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
                    <div className="grow border-t border-border"></div>
                    <span className="shrink mx-3 text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
                      Or Resource URL
                    </span>
                    <div className="grow border-t border-border"></div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground">
                      Resource URL {selectedFile ? '(Optional if new file uploaded)' : '*'}
                    </label>
                    <Input
                      name="url"
                      type="url"
                      defaultValue={material.url ?? ''}
                      required={!selectedFile}
                    />
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-muted-foreground">Module *</label>
                      <Input name="module" defaultValue={material.module ?? ''} required />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-muted-foreground">Milestone</label>
                      <Input name="milestone" defaultValue={material.milestone ?? ''} />
                    </div>
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
