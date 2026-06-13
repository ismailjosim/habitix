'use server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getCurrentUserProfile } from '@/lib/session';
import { canAccessModule, canEditStudyMaterial, canManageStudyMaterials } from '@/lib/permissions';

const createSchema = z.object({
  title: z.string().trim().min(3).max(180),
  author: z.string().trim().max(120).optional(),
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
    if (!current || !canManageStudyMaterials(current.profile.role))
      throw new Error('Only mentors and admins can create materials');
    const data = createSchema.parse(input);
    const membership = await prisma.teamMembership.findFirst({
      where: { profileId: current.profile.id, leftAt: null },
      select: { teamId: true },
    });
    await prisma.studyMaterial.create({
      data: {
        title: data.title,
        author: data.author || null,
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

const updateSchema = createSchema.extend({
  materialId: z.string().min(1),
});

export async function updateStudyMaterial(input: z.input<typeof updateSchema>) {
  try {
    const current = await getCurrentUserProfile();
    if (!current || !canManageStudyMaterials(current.profile.role))
      throw new Error('Only mentors and admins can edit materials');
    const data = updateSchema.parse(input);
    const existing = await prisma.studyMaterial.findUnique({
      where: { id: data.materialId },
      select: { ownerProfileId: true, isPublished: true },
    });
    if (!existing) throw new Error('Material not found');
    if (!canEditStudyMaterial(current.profile.role, current.profile.id, existing.ownerProfileId))
      throw new Error('You can only edit materials you created');

    await prisma.studyMaterial.update({
      where: { id: data.materialId },
      data: {
        title: data.title,
        author: data.author || null,
        description: data.description || null,
        url: data.url,
        module: data.module,
        milestone: data.milestone || null,
        isPublished: data.isPublished,
        publishedAt: data.isPublished ? (existing.isPublished ? undefined : new Date()) : null,
        tags: {
          deleteMany: {},
          create: [...new Set(data.tags)].map((tag) => ({ tag })),
        },
      },
    });
    revalidatePath('/study-materials');
    revalidatePath(`/study-materials/${data.materialId}`);
    return { success: true as const };
  } catch (error) {
    return {
      success: false as const,
      message: error instanceof Error ? error.message : 'Could not update material',
    };
  }
}

export async function trackStudyMaterial(input: {
  materialId: string;
  action: 'view' | 'download';
}) {
  const current = await getCurrentUserProfile();
  if (!current || !canAccessModule(current.profile.role, 'materials')) {
    return { success: false as const };
  }
  const memberships = await prisma.teamMembership.findMany({
    where: { profileId: current.profile.id, leftAt: null },
    select: { teamId: true },
  });
  const teamIds = memberships.map(({ teamId }) => teamId);
  const canManage = canManageStudyMaterials(current.profile.role);
  const material = await prisma.studyMaterial.findFirst({
    where: {
      id: input.materialId,
      ...(!canManage ? { isPublished: true } : {}),
      OR: [
        { visibility: 'PUBLIC' },
        { visibility: 'ORGANIZATION' },
        ...(teamIds.length ? [{ visibility: 'TEAM' as const, teamId: { in: teamIds } }] : []),
        { ownerProfileId: current.profile.id },
      ],
    },
    select: { id: true },
  });
  if (!material) return { success: false as const };
  await prisma.studyMaterialView.create({
    data: { materialId: material.id, profileId: current.profile.id, action: input.action },
  });
  return { success: true as const };
}
