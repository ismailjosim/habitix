# Habitix

Habitix is a full-stack student productivity and collaboration platform. It combines focused-work
tracking, task and subtask management, team presence, coding Q&A, help-point recognition,
leaderboards, study materials, analytics, and role-aware reporting in one responsive application.

## Highlights

- Persistent Focus Mode with pause/resume and task linking.
- Personal, mentor-assigned, admin-assigned, and team task workflows.
- Team-scoped coding Help Desk with accepted answers and one-time point awards.
- Dashboard, activity heatmaps, trends, streaks, and focus breakdowns.
- Weekly/monthly team leaderboards and automatic badges.
- Team presence and mentor-student assignments.
- Published learning-resource library with visibility controls.
- Student performance reports and aggregate corporate snapshots.
- Admin user, role, team, and membership management.
- Light/dark theme and collapsible desktop sidebar.
- Server-enforced permissions for five platform roles.

The complete implemented feature catalog is maintained in the workspace at
`planning/features.md`.

## Technology

- Next.js 16 App Router
- React 19 and TypeScript
- PostgreSQL
- Prisma 7 with `@prisma/adapter-pg`
- Better Auth
- Tailwind CSS 4 and Radix-based UI components
- Vitest and Testing Library

## Requirements

- Node.js 20 or newer
- npm
- PostgreSQL

## Environment

Copy `.env.example` to `.env` and configure:

```env
DATABASE_URL="postgresql://..."
BETTER_AUTH_SECRET="a-unique-secret-at-least-32-characters"
BETTER_AUTH_URL="http://localhost:3000"
SEED_DEMO_DATA="false"
```

`BETTER_AUTH_URL` must exactly match the public application origin. Production values must use
HTTPS and a unique secret.

## Local Setup

```bash
npm install
npm run db:generate
npm run db:deploy
npm run db:seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

The standard seed creates required badge definitions only and is safe to run repeatedly.

## Full Demo Dataset

First sign in once with your normal local account. Then run:

```bash
npm run demo:seed
```

The command is deterministic and rerunnable. It preserves unrelated local data, uses your existing
admin account as the showcase owner, makes the Habitix Product Lab its active team, and creates:

- Five role-specific demo accounts.
- A populated team with owner, lead, mentor, member, moderator, and viewer roles.
- Mentor assignments.
- Tasks covering all major statuses, priorities, types, subtasks, comments, and activity history.
- Fourteen days of focus sessions across multiple users.
- Open and resolved Help Desk conversations with an accepted point award.
- Notifications, presence records, badges, materials, views, reports, and leaderboard snapshots.

All demo accounts use:

```txt
Password: HabitixDemo123!
```

| Experience            | Email                          |
| --------------------- | ------------------------------ |
| Mentor                | `mentor.demo@habitix.local`    |
| Student               | `student.demo@habitix.local`   |
| Student and team lead | `peer.demo@habitix.local`      |
| Moderator             | `moderator.demo@habitix.local` |
| Corporate Viewer      | `corporate.demo@habitix.local` |

The seed refuses to run when `NODE_ENV=production`.

To choose a specific existing showcase owner:

```bash
DEMO_OWNER_EMAIL=admin@example.com npm run demo:seed
```

On PowerShell:

```powershell
$env:DEMO_OWNER_EMAIL="admin@example.com"
npm run demo:seed
```

## First Administrator

New accounts start as students. After the first administrator account has signed in once:

```bash
npm run admin:promote -- admin@example.com
```

Admins can open `/admin/users` to manage platform roles, profile details, teams, active
memberships, and team roles. The final administrator cannot demote themselves.

## Application Routes

| Route               | Purpose                                                                  |
| ------------------- | ------------------------------------------------------------------------ |
| `/dashboard`        | Focus, tasks, streak, help points, activity, presence, and notifications |
| `/activity`         | Date-range analytics, heatmap, session history, and breakdown            |
| `/focus-mode`       | Persistent focus timer and daily sessions                                |
| `/tasks`            | Personal and assigned task board                                         |
| `/tasks/[taskId]`   | Task detail, subtasks, comments, history, and focus sessions             |
| `/help-desk`        | Team coding Q&A, responses, resolutions, and point awards                |
| `/leaderboard`      | Weekly/monthly focus and contribution rankings                           |
| `/team`             | Team members, roles, presence, and tasks                                 |
| `/notifications`    | Notification inbox and read state                                        |
| `/profile`          | Profile editing, statistics, and badges                                  |
| `/study-materials`  | Searchable learning-resource library                                     |
| `/corporate-report` | Student or aggregate reporting based on role                             |
| `/admin/users`      | Admin-only role, profile, team, and membership management                |

## Roles

| Role             | Main access                                                                 |
| ---------------- | --------------------------------------------------------------------------- |
| Student          | Dashboard, activity, focus, tasks, Help Desk, leaderboard, team, materials  |
| Mentor           | Student features plus assignments, reporting, and owned material management |
| Admin            | Operational modules, Focus Mode, reporting, materials, and user management  |
| Moderator        | Dashboard, Help Desk moderation, notifications, and profile                 |
| Corporate Viewer | Notifications, profile, and approved aggregate reports only                 |

Platform role and team role are separate. Help Desk posting requires an active team membership even
when the platform role permits Help Desk access.

## Commands

| Command                          | Purpose                                                         |
| -------------------------------- | --------------------------------------------------------------- |
| `npm run dev`                    | Start the development server                                    |
| `npm run build`                  | Create the production build                                     |
| `npm start`                      | Start the production server                                     |
| `npm test`                       | Run Vitest once                                                 |
| `npm run test:watch`             | Run tests in watch mode                                         |
| `npm run test:coverage`          | Generate test coverage                                          |
| `npm run lint`                   | Run ESLint                                                      |
| `npm run qa:check`               | Run tests, permission audit, lint, Prisma validation, and build |
| `npm run db:generate`            | Generate Prisma Client                                          |
| `npm run db:deploy`              | Apply committed migrations                                      |
| `npm run db:migrate`             | Create migrations during development only                       |
| `npm run db:migrate:status`      | Inspect migration status                                        |
| `npm run db:seed`                | Seed required defaults                                          |
| `npm run demo:seed`              | Load the local showcase dataset                                 |
| `npm run db:studio`              | Open Prisma Studio                                              |
| `npm run admin:promote -- EMAIL` | Promote the first administrator                                 |
| `npm run deploy:prepare`         | Generate Prisma Client and deploy migrations                    |

## Testing

```bash
npm run qa:check
```

The test suite covers analytics, all platform roles, protected routes, task/subtask behavior, focus
completion, Help Desk award idempotency, notification ownership, admin membership changes, and UI
smoke rendering. Tests mock Prisma/session boundaries and never reset the development database.

## Production Deployment

```bash
npm run deploy:check
npm run deploy:prepare
npm run db:seed
```

Use `prisma migrate deploy` in production. Never run `prisma migrate dev`, `migrate reset`, or
`npm run demo:seed` against production.

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for environment, migration, release, and rollback
instructions.

## Documentation

- [User Guide](docs/USER-GUIDE.md)
- [Access Control](docs/access-control.md)
- [Database Design](docs/database-design-v1.md)
- [UI System](docs/UI-SYSTEM.md)
- [Final QA Checklist](docs/FINAL-QA.md)
- [Developer Handoff](docs/DEVELOPER-HANDOFF.md)
- [Known Limitations](docs/KNOWN-LIMITATIONS.md)
- [VS Code Extension Roadmap](docs/VSCODE-EXTENSION-ROADMAP.md)
- [Deployment Guide](docs/DEPLOYMENT.md)
