import 'dotenv/config';

import { hashPassword } from 'better-auth/crypto';

import type { AppRole } from '../src/generated/prisma/client';
import { BADGE_DEFINITIONS } from '../src/lib/badges';
import { prisma } from '../src/lib/prisma';

const DEMO_PASSWORD = 'HabitixDemo123!';

function atDayOffset(offset: number, hour = 10, minute = 0) {
  const date = new Date();
  date.setHours(hour, minute, 0, 0);
  date.setDate(date.getDate() + offset);
  return date;
}

async function demoProfile({
  key,
  name,
  email,
  role,
  streak,
  focusMinutes,
  helpPoints,
}: {
  key: string;
  name: string;
  email: string;
  role: AppRole;
  streak: number;
  focusMinutes: number;
  helpPoints: number;
}) {
  const userId = `demo-user-${key}`;
  const profileId = `demo-profile-${key}`;
  const now = new Date();
  const user = await prisma.user.upsert({
    where: { email },
    update: { name, emailVerified: true, updatedAt: now },
    create: {
      id: userId,
      name,
      email,
      emailVerified: true,
      image: `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(name)}`,
      createdAt: atDayOffset(-60),
      updatedAt: now,
    },
  });

  const profile = await prisma.userProfile.upsert({
    where: { authUserId: user.id },
    update: {
      displayName: name,
      role,
      currentStreak: streak,
      totalFocusMinutes: focusMinutes,
      helpPoints,
      institution: 'Habitix Academy',
      department: role === 'MENTOR' ? 'Software Engineering' : 'Computer Science',
      bio: `Demo ${role.toLowerCase().replace('_', ' ')} account for the Habitix showcase.`,
    },
    create: {
      id: profileId,
      authUserId: user.id,
      displayName: name,
      role,
      currentStreak: streak,
      totalFocusMinutes: focusMinutes,
      helpPoints,
      institution: 'Habitix Academy',
      department: role === 'MENTOR' ? 'Software Engineering' : 'Computer Science',
      bio: `Demo ${role.toLowerCase().replace('_', ' ')} account for the Habitix showcase.`,
    },
  });

  await prisma.userPreference.upsert({
    where: { profileId: profile.id },
    update: {},
    create: { profileId: profile.id, focusReminderMinutes: 25 },
  });
  await prisma.account.deleteMany({ where: { userId: user.id, providerId: 'credential' } });
  await prisma.account.create({
    data: {
      id: `demo-account-${key}`,
      accountId: user.id,
      providerId: 'credential',
      userId: user.id,
      password: await hashPassword(DEMO_PASSWORD),
      createdAt: now,
      updatedAt: now,
    },
  });
  return profile;
}

async function clearDemoRecords() {
  await prisma.helpPost.updateMany({
    where: { id: { startsWith: 'demo-' } },
    data: { awardedResponseId: null },
  });
  await prisma.notification.deleteMany({ where: { id: { startsWith: 'demo-' } } });
  await prisma.badgeAward.deleteMany({ where: { id: { startsWith: 'demo-' } } });
  await prisma.leaderboardSnapshot.deleteMany({ where: { id: { startsWith: 'demo-' } } });
  await prisma.studyMaterial.deleteMany({ where: { id: { startsWith: 'demo-' } } });
  await prisma.helpPost.deleteMany({ where: { id: { startsWith: 'demo-' } } });
  await prisma.focusSession.deleteMany({ where: { id: { startsWith: 'demo-' } } });
  await prisma.task.deleteMany({ where: { id: { startsWith: 'demo-' } } });
  await prisma.activityEvent.deleteMany({ where: { id: { startsWith: 'demo-' } } });
  await prisma.mentorAssignment.deleteMany({ where: { id: { startsWith: 'demo-' } } });
  await prisma.studentReport.deleteMany({ where: { id: { startsWith: 'demo-' } } });
  await prisma.corporateReportSnapshot.deleteMany({ where: { id: { startsWith: 'demo-' } } });
}

