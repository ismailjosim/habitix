# Habitix Database Design V1

This document is the Day 03 handoff for the first PostgreSQL/Prisma schema. It covers the MVP data needed for the app shell modules: dashboard, activity, focus mode, tasks, help desk, leaderboard, team, notifications, profile, study materials, and corporate reports.

## Design Principles

- Keep Better Auth core tables separate from Habitix profile and role data.
- Use PostgreSQL enums for stable workflow states and role values.
- Prefer explicit relational tables over unstructured JSON for dashboard-backed features.
- Store snapshots for leaderboard and reports so historical views are reproducible.
- Separate private student records from aggregate corporate reporting data.

## Core Enums

```prisma
enum AppRole {
  STUDENT
  MENTOR
  ADMIN
  MODERATOR
  CORPORATE_VIEWER
}

enum TeamMembershipRole {
  MEMBER
  LEAD
  MENTOR
  ADMIN
  VIEWER
}

enum TaskStatus {
  TODO
  IN_PROGRESS
  BLOCKED
  IN_REVIEW
  DONE
  ARCHIVED
}

enum TaskType {
  PERSONAL
  MENTOR_ASSIGNED
  ADMIN_ASSIGNED
  TEAM
}

enum TaskPriority {
  LOW
  MEDIUM
  HIGH
  URGENT
}

enum FocusActivityType {
  STUDY
  CODING
  READING
  WRITING
  RESEARCH
  REVIEW
  OTHER
}

enum FocusSessionStatus {
  PLANNED
  ACTIVE
  PAUSED
  COMPLETED
  ABANDONED
}

enum HelpPostStatus {
  OPEN
  ANSWERED
  RESOLVED
  CLOSED
  FLAGGED
}

enum NotificationType {
  TASK_ASSIGNED
  TASK_DUE
  HELP_RESPONSE
  HELP_RESOLVED
  BADGE_AWARDED
  MENTOR_FEEDBACK
  TEAM_UPDATE
  SYSTEM
}

enum StudyMaterialType {
  LINK
  FILE
  NOTE
  VIDEO
  COLLECTION
}

enum Visibility {
  PRIVATE
  TEAM
  ORGANIZATION
  PUBLIC
}
```

## Identity And Profiles

### UserProfile

App-owned extension of Better Auth user identity.

- `id`
- `authUserId` unique, references Better Auth user id
- `displayName`
- `avatarUrl`
- `role AppRole`
- `bio`
- `timezone`
- `institution`
- `department`
- `currentStreak`
- `totalFocusMinutes`
- `helpPoints`
- `createdAt`
- `updatedAt`

### UserPreference

- `id`
- `profileId`
- `emailNotifications`
- `pushNotifications`
- `weeklyDigest`
- `focusReminderMinutes`
- `createdAt`
- `updatedAt`

## Teams And Access

### Team

- `id`
- `name`
- `slug` unique
- `description`
- `avatarUrl`
- `ownerProfileId`
- `createdAt`
- `updatedAt`

### TeamMembership

- `id`
- `teamId`
- `profileId`
- `role TeamMembershipRole`
- `joinedAt`
- `leftAt`
- unique `teamId + profileId`

### MentorAssignment

Supports mentor/admin relationships outside one team.

- `id`
- `mentorProfileId`
- `studentProfileId`
- `teamId` optional
- `startsAt`
- `endsAt`
- `createdAt`

## Tasks

### Task

- `id`
- `title`
- `description`
- `type TaskType`
- `status TaskStatus`
- `priority TaskPriority`
- `category`
- `createdByProfileId`
- `assignedToProfileId` optional
- `teamId` optional
- `dueAt`
- `completedAt`
- `createdAt`
- `updatedAt`

### Subtask

- `id`
- `taskId`
- `title`
- `isDone`
- `position`
- `createdAt`
- `updatedAt`

### TaskComment

- `id`
- `taskId`
- `authorProfileId`
- `body`
- `createdAt`
- `updatedAt`

### TaskActivity

- `id`
- `taskId`
- `actorProfileId`
- `eventType`
- `fromStatus`
- `toStatus`
- `metadata` JSON for small audit context only
- `createdAt`

## Focus Mode And Activity

### FocusSession

