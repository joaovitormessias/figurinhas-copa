# AGENTS.md

## Project name
Marketplace de Figurinhas da Copa

## Purpose
Build a web system for buying and selling World Cup stickers managed by an administrator.

This is not a free marketplace between users.

The public user can only buy stickers from the administrator's public stock.
Users may offer stickers to sell to the administrator, but those offers are private and visible only to the user who created them and administrators.

## Current repository structure

```txt
figurinhas/
├── apps/
│   ├── api/        # NestJS backend
│   └── web/        # React + Vite frontend
├── docs/           # Project documentation and business rules
├── docker-compose.yml
├── package.json
├── package-lock.json
└── AGENTS.md
```

Expected backend structure:

```txt
apps/api/
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── src/
│   ├── app.module.ts
│   ├── main.ts
│   ├── prisma/
│   ├── auth/
│   ├── users/
│   ├── stickers/
│   ├── inventory/
│   ├── orders/
│   ├── offers/
│   ├── admin/
│   └── audit/
└── prisma.config.ts
```

Expected frontend structure:

```txt
apps/web/
├── public/
├── src/
│   ├── app/
│   ├── components/
│   ├── features/
│   ├── services/
│   ├── types/
│   └── utils/
├── index.html
├── vite.config.ts
└── package.json
```

## Main stack

Backend:
- NestJS
- TypeScript
- Prisma ORM 7+
- PostgreSQL
- Docker Compose for local database

Frontend:
- React
- Vite
- TypeScript
- Tailwind CSS
- daisyUI

Database:
- PostgreSQL
- Local development via Docker Compose
- Use PostgreSQL schema `figurinhas`

Future deploy:
- Nginx reverse proxy
- Cloudflare DNS
- Hostinger/Portainer environment
- Subdomain: `figurinhas.schumachertursc.com.br`

## Important Prisma 7 rule

This project uses Prisma 7+.

Do not place `url` or `directUrl` inside `schema.prisma`.

Correct datasource in `apps/api/prisma/schema.prisma`:

```prisma
datasource db {
  provider = "postgresql"
  schemas  = ["figurinhas"]
}
```

Database connection configuration belongs in `apps/api/prisma.config.ts`:

```ts
import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
});
```

Every Prisma model must explicitly declare:

```prisma
@@schema("figurinhas")
```

## Environment rules

Backend environment file:

```txt
apps/api/.env
```

Expected local database URL when Postgres is exposed as `5433:5432`:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5433/figurinhas_dev?schema=figurinhas"
DIRECT_URL="postgresql://postgres:postgres@localhost:5433/figurinhas_dev?schema=figurinhas"
```

Frontend environment file:

```txt
apps/web/.env
```

Expected public frontend variables:

```env
VITE_API_URL="http://localhost:3333"
VITE_SUPABASE_URL=""
VITE_SUPABASE_ANON_KEY=""
```

Never expose these in frontend code:
- `DATABASE_URL`
- `DIRECT_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- any database password
- any server-only secret

## Local development commands

Run from repository root unless stated otherwise.

Start database:

```bash
docker compose up -d
```

Check database container:

```bash
docker ps
```

Backend Prisma commands:

```bash
cd apps/api
npx prisma format
npx prisma validate
npx prisma migrate dev --name init
npx prisma generate
```

Backend build:

```bash
cd apps/api
npm run build
```

Backend dev server:

```bash
cd apps/api
npm run start:dev
```

Frontend dev server:

```bash
cd apps/web
npm run dev
```

Frontend build:

```bash
cd apps/web
npm run build
```

## Source of truth documents

Before implementing features, read the relevant files in `docs/`.

Most important documents:

```txt
docs/Visao geral do projeto.md
docs/Escopo do projeto.md
docs/Regra de negocio.md
docs/Requisitos funcionais.md
docs/Requisitos nao funcionais.md
docs/Modelo conceitual de dados.md
docs/Status recomendados.md
docs/Fluxos principais.md
docs/Criterios de aceite gerais.md
docs/Stack tecnica.md
docs/Telas necessarias.md
```

