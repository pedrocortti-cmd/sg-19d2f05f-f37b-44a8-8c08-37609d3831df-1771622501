-- Agregar columna 'order' a categories para ordenar las categorías
ALTER TABLE categories ADD COLUMN IF NOT EXISTS "order" integer DEFAULT 0;

-- Agregar columna 'image' a products para imágenes de productos
ALTER TABLE products ADD COLUMN IF NOT EXISTS image text;

-- Crear índice para mejorar performance
CREATE INDEX IF NOT EXISTS idx_categories_order ON categories("order");