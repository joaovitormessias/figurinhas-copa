-- CreateTable
CREATE TABLE "sticker_catalog" (
    "id" UUID NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "album_number" INTEGER NOT NULL,
    "player_name" VARCHAR(120) NOT NULL,
    "team_name" VARCHAR(120) NOT NULL,
    "category" VARCHAR(80) NOT NULL,
    "collection" VARCHAR(120) NOT NULL,
    "image_url" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sticker_catalog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "sticker_catalog_code_key" ON "sticker_catalog"("code");
