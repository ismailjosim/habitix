import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getCurrentUserProfile } from '@/lib/session';

export async function getStudyMaterials({ search = '', module = 'all' } = {}) {
  const current = await getCurrentUserProfile();
  if (!current) return { materials: [], modules: [], canManage: false };
  const canManage = ['MENTOR', 'ADMIN', 'MODERATOR'].includes(current.profile.role);
  const memberships = await prisma.teamMembership.findMany({
    where: { profileId: current.profile.id, leftAt: null },
    select: { teamId: true },
  });
  const teamIds = memberships.map(({ teamId }) => teamId);

  const materials = await prisma.studyMaterial.findMany({
    where: {
      ...(canManage ? {} : { isPublished: true }),
      ...(module !== 'all' ? { module } : {}),
      ...(search
        ? {
            OR: [
              { title: { contains: search, mode: 'insensitive' } },
              { description: { contains: search, mode: 'insensitive' } },
              { module: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {}),
      OR: [
        { visibility: 'PUBLIC' },
        { visibility: 'ORGANIZATION' },
        ...(teamIds.length ? [{ visibility: 'TEAM' as const, teamId: { in: teamIds } }] : []),
        { ownerProfileId: current.profile.id },
      ],
    },
    include: {
      owner: { select: { displayName: true } },
      tags: { select: { tag: true } },
      _count: { select: { views: true } },
    },
    orderBy: [{ module: 'asc' }, { milestone: 'asc' }, { createdAt: 'desc' }],
  });
  const modules = [
    ...new Set(
      materials.map((item) => item.module).filter((item): item is string => Boolean(item))
    ),
  ];
  return { materials, modules, canManage };
}

export async function getStudyMaterial(id: string) {
  const current = await getCurrentUserProfile();
  if (!current) notFound();
  const memberships = await prisma.teamMembership.findMany({
    where: { profileId: current.profile.id, leftAt: null },
    select: { teamId: true },
  });
  const teamIds = memberships.map(({ teamId }) => teamId);
  const canManage = ['MENTOR', 'ADMIN', 'MODERATOR'].includes(current.profile.role);
  const material = await prisma.studyMaterial.findUnique({
    where: { id },
    include: {
      owner: { select: { displayName: true } },
      tags: true,
      _count: { select: { views: true } },
    },
  });
  if (!material) notFound();
  const isOwner = material.ownerProfileId === current.profile.id;
  const isVisible =
    material.visibility === 'PUBLIC' ||
    material.visibility === 'ORGANIZATION' ||
    (material.visibility === 'TEAM' &&
      Boolean(material.teamId && teamIds.includes(material.teamId))) ||
    isOwner;
  if (!isVisible || (!material.isPublished && !canManage && !isOwner)) notFound();
  const canEdit =
    ['ADMIN', 'MODERATOR'].includes(current.profile.role) ||
    (current.profile.role === 'MENTOR' && material.ownerProfileId === current.profile.id);
  return { material, canManage, canEdit };
}
