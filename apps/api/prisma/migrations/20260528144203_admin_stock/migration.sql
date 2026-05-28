-- CreateEnum
CREATE TYPE "AdminStockStatus" AS ENUM ('available', 'reserved', 'unavailable', 'out_of_stock');

-- CreateTable
CREATE TABLE "admin_stock" (
    "id" UUID NOT NULL,
    "sticker_id" UUID NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 0,
    "reserved_quantity" INTEGER NOT NULL DEFAULT 0,
    "sale_price" DECIMAL(10,2) NOT NULL,
    "is_visible" BOOLEAN NOT NULL DEFAULT true,
    "status" "AdminStockStatus" NOT NULL DEFAULT 'available',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "admin_stock_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "admin_stock_sticker_id_idx" ON "admin_stock"("sticker_id");

-- AddForeignKey
ALTER TABLE "admin_stock" ADD CONSTRAINT "admin_stock_sticker_id_fkey" FOREIGN KEY ("sticker_id") REFERENCES "sticker_catalog"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
