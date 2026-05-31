import 'dotenv/config';

import { prisma } from '../src/lib/prisma';

async function main() {
  console.log('Seed script placeholder: Day 05+ will add demo Habitix data.');
  await prisma.$queryRaw`SELECT 1`;
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
