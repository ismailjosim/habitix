# Developer Handoff

## Architecture

- Next.js App Router with React server components and server actions.
- PostgreSQL through Prisma and the `@prisma/adapter-pg` adapter.
- Better Auth email/password authentication.
- Central authorization policy in `src/lib/permissions.ts`.
- Server queries in `src/lib/queries` and mutations in `src/lib/actions`.
- Shared analytics calculations in `src/lib/analytics.ts`.
- Vitest tests mock session and Prisma boundaries; they do not reset the development database.

## Local Workflow

```bash
npm install
npm run db:generate
npm run db:deploy
npm run db:seed
npm run dev
```

Required environment variables are documented in `.env.example`. Promote the first administrator
only after that account has signed in once:

```bash
npm run admin:promote -- admin@example.com
```

## Quality Commands

```bash
npm run qa:check
npm run db:migrate:status
npm run deploy:prepare
```

Never use `prisma migrate dev`, `migrate reset`, or demo seeding against production.

## Ownership Rules

- Every protected query/action must check session and role on the server.
- Navigation visibility is convenience, not authorization.
- Help requests and leaderboards are team-scoped.
- Mentor access is constrained by assignments or managed teams.
- Corporate viewers must read approved aggregate snapshots, not individual student data.
- Role changes and active team assignment are admin-only.

## Data And Fixtures

Production seeding upserts badge definitions only. Set `SEED_DEMO_DATA=true` only for disposable
local or preview databases. Shared test fixtures live in `src/test/fixtures.ts`.

See `docs/database-design-v1.md`, `docs/access-control.md`, and `docs/DEPLOYMENT.md` before
changing data ownership or deployment behavior.
