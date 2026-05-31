# Habitix Seed Data Plan

This is the Day 04 seed handoff. Seed data should stay separate from migrations and should be loaded through `prisma/seed.ts` after the first database is available.

## Demo Dataset

- Users: 1 admin, 1 moderator, 2 mentors, 12 students, and 1 corporate viewer.
- Teams: 3 teams with mixed membership roles and mentor assignments.
- Tasks: 30 tasks across personal, mentor-assigned, admin-assigned, and team scopes.
- Focus sessions: 80 sessions over the last 14 days for dashboard totals and activity heatmaps.
- Help desk: 12 posts with open, answered, resolved, closed, and flagged states.
- Badges: 8 badge definitions and 20 awards.
- Leaderboards: current-week and previous-week snapshots.
- Notifications: due tasks, help responses, badge awards, mentor feedback, and team updates.
- Study materials: links, notes, videos, collections, and file placeholders.
- Reports: student weekly snapshots and aggregate corporate report snapshots.

## Loading Order

1. Profiles and preferences.
2. Teams, memberships, and mentor assignments.
3. Tasks, subtasks, comments, and task activity.
4. Focus sessions and activity events.
5. Help posts, tags, responses, helper limits, and awarded responses.
6. Badges, awards, leaderboard snapshots, and entries.
7. Notifications, study materials, and report snapshots.
