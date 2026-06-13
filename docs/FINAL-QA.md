# Final QA Checklist

Last reviewed: June 13, 2026.

## Automated Gate

Run the complete gate from the project root:

```bash
npm run qa:check
```

This runs unit/integration tests, the permission audit, ESLint, Prisma validation, TypeScript, and
the production Next.js build.

## Route Review

| Route                      | Core state reviewed                                                 |
| -------------------------- | ------------------------------------------------------------------- |
| `/sign-up`, `/sign-in`     | Labels, password rules, errors, redirects, mobile card layout       |
| `/dashboard`               | Empty totals, trends, heatmap, notifications, presence              |
| `/activity`                | Empty history, ranges, horizontal heatmap overflow, breakdown       |
| `/focus-mode`              | Timer controls, restored session, linked task, empty sessions       |
| `/tasks`, `/tasks/[id]`    | Personal/assigned creation, status, subtasks, comments, empty board |
| `/help-desk`               | No-team guidance, create/respond/resolve/award flow, filters        |
| `/leaderboard`             | No-team and zero-activity states, weekly/monthly views              |
| `/team`                    | No-membership state, members, presence, shared tasks                |
| `/notifications`           | Empty inbox, read one, read all                                     |
| `/profile`                 | Responsive form, badges, stats, live save feedback                  |
| `/study-materials`, detail | Empty library, filters, managed create form, resource detail        |
| `/corporate-report`        | Student, aggregate, empty, filter, and print states                 |
| `/admin/users`             | Admin-only access, role changes, team creation and assignment       |

## Accessibility And Responsive Review

- Global keyboard skip link targets the main content.
- Shared controls expose visible focus rings.
- Auth, profile, focus, task, material, and admin fields have labels or accessible names.
- Errors use alert semantics and profile saves use a polite status region.
- Reduced-motion preferences disable nonessential animation and smooth scrolling.
- Mobile navigation uses a labelled sheet; desktop navigation remains fixed.
- Dense grids collapse before small-screen widths; wide heatmaps use horizontal scrolling.
- Empty and loading states exist for protected application modules.
- Color is supplemented by text labels for task, role, urgency, timer, and notification states.

## Manual Release Pass

Use at least one student and one admin account:

1. Sign up, sign in, and sign out.
2. Assign the student to a team from `/admin/users`.
3. Create a task with subtasks and complete it.
4. Start and complete a focus session linked to the task.
5. Create a help request, answer from another account, resolve it, and award points.
6. Confirm dashboard, activity, leaderboard, profile, and notifications reflect the changes.
7. Create and open a study material.
8. Verify mentor/admin reporting and corporate aggregate isolation.
9. Repeat navigation at approximately 375px, 768px, and 1440px widths.
10. Complete keyboard-only navigation and verify visible focus.

The production build compiles every route, but authenticated multi-account browser automation is
not yet part of the repository. Complete this manual pass before a public launch.
