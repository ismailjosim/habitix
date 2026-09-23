import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client';

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
});

async function main() {
  const [users, tasks, help, materials, focus, notifs, leaderboard, badges, teams, comments] =
    await Promise.all([
      prisma.userProfile.count(),
      prisma.task.count(),
      prisma.helpPost.count(),
      prisma.studyMaterial.count(),
      prisma.focusSession.count(),
      prisma.notification.count(),
      prisma.leaderboardEntry.count(),
      prisma.badgeAward.count(),
      prisma.team.count(),
      prisma.taskComment.count(),
    ]);
  console.log('=== DEMO SEED VERIFICATION ===');
  console.log(`User Profiles  : ${users}`);
  console.log(`Teams          : ${teams}`);
  console.log(`Tasks          : ${tasks}`);
  console.log(`Task Comments  : ${comments}`);
  console.log(`Help Posts     : ${help}`);
  console.log(`Study Materials: ${materials}`);
  console.log(`Focus Sessions : ${focus}`);
  console.log(`Notifications  : ${notifs}`);
  console.log(`Leaderboard    : ${leaderboard}`);
  console.log(`Badge Awards   : ${badges}`);
  console.log('==============================');

  const profiles = await prisma.userProfile.findMany({
    select: { displayName: true, role: true, currentStreak: true, totalFocusMinutes: true },
    orderBy: { createdAt: 'asc' },
  });
  console.log('\nUser profiles:');
  for (const p of profiles) {
    console.log(
      `  ${p.displayName} (${p.role}) — streak: ${p.currentStreak}, focus: ${p.totalFocusMinutes}m`
    );
  }

  const taskList = await prisma.task.findMany({
    select: { title: true, status: true, type: true, priority: true },
    orderBy: { createdAt: 'asc' },
  });
  console.log('\nTasks:');
  for (const t of taskList) {
    console.log(`  [${t.status}] ${t.title} (${t.type}, ${t.priority})`);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
