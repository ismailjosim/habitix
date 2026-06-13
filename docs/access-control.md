# Access Control Audit

Day 26 establishes `src/lib/permissions.ts` as the central role and ownership policy.
Server queries and actions must enforce these rules; hiding a navigation item or button is not sufficient.

## Role Boundaries

- `STUDENT`: Own profile, focus, activity, accessible tasks, team help, leaderboard, team, notifications, and published study materials. May update assigned/owned task progress but cannot manage unrelated team tasks.
- `MENTOR`: Student capabilities plus scoped task assignment, assigned-student reports, managed-team task progress, help resolution inside active teams, and owned study material management.
- `ADMIN`: Organization-wide task, report, help, and study-material management, plus personal Focus Mode access. Individual data access remains limited to modules explicitly granted by policy.
- `MODERATOR`: Help-desk moderation plus own dashboard, notifications, and profile. No task, focus, team-directory, study-material management, or individual report access.
- `CORPORATE_VIEWER`: Own notifications and profile plus approved aggregate corporate snapshots. Dashboard requests redirect to corporate reporting; no individual task, help, focus, team-directory, or student operational records are queried.

## High-Risk Checks

- Task reads require direct ownership/assignment, active team membership, or admin role.
- Task mutation requires creator, assignee, team manager role, or admin; definition edits and deletion require creator or admin.
- Team task queries verify active membership for the requested team ID.
- Mentor help resolution requires active membership in the post's team; moderators and admins may resolve organization-wide.
- Study-material drafts and edits enforce role, ownership, publication, visibility, and team scope.
- Corporate viewers query `CorporateReportSnapshot` only and cannot access individual report branches.

Run `pnpm security:test` after permission changes.
