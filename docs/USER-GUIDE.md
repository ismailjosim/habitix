# Habitix User Guide

## Getting Started

1. Create an account or sign in.
2. Complete your profile.
3. Ask an administrator to assign you to a team if you need team tasks, Help Desk, presence, or
   leaderboard features.
4. Use Focus Mode and Tasks to record daily work.

New accounts receive the `STUDENT` platform role. Platform roles control module access. Team roles
such as `MEMBER`, `LEAD`, and `MENTOR` control responsibility inside one team.

## Main Features

- **Dashboard:** Seven-day focus, task, help-point, streak, notification, and team-presence summary.
- **Activity:** Focus history, activity breakdown, help credit, streaks, and date-range views.
- **Focus Mode:** Start, pause, resume, stop, or complete a timed session and optionally link a task.
- **Tasks:** Create personal tasks, manage subtasks, update status, and review task history.
- **Help Desk:** Ask teammates for help, respond, resolve requests, and award a helpful response.
- **Leaderboard:** Weekly and monthly team focus and contribution rankings.
- **Team:** Active members, roles, presence, and shared task information.
- **Notifications:** Review and mark individual or all notifications as read.
- **Profile:** Update display name, biography, institution, and department; review stats and badges.
- **Study Materials:** Browse published resources. Mentors and admins can manage materials.
- **Corporate Report:** Mentors and admins view authorized student reports; corporate viewers see
  approved aggregate snapshots only.
- **User Management:** Admin-only page for roles, profile fields, teams, and memberships.

## Help Desk Access

The Help Desk navigation is available to students, mentors, admins, and moderators. Asking or
answering peer questions requires an active team membership because every request is team-scoped.
If **Ask for help** is disabled, open Team to check your status or ask an admin to assign you at
`/admin/users`.

## Administrator Setup

After the first administrator has signed in once:

```bash
npm run admin:promote -- admin@example.com
```

The administrator can then use `/admin/users`. The application prevents the final administrator
from removing their own admin role.
