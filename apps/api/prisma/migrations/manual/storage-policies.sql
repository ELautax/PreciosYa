-- PreciosYa — SQL manual (TASK-043)
-- Ejecutar en Supabase SQL Editor para asegurar bucket y policies de Storage.
-- Nota: este proyecto usa backend con service_role (sin RLS en tablas de negocio).

-- 1) Bucket público para listas de precios (PNG)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('price-lists', 'price-lists', true, 5242880, ARRAY['image/png'])
ON CONFLICT (id)
DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 2) Lectura pública para objetos del bucket price-lists
-- (necesario si se quiere permitir listado/consulta por API sobre storage.objects)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'public_can_read_price_lists'
  ) THEN
    CREATE POLICY public_can_read_price_lists
      ON storage.objects
      FOR SELECT
      TO public
      USING (bucket_id = 'price-lists');
  END IF;
END $$;
