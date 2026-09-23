# Habitix

**Habitix** is a full-stack student productivity and team collaboration platform built for learners and mentors. It unifies focused-work tracking, structured task management, peer Q&A, live team presence, leaderboards, study materials, image uploads, role-aware reporting, and admin tooling in a single, responsive Next.js application.

---

## Features

### 🎯 Focus Mode

- Persistent timer with start, pause, resume, and session completion
- Activity-type tagging (Coding, Study, Writing, Research, Review)
- Optional task and team linking per session
- Planned vs. actual minute tracking with session notes
- VS Code extension integration roadmap
- Full session history and daily statistics

### ✅ Task Management

- Four task types: **Personal**, **Mentor Assigned**, **Admin Assigned**, **Team**
- Six statuses: `TODO → IN_PROGRESS → BLOCKED → IN_REVIEW → DONE → ARCHIVED`
- Priorities: Urgent, High, Medium, Low
- Subtask checklists with completion tracking
- Task comments with screenshot attachments (Cloudinary)
- Activity history timeline on every task
- Progress bar calculated from subtask completion
- Metadata sidebar (due date, category, assignee, creator)

### 👥 Team & Presence

- Multi-team support with unique slugs
- Six membership roles: Owner, Admin, Lead, Mentor, Member, Viewer
- Live presence panel showing recently active teammates
- Mentor-student assignment tracking per team
- Team avatar/logo upload (role-restricted)

### 🆘 Help Desk

- Team-scoped coding Q&A board
- Urgency levels and topic tags
- Screenshot uploads on question posts
- Answer acceptance with one-time help-point awards
- ANSWERED / RESOLVED / OPEN status flow
- Moderation role for Help Desk oversight

### 📊 Dashboard & Analytics

- Welcome banner with streak, focus, and help-point stats
- 28-day activity heatmap
- Online peers panel and notification feed
- Dedicated `/activity` page with date-range filtering
- Focus breakdown by activity type
- Streak and trend tracking

### 🏆 Leaderboard & Badges

- Weekly and monthly team-scoped leaderboard snapshots
- Rankings by composite score (focus + tasks + help points + badges)
- Seven automatic badge definitions with eligibility criteria
- Badge award history and notification on earn

### 📚 Study Materials

- Published resource library with LINK, PDF, and NOTE types
- Visibility controls: Public, Team, Organization
- Module and milestone tagging
- Document/PDF upload to Cloudinary (up to 15 MB)
- Mentor/admin-only create and edit with student browse access
- View and download tracking

### 🔔 Notifications

- Real-time inbox with category filtering
- Types: Task Assigned, Help Resolved, Badge Awarded, Team Update, Mention
- Read/unread state with bulk-mark support

### 👤 Profile

- Avatar upload with drag-and-drop dropzone (Cloudinary)
- Display name, bio, institution, and department
- Focus statistics, streak, and help points
- Earned badge showcase gallery

### 📈 Corporate Report

- Student-level performance report (focus, tasks, badges)
- Aggregate corporate snapshots for Corporate Viewer role
- Printable report layout

### 🛡️ Admin Panel

- User search and role management
- Team creation and membership editing
- Profile editing and deactivation
- Role promotion/demotion with admin guard (final admin protected)

### 🎨 UI & UX

- Light / dark theme toggle with `next-themes`
- Collapsible desktop sidebar with keyboard navigation
- **Skeleton loading states** on every major route (layout-matching, no spinners)
- Glassmorphism cards, smooth micro-animations, HSL color palette
- Google Fonts (Inter) for modern typography
- Fully responsive down to mobile

---

## Technology Stack

