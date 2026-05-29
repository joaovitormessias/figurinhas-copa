-- CreateEnum
CREATE TYPE "UserOfferStatus" AS ENUM ('pending', 'under_review', 'accepted', 'rejected', 'cancelled_by_user', 'cancelled_by_admin', 'completed');

-- CreateEnum
CREATE TYPE "StickerCondition" AS ENUM ('new', 'good', 'used', 'damaged');

-- CreateTable
CREATE TABLE "user_offer" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "sticker_id" UUID NOT NULL,
    "quantity" INTEGER NOT NULL,
    "condition" "StickerCondition" NOT NULL,
    "suggested_price" DECIMAL(10,2),
    "system_price" DECIMAL(10,2) NOT NULL DEFAULT 1.50,
    "admin_final_price" DECIMAL(10,2),
    "status" "UserOfferStatus" NOT NULL DEFAULT 'pending',
    "user_note" TEXT,
    "admin_note" TEXT,
    "reviewed_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "cancelled_at" TIMESTAMP(3),
    "cancellation_reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_offer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "user_offer_user_id_idx" ON "user_offer"("user_id");

-- CreateIndex
CREATE INDEX "user_offer_sticker_id_idx" ON "user_offer"("sticker_id");

-- CreateIndex
CREATE INDEX "user_offer_status_idx" ON "user_offer"("status");

-- AddForeignKey
ALTER TABLE "user_offer" ADD CONSTRAINT "user_offer_sticker_id_fkey" FOREIGN KEY ("sticker_id") REFERENCES "sticker_catalog"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
