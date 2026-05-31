# Habitix Database Design V1

This document is the Day 03 handoff for the first PostgreSQL/Prisma schema. It covers the MVP data needed for the app shell modules: dashboard, activity, focus mode, tasks, help desk, leaderboard, team, notifications, profile, study materials, and corporate reports.

## Design Principles

- Keep Better Auth core tables separate from Habitix profile and role data.
- Use PostgreSQL enums for stable workflow states and role values.
- Prefer explicit relational tables over unstructured JSON for dashboard-backed features.
- Store snapshots for leaderboard and reports so historical views are reproducible.
- Separate private student records from aggregate corporate reporting data.
- Add `createdAt` and `updatedAt` to user-owned records so mentor/admin reviews have an audit trail.
- Use optional foreign keys for cross-module links, such as tasks connected to focus sessions, without forcing every workflow into the same shape.

## Better Auth Compatibility

Day 04 should let Better Auth generate or own the auth adapter models. Habitix models should reference the Better Auth `user.id` value through `UserProfile.authUserId`, but should not duplicate authentication fields such as email verification state, sessions, OAuth accounts, or verification tokens.

Expected Better Auth tables:

- `User`
- `Session`
- `Account`
- `Verification`

Habitix-owned profile data starts at `UserProfile`. Application code should read app roles from `UserProfile.role`, not from Better Auth account metadata.

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

enum ReportScopeType {
  STUDENT
  TEAM
  ORGANIZATION
}

