'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { requireModuleAccess } from '@/lib/authorization';
import { prisma } from '@/lib/prisma';

const roles = ['STUDENT', 'MENTOR', 'ADMIN', 'MODERATOR', 'CORPORATE_VIEWER'] as const;
const teamRoles = ['MEMBER', 'LEAD', 'MENTOR', 'ADMIN', 'VIEWER'] as const;

const updateUserSchema = z.object({
  profileId: z.string().min(1),
  displayName: z.string().trim().min(1).max(100),
  role: z.enum(roles),
  institution: z.string().trim().max(200).optional(),
  department: z.string().trim().max(200).optional(),
  teamId: z.string().optional(),
  teamRole: z.enum(teamRoles).default('MEMBER'),
});

const createTeamSchema = z.object({
  name: z.string().trim().min(2).max(100),
  slug: z
    .string()
    .trim()
    .min(2)
    .max(80)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Use lowercase letters, numbers, and hyphens'),
});

export async function updateManagedUser(input: z.input<typeof updateUserSchema>) {
  try {
    const current = await requireModuleAccess('admin');
    const data = updateUserSchema.parse(input);

    if (current.profile.id === data.profileId && data.role !== 'ADMIN') {
      const adminCount = await prisma.userProfile.count({ where: { role: 'ADMIN' } });
      if (adminCount <= 1) throw new Error('The last admin cannot remove their own admin role');
    }

    await prisma.$transaction(async (tx) => {
      await tx.userProfile.update({
        where: { id: data.profileId },
        data: {
          displayName: data.displayName,
          role: data.role,
          institution: data.institution || null,
          department: data.department || null,
        },
      });

      await tx.teamMembership.updateMany({
        where: { profileId: data.profileId, leftAt: null },
        data: { leftAt: new Date() },
      });

      if (data.teamId) {
        await tx.teamMembership.upsert({
          where: { teamId_profileId: { teamId: data.teamId, profileId: data.profileId } },
          update: { role: data.teamRole, leftAt: null },
          create: { teamId: data.teamId, profileId: data.profileId, role: data.teamRole },
        });
      }
    });

    revalidatePath('/admin/users');
    revalidatePath('/team');
    revalidatePath('/help-desk');
    return { success: true as const, message: 'User access updated' };
  } catch (error) {
    return {
      success: false as const,
      message: error instanceof Error ? error.message : 'Could not update the user',
    };
  }
}

export async function createManagedTeam(input: z.input<typeof createTeamSchema>) {
  try {
    const current = await requireModuleAccess('admin');
    const data = createTeamSchema.parse(input);
    const team = await prisma.team.create({
      data: {
        name: data.name,
        slug: data.slug,
        ownerProfileId: current.profile.id,
        memberships: {
          create: { profileId: current.profile.id, role: 'ADMIN' },
        },
      },
    });
    revalidatePath('/admin/users');
    revalidatePath('/team');
    return { success: true as const, message: 'Team created', teamId: team.id };
  } catch (error) {
    return {
      success: false as const,
      message: error instanceof Error ? error.message : 'Could not create the team',
    };
  }
}
