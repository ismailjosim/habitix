'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { DataPanel } from '@/components/shared';
import { updateProfile } from '@/lib/actions/profile';
import { uploadFile } from '@/lib/upload-client';
import { useEffect, useRef, useState } from 'react';
import { ImageUploadDropzone } from '@/components/ui/image-upload-dropzone';
import type { ProfileData } from '@/lib/queries/profile';

interface ProfileFormProps {
  profile: ProfileData;
}

export function ProfileForm({ profile }: ProfileFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [displayName, setDisplayName] = useState(profile.displayName);
  const [bio, setBio] = useState(profile.bio || '');
  const [institution, setInstitution] = useState(profile.institution || '');
  const [department, setDepartment] = useState(profile.department || '');
  const [message, setMessage] = useState('');
  const [messageSuccess, setMessageSuccess] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState(profile.avatarUrl || '');
  const previewObjectUrl = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      if (previewObjectUrl.current) URL.revokeObjectURL(previewObjectUrl.current);
    };
  }, []);

  function selectImage(file: File | null) {
    if (previewObjectUrl.current) URL.revokeObjectURL(previewObjectUrl.current);
    previewObjectUrl.current = file ? URL.createObjectURL(file) : null;
    setImageFile(file);
    setImagePreview(previewObjectUrl.current ?? profile.avatarUrl ?? '');
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setMessageSuccess(false);

    const result = await updateProfile({
      displayName,
      bio: bio || null,
      institution: institution || null,
      department: department || null,
    });

    if (result.success) {
      setMessage('Profile updated successfully');
      setMessageSuccess(true);
    } else {
      setMessage(result.message);
    }
    setLoading(false);
  }

  async function handleImageSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!imageFile) return setMessage('Choose an image first');
    setLoading(true);
    setMessage('');
    setMessageSuccess(false);

    try {
      const result = await uploadFile(imageFile, 'avatar');
      setMessage('Profile photo updated successfully!');
      setMessageSuccess(true);
      if (previewObjectUrl.current) URL.revokeObjectURL(previewObjectUrl.current);
      previewObjectUrl.current = null;
      setImagePreview(result.url);
      setImageFile(null);
      router.refresh();
    } catch (err: unknown) {
      setMessage(err instanceof Error ? err.message : 'Failed to update profile photo');
      setMessageSuccess(false);
    } finally {
      setLoading(false);
    }
  }

  return (
    <DataPanel title="Personal Information" description="Update your profile details">
      <form
        onSubmit={handleImageSubmit}
        className="mb-6 rounded-2xl border border-border bg-card/60 p-5 shadow-xs"
      >
        <h3 className="mb-1 text-sm font-semibold text-foreground">Profile Picture</h3>
        <p className="mb-4 text-xs text-muted-foreground">
          Upload and crop your avatar directly to Cloudinary.
        </p>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <ImageUploadDropzone
            value={imagePreview}
            onChange={(file) => selectImage(file)}
            aspectRatio="square"
            label=""
            description="Drag or click to choose photo"
            disabled={loading}
          />
          <div className="space-y-2">
            <Button type="submit" disabled={loading || !imageFile}>
              {loading ? 'Uploading to Cloudinary...' : 'Save photo'}
            </Button>
            {imageFile && (
              <p className="text-xs text-muted-foreground">
                Click &quot;Save photo&quot; to commit changes to Cloudinary.
              </p>
            )}
          </div>
        </div>
      </form>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="profile-name" className="text-sm font-medium">
            Name
          </label>
          <Input
            id="profile-name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Your name"
            disabled={loading}
          />
        </div>

        <div>
          <label htmlFor="profile-bio" className="text-sm font-medium">
            About Me
          </label>
          <Textarea
            id="profile-bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Tell us about yourself..."
            disabled={loading}
            rows={3}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="profile-institution" className="text-sm font-medium">
              Institution
            </label>
            <Input
              id="profile-institution"
              value={institution}
              onChange={(e) => setInstitution(e.target.value)}
              placeholder="University/School"
              disabled={loading}
            />
          </div>
          <div>
            <label htmlFor="profile-department" className="text-sm font-medium">
              Department
            </label>
            <Input
              id="profile-department"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              placeholder="Your department"
              disabled={loading}
            />
          </div>
        </div>

        {message && (
          <div
            role="status"
            aria-live="polite"
            className={`rounded-md px-3 py-2 text-sm ${
              messageSuccess ? 'bg-success-soft text-success' : 'bg-destructive/10 text-destructive'
            }`}
          >
            {message}
          </div>
        )}

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? 'Saving...' : 'Save Changes'}
        </Button>
      </form>
    </DataPanel>
  );
}
