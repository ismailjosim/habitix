import type { AppRole } from '@/generated/prisma/client';

export function profileFixture(role: AppRole = 'STUDENT') {
  return {
    id: `${role.toLowerCase()}-profile`,
    authUserId: `${role.toLowerCase()}-user`,
    displayName: role.replace('_', ' '),
    avatarUrl: null,
    role,
    institution: null,
    department: null,
    bio: null,
    currentStreak: 0,
    totalFocusMinutes: 0,
    helpPoints: 0,
    createdAt: new Date('2026-01-01T00:00:00Z'),
    updatedAt: new Date('2026-01-01T00:00:00Z'),
  };
}

export function currentUserFixture(role: AppRole = 'STUDENT') {
  const profile = profileFixture(role);
  return {
    profile,
    session: {
      session: {
        id: 'session-1',
        userId: profile.authUserId,
        expiresAt: new Date('2027-01-01T00:00:00Z'),
        token: 'test-token',
        createdAt: new Date('2026-01-01T00:00:00Z'),
        updatedAt: new Date('2026-01-01T00:00:00Z'),
        ipAddress: null,
        userAgent: null,
      },
      user: {
        id: profile.authUserId,
        name: profile.displayName,
        email: `${profile.authUserId}@example.test`,
        emailVerified: true,
        image: null,
        createdAt: new Date('2026-01-01T00:00:00Z'),
        updatedAt: new Date('2026-01-01T00:00:00Z'),
      },
    },
  };
}
