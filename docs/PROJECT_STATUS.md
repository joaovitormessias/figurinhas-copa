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
- AdminStock Prisma model and migration created.
- InventoryModule implemented with public storefront endpoints and admin placeholder endpoints.
- PurchaseOrder, PurchaseOrderItem and Reservation Prisma models and migration created.
- OrdersModule implemented with temporary reservation flow and admin order transitions.
- UserOffer Prisma model and migration created.
- OffersModule implemented with private user offer endpoints and admin status transitions.
- Root package.json configured with workspaces.
- .gitignore added and env files removed from tracking.

## In progress

- None.

## Next task

Implement audit logging for critical actions.

## Blockers

None.

## Important notes

- Backend is the source of truth for business rules.
- Frontend must not decide stock/reservation rules.
- Prisma 7 does not use url/directUrl inside schema.prisma.
- Stock availability = quantity - reservedQuantity.
- StickerCatalog records possible stickers only; public sale availability still belongs to future AdminStock.
- AdminStock records administrator-owned sale stock and calculates availableQuantity from quantity - reservedQuantity.
- Purchase order creation reserves stock but does not decrement AdminStock.quantity.
- Completing an approved order decrements quantity and reservedQuantity in the same transaction.
- UserOffer records private offers only and does not update AdminStock automatically.

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
- npm run prisma:format: OK
- npm run prisma:validate: OK
- cd apps/api && npx prisma migrate dev --name admin_stock: OK
- npm run prisma:generate: OK
- npm run build:api: OK
- npm run prisma:format: OK
- npm run prisma:validate: OK
- cd apps/api && npx prisma migrate dev --name purchase_orders_reservations: OK
- npm run prisma:generate: OK
- npm run build:api: OK
- npm run prisma:format: OK
- npm run prisma:validate: OK
- cd apps/api && npx prisma migrate dev --name user_offers: OK
- npm run prisma:generate: OK
- npm run build:api: OK
