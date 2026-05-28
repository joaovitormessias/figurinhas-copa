# Project Status

## Current phase

Backend foundation.

## Done

- Monorepo created with apps/api and apps/web.
- PostgreSQL local running with Docker Compose.
- Prisma 7 configured with prisma.config.ts.
- Initial Prisma migration synced.
- Prisma Client generated.
- Root package.json configured with workspaces.
- .gitignore added and env files removed from tracking.

## In progress

- PrismaModule and /health endpoint.

## Next task

Implement PrismaModule, PrismaService and GET /health.

## Blockers

None.

## Important notes

- Backend is the source of truth for business rules.
- Frontend must not decide stock/reservation rules.
- Prisma 7 does not use url/directUrl inside schema.prisma.
- Stock availability = quantity - reservedQuantity.

## Last validation

- docker compose up -d: OK
- npx prisma migrate dev --name init: OK
- npx prisma generate: OK