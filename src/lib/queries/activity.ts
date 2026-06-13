import { prisma } from '@/lib/prisma';
import { requireModuleAccess } from '@/lib/authorization';

const HELP_CREDIT_MINUTES_PER_POINT = 10;
const DEFAULT_DAYS = 365;

type DailyActivity = {
  date: string;
  focusMinutes: number;
  helpCreditMinutes: number;
  totalMinutes: number;
};

export type ActivityData = {
  rangeDays: number;
  stats: {
    totalSessions: number;
    totalFocusMinutes: number;
    tasksCompleted: number;
    helpPoints: number;
    helpCreditMinutes: number;
    currentStreak: number;
    bestDay: DailyActivity | null;
  };
  heatmap: DailyActivity[];
  recentSessions: {
    id: string;
    activityLabel: string;
    actualMinutes: number;
    completedAt: Date;
    task: { id: string; title: string } | null;
  }[];
  breakdown: {
    activityType: string;
    label: string;
    minutes: number;
    percentage: number;
  }[];
};

type SessionRow = {
  id: string;
  activityType: string;
  actualMinutes: number | null;
  completedAt: Date | null;
  notes: string | null;
  task: { id: string; title: string } | null;
};

export async function getActivityData(rangeDays = DEFAULT_DAYS): Promise<ActivityData> {
  const current = await requireModuleAccess('activity');

  const { profile } = current;
  const safeDays = [30, 90, 180, 365].includes(rangeDays) ? rangeDays : DEFAULT_DAYS;
  const heatmapStart = startOfDay(new Date());
  heatmapStart.setDate(heatmapStart.getDate() - (safeDays - 1));

  const [sessions, tasksCompleted, awardedHelp] = await Promise.all([
    prisma.focusSession.findMany({
      where: {
        profileId: profile.id,
        status: 'COMPLETED',
        completedAt: { gte: heatmapStart },
      },
      select: {
        id: true,
        activityType: true,
        actualMinutes: true,
        completedAt: true,
        notes: true,
        task: { select: { id: true, title: true } },
      },
      orderBy: { completedAt: 'desc' },
    }),
    prisma.task.count({
      where: {
        status: 'DONE',
        completedAt: { gte: heatmapStart },
        OR: [{ assignedToProfileId: profile.id }, { createdByProfileId: profile.id }],
      },
    }),
    prisma.helpResponse.findMany({
      where: {
        authorProfileId: profile.id,
        pointsAwarded: { gt: 0 },
        updatedAt: { gte: heatmapStart },
      },
      select: { pointsAwarded: true, updatedAt: true },
    }),
  ]);

  const helpPoints = awardedHelp.reduce((total, response) => total + response.pointsAwarded, 0);
  const dailyMap = new Map<string, DailyActivity>();

  sessions.forEach((session) => {
    if (!session.completedAt) return;
    const day = getOrCreateDay(dailyMap, dateKey(session.completedAt));
    day.focusMinutes += session.actualMinutes ?? 0;
    day.totalMinutes += session.actualMinutes ?? 0;
  });

  awardedHelp.forEach((response) => {
    const credit = response.pointsAwarded * HELP_CREDIT_MINUTES_PER_POINT;
    const day = getOrCreateDay(dailyMap, dateKey(response.updatedAt));
    day.helpCreditMinutes += credit;
    day.totalMinutes += credit;
  });

  const totalFocusMinutes = sessions.reduce(
    (total, session) => total + (session.actualMinutes ?? 0),
    0
  );
  const focusDays = [...dailyMap.values()].filter((day) => day.focusMinutes > 0);
  const breakdown = buildBreakdown(sessions, totalFocusMinutes);

  return {
    rangeDays: safeDays,
    stats: {
      totalSessions: sessions.length,
      totalFocusMinutes,
      tasksCompleted,
      helpPoints,
      helpCreditMinutes: helpPoints * HELP_CREDIT_MINUTES_PER_POINT,
      currentStreak: calculateCurrentStreak(new Set(focusDays.map((day) => day.date))),
      bestDay: focusDays.sort((a, b) => b.focusMinutes - a.focusMinutes)[0] ?? null,
    },
    heatmap: buildHeatmap(dailyMap, heatmapStart, safeDays),
    recentSessions: sessions.slice(0, 8).flatMap((session) =>
      session.completedAt
        ? [
            {
              id: session.id,
              activityLabel: getActivityLabel(session),
              actualMinutes: session.actualMinutes ?? 0,
              completedAt: session.completedAt,
              task: session.task,
            },
          ]
        : []
    ),
    breakdown,
  };
}

export function calculateCurrentStreak(activeDateKeys: Set<string>, now = new Date()) {
  const cursor = startOfDay(now);

  // A streak remains current until the end of the following day.
  if (!activeDateKeys.has(dateKey(cursor))) {
    cursor.setDate(cursor.getDate() - 1);
  }

  let streak = 0;
  while (activeDateKeys.has(dateKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}

function buildHeatmap(map: Map<string, DailyActivity>, start: Date, days: number) {
  return Array.from({ length: days }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    const key = dateKey(date);
    return map.get(key) ?? { date: key, focusMinutes: 0, helpCreditMinutes: 0, totalMinutes: 0 };
  });
}

function buildBreakdown(sessions: SessionRow[], totalMinutes: number) {
  const minutesByType = new Map<string, { label: string; minutes: number }>();

  sessions.forEach((session) => {
    const label = getActivityLabel(session);
    const key = label.toLowerCase();
    const current = minutesByType.get(key) ?? { label, minutes: 0 };
    current.minutes += session.actualMinutes ?? 0;
    minutesByType.set(key, current);
  });

  return [...minutesByType.entries()]
    .map(([activityType, value]) => ({
      activityType,
      label: value.label,
      minutes: value.minutes,
      percentage: totalMinutes ? Math.round((value.minutes / totalMinutes) * 100) : 0,
    }))
    .sort((a, b) => b.minutes - a.minutes);
}

function getActivityLabel(session: Pick<SessionRow, 'activityType' | 'notes'>) {
  if (session.notes) {
    try {
      const metadata = JSON.parse(session.notes) as { activityLabel?: unknown };
      if (typeof metadata.activityLabel === 'string') return metadata.activityLabel;
    } catch {
      // Older sessions may contain free-form notes rather than timer metadata.
    }
  }

  return session.activityType
    .split('_')
    .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
    .join(' ');
}

function getOrCreateDay(map: Map<string, DailyActivity>, key: string) {
  const existing = map.get(key);
  if (existing) return existing;

  const day = { date: key, focusMinutes: 0, helpCreditMinutes: 0, totalMinutes: 0 };
  map.set(key, day);
  return day;
}

function startOfDay(date: Date) {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
}

function dateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
