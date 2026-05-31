import { headers } from 'next/headers';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function getCurrentSession() {
  return auth.api.getSession({
    headers: await headers(),
  });
}

export async function getCurrentUserProfile() {
  const session = await getCurrentSession();

  if (!session) {
    return null;
  }

  const profile = await prisma.userProfile.upsert({
    where: {
      authUserId: session.user.id,
    },
    update: {
      displayName: session.user.name,
      avatarUrl: session.user.image,
    },
    create: {
      authUserId: session.user.id,
      displayName: session.user.name,
      avatarUrl: session.user.image,
      role: 'STUDENT',
      preferences: {
        create: {},
      },
    },
  });

  return {
    session,
    profile,
  };
}
