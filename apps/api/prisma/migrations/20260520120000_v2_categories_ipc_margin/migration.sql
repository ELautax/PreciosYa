-- PreciosYa v2: category templates, margin status, product units, IPC divisions

CREATE TYPE "MarginStatus" AS ENUM ('LOW', 'WARNING', 'OK');
CREATE TYPE "ProductUnit" AS ENUM ('unidad', 'kg', 'g', 'lt', 'ml', 'pack', 'docena', 'caja');

ALTER TYPE "IndexType" ADD VALUE IF NOT EXISTS 'IPC_INDEC_BEBIDAS';
ALTER TYPE "IndexType" ADD VALUE IF NOT EXISTS 'IPC_INDEC_VESTIMENTA';
ALTER TYPE "IndexType" ADD VALUE IF NOT EXISTS 'IPC_INDEC_VIVIENDA';
ALTER TYPE "IndexType" ADD VALUE IF NOT EXISTS 'IPC_INDEC_HOGAR';
ALTER TYPE "IndexType" ADD VALUE IF NOT EXISTS 'IPC_INDEC_SALUD';
ALTER TYPE "IndexType" ADD VALUE IF NOT EXISTS 'IPC_INDEC_TRANSPORTE';
ALTER TYPE "IndexType" ADD VALUE IF NOT EXISTS 'IPC_INDEC_COMUNICACION';
ALTER TYPE "IndexType" ADD VALUE IF NOT EXISTS 'IPC_INDEC_RECREACION';
ALTER TYPE "IndexType" ADD VALUE IF NOT EXISTS 'IPC_INDEC_EDUCACION';
ALTER TYPE "IndexType" ADD VALUE IF NOT EXISTS 'IPC_INDEC_RESTAURANTES';
ALTER TYPE "IndexType" ADD VALUE IF NOT EXISTS 'IPC_INDEC_VARIOS';

CREATE TABLE "category_templates" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "color_hex" TEXT NOT NULL DEFAULT '#16A34A',
    "preferred_index" "IndexType" NOT NULL DEFAULT 'IPC_INDEC',
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "category_templates_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "category_templates_slug_key" ON "category_templates"("slug");

ALTER TABLE "categories" ADD COLUMN "template_id" UUID;
ALTER TABLE "categories" ADD COLUMN "is_active" BOOLEAN NOT NULL DEFAULT true;

ALTER TABLE "categories" ADD CONSTRAINT "categories_template_id_fkey"
  FOREIGN KEY ("template_id") REFERENCES "category_templates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE UNIQUE INDEX "categories_local_id_template_id_key" ON "categories"("local_id", "template_id");

ALTER TABLE "products" ADD COLUMN "margin_status" "MarginStatus" NOT NULL DEFAULT 'OK';

ALTER TABLE "products" ALTER COLUMN "unit" DROP DEFAULT;
ALTER TABLE "products" ALTER COLUMN "unit" TYPE "ProductUnit" USING (
  CASE
    WHEN "unit" IN ('unidad', 'kg', 'g', 'lt', 'ml', 'pack', 'docena', 'caja') THEN "unit"::"ProductUnit"
    ELSE 'unidad'::"ProductUnit"
  END
);
ALTER TABLE "products" ALTER COLUMN "unit" SET DEFAULT 'unidad'::"ProductUnit";

-- Seed COICOP division templates (12 + Otros)
INSERT INTO "category_templates" ("slug", "name", "color_hex", "preferred_index", "sort_order") VALUES
  ('alimentos', 'Alimentos y bebidas', '#16A34A', 'IPC_INDEC_ALIMENTOS', 1),
  ('bebidas-tabaco', 'Bebidas alcohólicas y tabaco', '#854D0E', 'IPC_INDEC_BEBIDAS', 2),
  ('vestimenta', 'Prendas y calzado', '#7C3AED', 'IPC_INDEC_VESTIMENTA', 3),
  ('vivienda', 'Vivienda y servicios', '#2563EB', 'IPC_INDEC_VIVIENDA', 4),
  ('hogar', 'Hogar y equipamiento', '#0891B2', 'IPC_INDEC_HOGAR', 5),
  ('salud', 'Salud', '#DC2626', 'IPC_INDEC_SALUD', 6),
  ('transporte', 'Transporte', '#EA580C', 'IPC_INDEC_TRANSPORTE', 7),
  ('comunicacion', 'Comunicación', '#4F46E5', 'IPC_INDEC_COMUNICACION', 8),
  ('recreacion', 'Recreación y cultura', '#DB2777', 'IPC_INDEC_RECREACION', 9),
  ('educacion', 'Educación', '#0D9488', 'IPC_INDEC_EDUCACION', 10),
  ('restaurantes', 'Restaurantes y hoteles', '#CA8A04', 'IPC_INDEC_RESTAURANTES', 11),
  ('varios', 'Bienes y servicios varios', '#64748B', 'IPC_INDEC_VARIOS', 12),
  ('otros', 'Otros', '#78716C', 'IPC_INDEC', 99);
