-- CreateEnum
CREATE TYPE "PlanType" AS ENUM ('FREE', 'PRO', 'AGENCY');

-- CreateEnum
CREATE TYPE "ChangeReason" AS ENUM ('MANUAL', 'BULK_PCT', 'IPC_INDEC', 'BCRA_RATE', 'IMPORT');

-- CreateEnum
CREATE TYPE "IndexType" AS ENUM ('IPC_INDEC', 'IPC_INDEC_ALIMENTOS', 'BCRA_USD_OFICIAL', 'BCRA_USD_MEP');

-- CreateEnum
CREATE TYPE "ExportFormat" AS ENUM ('PNG', 'PDF');

-- CreateEnum
CREATE TYPE "NotifType" AS ENUM ('NEW_IPC', 'MARGIN_ALERT', 'PLAN_EXPIRING', 'PLAN_EXPIRED', 'WELCOME');

-- CreateEnum
CREATE TYPE "SubStatus" AS ENUM ('ACTIVE', 'CANCELLED', 'EXPIRED', 'PENDING');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "avatar_url" TEXT,
    "google_id" TEXT,
    "plan" "PlanType" NOT NULL DEFAULT 'FREE',
    "plan_expires_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "locals" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT,
    "min_margin_pct" DECIMAL(5,2) NOT NULL DEFAULT 20.00,
    "currency" TEXT NOT NULL DEFAULT 'ARS',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "locals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categories" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "local_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "color_hex" TEXT DEFAULT '#16A34A',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "products" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "local_id" UUID NOT NULL,
    "category_id" UUID,
    "name" TEXT NOT NULL,
    "barcode" TEXT,
    "unit" TEXT NOT NULL DEFAULT 'unidad',
    "cost" DECIMAL(12,2) NOT NULL,
    "margin_pct" DECIMAL(5,2) NOT NULL,
    "sale_price" DECIMAL(12,2) NOT NULL,
    "is_margin_alert" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "price_history" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "product_id" UUID NOT NULL,
    "cost" DECIMAL(12,2) NOT NULL,
    "margin_pct" DECIMAL(5,2) NOT NULL,
    "sale_price" DECIMAL(12,2) NOT NULL,
    "change_reason" "ChangeReason" NOT NULL,
    "ipc_reference" DECIMAL(5,2),
    "note" TEXT,
    "recorded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "price_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "economic_indices" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "type" "IndexType" NOT NULL,
    "period" TIMESTAMP(3) NOT NULL,
    "value_pct" DECIMAL(6,3) NOT NULL,
    "source_url" TEXT,
    "fetched_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "economic_indices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "price_lists" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "local_id" UUID NOT NULL,
    "format" "ExportFormat" NOT NULL,
    "file_url" TEXT,
    "shared_via" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "price_lists_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "type" "NotifType" NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscriptions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "plan" "PlanType" NOT NULL,
    "status" "SubStatus" NOT NULL,
    "mp_subscription_id" TEXT,
    "amount_ars" DECIMAL(10,2) NOT NULL,
    "billing_cycle" TEXT NOT NULL DEFAULT 'monthly',
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3),
    "cancelled_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_google_id_key" ON "users"("google_id");

-- CreateIndex
CREATE UNIQUE INDEX "categories_local_id_name_key" ON "categories"("local_id", "name");

-- CreateIndex
CREATE INDEX "products_local_id_is_active_idx" ON "products"("local_id", "is_active");

-- CreateIndex
CREATE INDEX "products_barcode_idx" ON "products"("barcode");

-- CreateIndex
CREATE UNIQUE INDEX "products_local_id_barcode_key" ON "products"("local_id", "barcode");

-- CreateIndex
CREATE INDEX "price_history_product_id_recorded_at_idx" ON "price_history"("product_id", "recorded_at" DESC);

-- CreateIndex
CREATE INDEX "economic_indices_type_period_idx" ON "economic_indices"("type", "period" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "economic_indices_type_period_key" ON "economic_indices"("type", "period");

-- AddForeignKey
ALTER TABLE "locals" ADD CONSTRAINT "locals_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "categories" ADD CONSTRAINT "categories_local_id_fkey" FOREIGN KEY ("local_id") REFERENCES "locals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_local_id_fkey" FOREIGN KEY ("local_id") REFERENCES "locals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "price_history" ADD CONSTRAINT "price_history_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "price_lists" ADD CONSTRAINT "price_lists_local_id_fkey" FOREIGN KEY ("local_id") REFERENCES "locals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
