import { IconPlus } from '@tabler/icons-react';
import { Button } from '@/components/ui/button';
import { ImageUploadDropzone } from '@/components/ui/image-upload-dropzone';
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

          <ImageUploadDropzone
            name="image"
            value={imagePreview}
            aspectRatio="video"
            label="Optional screenshot"
            description="Drag & drop or click to upload an error screenshot to Cloudinary"
            onChange={(file) => onImageChange(file)}
            disabled={isPending}
          />

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
