import 'dotenv/config';

import { ActivitySourceType, FocusActivityType, TaskPriority } from '../src/generated/prisma/enums';
import { prisma } from '../src/lib/prisma';
import { BADGE_DEFINITIONS } from '../src/lib/badges';

function pickOne<T>(items: readonly T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

async function main() {
  console.log('Starting seed data creation...');

  for (const definition of BADGE_DEFINITIONS) {
    await prisma.badge.upsert({
      where: { name: definition.name },
      update: definition,
      create: definition,
    });
  }

  // Create test user
  const mainUser = await prisma.user.upsert({
    where: { email: 'student@habitix.dev' },
    update: {},
    create: {
      id: 'user-1',
      name: 'ISMAIL',
      email: 'student@habitix.dev',
      emailVerified: true,
      image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ismail',
      createdAt: new Date('2026-05-01'),
      updatedAt: new Date(),
    },
  });

  // Create user profile with stats
  const mainProfile = await prisma.userProfile.upsert({
    where: { authUserId: mainUser.id },
    update: {},
    create: {
      id: 'profile-1',
      authUserId: mainUser.id,
      displayName: 'ISMAIL',
      role: 'STUDENT',
      currentStreak: 7,
      totalFocusMinutes: 420,
      helpPoints: 125,
      bio: 'Focused learner working on web development',
      createdAt: new Date('2026-05-01'),
      updatedAt: new Date(),
    },
  });

  // Create team members
  const teamMembers = [];
  for (let i = 0; i < 3; i++) {
    const member = await prisma.user.upsert({
      where: { email: `peer${i + 1}@habitix.dev` },
      update: {},
      create: {
        id: `user-peer-${i + 1}`,
        name: `Peer ${i + 1}`,
        email: `peer${i + 1}@habitix.dev`,
        emailVerified: true,
        image: `https://api.dicebear.com/7.x/avataaars/svg?seed=peer${i + 1}`,
        createdAt: new Date('2026-05-15'),
        updatedAt: new Date(),
      },
    });

    const peerProfile = await prisma.userProfile.upsert({
      where: { authUserId: member.id },
      update: {},
      create: {
        id: `profile-peer-${i + 1}`,
        authUserId: member.id,
        displayName: `Peer ${i + 1}`,
        role: 'STUDENT',
        currentStreak: Math.floor(Math.random() * 5) + 1,
        totalFocusMinutes: Math.floor(Math.random() * 500) + 100,
        helpPoints: Math.floor(Math.random() * 100),
        bio: `Learning developer #${i + 1}`,
        createdAt: new Date('2026-05-15'),
        updatedAt: new Date(),
      },
    });

    teamMembers.push(peerProfile);
  }

  // Create team
  const team = await prisma.team.upsert({
    where: { slug: 'focus-hub-beta' },
    update: {},
    create: {
      id: 'team-1',
      name: 'Focus Hub Beta',
      slug: 'focus-hub-beta',
      description: 'A beta testing team for the Habitix focus features',
      ownerProfileId: mainProfile.id,
      createdAt: new Date('2026-05-01'),
      updatedAt: new Date(),
    },
  });

  // Add team members
  await prisma.teamMembership.upsert({
    where: {
      teamId_profileId: {
        teamId: team.id,
        profileId: mainProfile.id,
      },
    },
    update: {},
    create: {
      teamId: team.id,
      profileId: mainProfile.id,
      role: 'MEMBER',
      joinedAt: new Date('2026-05-01'),
    },
  });

  for (const member of teamMembers) {
    await prisma.teamMembership.upsert({
      where: {
        teamId_profileId: {
          teamId: team.id,
          profileId: member.id,
        },
      },
      update: {},
      create: {
        teamId: team.id,
        profileId: member.id,
        role: 'MEMBER',
        joinedAt: new Date('2026-05-15'),
      },
    });
  }

  // Create focus sessions (today and past days)
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Today's sessions
  await prisma.focusSession.createMany({
    data: [
      {
        id: 'focus-1',
        profileId: mainProfile.id,
        activityType: 'STUDY',
        plannedMinutes: 60,
        actualMinutes: 45,
        status: 'COMPLETED',
        startedAt: new Date(today.getTime() + 8 * 60 * 60 * 1000),
        completedAt: new Date(today.getTime() + 8 * 60 * 60 * 1000 + 45 * 60 * 1000),
        notes: 'Completed Chapter 3 of React Advanced Patterns',
        createdAt: new Date(today.getTime() + 8 * 60 * 60 * 1000),
        updatedAt: new Date(),
      },
      {
        id: 'focus-2',
        profileId: mainProfile.id,
        activityType: 'CODING',
        plannedMinutes: 90,
        actualMinutes: 75,
        status: 'COMPLETED',
        startedAt: new Date(today.getTime() + 14 * 60 * 60 * 1000),
        completedAt: new Date(today.getTime() + 14 * 60 * 60 * 1000 + 75 * 60 * 1000),
        notes: 'Built user authentication component',
        createdAt: new Date(today.getTime() + 14 * 60 * 60 * 1000),
        updatedAt: new Date(),
      },
    ],
    skipDuplicates: true,
  });

  // Past sessions for activity heatmap
  for (let dayOffset = 1; dayOffset < 7; dayOffset++) {
    const pastDate = new Date(today);
    pastDate.setDate(pastDate.getDate() - dayOffset);

    const sessionCount = Math.floor(Math.random() * 3) + 1;
    for (let i = 0; i < sessionCount; i++) {
      const startHour = 8 + Math.floor(Math.random() * 10);
      const duration = Math.floor(Math.random() * 60) + 30;

      await prisma.focusSession.create({
        data: {
          id: `focus-past-${dayOffset}-${i}`,
          profileId: mainProfile.id,
          activityType: pickOne([
            FocusActivityType.STUDY,
            FocusActivityType.CODING,
            FocusActivityType.WRITING,
          ]),
          plannedMinutes: Math.floor(duration * 1.2),
          actualMinutes: duration,
          status: 'COMPLETED',
          startedAt: new Date(pastDate.getTime() + startHour * 60 * 60 * 1000),
          completedAt: new Date(
            pastDate.getTime() + startHour * 60 * 60 * 1000 + duration * 60 * 1000
          ),
          notes: `Session on day -${dayOffset}`,
          createdAt: new Date(pastDate.getTime() + startHour * 60 * 60 * 1000),
          updatedAt: new Date(),
        },
      });
    }
  }

  // Create tasks (mix of statuses)
  const tasks = [];
  for (let i = 0; i < 5; i++) {
    const task = await prisma.task.create({
      data: {
        id: `task-${i + 1}`,
        title: `Task ${i + 1}: ${['Build API endpoint', 'Write unit tests', 'Review PR', 'Design database schema', 'Debug performance issue'][i]}`,
        description: `A detailed description for task ${i + 1}`,
        status: i < 3 ? 'DONE' : 'TODO',
        type: 'PERSONAL',
        priority: pickOne([TaskPriority.HIGH, TaskPriority.MEDIUM, TaskPriority.LOW]),
        teamId: team.id,
        createdByProfileId: mainProfile.id,
        assignedToProfileId: mainProfile.id,
        dueAt: new Date(today.getTime() + (i + 1) * 24 * 60 * 60 * 1000),
        completedAt: i < 3 ? today : null,
        createdAt: new Date(today.getTime() - 24 * 60 * 60 * 1000),
        updatedAt: i < 3 ? today : new Date(today.getTime() - 12 * 60 * 60 * 1000),
      },
    });
    tasks.push(task);
  }

  // Create activity events
  for (let i = 0; i < 10; i++) {
    const eventDate = new Date(today);
    eventDate.setDate(eventDate.getDate() - Math.floor(Math.random() * 7));

    await prisma.activityEvent.create({
      data: {
        id: `activity-${i + 1}`,
        profileId: mainProfile.id,
        teamId: team.id,
        sourceType: pickOne([
          ActivitySourceType.FOCUS_SESSION,
          ActivitySourceType.TASK,
          ActivitySourceType.BADGE_AWARD,
        ]),
        sourceId: `source-${i}`,
        type: 'activity',
        occurredAt: eventDate,
        createdAt: eventDate,
      },
    });
  }

  // Create notifications
  const notifications = [
    {
      id: 'notif-1',
      type: 'TASK_ASSIGNED' as const,
      title: 'Task Assigned',
      body: 'You have been assigned "Build API endpoint"',
    },
    {
      id: 'notif-2',
      type: 'BADGE_AWARDED' as const,
      title: 'Badge Awarded',
      body: 'You earned the "Focus Master" badge for 50+ hours of focus',
    },
    {
      id: 'notif-3',
      type: 'HELP_RESPONSE' as const,
      title: 'Help Response',
      body: 'Someone replied to your help question about React hooks',
    },
    {
      id: 'notif-4',
      type: 'TEAM_UPDATE' as const,
      title: 'Team Update',
      body: 'Your team completed 50 focus sessions this week!',
    },
    {
      id: 'notif-5',
      type: 'TASK_DUE' as const,
      title: 'Task Due',
      body: 'Your task "Write unit tests" is due tomorrow',
    },
  ];

  for (let i = 0; i < notifications.length; i++) {
    const notificationDate = new Date(today);
    notificationDate.setDate(notificationDate.getDate() - i);

    await prisma.notification.upsert({
      where: { id: notifications[i].id },
      update: {},
      create: {
        id: notifications[i].id,
        recipientProfileId: mainProfile.id,
        type: notifications[i].type,
        title: notifications[i].title,
        body: notifications[i].body,
        readAt: i > 2 ? notificationDate : null,
        createdAt: notificationDate,
      },
    });
  }

  // Create badges
  const badge = await prisma.badge.upsert({
    where: { name: 'Focus Master' },
    update: {},
    create: {
      id: 'badge-1',
      name: 'Focus Master',
      description: 'Reached 50+ hours of total focus time',
      iconName: 'trophy',
      criteria: 'totalFocusMinutes >= 3000',
      createdAt: new Date('2026-05-01'),
      updatedAt: new Date(),
    },
  });

  // Award badge
  await prisma.badgeAward.upsert({
    where: {
      badgeId_profileId_periodKey: {
        badgeId: badge.id,
        profileId: mainProfile.id,
        periodKey: 'lifetime',
      },
    },
    update: {},
    create: {
      badgeId: badge.id,
      profileId: mainProfile.id,
      periodKey: 'lifetime',
      awardedAt: new Date('2026-05-28'),
    },
  });

  console.log('✅ Seed data created successfully!');
  console.log(`
  Test credentials:
  Email: student@habitix.dev
  Name: ISMAIL

  Dashboard preview includes:
  - 2 focus sessions today (120 minutes total)
  - 7-day activity heatmap
  - 3 team peers online
  - 5 recent notifications
  - 3 completed tasks today
  - 7-day activity streak
  `);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
