-- sold_at se guardaba como timestamp without time zone (UTC wall-clock).
-- Timestamptz evita desfasajes al filtrar «Hoy» en ART.
ALTER TABLE "sales"
  ALTER COLUMN "sold_at" TYPE TIMESTAMPTZ(3)
  USING ("sold_at" AT TIME ZONE 'UTC');