If code and documentation disagree, stop and report the conflict before making broad changes.

## Business model

The system has three major concepts that must never be mixed:

1. Sticker catalog
   - All possible stickers in the album.
   - Says that a sticker exists.
   - Does not mean it is available for sale.

2. Admin stock
   - Stickers owned by the administrator.
   - Can appear in the public storefront.
   - Has quantity, reserved quantity, visibility and sale price.

3. User offers
   - Stickers users want to sell to the administrator.
   - Private.
   - Never appear in the public storefront automatically.

## User roles

### Visitor
Can:
- view public storefront;
- search stickers;
- view basic sticker details;
- access login/register.

Cannot:
- create purchase order;
- create sell offer;
- reserve stock;
- access admin panel.

### Authenticated user
Can:
- create purchase orders for public admin stock;
- create private sell offers to the administrator;
- view own purchase orders;
- view own sell offers;
- update own basic profile.

Cannot:
- see offers from other users;
- edit prices;
- edit stock;
- access admin data.

### Administrator
Can:
- manage sticker catalog;
- manage admin stock;
- manage prices;
- view and process all purchase orders;
- view and process all user offers;
- confirm presencial payment and delivery;
- view audit logs;
- configure system defaults.

## MVP scope

Build only:
- authentication structure or placeholders prepared for authentication;
- sticker catalog;
- public storefront;
- admin stock;
- purchase order flow;
- reservation flow;
- private user sell offers;
- basic admin panel/API endpoints;
- manual presencial payment confirmation;
- audit logging for critical actions.

Do not build in the MVP:
- online payment;
- shipping integration;
- Correios integration;
- chat;
- automatic WhatsApp messages;
- auction system;
- marketplace between users;
- coupon system;
- AI recommendations;
- complex rarity ranking.

## Core business rules

### Public storefront
Only show stickers that:
- belong to `AdminStock`;
- have an active `StickerCatalog` item;
- are visible;
- are not unavailable;
- have `quantity - reservedQuantity > 0`.

### Catalog is not stock
Do not use `StickerCatalog` as availability.

`StickerCatalog` means the sticker exists.
`AdminStock` means the administrator has units for sale.

### User offer is not public inventory
A user offer does not appear publicly.
Only an administrator may decide to buy it.
Only after an explicit admin action can it become part of `AdminStock`.

### Payment
Payment is presencial/manual.
The system records the intent, approval, completion and delivery, but does not process payment online.

### WhatsApp
Users must provide a valid WhatsApp/phone number for presencial negotiation.
Do not implement automatic WhatsApp sending in the MVP.

## Stock and reservation rule

This is a critical rule.
Do not simplify it into a normal CRUD update.

Definitions:

```txt
quantity = physical/admin-controlled stock
reservedQuantity = temporarily blocked stock
availableQuantity = quantity - reservedQuantity
```

When creating a purchase order:
- validate available stock;
- create `PurchaseOrder` with status `pending_admin_approval`;
- create `PurchaseOrderItem` records;
- increment `AdminStock.reservedQuantity`;
- create `Reservation` with status `active`;
- set `Reservation.expiresAt` to now + 24 hours;
- do not decrement `AdminStock.quantity` yet;
- perform all operations inside a Prisma transaction.

When administrator rejects an order:
- change order status to `rejected`;
- decrement `AdminStock.reservedQuantity`;
- mark reservation as `released`;
- do not decrement `AdminStock.quantity`;
- perform all operations inside a Prisma transaction.

When user cancels an order:
- change order status to `cancelled_by_user`;
- decrement `AdminStock.reservedQuantity`;
- mark reservation as `released`;
- do not decrement `AdminStock.quantity`;
- perform all operations inside a Prisma transaction.

