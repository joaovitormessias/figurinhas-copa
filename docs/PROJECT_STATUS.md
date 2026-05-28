# Project Status

## Current phase

Backend foundation.

## Done

- Monorepo created with apps/api and apps/web.
- PostgreSQL local running with Docker Compose.
- Prisma 7 configured with prisma.config.ts.
- Initial Prisma migration synced.
- Prisma Client generated.
- PrismaModule and PrismaService integrated in NestJS backend.
- GET /health validates database connection with Prisma.
- Root package.json configured with workspaces.
- .gitignore added and env files removed from tracking.

## In progress

- None.

## Next task

Implement sticker catalog module.

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
- npm run build:api: OK
- npm run dev:api: OK
- curl http://localhost:3333/health: OK, returned status ok and database connected
