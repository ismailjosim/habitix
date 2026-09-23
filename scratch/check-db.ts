import 'dotenv/config';
import { prisma } from '../src/lib/prisma';

async function main() {
  const users = await prisma.user.findMany({
    select: { id: true, email: true, name: true },
  });
  console.log('USERS IN DB:', users);
  const profiles = await prisma.userProfile.findMany({
    select: { id: true, authUserId: true, displayName: true, role: true },
  });
  console.log('PROFILES IN DB:', profiles);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
