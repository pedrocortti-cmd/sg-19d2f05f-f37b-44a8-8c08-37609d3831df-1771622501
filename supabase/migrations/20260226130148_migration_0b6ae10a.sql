-- Agregar columnas faltantes a categories
ALTER TABLE categories ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT true;
ALTER TABLE categories ADD COLUMN IF NOT EXISTS icon TEXT;

-- Agregar columnas faltantes a sales para compatibilidad completa
ALTER TABLE sales ADD COLUMN IF NOT EXISTS delivery_cost DECIMAL(10,2) DEFAULT 0;
ALTER TABLE sales ADD COLUMN IF NOT EXISTS amount_paid DECIMAL(10,2) DEFAULT 0;
ALTER TABLE sales ADD COLUMN IF NOT EXISTS balance DECIMAL(10,2) DEFAULT 0;
ALTER TABLE sales ADD COLUMN IF NOT EXISTS created_by TEXT;
ALTER TABLE sales ADD COLUMN IF NOT EXISTS delivery_driver_name TEXT;
ALTER TABLE sales ADD COLUMN IF NOT EXISTS notes TEXT; -- Algunos registros usan 'notes', unificamos.