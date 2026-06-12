import { prisma } from '@/lib/prisma';

export const PRESENCE_STALE_AFTER_MS = 90_000;

export async function touchPresence(profileId: string) {
  const now = new Date();

  return prisma.presence.upsert({
    where: { profileId },
    update: { lastSeenAt: now },
    create: { profileId, lastSeenAt: now },
  });
}
