
# Technical Decisions

## 001 - Backend is the business authority

The frontend must not apply sensitive rules such as stock reservation, order completion or user offer visibility.

## 002 - Catalog is not stock

StickerCatalog represents existing stickers.
AdminStock represents what the administrator sells publicly.
UserOffer represents private offers from users to the administrator.

## 003 - Reservation flow

Creating an order does not decrease AdminStock.quantity.
Creating an order increases AdminStock.reservedQuantity.
Completing an order decreases quantity and reservedQuantity.
Rejecting/cancelling/expiring releases reservedQuantity.

## 004 - Prisma 7 config

DATABASE_URL is defined in prisma.config.ts, not in schema.prisma.
schema.prisma contains provider and schemas only.