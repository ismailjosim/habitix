import 'dotenv/config';

import { betterAuth } from 'better-auth/minimal';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { nextCookies } from 'better-auth/next-js';

import { serverEnv } from '@/lib/env';
import { prisma } from '@/lib/prisma';

export const auth = betterAuth({
  baseURL: serverEnv.BETTER_AUTH_URL,
  secret: serverEnv.BETTER_AUTH_SECRET,
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
  emailAndPassword: {
    enabled: true,
  },
  trustedOrigins:
    process.env.NODE_ENV === 'production'
      ? [serverEnv.BETTER_AUTH_URL]
      : [serverEnv.BETTER_AUTH_URL, 'http://localhost:3001', 'http://localhost:3002'],
  databaseHooks: {
    user: {
      create: {
        async after(user) {
          await prisma.userProfile.upsert({
            where: {
              authUserId: user.id,
            },
            update: {
              displayName: user.name,
              avatarUrl: user.image,
            },
            create: {
              authUserId: user.id,
              displayName: user.name,
              avatarUrl: user.image,
              role: 'STUDENT',
              preferences: {
                create: {},
              },
            },
          });
        },
      },
    },
  },
  plugins: [nextCookies()],
});
