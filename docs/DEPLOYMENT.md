# Deployment Guide

## Platform Requirements

- Node.js 20 or newer.
- A PostgreSQL database. The Prisma datasource is explicitly configured with
  `provider = "postgresql"`.
- A deployment host that supports Next.js server rendering and server actions.
- HTTPS for the production application origin.

Habitix currently stores no uploaded files, so no storage provider keys are required. User avatar
URLs are remote values supplied by auth/profile data, while the application logo is bundled at
build time.

## Required Environment

| Variable             | Purpose                                                                               |
| -------------------- | ------------------------------------------------------------------------------------- |
| `DATABASE_URL`       | PostgreSQL connection string used by Prisma and the application.                      |
| `BETTER_AUTH_SECRET` | Unique secret of at least 32 characters. Never reuse the development value.           |
| `BETTER_AUTH_URL`    | Exact public origin, such as `https://habitix.example.com`, without a trailing slash. |
| `SEED_DEMO_DATA`     | Optional. Leave unset or `false` in production.                                       |

`BETTER_AUTH_URL` is also the only trusted production origin. Confirm that the deployment host,
protocol, and any custom domain exactly match this value. Preview deployments need their own
environment values.

## Release Checklist

1. Provision an empty or backed-up PostgreSQL database.
2. Configure all required environment variables in the deployment platform.
3. Run `npm ci`.
4. Run `npm run deploy:check`.
5. Run `npm run deploy:prepare`.
6. Run `npm run db:seed` to upsert required badge definitions.
7. Start the application with `npm start`, or let the platform start the Next.js output.
8. Sign up with a real account and verify the auth callback returns to the production origin.
9. Smoke test `/dashboard`, `/tasks`, `/focus-mode`, `/help-desk`, and `/notifications`.

For Vercel or a similar platform, use `npm run build` as the build command. Run
`npm run deploy:prepare` in a controlled release step rather than from every application instance.

## Database Migrations

Production migrations must use:

```bash
npm run db:deploy
```

Never run `prisma migrate dev` against production. That command is only for creating migrations
on a developer database.

Before release, inspect status with:

```bash
npm run db:migrate:status
```

Test the complete migration history against a disposable empty PostgreSQL database before the first
production release. Point `DATABASE_URL` at that database, run `npm run db:deploy`, then run
`npm run db:seed` and `npm run db:test`. Do not use a development or production database for
this clean-database test.

## Seed Policy

`npm run db:seed` is idempotent for required badge definitions. By default it does not create
users, teams, sessions, tasks, notifications, or activity history.

Demo data is permitted only on disposable local or preview databases:

```bash
SEED_DEMO_DATA=true npm run db:seed
```

The seed script rejects demo seeding when `NODE_ENV=production`.

## Rollback

Prisma migrations are forward-only in production. Before a risky migration, take a provider-level
database backup and rehearse restoration. If an application release fails:

1. Roll back the application artifact to the previous version.
2. Do not delete migration records or run `migrate reset`.
3. Restore the database backup only when the migration itself is incompatible and data restoration
   has been approved.
4. Create a new corrective migration for normal schema fixes.
