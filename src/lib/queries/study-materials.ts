import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getCurrentUserProfile } from '@/lib/session';

export async function getStudyMaterials({ search = '', module = 'all', page = 1 } = {}) {
  const current = await getCurrentUserProfile();
  if (!current)
    return { materials: [], modules: [], canManage: false, total: 0, page: 1, pageSize: 12 };
  const canManage = ['MENTOR', 'ADMIN', 'MODERATOR'].includes(current.profile.role);
  const memberships = await prisma.teamMembership.findMany({
    where: { profileId: current.profile.id, leftAt: null },
    select: { teamId: true },
  });
  const teamIds = memberships.map(({ teamId }) => teamId);
  const safePage = Math.max(1, page);
  const pageSize = 12;
  const safeSearch = search.trim().slice(0, 100);
  const where = {
    ...(canManage ? {} : { isPublished: true }),
    ...(module !== 'all' ? { module } : {}),
    ...(safeSearch
      ? {
          OR: [
            { title: { contains: safeSearch, mode: 'insensitive' as const } },
            { author: { contains: safeSearch, mode: 'insensitive' as const } },
            { description: { contains: safeSearch, mode: 'insensitive' as const } },
            { module: { contains: safeSearch, mode: 'insensitive' as const } },
          ],
        }
      : {}),
    AND: [
      {
        OR: [
          { visibility: 'PUBLIC' as const },
          { visibility: 'ORGANIZATION' as const },
          ...(teamIds.length ? [{ visibility: 'TEAM' as const, teamId: { in: teamIds } }] : []),
          { ownerProfileId: current.profile.id },
        ],
      },
    ],
  };

  const [materials, total, moduleRows] = await Promise.all([
    prisma.studyMaterial.findMany({
      where,
      include: {
        owner: { select: { displayName: true } },
        tags: { select: { tag: true } },
        _count: { select: { views: true } },
      },
      orderBy: [{ module: 'asc' }, { milestone: 'asc' }, { createdAt: 'desc' }],
      skip: (safePage - 1) * pageSize,
      take: pageSize,
    }),
    prisma.studyMaterial.count({ where }),
    prisma.studyMaterial.findMany({
      where: { AND: where.AND, ...(canManage ? {} : { isPublished: true }), module: { not: null } },
      distinct: ['module'],
      select: { module: true },
      orderBy: { module: 'asc' },
    }),
  ]);
  const modules = [
    ...new Set(
      moduleRows.map((item) => item.module).filter((item): item is string => Boolean(item))
    ),
  ];
  return { materials, modules, canManage, total, page: safePage, pageSize };
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