async function main() {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Demo data must never be seeded in production');
  }

  const owner =
    (process.env.DEMO_OWNER_EMAIL
      ? await prisma.userProfile.findFirst({
          where: { authUser: { email: process.env.DEMO_OWNER_EMAIL } },
        })
      : null) ??
    (await prisma.userProfile.findFirst({
      where: { role: 'ADMIN', authUserId: { not: { startsWith: 'demo-user-' } } },
      orderBy: { createdAt: 'asc' },
    })) ??
    (await prisma.userProfile.findFirst({
      where: { authUserId: { not: { startsWith: 'demo-user-' } } },
      orderBy: { createdAt: 'asc' },
    }));

  if (!owner) {
    throw new Error('Sign in once before seeding demo data so the showcase has an owner account');
  }

  console.log(`Building showcase data for ${owner.displayName}...`);
  await clearDemoRecords();

  await Promise.all(
    BADGE_DEFINITIONS.map((definition) =>
      prisma.badge.upsert({
        where: { name: definition.name },
        update: definition,
        create: definition,
      })
    )
  );

  const [mentor, student, peer, moderator, corporate] = await Promise.all([
    demoProfile({
      key: 'mentor',
      name: 'Maya Mentor',
      email: 'mentor.demo@habitix.local',
      role: 'MENTOR',
      streak: 12,
      focusMinutes: 2860,
      helpPoints: 28,
    }),
    demoProfile({
      key: 'student',
      name: 'Ari Student',
      email: 'student.demo@habitix.local',
      role: 'STUDENT',
      streak: 8,
      focusMinutes: 1740,
      helpPoints: 12,
    }),
    demoProfile({
      key: 'peer',
      name: 'Noor Coder',
      email: 'peer.demo@habitix.local',
      role: 'STUDENT',
      streak: 5,
      focusMinutes: 1320,
      helpPoints: 18,
    }),
    demoProfile({
      key: 'moderator',
      name: 'Sam Moderator',
      email: 'moderator.demo@habitix.local',
      role: 'MODERATOR',
      streak: 2,
      focusMinutes: 320,
      helpPoints: 8,
    }),
    demoProfile({
      key: 'corporate',
      name: 'Taylor Viewer',
      email: 'corporate.demo@habitix.local',
      role: 'CORPORATE_VIEWER',
      streak: 0,
      focusMinutes: 0,
      helpPoints: 0,
    }),
  ]);

  await prisma.userProfile.update({
    where: { id: owner.id },
    data: {
      role: 'ADMIN',
      institution: owner.institution ?? 'Habitix Academy',
      department: owner.department ?? 'Platform Administration',
      currentStreak: 14,
      totalFocusMinutes: 3480,
      helpPoints: 24,
    },
  });

  const team = await prisma.team.upsert({
    where: { slug: 'habitix-showcase' },
    update: {
      name: 'Habitix Product Lab',
      description: 'A fully populated team for exploring every Habitix collaboration feature.',
      ownerProfileId: owner.id,
    },
    create: {
      id: 'demo-team-showcase',
      name: 'Habitix Product Lab',
      slug: 'habitix-showcase',
      description: 'A fully populated team for exploring every Habitix collaboration feature.',
      ownerProfileId: owner.id,
    },
  });

  await prisma.teamMembership.updateMany({
    where: { profileId: owner.id, teamId: { not: team.id }, leftAt: null },
    data: { leftAt: new Date() },
  });

  const memberships = [
    [owner.id, 'ADMIN'],
    [mentor.id, 'MENTOR'],
    [student.id, 'MEMBER'],
    [peer.id, 'LEAD'],
    [moderator.id, 'MEMBER'],
    [corporate.id, 'VIEWER'],
  ] as const;
  for (const [profileId, role] of memberships) {
    await prisma.teamMembership.upsert({
      where: { teamId_profileId: { teamId: team.id, profileId } },
      update: { role, leftAt: null },
      create: { teamId: team.id, profileId, role, joinedAt: atDayOffset(-45) },
    });
  }

  await prisma.mentorAssignment.createMany({
    data: [
      {
        id: 'demo-assignment-ari',
        mentorProfileId: mentor.id,
        studentProfileId: student.id,
        teamId: team.id,
        startsAt: atDayOffset(-40),
      },
      {
        id: 'demo-assignment-noor',
        mentorProfileId: mentor.id,
        studentProfileId: peer.id,
        teamId: team.id,
        startsAt: atDayOffset(-35),
      },
    ],
  });

  const taskRows = [
    {
      id: 'demo-task-api',
      title: 'Build habit analytics API',
      description: 'Create validated endpoints for streaks, focus totals, and weekly summaries.',
      type: 'MENTOR_ASSIGNED' as const,
      status: 'IN_PROGRESS' as const,
      priority: 'HIGH' as const,
      category: 'Backend',
      createdByProfileId: mentor.id,
      assignedToProfileId: student.id,
      dueAt: atDayOffset(3, 17),
      createdAt: atDayOffset(-5),
      subtasks: {
        create: [
          { title: 'Define response schema', position: 0, isDone: true },
          { title: 'Implement aggregation query', position: 1, isDone: true },
          { title: 'Add integration tests', position: 2, isDone: false },
        ],
      },
    },
    {
      id: 'demo-task-dashboard',
      title: 'Polish responsive dashboard',
      description: 'Review mobile cards, empty states, and keyboard focus behavior.',
      type: 'TEAM' as const,
      status: 'IN_REVIEW' as const,
      priority: 'MEDIUM' as const,
      category: 'Frontend',
      createdByProfileId: owner.id,
      assignedToProfileId: peer.id,
      dueAt: atDayOffset(1, 18),
      createdAt: atDayOffset(-6),
      subtasks: {
        create: [
          { title: 'Audit mobile layout', position: 0, isDone: true },
          { title: 'Check contrast', position: 1, isDone: true },
        ],
      },
    },
    {
      id: 'demo-task-tests',
      title: 'Complete focus workflow tests',
      description: 'Cover start, pause, resume, completion, and activity totals.',
      type: 'PERSONAL' as const,
      status: 'DONE' as const,
      priority: 'HIGH' as const,
      category: 'Testing',
      createdByProfileId: owner.id,
      assignedToProfileId: owner.id,
      dueAt: atDayOffset(-1),
      completedAt: atDayOffset(-2, 16),
      createdAt: atDayOffset(-9),
      subtasks: {
        create: [
          { title: 'Mock session ownership', position: 0, isDone: true },
          { title: 'Assert activity event', position: 1, isDone: true },
        ],
      },
    },
    {
      id: 'demo-task-database',
      title: 'Review database indexes',
      description: 'Confirm frequent aggregation and team lookup fields are indexed.',
      type: 'ADMIN_ASSIGNED' as const,
      status: 'BLOCKED' as const,
      priority: 'URGENT' as const,
      category: 'Database',
      createdByProfileId: owner.id,
      assignedToProfileId: student.id,
      dueAt: atDayOffset(-1),
      createdAt: atDayOffset(-7),
      subtasks: { create: [{ title: 'Capture query plans', position: 0, isDone: false }] },
    },
    {
      id: 'demo-task-reading',
      title: 'Read TypeScript narrowing guide',
      description: 'Summarize discriminated unions for the team.',
      type: 'PERSONAL' as const,
      status: 'TODO' as const,
      priority: 'LOW' as const,
      category: 'Learning',
      createdByProfileId: owner.id,
      assignedToProfileId: owner.id,
      dueAt: atDayOffset(5),
      createdAt: atDayOffset(-1),
      subtasks: { create: [{ title: 'Write summary notes', position: 0, isDone: false }] },
    },
  ];
  for (const task of taskRows) {
    await prisma.task.create({ data: { ...task, teamId: team.id } });
  }

  await prisma.taskComment.createMany({
    data: [
      {
        id: 'demo-comment-api',
        taskId: 'demo-task-api',
        authorProfileId: mentor.id,
        body: 'Good progress. Add a zero-data test before moving this to review.',
        createdAt: atDayOffset(-1, 15),
      },
      {
        id: 'demo-comment-dashboard',
        taskId: 'demo-task-dashboard',
        authorProfileId: owner.id,
        body: 'The mobile card layout is ready. Please verify keyboard navigation.',
        createdAt: atDayOffset(-1, 11),
      },
    ],
  });

  const sessionOwners = [owner, student, peer, mentor];
  const activities = ['CODING', 'STUDY', 'WRITING', 'RESEARCH'] as const;
  const focusRows = [];
  for (let day = 0; day < 14; day++) {
    for (let index = 0; index < sessionOwners.length; index++) {
      const profile = sessionOwners[index];
      const minutes = 25 + ((day + index) % 4) * 10;
      const startedAt = atDayOffset(-day, 8 + index * 2);
      focusRows.push({
        id: `demo-focus-${day}-${index}`,
        profileId: profile.id,
        teamId: team.id,
        taskId: profile.id === owner.id ? 'demo-task-tests' : 'demo-task-api',
        activityType: activities[(day + index) % activities.length],
        status: 'COMPLETED' as const,
        plannedMinutes: minutes,
        actualMinutes: minutes,
        startedAt,
        completedAt: new Date(startedAt.getTime() + minutes * 60_000),
        source: 'demo',
        notes: JSON.stringify({
          elapsedSeconds: minutes * 60,
          activityLabel: activities[(day + index) % activities.length],
        }),
        createdAt: startedAt,
        updatedAt: startedAt,
      });
    }
  }
  await prisma.focusSession.createMany({ data: focusRows });

  await prisma.taskActivity.createMany({
    data: taskRows.map((task, index) => ({
      id: `demo-task-activity-${index}`,
      taskId: task.id,
      actorProfileId: task.createdByProfileId,
      eventType: index === 2 ? 'status_changed' : 'created',
      toStatus: task.status,
      createdAt: task.createdAt,
    })),
  });

  await prisma.activityEvent.createMany({
    data: focusRows.slice(0, 20).map((session, index) => ({
      id: `demo-activity-focus-${index}`,
      profileId: session.profileId,
      teamId: team.id,
      type: 'focus_completed',
      sourceId: session.id,
      sourceType: 'FOCUS_SESSION',
      points: session.actualMinutes,
      occurredAt: session.completedAt,
      createdAt: session.completedAt,
    })),
  });

  const openPost = await prisma.helpPost.create({
    data: {
      id: 'demo-help-open',
      authorProfileId: student.id,
      teamId: team.id,
      title: 'Why does my Prisma relation query return duplicates?',
      body: 'I am joining tags and responses and the result repeats posts. What is the clean Prisma pattern?',
      status: 'ANSWERED',
      topic: 'Database',
      urgency: 'HIGH',
      createdAt: atDayOffset(-1, 9),
      tags: { create: [{ tag: 'Prisma' }, { tag: 'PostgreSQL' }] },
    },
  });
  await prisma.helpResponse.createMany({
    data: [
      {
        id: 'demo-response-open-1',
        postId: openPost.id,
        authorProfileId: peer.id,
        body: 'Use nested includes and map the child collection instead of flattening the SQL-style join.',
        createdAt: atDayOffset(-1, 9, 20),
      },
      {
        id: 'demo-response-open-2',
        postId: openPost.id,
        authorProfileId: mentor.id,
        body: 'Also confirm the relation has a unique key and avoid raw joins unless aggregation requires them.',
        createdAt: atDayOffset(-1, 9, 35),
      },
    ],
  });

  const resolvedPost = await prisma.helpPost.create({
    data: {
      id: 'demo-help-resolved',
      authorProfileId: owner.id,
      teamId: team.id,
      title: 'How should focus time be credited after a paused session?',
      body: 'Should the timer count only active seconds and how should the completion minimum work?',
      status: 'RESOLVED',
      topic: 'Coding',
      urgency: 'MEDIUM',
      resolvedAt: atDayOffset(-3, 14),
      createdAt: atDayOffset(-3, 12),
      tags: { create: [{ tag: 'Timer' }, { tag: 'Analytics' }] },
    },
  });
  const accepted = await prisma.helpResponse.create({
    data: {
      id: 'demo-response-accepted',
      postId: resolvedPost.id,
      authorProfileId: student.id,
      body: 'Persist elapsed active seconds on pause, then use the server clock when resumed. Completion can enforce the planned minimum.',
      isAccepted: true,
      pointsAwarded: 2,
      createdAt: atDayOffset(-3, 12, 18),
    },
  });
  await prisma.helpPost.update({
    where: { id: resolvedPost.id },
    data: { awardedResponseId: accepted.id },
  });

  const materialRows = [
    {
      id: 'demo-material-next',
      title: 'Next.js App Router Patterns',
      author: 'Habitix Engineering',
      description: 'Server components, actions, loading states, and authorization boundaries.',
      type: 'LINK' as const,
      url: 'https://nextjs.org/docs/app',
      visibility: 'PUBLIC' as const,
      module: 'Frontend',
      milestone: 'Architecture',
      isPublished: true,
      publishedAt: atDayOffset(-10),
      tags: ['Next.js', 'React'],
    },
    {
      id: 'demo-material-prisma',
      title: 'Prisma Data Modeling Guide',
      author: 'Prisma',
      description: 'Relations, indexes, migrations, and production-safe workflows.',
      type: 'LINK' as const,
      url: 'https://www.prisma.io/docs/orm/prisma-schema/data-model',
      visibility: 'TEAM' as const,
      module: 'Database',
      milestone: 'Data Layer',
      isPublished: true,
      publishedAt: atDayOffset(-8),
      tags: ['Prisma', 'PostgreSQL'],
    },
    {
      id: 'demo-material-testing',
      title: 'Testing Core Habitix Flows',
      author: 'Maya Mentor',
      description: 'A practical checklist for unit, integration, permission, and smoke tests.',
      type: 'NOTE' as const,
      url: null,
      visibility: 'ORGANIZATION' as const,
      module: 'Testing',
      milestone: 'Quality',
      isPublished: true,
      publishedAt: atDayOffset(-4),
      tags: ['Vitest', 'QA'],
    },
  ];
  for (const material of materialRows) {
    await prisma.studyMaterial.create({
      data: {
        ...material,
        ownerProfileId: mentor.id,
        teamId: material.visibility === 'TEAM' ? team.id : null,
        tags: { create: material.tags.map((tag) => ({ tag })) },
      },
    });
  }
  await prisma.studyMaterialView.createMany({
    data: [
      {
        id: 'demo-view-next',
        materialId: 'demo-material-next',
        profileId: owner.id,
        action: 'view',
        createdAt: atDayOffset(-1),
      },
      {
        id: 'demo-view-prisma',
        materialId: 'demo-material-prisma',
        profileId: student.id,
        action: 'open',
        createdAt: atDayOffset(-2),
      },
    ],
  });

  const badges = await prisma.badge.findMany();
  const awardProfiles = [owner, mentor, student, peer];
  for (let index = 0; index < awardProfiles.length; index++) {
    const badge = badges[index % badges.length];
    await prisma.badgeAward.create({
      data: {
        id: `demo-badge-award-${index}`,
        badgeId: badge.id,
        profileId: awardProfiles[index].id,
        awardedByProfileId: owner.id,
        reason: 'Showcase achievement generated by the local demo seed.',
        periodKey: `demo-${index}`,
        awardedAt: atDayOffset(-index - 1),
      },
    });
  }

  const periodStart = atDayOffset(-29, 0);
  const periodEnd = atDayOffset(0, 23, 59);
  await prisma.studentReport.createMany({
    data: [
      {
        id: 'demo-student-report-ari',
        profileId: student.id,
        periodStart,
        periodEnd,
        focusMinutes: 620,
        tasksCompleted: 7,
        helpPoints: 12,
        badgesEarned: 2,
        summary: 'Strong consistency with improving backend delivery and peer support.',
      },
      {
        id: 'demo-student-report-noor',
        profileId: peer.id,
        periodStart,
        periodEnd,
        focusMinutes: 540,
        tasksCompleted: 6,
        helpPoints: 18,
        badgesEarned: 1,
        summary: 'High collaboration score and reliable frontend delivery.',
      },
    ],
  });
  await prisma.corporateReportSnapshot.create({
    data: {
      id: 'demo-corporate-report',
      teamId: team.id,
      periodStart,
      periodEnd,
      activeStudents: 2,
      averageEngagement: 86.5,
      tasksCompleted: 13,
      focusMinutes: 1160,
      helpDeskResolutionRate: 82,
      summary:
        'The Habitix Product Lab maintained strong focus consistency and peer response times.',
    },
  });

  const snapshot = await prisma.leaderboardSnapshot.create({
    data: {
      id: 'demo-leaderboard-snapshot',
      scopeType: 'TEAM',
      scopeId: team.id,
      teamId: team.id,
      periodStart: atDayOffset(-6, 0),
      periodEnd,
    },
  });
  await prisma.leaderboardEntry.createMany({
    data: [
      {
        id: 'demo-leaderboard-1',
        snapshotId: snapshot.id,
        profileId: owner.id,
        rank: 1,
        score: 720,
        focusMinutes: 560,
        tasksCompleted: 5,
        helpPoints: 24,
        badgesEarned: 2,
      },
      {
        id: 'demo-leaderboard-2',
        snapshotId: snapshot.id,
        profileId: mentor.id,
        rank: 2,
        score: 665,
        focusMinutes: 520,
        tasksCompleted: 4,
        helpPoints: 28,
        badgesEarned: 1,
      },
      {
        id: 'demo-leaderboard-3',
        snapshotId: snapshot.id,
        profileId: student.id,
        rank: 3,
        score: 590,
        focusMinutes: 470,
        tasksCompleted: 4,
        helpPoints: 12,
        badgesEarned: 1,
      },
    ],
  });

  await prisma.notification.createMany({
    data: [
      {
        id: 'demo-notification-task',
        recipientProfileId: owner.id,
        actorProfileId: mentor.id,
        type: 'TASK_ASSIGNED',
        title: 'New showcase task',
        body: 'Maya Mentor assigned a task in Habitix Product Lab.',
        targetType: 'TASK',
        targetId: 'demo-task-api',
        createdAt: atDayOffset(0, 9),
      },
      {
        id: 'demo-notification-help',
        recipientProfileId: owner.id,
        actorProfileId: student.id,
        type: 'HELP_RESOLVED',
        title: 'Help request resolved',
        body: 'Ari Student provided the awarded response.',
        targetType: 'help_post',
        targetId: 'demo-help-resolved',
        createdAt: atDayOffset(-1, 14),
      },
      {
        id: 'demo-notification-badge',
        recipientProfileId: owner.id,
        type: 'BADGE_AWARDED',
        title: 'Badge earned: 7-Day Focus Streak',
        body: 'Your showcase profile demonstrates a two-week streak.',
        targetType: 'badge_award',
        targetId: 'demo-badge-award-0',
        createdAt: atDayOffset(-2, 18),
      },
      {
        id: 'demo-notification-team',
        recipientProfileId: owner.id,
        actorProfileId: peer.id,
        type: 'TEAM_UPDATE',
        title: 'Dashboard review ready',
        body: 'Noor moved the responsive dashboard task to review.',
        targetType: 'TASK',
        targetId: 'demo-task-dashboard',
        readAt: atDayOffset(-2, 19),
        createdAt: atDayOffset(-3, 16),
      },
    ],
  });

  for (const [index, profile] of [owner, mentor, student, peer].entries()) {
    await prisma.presence.upsert({
      where: { profileId: profile.id },
      update: { lastSeenAt: new Date(Date.now() - index * 4 * 60_000) },
      create: {
        profileId: profile.id,
        lastSeenAt: new Date(Date.now() - index * 4 * 60_000),
      },
    });
  }

  console.log('Habitix showcase data is ready.');
  console.log(`Owner account: ${owner.displayName}`);
  console.log(`Demo password for all accounts: ${DEMO_PASSWORD}`);
  console.log('Demo accounts:');
  console.log('  mentor.demo@habitix.local');
  console.log('  student.demo@habitix.local');
  console.log('  peer.demo@habitix.local');
  console.log('  moderator.demo@habitix.local');
  console.log('  corporate.demo@habitix.local');
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
