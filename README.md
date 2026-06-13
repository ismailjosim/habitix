# Habitix

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Testing

```bash
npm test
npm run test:watch
npm run test:coverage
```

Tests use Vitest with mocked Prisma/session boundaries, so they never reset or mutate the development database. Shared fixtures live in `src/test/fixtures.ts`.

Before opening a pull request, run:

```bash
npm test
npm run lint
npm run build
npm run db:validate
```

## Deployment

Habitix requires PostgreSQL and uses Better Auth. Copy `.env.example` into the deployment
provider and replace every placeholder with production values.

```bash
npm run deploy:check
npm run deploy:prepare
npm run db:seed
```

`deploy:prepare` generates Prisma Client and runs `prisma migrate deploy`. It must run against
the production database before the new application version starts. Production seeding creates only
required badge definitions; demo accounts are disabled.

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for the environment, migration, rollback, and release
checklists.

## First Administrator

New accounts start as students. After the first administrator signs in once, promote that account:

```bash
npm run admin:promote -- admin@example.com
```

The administrator can then open `/admin/users` to change platform roles, edit profile details,
create teams, and assign active team memberships. Help Desk posting requires an active team
membership, regardless of platform role.
