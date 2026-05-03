-- PreciosYa — SQL manual (TASK-007)
-- Ejecutar en el SQL Editor de Supabase DESPUÉS de aplicar migraciones Prisma (`pnpm --filter api db:deploy`).
-- Idempotencia: usa IF NOT EXISTS en índices donde aplica.

-- =============================================================================
-- Índices (por si el entorno no los tiene ya desde la migración inicial Prisma)
-- =============================================================================
CREATE INDEX IF NOT EXISTS "price_history_product_id_recorded_at_idx" ON "price_history" ("product_id", "recorded_at" DESC);
CREATE INDEX IF NOT EXISTS "products_local_id_is_active_idx" ON "products" ("local_id", "is_active");
CREATE INDEX IF NOT EXISTS "products_barcode_idx" ON "products" ("barcode");
CREATE INDEX IF NOT EXISTS "economic_indices_type_period_idx" ON "economic_indices" ("type", "period" DESC);

-- =============================================================================
-- 1. Insertar en price_history cuando cambian cost o margin_pct (products)
-- =============================================================================
CREATE OR REPLACE FUNCTION record_price_change()
RETURNS TRIGGER AS $$
BEGIN
  IF (OLD."cost" <> NEW."cost" OR OLD."margin_pct" <> NEW."margin_pct") THEN
    INSERT INTO "price_history" ("product_id", "cost", "margin_pct", "sale_price", "change_reason")
    VALUES (NEW."id", NEW."cost", NEW."margin_pct", NEW."sale_price", 'MANUAL');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_products_price_history ON "products";
CREATE TRIGGER trg_products_price_history
  AFTER UPDATE ON "products"
  FOR EACH ROW
  EXECUTE FUNCTION record_price_change();

-- =============================================================================
-- 2. updated_at automático
-- =============================================================================
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW."updated_at" = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_users_updated_at ON "users";
CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON "users"
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_locals_updated_at ON "locals";
CREATE TRIGGER trg_locals_updated_at
  BEFORE UPDATE ON "locals"
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_products_updated_at ON "products";
CREATE TRIGGER trg_products_updated_at
  BEFORE UPDATE ON "products"
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();
