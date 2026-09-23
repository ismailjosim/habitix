'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { IconCamera, IconPhoto } from '@tabler/icons-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
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
import { ImageUploadDropzone } from '@/components/ui/image-upload-dropzone';
import { RoleBadge } from '@/components/shared';
import { uploadFile } from '@/lib/upload-client';
import type { ProfileData } from '@/lib/queries/profile';

interface ProfileHeaderProps {
  profile: ProfileData;
}

export function ProfileHeader({ profile }: ProfileHeaderProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [currentAvatar, setCurrentAvatar] = useState(profile.avatarUrl);

  const initials = profile.displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  async function handleAvatarSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedFile) {
      setError('Please choose an image first.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await uploadFile(selectedFile, 'avatar');
      setSuccess('Profile picture updated!');
      setCurrentAvatar(res.url);
      setSelectedFile(null);
      setTimeout(() => {
        setOpen(false);
        setSuccess(null);
        router.refresh();
      }, 1000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to upload photo');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-primary via-primary to-primary-hover px-6 py-10 text-primary-foreground shadow-[0_24px_60px_rgba(249,115,91,0.22)]">
      <div className="pointer-events-none absolute -right-16 -top-24 size-72 rounded-full bg-white/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-28 left-1/3 size-64 rounded-full bg-warning/20 blur-3xl" />
      <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center">
        <div className="group relative">
          <Avatar className="relative h-24 w-24 border-4 border-white/90 shadow-xl">
            <AvatarImage src={currentAvatar || undefined} />
            <AvatarFallback className="bg-primary text-lg font-semibold text-primary-foreground">
              {initials}
            </AvatarFallback>
          </Avatar>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 text-white opacity-0 transition-opacity group-hover:opacity-100"
            title="Change profile photo"
          >
            <IconCamera className="size-6" />
          </button>
        </div>

        <div className="relative flex-1 space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h1 className="text-3xl font-bold tracking-tight">{profile.displayName}</h1>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-white/40 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20 hover:text-white"
                >
                  <IconPhoto className="mr-1.5 size-4" />
                  Change Photo
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <form onSubmit={handleAvatarSubmit}>
                  <DialogHeader>
                    <DialogTitle>Update Profile Photo</DialogTitle>
                    <DialogDescription>
                      Upload a new avatar. Photos are optimized and cropped to 512x512 with face
                      centering on Cloudinary.
                    </DialogDescription>
                  </DialogHeader>

                  <div className="py-4">
                    <ImageUploadDropzone
                      value={currentAvatar}
                      onChange={(file) => setSelectedFile(file)}
                      aspectRatio="square"
                      label="New Avatar"
                      description="Drag and drop or browse for JPG, PNG, or WebP"
                      maxSizeMB={8}
                    />

                    {error && <p className="mt-2 text-xs font-medium text-destructive">{error}</p>}
                    {success && (
                      <p className="mt-2 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                        {success}
                      </p>
                    )}
                  </div>

                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setOpen(false)}
                      disabled={loading}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={loading || !selectedFile}>
                      {loading ? 'Uploading...' : 'Save Avatar'}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
          <p className="text-primary-foreground/80">{profile.email}</p>

          <div className="flex flex-wrap gap-2 pt-2">
            <RoleBadge role={profile.role} />
            {profile.team && (
              <Badge
                variant="secondary"
                className="border border-white/30 bg-white/90 text-slate-800 shadow-sm"
              >
                {profile.team.name}
              </Badge>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
