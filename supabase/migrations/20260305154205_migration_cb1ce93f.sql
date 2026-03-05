-- Agregar políticas de escritura públicas para operaciones del POS
-- (En producción, deberías agregar autenticación)

-- Categories - Escritura pública
DROP POLICY IF EXISTS "Enable insert for all users" ON categories;
CREATE POLICY "Enable insert for all users" ON categories
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Enable update for all users" ON categories;
CREATE POLICY "Enable update for all users" ON categories
  FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Enable delete for all users" ON categories;
CREATE POLICY "Enable delete for all users" ON categories
  FOR DELETE USING (true);

-- Products - Escritura pública
DROP POLICY IF EXISTS "Enable insert for all users" ON products;
CREATE POLICY "Enable insert for all users" ON products
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Enable update for all users" ON products;
CREATE POLICY "Enable update for all users" ON products
  FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Enable delete for all users" ON products;
CREATE POLICY "Enable delete for all users" ON products
  FOR DELETE USING (true);

-- Delivery Drivers - Escritura pública
DROP POLICY IF EXISTS "Enable insert for all users" ON delivery_drivers;
CREATE POLICY "Enable insert for all users" ON delivery_drivers
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Enable update for all users" ON delivery_drivers;
CREATE POLICY "Enable update for all users" ON delivery_drivers
  FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Enable delete for all users" ON delivery_drivers;
CREATE POLICY "Enable delete for all users" ON delivery_drivers
  FOR DELETE USING (true);

-- Sales - Escritura pública
DROP POLICY IF EXISTS "Enable insert for all users" ON sales;
CREATE POLICY "Enable insert for all users" ON sales
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Enable update for all users" ON sales;
CREATE POLICY "Enable update for all users" ON sales
  FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Enable delete for all users" ON sales;
CREATE POLICY "Enable delete for all users" ON sales
  FOR DELETE USING (true);

-- Sale Items - Escritura pública
DROP POLICY IF EXISTS "Enable insert for all users" ON sale_items;
CREATE POLICY "Enable insert for all users" ON sale_items
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Enable update for all users" ON sale_items;
CREATE POLICY "Enable update for all users" ON sale_items
  FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Enable delete for all users" ON sale_items;
CREATE POLICY "Enable delete for all users" ON sale_items
  FOR DELETE USING (true);

-- Inventory Movements - Escritura pública
DROP POLICY IF EXISTS "Enable insert for all users" ON inventory_movements;
CREATE POLICY "Enable insert for all users" ON inventory_movements
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Enable read access for all users" ON inventory_movements;
CREATE POLICY "Enable read access for all users" ON inventory_movements
  FOR SELECT USING (true);