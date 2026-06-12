'use server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getCurrentUserProfile } from '@/lib/session';

const createSchema = z.object({
  title: z.string().trim().min(3).max(180),
  description: z.string().trim().max(2000).optional(),
  url: z.string().url(),
  module: z.string().trim().min(1).max(80),
  milestone: z.string().trim().max(80).optional(),
  isPublished: z.boolean().default(false),
  tags: z.array(z.string().trim().min(1).max(30)).max(8).default([]),
});

export async function createStudyMaterial(input: z.input<typeof createSchema>) {
  try {
    const current = await getCurrentUserProfile();
    if (!current || !['MENTOR', 'ADMIN', 'MODERATOR'].includes(current.profile.role))
      throw new Error('Only mentors and admins can create materials');
    const data = createSchema.parse(input);
    const membership = await prisma.teamMembership.findFirst({
      where: { profileId: current.profile.id, leftAt: null },
      select: { teamId: true },
    });
    await prisma.studyMaterial.create({
      data: {
        title: data.title,
        description: data.description || null,
        type: 'FILE',
        url: data.url,
        ownerProfileId: current.profile.id,
        teamId: membership?.teamId,
        visibility: membership ? 'TEAM' : 'ORGANIZATION',
        module: data.module,
        milestone: data.milestone || null,
        isPublished: data.isPublished,
        publishedAt: data.isPublished ? new Date() : null,
        tags: { create: [...new Set(data.tags)].map((tag) => ({ tag })) },
      },
    });
    revalidatePath('/study-materials');
    return { success: true as const };
  } catch (error) {
    return {
      success: false as const,
      message: error instanceof Error ? error.message : 'Could not create material',
    };
  }
}

export async function trackStudyMaterial(input: {
  materialId: string;
  action: 'view' | 'download';
}) {
  const current = await getCurrentUserProfile();
  if (!current) return { success: false as const };
  await prisma.studyMaterialView.create({
    data: { materialId: input.materialId, profileId: current.profile.id, action: input.action },
  });
  return { success: true as const };
}