- `id`
- `profileId`
- `taskId` optional
- `teamId` optional
- `activityType FocusActivityType`
- `status FocusSessionStatus`
- `plannedMinutes`
- `actualMinutes`
- `startedAt`
- `pausedAt`
- `completedAt`
- `source`
- `notes`
- `createdAt`
- `updatedAt`

### ActivityEvent

Normalized feed source for dashboard, profile, and activity heatmaps.

- `id`
- `profileId`
- `teamId` optional
- `type`
- `sourceId`
- `sourceType`
- `points`
- `occurredAt`
- `createdAt`

## Help Desk

### HelpPost

- `id`
- `authorProfileId`
- `teamId` optional
- `title`
- `body`
- `status HelpPostStatus`
- `topic`
- `urgency TaskPriority`
- `awardedResponseId` optional
- `resolvedAt`
- `createdAt`
- `updatedAt`

### HelpResponse

- `id`
- `postId`
- `authorProfileId`
- `body`
- `isAccepted`
- `pointsAwarded`
- `createdAt`
- `updatedAt`

### HelpPostTag

- `id`
- `postId`
- `tag`
- unique `postId + tag`

### HelperLimit

- `id`
- `profileId`
- `periodStart`
- `periodEnd`
- `responsesGiven`
- `pointsEarned`
- unique `profileId + periodStart + periodEnd`

## Leaderboards And Badges

### Badge

- `id`
- `name`
- `description`
- `iconName`
- `criteria`
- `createdAt`
- `updatedAt`

### BadgeAward

- `id`
- `badgeId`
- `profileId`
- `awardedByProfileId` optional
- `reason`
- `awardedAt`
- unique `badgeId + profileId + awardedAt`

### LeaderboardSnapshot

- `id`
- `scopeType`
- `scopeId`
- `periodStart`
- `periodEnd`
- `generatedAt`

### LeaderboardEntry

- `id`
- `snapshotId`
- `profileId`
- `rank`
- `score`
- `focusMinutes`
- `tasksCompleted`
- `helpPoints`
- `badgesEarned`
- unique `snapshotId + profileId`

## Notifications

### Notification

- `id`
- `recipientProfileId`
- `actorProfileId` optional
- `type NotificationType`
- `title`
- `body`
- `targetType`
- `targetId`
- `readAt`
- `createdAt`

## Study Materials

### StudyMaterial

- `id`
- `title`
- `description`
- `type StudyMaterialType`
- `url`
- `fileKey`
- `ownerProfileId`
- `teamId` optional
- `visibility Visibility`
- `createdAt`
- `updatedAt`

### StudyMaterialTag

- `id`
- `materialId`
- `tag`
- unique `materialId + tag`

## Reports

### StudentReport

- `id`
- `profileId`
- `periodStart`
- `periodEnd`
- `focusMinutes`
- `tasksCompleted`
- `helpPoints`
- `badgesEarned`
- `summary`
- `generatedAt`

### CorporateReportSnapshot

Aggregate-only data for external viewers.

- `id`
- `teamId` optional
- `periodStart`
- `periodEnd`
- `activeStudents`
- `averageEngagement`
- `tasksCompleted`
- `focusMinutes`
- `helpDeskResolutionRate`
- `summary`
- `generatedAt`

## Seed Data Shape

- 1 admin, 1 moderator, 2 mentors, 12 students, 1 corporate viewer.
- 3 teams with mixed student membership and mentor assignments.
- 30 tasks across personal, mentor-assigned, admin-assigned, and team scopes.
- 80 focus sessions over 14 days for heatmaps and dashboard totals.
- 12 help posts with responses, accepted answers, and helper points.
- 8 badges and 20 badge awards.
- Weekly leaderboard snapshots for students and teams.
- Notifications for due tasks, help responses, badge awards, and mentor feedback.
- Study materials across links, notes, videos, and file placeholders.
- Student and corporate report snapshots for the current week.

## Day 04 Conversion Notes

- Install Prisma and PostgreSQL dependencies before creating `prisma/schema.prisma`.
- Add `DATABASE_URL` to `.env.local` and `.env.example`.
- Convert this design into Prisma models using explicit relation names where a model references `UserProfile` multiple times.
- Keep Better Auth generated tables compatible with the Better Auth Prisma adapter.
- After schema creation, run `prisma validate`, generate Prisma Client, then create the first migration.