When admin cancels an order:
- change order status to `cancelled_by_admin`;
- decrement `AdminStock.reservedQuantity`;
- mark reservation as `released`;
- do not decrement `AdminStock.quantity`;
- perform all operations inside a Prisma transaction.

When reservation expires:
- change order status to `expired`;
- decrement `AdminStock.reservedQuantity`;
- mark reservation as `expired`;
- do not decrement `AdminStock.quantity`;
- perform all operations inside a Prisma transaction.

When administrator completes an order:
- change order status to `completed`;
- decrement `AdminStock.quantity`;
- decrement `AdminStock.reservedQuantity`;
- mark reservation as `converted_to_sale`;
- set completion metadata;
- perform all operations inside a Prisma transaction.

Never allow:
- `quantity < 0`;
- `reservedQuantity < 0`;
- `reservedQuantity > quantity`;
- purchase when requested quantity is greater than available quantity;
- frontend to be the source of truth for stock availability.

## Recommended technical status values

Use English technical values in code, database and API.
Use Portuguese labels only in frontend display.

### PurchaseOrderStatus

```ts
export enum PurchaseOrderStatus {
  PENDING_ADMIN_APPROVAL = "pending_admin_approval",
  APPROVED = "approved",
  REJECTED = "rejected",
  CANCELLED_BY_USER = "cancelled_by_user",
  CANCELLED_BY_ADMIN = "cancelled_by_admin",
  EXPIRED = "expired",
  COMPLETED = "completed",
}
```

### ReservationStatus

```ts
export enum ReservationStatus {
  ACTIVE = "active",
  RELEASED = "released",
  EXPIRED = "expired",
  CONVERTED_TO_SALE = "converted_to_sale",
}
```

### UserOfferStatus

```ts
export enum UserOfferStatus {
  PENDING = "pending",
  UNDER_REVIEW = "under_review",
  ACCEPTED = "accepted",
  REJECTED = "rejected",
  CANCELLED_BY_USER = "cancelled_by_user",
  CANCELLED_BY_ADMIN = "cancelled_by_admin",
  COMPLETED = "completed",
}
```

### AdminStockStatus

```ts
export enum AdminStockStatus {
  AVAILABLE = "available",
  RESERVED = "reserved",
  UNAVAILABLE = "unavailable",
  OUT_OF_STOCK = "out_of_stock",
}
```

### StickerCondition

```ts
export enum StickerCondition {
  NEW = "new",
  GOOD = "good",
  USED = "used",
  DAMAGED = "damaged",
}
```

## Frontend label mapping

Frontend may display these Portuguese labels:

```ts
export const purchaseOrderStatusLabel = {
  pending_admin_approval: "Aguardando aprovação",
  approved: "Aprovado",
  rejected: "Recusado",
  cancelled_by_user: "Cancelado pelo usuário",
  cancelled_by_admin: "Cancelado pelo administrador",
  expired: "Expirado",
  completed: "Concluído",
};

export const reservationStatusLabel = {
  active: "Reserva ativa",
  released: "Reserva liberada",
  expired: "Reserva expirada",
  converted_to_sale: "Convertida em venda",
};

export const userOfferStatusLabel = {
  pending: "Pendente",
  under_review: "Em análise",
  accepted: "Aceita",
  rejected: "Recusada",
  cancelled_by_user: "Cancelada pelo usuário",
  cancelled_by_admin: "Cancelada pelo administrador",
  completed: "Concluída",
};

export const adminStockStatusLabel = {
  available: "Disponível",
  reserved: "Reservado",
  unavailable: "Indisponível",
  out_of_stock: "Esgotado",
};
```

Do not store Portuguese labels in the database.

## Expected Prisma models

The Prisma schema should model at least:

```txt
UserProfile
StickerCatalog
AdminStock
PurchaseOrder
PurchaseOrderItem
Reservation
UserOffer
SystemConfig
AuditLog
```

