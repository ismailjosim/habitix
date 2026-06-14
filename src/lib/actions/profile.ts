'use server';

import { prisma } from '@/lib/prisma';
import { getCurrentSession } from '@/lib/session';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { deleteImage, uploadImage } from '@/lib/cloudinary';

const updateProfileSchema = z.object({
  displayName: z.string().min(1, 'Name is required').max(100),
  bio: z.string().max(500).optional().nullable(),
  timezone: z.string().optional(),
  institution: z.string().max(200).optional().nullable(),
  department: z.string().max(200).optional().nullable(),
});

type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

export async function updateProfile(data: UpdateProfileInput) {
  try {
    const session = await getCurrentSession();
    if (!session) {
      throw new Error('Unauthorized');
    }

    // Validate input
    const validatedData = updateProfileSchema.parse(data);

    // Update profile
    const updated = await prisma.userProfile.update({
      where: { authUserId: session.user.id },
      data: {
        displayName: validatedData.displayName,
        bio: validatedData.bio,
        timezone: validatedData.timezone,
        institution: validatedData.institution,
        department: validatedData.department,
      },
    });

    // Revalidate profile page
    revalidatePath('/profile');

    return {
      success: true,
      message: 'Profile updated successfully',
      data: updated,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        message: 'Validation error',
        errors: error.issues,
      };
    }

    console.error('Profile update error:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to update profile',
    };
  }
}

export async function updateProfileImage(formData: FormData) {
  let uploadedPublicId: string | null = null;

  try {
    const session = await getCurrentSession();
    if (!session) throw new Error('Unauthorized');

    const image = formData.get('image');
    if (!(image instanceof File)) throw new Error('Choose an image to upload');

    const currentProfile = await prisma.userProfile.findUnique({
      where: { authUserId: session.user.id },
      select: { avatarPublicId: true },
    });
    if (!currentProfile) throw new Error('Profile was not found');

    const uploaded = await uploadImage(image, {
      folder: `habitix/profiles/${session.user.id}`,
      transformation: [{ width: 512, height: 512, crop: 'fill', gravity: 'face', quality: 'auto' }],
    });
    uploadedPublicId = uploaded.publicId;

    await prisma.userProfile.update({
      where: { authUserId: session.user.id },
      data: { avatarUrl: uploaded.url, avatarPublicId: uploaded.publicId },
    });

    if (currentProfile.avatarPublicId && currentProfile.avatarPublicId !== uploaded.publicId) {
      await deleteImage(currentProfile.avatarPublicId).catch(() => undefined);
    }

    revalidatePath('/profile');
    revalidatePath('/team');
    revalidatePath('/dashboard');
    revalidatePath('/help-desk');
    return { success: true as const, message: 'Profile image updated', url: uploaded.url };
  } catch (error) {
    if (uploadedPublicId) await deleteImage(uploadedPublicId).catch(() => undefined);
    return {
      success: false as const,
      message: error instanceof Error ? error.message : 'Failed to update profile image',
    };
  }
}
