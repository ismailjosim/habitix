import Image from 'next/image';
import { IconPhoto, IconPlus } from '@tabler/icons-react';
import { Button } from '@/components/ui/button';
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
import { formatLabel, helpDeskTopics, helpDeskUrgencies } from './help-desk.utils';

interface CreateHelpPostModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  canCreatePost: boolean;
  onSubmit: (formData: FormData) => void;
  isPending: boolean;
  error: string | null;
  imagePreview: string | null;
  onImageChange: (file: File | null) => void;
}

export function CreateHelpPostModal({
  open,
  onOpenChange,
  canCreatePost,
  onSubmit,
  isPending,
  error,
  imagePreview,
  onImageChange,
}: CreateHelpPostModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button
          disabled={!canCreatePost}
          className="bg-focus text-focus-foreground hover:bg-cyan-600"
        >
          <IconPlus /> Ask for help
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form action={onSubmit} className="space-y-4">
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
                {helpDeskTopics.map((topic) => (
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
                {helpDeskUrgencies.map((urgency) => (
                  <SelectItem key={urgency} value={urgency}>
                    {formatLabel(urgency)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Input name="tags" placeholder="Optional tags, comma separated" />

          <div className="space-y-2">
            <label htmlFor="help-image" className="flex items-center gap-2 text-sm font-medium">
              <IconPhoto className="size-4" /> Optional screenshot
            </label>
            <Input
              id="help-image"
              name="image"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={(event) => {
                const file = event.target.files?.[0] || null;
                onImageChange(file);
              }}
            />
            <p className="text-xs text-muted-foreground">
              Attach one JPG, PNG, WebP, or GIF up to 8 MB.
            </p>
            {imagePreview && (
              <div className="relative aspect-video overflow-hidden rounded-xl border bg-muted">
                <Image
                  src={imagePreview}
                  alt="Selected attachment preview"
                  fill
                  className="object-contain"
                  unoptimized
                />
              </div>
            )}
          </div>

          {error && (
            <div
              role="alert"
              className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
            >
              {error}
            </div>
          )}

          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              Post request
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
