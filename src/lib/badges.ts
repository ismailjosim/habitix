import { prisma } from '@/lib/prisma';

export const BADGE_DEFINITIONS = [
  {
    name: '7-Day Focus Streak',
    description: 'Stayed consistent for seven focus days.',
    iconName: 'flame',
    criteria: 'currentStreak >= 7',
  },
  {
    name: 'Focus Master',
    description: 'Completed 50 hours of focused work.',
    iconName: 'target',
    criteria: 'totalFocusMinutes >= 3000',
  },
  {
    name: 'Top Coder',
    description: 'Completed 10 hours of coding focus sessions.',
    iconName: 'code',
    criteria: 'codingFocusMinutes >= 600',
  },
  {
    name: 'Rising Star',
    description: 'Completed 10 tasks.',
    iconName: 'star',
    criteria: 'completedTasks >= 10',
  },
  {
    name: 'Top Contributor',
    description: 'Earned 10 help points from useful answers.',
    iconName: 'heart-handshake',
    criteria: 'helpPoints >= 10',
  },
  {
    name: 'Weekly Champion',
    description: 'Led the team focus leaderboard for a week.',
    iconName: 'crown',
    criteria: 'weeklyFocusRank == 1',
  },
  {
    name: 'Monthly Champion',
    description: 'Led the team focus leaderboard for a month.',
    iconName: 'trophy',
    criteria: 'monthlyFocusRank == 1',
  },
] as const;

export async function ensureBadgeDefinitions() {
  await Promise.all(
    BADGE_DEFINITIONS.map((definition) =>
      prisma.badge.upsert({
        where: { name: definition.name },
        update: {
          description: definition.description,
          iconName: definition.iconName,
          criteria: definition.criteria,
        },
        create: definition,
      })
    )
  );
}

export async function awardEligibleBadges(profileId: string) {
  await ensureBadgeDefinitions();

  const [profile, coding, completedTasks] = await Promise.all([
    prisma.userProfile.findUnique({
      where: { id: profileId },
      select: { currentStreak: true, totalFocusMinutes: true, helpPoints: true },
    }),
    prisma.focusSession.aggregate({
      where: { profileId, status: 'COMPLETED', activityType: 'CODING' },
      _sum: { actualMinutes: true },
    }),
    prisma.task.count({
      where: {
        status: 'DONE',
        OR: [{ assignedToProfileId: profileId }, { createdByProfileId: profileId }],
      },
    }),
  ]);

  if (!profile) return [];

  const earned = [
    profile.currentStreak >= 7 ? ['7-Day Focus Streak', 'Reached a seven-day focus streak'] : null,
    profile.totalFocusMinutes >= 3000 ? ['Focus Master', 'Completed 50 hours of focus'] : null,
    (coding._sum.actualMinutes ?? 0) >= 600
      ? ['Top Coder', 'Completed 10 hours of coding focus']
      : null,
    completedTasks >= 10 ? ['Rising Star', 'Completed 10 tasks'] : null,
    profile.helpPoints >= 10 ? ['Top Contributor', 'Earned 10 help points'] : null,
  ].filter((item): item is string[] => Boolean(item));

  const awards = [];
  for (const [badgeName, reason] of earned) {
    const award = await awardBadge({ profileId, badgeName, reason });
    if (award) awards.push(award);
  }
  return awards;
}

export async function awardBadge({
  profileId,
  badgeName,
  reason,
  periodKey = 'lifetime',
}: {
  profileId: string;
  badgeName: string;
  reason: string;
  periodKey?: string;
}) {
  await ensureBadgeDefinitions();
  const badge = await prisma.badge.findUnique({ where: { name: badgeName } });
  if (!badge) throw new Error(`Badge definition not found: ${badgeName}`);

  const result = await prisma.badgeAward.createMany({
    data: [{ badgeId: badge.id, profileId, reason, periodKey }],
    skipDuplicates: true,
  });
  if (result.count === 0) return null;

  const award = await prisma.badgeAward.findUnique({
    where: { badgeId_profileId_periodKey: { badgeId: badge.id, profileId, periodKey } },
  });

  await prisma.notification.create({
    data: {
      recipientProfileId: profileId,
      type: 'BADGE_AWARDED',
      title: `Badge earned: ${badge.name}`,
      body: reason,
      targetType: 'badge_award',
      targetId: award?.id,
    },
  });

  return award;
}