Minimum relation rules:
- `AdminStock` belongs to `StickerCatalog`.
- `PurchaseOrder` belongs to `UserProfile`.
- `PurchaseOrderItem` belongs to `PurchaseOrder`.
- `PurchaseOrderItem` references both `StickerCatalog` and `AdminStock`.
- `Reservation` belongs to `PurchaseOrder`, `AdminStock` and `StickerCatalog`.
- `UserOffer` belongs to `UserProfile` and `StickerCatalog`.
- `AuditLog` may reference an actor user.

`PurchaseOrderItem` must preserve price snapshots:
- `unitPrice`
- `subtotal`

Do not calculate historical order totals from current stock prices.

## Implementation order

Build in this order:

1. Prisma schema and migrations.
2. PrismaModule and `/health` endpoint.
3. Sticker catalog module.
4. Admin stock/inventory module.
5. Public storefront endpoints.
6. Purchase orders and reservations.
7. User offers.
8. Audit logging.
9. Admin endpoints.
10. Frontend integration.
11. UI polish and card styling.

Do not start with visual polish before backend rules exist.

## Backend coding rules

Use NestJS module boundaries.

Expected module names:
- `PrismaModule`
- `AuthModule`
- `UsersModule`
- `StickersModule`
- `InventoryModule`
- `OrdersModule`
- `OffersModule`
- `AdminModule`
- `AuditModule`

Use DTOs for input validation.

Validate:
- required fields;
- positive quantities;
- non-negative prices;
- valid enum values;
- unique sticker codes;
- permissions and ownership.

Do not trust frontend input.

Use Prisma transactions for:
- creating purchase orders;
- reserving stock;
- completing orders;
- cancelling orders;
- expiring reservations;
- converting accepted offers into admin stock;
- any operation that changes more than one table.

Prefer explicit services over putting business logic in controllers.

Controllers should:
- receive request;
- validate DTOs;
- call services;
- return response.

Services should:
- enforce business rules;
- use transactions;
- call Prisma;
- record audit logs where needed.

## API design rules

Use REST endpoints for MVP.

Suggested public endpoints:

```txt
GET /health
GET /stickers
GET /stickers/:id
GET /inventory/public
GET /inventory/public/:id
```

Suggested authenticated user endpoints:

```txt
GET /me
PATCH /me
POST /orders
GET /orders/my
GET /orders/my/:id
PATCH /orders/my/:id/cancel
POST /offers
GET /offers/my
GET /offers/my/:id
PATCH /offers/my/:id/cancel
```

Suggested admin endpoints:

```txt
POST /admin/stickers
PATCH /admin/stickers/:id
POST /admin/inventory
PATCH /admin/inventory/:id
GET /admin/orders
GET /admin/orders/:id
PATCH /admin/orders/:id/approve
PATCH /admin/orders/:id/reject
PATCH /admin/orders/:id/cancel
PATCH /admin/orders/:id/complete
GET /admin/offers
GET /admin/offers/:id
PATCH /admin/offers/:id/status
POST /admin/offers/:id/add-to-stock
GET /admin/audit-logs
GET /admin/system-config
PATCH /admin/system-config
```

## Authentication and authorization

The final system may use Supabase Auth or NestJS auth.

Until auth is fully implemented:
- keep guards centralized;
- use TODOs only in auth boundary files;
- do not scatter fake user IDs across services;
- do not build business rules that depend on hardcoded users.

When authentication exists:
- users can only access their own orders and offers;
- admins can access administrative endpoints;
- admin-only operations must reject normal users;
- public endpoints must not leak private offer or user data.

## Audit logging

Create audit logs for important actions:
- sticker created/updated;
- stock created/updated;
- order created;
- order approved/rejected/cancelled/completed;
- reservation created/released/expired/converted;
- user offer created/accepted/rejected/cancelled/completed;
- price changed;
- stock quantity changed;
- admin configuration changed.

