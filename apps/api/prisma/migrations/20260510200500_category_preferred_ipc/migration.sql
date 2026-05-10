-- Agrega subíndice IPC preferido por categoría.
ALTER TABLE "categories"
ADD COLUMN "preferred_index" "IndexType" NOT NULL DEFAULT 'IPC_INDEC';

