-- CreateEnum
CREATE TYPE "PurchaseOrderStatus" AS ENUM ('pending_admin_approval', 'approved', 'rejected', 'cancelled_by_user', 'cancelled_by_admin', 'expired', 'completed');

-- CreateEnum
CREATE TYPE "ReservationStatus" AS ENUM ('active', 'released', 'expired', 'converted_to_sale');

-- CreateTable
CREATE TABLE "purchase_order" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "status" "PurchaseOrderStatus" NOT NULL DEFAULT 'pending_admin_approval',
    "total_amount" DECIMAL(10,2) NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "admin_decision_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "cancelled_at" TIMESTAMP(3),
    "cancellation_reason" TEXT,
    "user_note" TEXT,
    "admin_note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "purchase_order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "purchase_order_item" (
    "id" UUID NOT NULL,
    "order_id" UUID NOT NULL,
    "sticker_id" UUID NOT NULL,
    "admin_stock_id" UUID NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unit_price" DECIMAL(10,2) NOT NULL,
    "subtotal" DECIMAL(10,2) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "purchase_order_item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reservation" (
    "id" UUID NOT NULL,
    "order_id" UUID NOT NULL,
    "admin_stock_id" UUID NOT NULL,
    "sticker_id" UUID NOT NULL,
    "quantity" INTEGER NOT NULL,
    "status" "ReservationStatus" NOT NULL DEFAULT 'active',
    "expires_at" TIMESTAMP(3) NOT NULL,
    "released_at" TIMESTAMP(3),
    "converted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reservation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "purchase_order_user_id_idx" ON "purchase_order"("user_id");

-- CreateIndex
CREATE INDEX "purchase_order_status_idx" ON "purchase_order"("status");

-- CreateIndex
CREATE INDEX "purchase_order_item_order_id_idx" ON "purchase_order_item"("order_id");

-- CreateIndex
CREATE INDEX "purchase_order_item_sticker_id_idx" ON "purchase_order_item"("sticker_id");

-- CreateIndex
CREATE INDEX "purchase_order_item_admin_stock_id_idx" ON "purchase_order_item"("admin_stock_id");

-- CreateIndex
CREATE INDEX "reservation_order_id_idx" ON "reservation"("order_id");

-- CreateIndex
CREATE INDEX "reservation_admin_stock_id_idx" ON "reservation"("admin_stock_id");

-- CreateIndex
CREATE INDEX "reservation_sticker_id_idx" ON "reservation"("sticker_id");

-- CreateIndex
CREATE INDEX "reservation_status_idx" ON "reservation"("status");

-- AddForeignKey
ALTER TABLE "purchase_order_item" ADD CONSTRAINT "purchase_order_item_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "purchase_order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_order_item" ADD CONSTRAINT "purchase_order_item_sticker_id_fkey" FOREIGN KEY ("sticker_id") REFERENCES "sticker_catalog"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_order_item" ADD CONSTRAINT "purchase_order_item_admin_stock_id_fkey" FOREIGN KEY ("admin_stock_id") REFERENCES "admin_stock"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservation" ADD CONSTRAINT "reservation_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "purchase_order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservation" ADD CONSTRAINT "reservation_admin_stock_id_fkey" FOREIGN KEY ("admin_stock_id") REFERENCES "admin_stock"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservation" ADD CONSTRAINT "reservation_sticker_id_fkey" FOREIGN KEY ("sticker_id") REFERENCES "sticker_catalog"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
