import 'dotenv/config';

import { prisma } from '../src/lib/prisma';

async function main() {
  const profileCount = await prisma.userProfile.count();

  console.log(`Database connection ok. User profiles: ${profileCount}`);
}

main()
  .catch((error) => {
    console.error('Database connection failed.');
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
