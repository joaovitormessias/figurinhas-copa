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
- Sticker catalog Prisma model and migration created.
- StickersModule implemented with public catalog endpoints and admin placeholder endpoints.
- Root package.json configured with workspaces.
- .gitignore added and env files removed from tracking.

## In progress

- None.

## Next task

Implement admin stock/inventory module.

## Blockers

None.

## Important notes

- Backend is the source of truth for business rules.
- Frontend must not decide stock/reservation rules.
- Prisma 7 does not use url/directUrl inside schema.prisma.
- Stock availability = quantity - reservedQuantity.
- StickerCatalog records possible stickers only; public sale availability still belongs to future AdminStock.

## Last validation

- docker compose up -d: OK
- npx prisma migrate dev --name init: OK
- npx prisma generate: OK
- npm run build:api: OK
- npm run dev:api: OK
- curl http://localhost:3333/health: OK, returned status ok and database connected
- npm run prisma:validate: OK
- cd apps/api && npx prisma migrate dev --name sticker_catalog: OK
- npm run prisma:generate: OK
- npm run build:api: OK