enum ActivitySourceType {
  FOCUS_SESSION
  TASK
  HELP_POST
  HELP_RESPONSE
  BADGE_AWARD
  MANUAL
}
```

## Relationship Map

- `UserProfile` has one `UserPreference`.
- `UserProfile` owns many tasks, assigned tasks, comments, task activities, focus sessions, help posts, help responses, notifications, study materials, badge awards, leaderboard entries, and student reports.
- `Team` has one owner profile and many memberships, tasks, focus sessions, help posts, study materials, leaderboard snapshots, and corporate report snapshots.
- `TeamMembership` connects profiles to teams with role-specific access.
- `MentorAssignment` connects mentor/admin profiles to student profiles, optionally inside a team.
- `Task` may be personal, mentor-assigned, admin-assigned, or team-scoped. It has many subtasks, comments, activities, and optional focus sessions.
- `HelpPost` has many tags and responses, and can point to one awarded response after resolution.
- `LeaderboardSnapshot` has many leaderboard entries and can represent student, team, or organization scopes.
- `BadgeAward` connects a badge to a profile, optionally awarded by another profile.
- `CorporateReportSnapshot` stores aggregate data only; it should not expose individual student records to corporate viewers.

## Role Boundaries

- `STUDENT`: Can manage own tasks, focus sessions, help posts, responses, profile, preferences, and private study materials. Can see team-scoped content for teams where they have active membership.
- `MENTOR`: Can view assigned students through `MentorAssignment`, create mentor-assigned tasks, comment on assigned student tasks, review reports, and manage team study materials where membership permits.
- `ADMIN`: Can create admin-assigned tasks, manage teams, memberships, mentor assignments, badges, study materials, notifications, and organization-level report snapshots.
- `MODERATOR`: Can review help posts, close or flag posts, moderate responses, and adjust awarded contributor state when required.
- `CORPORATE_VIEWER`: Can only read aggregate report snapshots and approved organization/team-level metrics. This role should not query individual task, help, or focus rows directly.

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

Suggested indexes:

- unique `authUserId`
- `role`
- `displayName`

### UserPreference

- `id`
- `profileId`
- `emailNotifications`
- `pushNotifications`
- `weeklyDigest`
- `focusReminderMinutes`
- `createdAt`
- `updatedAt`

Suggested indexes:

- unique `profileId`

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

Suggested indexes:

- `profileId + leftAt`
- `teamId + role`

### MentorAssignment

Supports mentor/admin relationships outside one team.

- `id`
- `mentorProfileId`
- `studentProfileId`
- `teamId` optional
- `startsAt`
- `endsAt`
- `createdAt`

Suggested indexes:

- `mentorProfileId + endsAt`
- `studentProfileId + endsAt`
- `teamId`

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

Suggested indexes:

- `assignedToProfileId + status + dueAt`
- `createdByProfileId + createdAt`
- `teamId + status`
- `type + status`

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

Allowed `eventType` examples:

- `created`
- `assigned`
- `status_changed`
- `priority_changed`
- `due_date_changed`
- `commented`
- `completed`

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

Suggested indexes:

- `profileId + startedAt`
- `profileId + status`
- `teamId + startedAt`
- `taskId`

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

Use this table for heatmaps, recent activity feeds, and lightweight dashboard timelines. The source table remains authoritative for detailed views.

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

Suggested indexes:

- `status + createdAt`
- `authorProfileId + createdAt`
- `teamId + status`
- `topic`

### HelpResponse

- `id`
- `postId`
- `authorProfileId`
- `body`
- `isAccepted`
- `pointsAwarded`
- `createdAt`
- `updatedAt`

Business rule:

- Only one accepted response should be awarded for a resolved help post.
- `HelpPost.awardedResponseId` should point to the winning `HelpResponse`.
- Awarded points should update `UserProfile.helpPoints` and `HelperLimit.pointsEarned`.

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

Use weekly periods for the MVP to cap helper rewards and support the help desk metrics panel.

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

Suggested fields for conversion:

- `scopeType ReportScopeType`
- `scopeId` optional string for team or organization scope

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

Suggested indexes:

- `recipientProfileId + readAt + createdAt`
- `targetType + targetId`

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

Suggested indexes:

- `ownerProfileId + createdAt`
- `teamId + visibility`
- `type`

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

Do not store names, emails, task titles, help post bodies, or other student-identifying details in this table.

## Screen-To-Data Coverage

- Dashboard summary cards: `UserProfile.totalFocusMinutes`, `UserProfile.currentStreak`, task counts from `Task`, help totals from `UserProfile.helpPoints`, and `LeaderboardEntry.rank`.
- Dashboard activity feed: `ActivityEvent` with links back to source records.
- Activity heatmap: `FocusSession.startedAt`, `FocusSession.actualMinutes`, and `ActivityEvent.occurredAt`.
- Focus mode: `FocusSession` linked to optional `Task`.
- Tasks board/list/detail: `Task`, `Subtask`, `TaskComment`, and `TaskActivity`.
- Help desk: `HelpPost`, `HelpResponse`, `HelpPostTag`, and `HelperLimit`.
- Leaderboard: `LeaderboardSnapshot`, `LeaderboardEntry`, `Badge`, and `BadgeAward`.
- Team dashboard: `Team`, `TeamMembership`, `MentorAssignment`, team tasks, team focus sessions, and team leaderboard snapshots.
- Notifications: `Notification` with typed targets.
- Profile: `UserProfile`, `UserPreference`, `BadgeAward`, recent `ActivityEvent`, and report summaries.
- Study materials: `StudyMaterial` and `StudyMaterialTag`.
- Corporate report: `CorporateReportSnapshot` only, backed by aggregate metrics.

## Prisma Conversion Notes

- Use `@default(cuid())` string ids for app-owned models unless the auth adapter requires a different id shape.
- Use explicit relation names whenever a model references `UserProfile` more than once, such as task creator versus assignee.
- Use `Json` only for flexible audit metadata in `TaskActivity.metadata`; avoid JSON for primary feature data.
- Convert `ReportScopeType` into shared scope enum values for leaderboards and reports.
- Keep nullable foreign keys intentional and documented in model comments.
- Add `onDelete: Cascade` for dependent child rows like subtasks, comments, help tags, study material tags, and leaderboard entries.
- Prefer `onDelete: Restrict` or `SetNull` for historical records that should survive account or team changes.

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

Seed records should recreate the mockup states:

- A dashboard user with active streak, weekly focus totals, upcoming due tasks, and recent badge/help activity.
- A task board with todo, in-progress, blocked, review, and done examples.
- A help desk with open, answered, resolved, and flagged examples.
- A leaderboard with current-week ranks and at least one previous snapshot.
- A team screen with mentor and student membership variety.
- A profile screen with badges, focus history, and preference settings.
- A corporate report screen with aggregate engagement, completion, focus, and resolution metrics.

## Day 04 Conversion Notes

- Install Prisma and PostgreSQL dependencies before creating `prisma/schema.prisma`.
- Add `DATABASE_URL` to `.env.local` and `.env.example`.
- Convert this design into Prisma models using explicit relation names where a model references `UserProfile` multiple times.
- Keep Better Auth generated tables compatible with the Better Auth Prisma adapter.
- After schema creation, run `prisma validate`, generate Prisma Client, then create the first migration.
