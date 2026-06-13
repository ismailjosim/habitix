'use client';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { DataPanel } from '@/components/shared';
import { updateProfile } from '@/lib/actions/profile';
import { useState } from 'react';
import type { ProfileData } from '@/lib/queries/profile';

interface ProfileFormProps {
  profile: ProfileData;
}

export function ProfileForm({ profile }: ProfileFormProps) {
  const [loading, setLoading] = useState(false);
  const [displayName, setDisplayName] = useState(profile.displayName);
  const [bio, setBio] = useState(profile.bio || '');
  const [institution, setInstitution] = useState(profile.institution || '');
  const [department, setDepartment] = useState(profile.department || '');
  const [message, setMessage] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const result = await updateProfile({
      displayName,
      bio: bio || null,
      institution: institution || null,
      department: department || null,
    });

    if (result.success) {
      setMessage('Profile updated successfully');
    } else {
      setMessage(result.message);
    }
    setLoading(false);
  }

  return (
    <DataPanel title="Personal Information" description="Update your profile details">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="profile-name" className="text-sm font-medium">Name</label>
          <Input
            id="profile-name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Your name"
            disabled={loading}
          />
        </div>

        <div>
          <label htmlFor="profile-bio" className="text-sm font-medium">About Me</label>
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
            <label htmlFor="profile-institution" className="text-sm font-medium">Institution</label>
            <Input
              id="profile-institution"
              value={institution}
              onChange={(e) => setInstitution(e.target.value)}
              placeholder="University/School"
              disabled={loading}
            />
          </div>
          <div>
            <label htmlFor="profile-department" className="text-sm font-medium">Department</label>
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
              message.includes('success')
                ? 'bg-success-soft text-success'
                : 'bg-destructive/10 text-destructive'
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
