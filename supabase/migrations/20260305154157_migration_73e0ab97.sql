-- Habilitar lectura pública para las tablas principales del POS
-- Esto permite que el POS funcione sin autenticación

-- Categories - Lectura pública
DROP POLICY IF EXISTS "Enable read access for all users" ON categories;
CREATE POLICY "Enable read access for all users" ON categories
  FOR SELECT USING (true);

-- Products - Lectura pública
DROP POLICY IF EXISTS "Enable read access for all users" ON products;
CREATE POLICY "Enable read access for all users" ON products
  FOR SELECT USING (true);

-- Delivery Drivers - Lectura pública
DROP POLICY IF EXISTS "Enable read access for all users" ON delivery_drivers;
CREATE POLICY "Enable read access for all users" ON delivery_drivers
  FOR SELECT USING (true);

-- Sales - Lectura pública
DROP POLICY IF EXISTS "Enable read access for all users" ON sales;
CREATE POLICY "Enable read access for all users" ON sales
  FOR SELECT USING (true);

-- Sale Items - Lectura pública
DROP POLICY IF EXISTS "Enable read access for all users" ON sale_items;
CREATE POLICY "Enable read access for all users" ON sale_items
  FOR SELECT USING (true);