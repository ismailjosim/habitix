'use server';

import { prisma } from '@/lib/prisma';
import { getCurrentSession } from '@/lib/session';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

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
