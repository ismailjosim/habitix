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
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
  account: {
    accountLinking: {
      enabled: true,
      trustedProviders: ['google'],
      requireLocalEmailVerified: false,
    },
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
    account: {
      create: {
        async after(account) {
          if (account.providerId === 'google') {
            await prisma.user.update({
              where: { id: account.userId },
              data: { emailVerified: true },
            });
          }
          // If a user profile already exists, do not overwrite their existing role
          await prisma.userProfile.upsert({
            where: {
              authUserId: account.userId,
            },
            update: {},
            create: {
              authUserId: account.userId,
              displayName: 'Student',
              avatarUrl: null,
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