| Layer           | Technology                                                 |
| --------------- | ---------------------------------------------------------- |
| Framework       | [Next.js 16](https://nextjs.org/) App Router (Turbopack)   |
| Language        | TypeScript 5                                               |
| UI              | React 19, Tailwind CSS 4, Radix UI                         |
| Database        | PostgreSQL (Neon serverless)                               |
| ORM             | Prisma 7 with `@prisma/adapter-pg`                         |
| Auth            | [Better Auth](https://better-auth.com/) with Google OAuth  |
| File Storage    | [Cloudinary](https://cloudinary.com/) (images + documents) |
| Testing         | Vitest + Testing Library                                   |
| Linting         | ESLint 9, Prettier, Husky + lint-staged                    |
| Package Manager | pnpm                                                       |

---

## Project Structure

```
habitix-project/
├── prisma/
│   ├── schema.prisma          # 30+ models, enums, relations
│   ├── seed.ts                # Badge definitions seed (safe/repeatable)
│   ├── demo-seed.ts           # Full showcase dataset
│   └── migrations/            # Applied SQL migrations
├── src/
│   ├── app/
│   │   ├── (app)/             # Protected layout — all feature pages
│   │   │   ├── dashboard/
│   │   │   ├── tasks/[taskId]/
│   │   │   ├── team/
│   │   │   ├── help-desk/
│   │   │   ├── study-materials/[materialId]/
│   │   │   ├── leaderboard/
│   │   │   ├── focus-mode/
│   │   │   ├── profile/
│   │   │   ├── notifications/
│   │   │   ├── activity/
│   │   │   ├── corporate-report/
│   │   │   └── admin/users/
│   │   ├── (auth)/            # Login, sign-up, sign-in pages
│   │   └── api/
│   │       ├── auth/[...all]/ # Better Auth handler
│   │       └── upload/        # Cloudinary upload API route
│   ├── components/            # Feature-scoped component folders
│   ├── lib/
│   │   ├── actions/           # Server Actions (tasks, focus, help-desk…)
│   │   ├── queries/           # Read-only data fetching per feature
│   │   ├── auth.ts            # Better Auth config
│   │   ├── cloudinary.ts      # Upload / delete helpers
│   │   ├── upload-client.ts   # Client-side upload streaming
│   │   ├── badges.ts          # Badge logic and awarding
│   │   ├── permissions.ts     # Role permission matrix
│   │   └── authorization.ts   # Auth guards
│   └── generated/prisma/      # Auto-generated Prisma client
```

---

## Requirements

- **Node.js** 20 or newer
- **pnpm** (or npm / yarn)
- **PostgreSQL** database (local or cloud, e.g. [Neon](https://neon.tech))
- **Cloudinary** account (free tier works)
- (Optional) **Google OAuth** credentials for social login

---

## Environment Setup

Copy `.env.example` to `.env` and fill in all values:

```env
# Database
DATABASE_URL="postgresql://user:password@host:5432/habitix?sslmode=require"

# Better Auth
BETTER_AUTH_SECRET="a-random-secret-at-least-32-characters-long"
BETTER_AUTH_URL="http://localhost:3000"

# Cloudinary
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"

# Google OAuth (optional)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

> **Production**: `BETTER_AUTH_URL` must use HTTPS and match your public domain exactly. Never share `BETTER_AUTH_SECRET` or `CLOUDINARY_API_SECRET`.

---

## Local Development Setup

```bash
# 1. Install dependencies
pnpm install

# 2. Generate Prisma client
pnpm db:generate

# 3. Apply database migrations
pnpm db:deploy

# 4. Seed required badge definitions
pnpm db:seed

# 5. Start the dev server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Demo Dataset

To explore every feature with realistic data:

**Step 1 — Sign in once** with your account at [http://localhost:3000/sign-up](http://localhost:3000/sign-up).

**Step 2 — Run the demo seed:**

```bash
pnpm demo:seed
# or on Windows PowerShell:
npx tsx prisma/demo-seed.ts
```

This creates a "Habitix Product Lab" team and populates:

- 5 role-specific demo accounts
- 8 tasks across all statuses, priorities, and types with subtasks and comments
- 65 focus sessions across 14 days (4 users)
- 3 help desk posts with answers and accepted resolution
- 3 study materials (links and notes)
- Leaderboard snapshot with 3 ranked entries
- 10 badge awards and 14 notifications
- Corporate report snapshot and student performance reports
- Presence records for live presence panel

**Demo accounts** — all use password `HabitixDemo123!`:

| Role                | Email                          |
| ------------------- | ------------------------------ |
| Mentor              | `mentor.demo@habitix.local`    |
| Student             | `student.demo@habitix.local`   |
| Student & Team Lead | `peer.demo@habitix.local`      |
| Moderator           | `moderator.demo@habitix.local` |
| Corporate Viewer    | `corporate.demo@habitix.local` |

To specify a custom showcase owner:

```bash
# bash
DEMO_OWNER_EMAIL=admin@example.com npx tsx prisma/demo-seed.ts

# PowerShell
$env:DEMO_OWNER_EMAIL="admin@example.com"; npx tsx prisma/demo-seed.ts
```

> The seed is safe to re-run — it clears only `demo-` prefixed records and preserves all other data. It is blocked when `NODE_ENV=production`.

---

## First Administrator

New accounts default to `STUDENT` role. To promote your first admin:

```bash
# Sign in first, then:
npx tsx scripts/promote-admin.ts admin@example.com
```

Admins can manage all users, roles, teams, and memberships from `/admin/users`.

---

## Application Routes

| Route                   | Purpose                                                        |
| ----------------------- | -------------------------------------------------------------- |
| `/dashboard`            | Stats, activity heatmap, presence, and notifications           |
| `/tasks`                | Kanban board — personal and assigned tasks                     |
| `/tasks/[taskId]`       | Task detail, subtasks, comments with screenshots, history      |
| `/focus-mode`           | Persistent focus timer and session history                     |
| `/team`                 | Team members, roles, shared tasks, and presence                |
| `/help-desk`            | Team Q&A board with screenshot uploads and point awards        |
| `/leaderboard`          | Weekly/monthly team rankings and badge gallery                 |
| `/study-materials`      | Searchable learning resource library with PDF upload           |
| `/study-materials/[id]` | Resource detail view with edit/replace for mentors             |
| `/activity`             | Date-range analytics, heatmap, and focus breakdown             |
| `/notifications`        | Notification inbox with read state management                  |
| `/profile`              | Profile editing with drag-and-drop avatar upload               |
| `/corporate-report`     | Performance report (student) or aggregate snapshot (corporate) |
| `/admin/users`          | Admin-only user, role, team, and membership management         |

---

## Role Permissions

| Role                 | Access Summary                                                                                   |
| -------------------- | ------------------------------------------------------------------------------------------------ |
| **Student**          | Dashboard, focus, tasks (personal), help desk, leaderboard, team, study materials, profile       |
| **Mentor**           | All student features + mentor-assigned tasks, student reports, material management, badge awards |
| **Admin**            | All operational modules + user management, admin-assigned tasks, all reports                     |
| **Moderator**        | Dashboard, help desk moderation, notifications, profile only                                     |
| **Corporate Viewer** | Approved aggregate reports, notifications, and profile only                                      |

Platform role and team membership role are independent. Help Desk posting requires active team membership.

---

## Commands

| Command                       | Purpose                           |
| ----------------------------- | --------------------------------- |
| `pnpm dev`                    | Start development server          |
| `pnpm build`                  | Create production build           |
| `pnpm start`                  | Start production server           |
| `pnpm lint`                   | Run ESLint                        |
| `pnpm lint:fix`               | Run ESLint with auto-fix          |
| `pnpm format`                 | Format all files with Prettier    |
| `pnpm vitest run`             | Run unit test suite once          |
| `pnpm vitest`                 | Run tests in watch mode           |
| `pnpm db:generate`            | Generate Prisma Client            |
| `pnpm db:migrate`             | Create a new migration (dev only) |
| `pnpm db:deploy`              | Apply committed migrations        |
| `pnpm db:migrate:status`      | Inspect migration status          |
| `pnpm db:seed`                | Seed required badge definitions   |
| `npx tsx prisma/demo-seed.ts` | Load full showcase dataset        |

---

## Testing

```bash
pnpm vitest run
```

The test suite covers:

- Analytics calculations
- All 5 platform roles and permission checks
- Task/subtask creation and assignment rules
- Focus session start, pause, resume, and completion
- Help Desk point award idempotency
- Notification ownership guards
- Admin membership changes
- UI smoke rendering (activity dashboard)

Tests mock Prisma and session boundaries — they never modify the development database.

---

## Image & File Uploads

Cloudinary is used for all media storage. The following upload types are supported:

| Feature                 | Type             | Max Size |
| ----------------------- | ---------------- | -------- |
| Profile avatar          | Image            | 5 MB     |
| Team logo               | Image            | 5 MB     |
| Help Desk screenshot    | Image            | 5 MB     |
| Task comment attachment | Image            | 5 MB     |
| Study material document | PDF / EPUB / DOC | 15 MB    |

All uploads go through the authenticated `/api/upload` route. Stale files are removed from Cloudinary on replacement.

---

## Skeleton Loading

Every major route has a dedicated `loading.tsx` with a layout-matching skeleton that mirrors the exact component structure of the page — no generic spinners. This eliminates layout shift and provides a seamless perceived loading experience during server data fetching.

---

## Production Deployment

```bash
# Run checks
pnpm build

# Apply migrations against production DB
DATABASE_URL="..." pnpm db:deploy

# Seed badge definitions only (safe)
DATABASE_URL="..." pnpm db:seed
```

> Never run `demo:seed`, `migrate dev`, or `migrate reset` against a production database.

For Vercel deployment, the `vercel-build` script in `package.json` handles Prisma generation and migration automatically.

---

## License

Private — all rights reserved.
