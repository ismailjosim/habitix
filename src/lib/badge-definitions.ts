/**
 * Static badge definition data. Pure data — no server dependencies.
 * Imported by both the app (badges.ts) and seed scripts.
 */
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