Audit log should store:
- actor user ID if available;
- action;
- entity;
- entity ID;
- old value when relevant;
- new value when relevant;
- timestamp.

## Frontend coding rules

Use React + Vite + TypeScript.
Use Tailwind CSS + daisyUI.

The visual style should combine:
- marketplace/catalog density similar to game item marketplaces;
- colorful collectible-card energy inspired by games;
- original visual identity, without copying protected assets.

Do not use official FIFA/Panini/Brawl Stars assets unless legally licensed.
Use original cards, placeholders or properly licensed images only.

Frontend structure should be feature-based:

```txt
src/features/catalog
src/features/inventory
src/features/orders
src/features/offers
src/features/auth
src/components/ui
src/components/layout
src/services
src/types
```

Frontend must not decide sensitive business rules.
Frontend may calculate display-only values, but backend is the source of truth for:
- stock availability;
- reservation creation;
- order status transitions;
- offer visibility;
- admin permissions.

## UI screens required for MVP

Public:
- storefront/home page;
- sticker details page;
- login/register page.

User:
- my orders;
- order details;
- sell sticker form;
- my offers;
- profile page.

Admin:
- dashboard;
- catalog management;
- stock management;
- orders management;
- offers management;
- system settings;
- audit logs.

## Testing and validation rules

After backend changes, run:

```bash
cd apps/api
npm run build
npx prisma validate
```

After Prisma schema changes, run:

```bash
cd apps/api
npx prisma format
npx prisma validate
npx prisma migrate dev --name <name>
npx prisma generate
```

After frontend changes, run:

```bash
cd apps/web
npm run build
```

If tests are added, run them before reporting completion.

Do not claim a task is done if build/validation fails.
If a command fails, report:
- command executed;
- error summary;
- likely cause;
- proposed fix.

## Development workflow for Codex

Before modifying files:
1. Read this `AGENTS.md`.
2. Read the relevant docs in `docs/`.
3. Inspect current code.
4. State the plan briefly.
5. Keep the task scope small.

While modifying files:
- avoid broad rewrites;
- do not rename major folders without explicit approval;
- do not implement unrelated features;
- do not remove documentation;
- do not overwrite `.env` files;
- prefer `.env.example` for examples;
- preserve existing working behavior.

After modifying files:
1. Summarize files changed.
2. Explain why the change was made.
3. List validation commands run.
4. Report any commands not run.
5. Suggest the next smallest step.

## Commit discipline

Before large Codex tasks, the user should commit the current state.

Do not create huge multi-feature changes in one step.

Recommended change size:
- one module;
- one schema adjustment;
- one endpoint group;
- one frontend screen;
- one bug fix.

## Safety and privacy

This system handles personal data:
- name;
- email;
- WhatsApp/phone;
- order history;
- offer history.

Protect this data.

Do not expose:
- other users' offers;
- hidden stock;
- internal purchase prices;
- admin notes;
- audit logs to normal users;
- service role keys;
- database URLs.

## Known project decisions

Confirmed:
- local development first;
- deploy later;
- backend controls business rules;
- PostgreSQL schema is `figurinhas`;
- Prisma 7 uses `prisma.config.ts` for database URL;
- technical statuses are English snake_case;
- frontend labels may be Portuguese;
- payment is presencial/manual;
- WhatsApp is negotiation channel, not automated integration in MVP;
- user offers are private;
- public storefront comes from admin stock only.

Still avoid assuming without confirmation:
- final production auth strategy;
- final deployment container names;
- final Nginx configuration;
- final image asset licensing strategy;
- automatic expiration job mechanism.

## Definition of done

A task is done only when:
- the implementation matches the relevant docs;
- code builds;
- Prisma validates if Prisma was touched;
- migrations are generated when schema changed;
- sensitive rules are enforced in backend;
- no unrelated feature was added;
- changes are summarized clearly.

