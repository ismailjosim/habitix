import 'dotenv/config';

import { prisma } from '../src/lib/prisma';

const email = process.argv[2]?.trim().toLowerCase();

if (!email) {
  throw new Error('Usage: npm run admin:promote -- user@example.com');
}

const user = await prisma.user.findUnique({
  where: { email },
  select: { profile: { select: { id: true, displayName: true } } },
});

if (!user?.profile) {
  throw new Error(`No profile was found for ${email}. Sign in once before promoting the account.`);
}

await prisma.userProfile.update({
  where: { id: user.profile.id },
  data: { role: 'ADMIN' },
});

console.log(`${user.profile.displayName} (${email}) is now an ADMIN.`);
await prisma.$disconnect();
