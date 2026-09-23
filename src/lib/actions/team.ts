'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { getCurrentUserProfile } from '@/lib/session';
import { uploadImage, deleteImage, extractPublicIdFromUrl } from '@/lib/cloudinary';

export async function updateTeamAvatar(teamId: string, formData: FormData) {
  try {
    const current = await getCurrentUserProfile();
    if (!current) throw new Error('Unauthorized');

    const image = formData.get('image');
    if (!(image instanceof File)) throw new Error('Choose an image to upload');

    // Check permissions: owner, or leader/mentor/admin
    const team = await prisma.team.findUnique({
      where: { id: teamId },
      include: {
        memberships: {
          where: { profileId: current.profile.id, leftAt: null },
        },
      },
    });

    if (!team) throw new Error('Team was not found');

    const isOwner = team.ownerProfileId === current.profile.id;
    const isGlobalAdmin = current.profile.role === 'ADMIN';
    const isTeamLeaderOrMentor = team.memberships.some((m) =>
      ['LEAD', 'ADMIN', 'MENTOR'].includes(m.role)
    );

    if (!isOwner && !isGlobalAdmin && !isTeamLeaderOrMentor) {
      throw new Error('Only team leaders, mentors, and admins can change the team avatar');
    }

    const uploaded = await uploadImage(image, {
      folder: `habitix/teams/${team.id}`,
      transformation: [
        { width: 512, height: 512, crop: 'fill', gravity: 'center', quality: 'auto' },
      ],
    });

    const oldAvatarUrl = team.avatarUrl;
    await prisma.team.update({
      where: { id: team.id },
      data: { avatarUrl: uploaded.url },
    });

    if (oldAvatarUrl) {
      const oldPublicId = extractPublicIdFromUrl(oldAvatarUrl);
      if (oldPublicId) {
        deleteImage(oldPublicId).catch(() => undefined);
      }
    }

    revalidatePath('/team');
    revalidatePath('/dashboard');
    return { success: true as const, message: 'Team avatar updated', url: uploaded.url };
  } catch (error) {
    console.error('Update team avatar error:', error);
    return {
      success: false as const,
      message: error instanceof Error ? error.message : 'Failed to update team avatar',
    };
  }
}
