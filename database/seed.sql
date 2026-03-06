-- Datos de prueba para De la Gran Burger POS
-- Ejecutar después de crear el schema principal

-- Insertar categorías de ejemplo
INSERT INTO categories (name, icon, active, "order") VALUES
  ('Hamburguesas', '🍔', true, 1),
  ('Bebidas', '🥤', true, 2),
  ('Papas', '🍟', true, 3),
  ('Postres', '🍰', true, 4),
  ('Adicionales', '🧀', true, 5)
ON CONFLICT DO NOTHING;

-- Insertar productos de ejemplo
INSERT INTO products (name, price, category_id, active, stock, image) VALUES
  -- Hamburguesas
  ('Carnívora', 22000, (SELECT id FROM categories WHERE name = 'Hamburguesas'), true, 50, null),
  ('Chesse', 12000, (SELECT id FROM categories WHERE name = 'Hamburguesas'), true, 50, null),
  ('Chilli', 17000, (SELECT id FROM categories WHERE name = 'Hamburguesas'), true, 50, null),
  ('Chilli Doble', 22000, (SELECT id FROM categories WHERE name = 'Hamburguesas'), true, 50, null),
  ('Chilli Triple', 27000, (SELECT id FROM categories WHERE name = 'Hamburguesas'), true, 50, null),
  ('Clásica', 15000, (SELECT id FROM categories WHERE name = 'Hamburguesas'), true, 50, null),
  ('Doble', 20000, (SELECT id FROM categories WHERE name = 'Hamburguesas'), true, 50, null),
  ('Doble Chesse', 18000, (SELECT id FROM categories WHERE name = 'Hamburguesas'), true, 50, null),
  ('Triple', 25000, (SELECT id FROM categories WHERE name = 'Hamburguesas'), true, 50, null),
  
  -- Bebidas
  ('Coca Cola 500ml', 5000, (SELECT id FROM categories WHERE name = 'Bebidas'), true, 100, null),
  ('Coca Cola 1.5L', 8000, (SELECT id FROM categories WHERE name = 'Bebidas'), true, 50, null),
  ('Sprite 500ml', 5000, (SELECT id FROM categories WHERE name = 'Bebidas'), true, 100, null),
  ('Fanta 500ml', 5000, (SELECT id FROM categories WHERE name = 'Bebidas'), true, 100, null),
  ('Agua Mineral', 3000, (SELECT id FROM categories WHERE name = 'Bebidas'), true, 100, null),
  
  -- Papas
  ('Papas Fritas Chica', 8000, (SELECT id FROM categories WHERE name = 'Papas'), true, 50, null),
  ('Papas Fritas Grande', 12000, (SELECT id FROM categories WHERE name = 'Papas'), true, 50, null),
  ('Papas con Cheddar', 15000, (SELECT id FROM categories WHERE name = 'Papas'), true, 50, null),
  
  -- Postres
  ('Helado Chocolate', 6000, (SELECT id FROM categories WHERE name = 'Postres'), true, 30, null),
  ('Helado Vainilla', 6000, (SELECT id FROM categories WHERE name = 'Postres'), true, 30, null),
  ('Flan Casero', 5000, (SELECT id FROM categories WHERE name = 'Postres'), true, 20, null),
  
  -- Adicionales
  ('Huevo Extra', 2000, (SELECT id FROM categories WHERE name = 'Adicionales'), true, 100, null),
  ('Queso Extra', 3000, (SELECT id FROM categories WHERE name = 'Adicionales'), true, 100, null),
  ('Bacon Extra', 4000, (SELECT id FROM categories WHERE name = 'Adicionales'), true, 50, null)
ON CONFLICT DO NOTHING;

-- Insertar repartidores de ejemplo
INSERT INTO delivery_drivers (name, phone, active) VALUES
  ('Ariel Roa', '0981-111222', true),
  ('Juan Miño', '0982-333444', true),
  ('Gabriel', '0983-555666', true)
ON CONFLICT DO NOTHING;

-- Confirmar inserción
SELECT 
  'Datos de prueba insertados exitosamente' as mensaje,
  (SELECT COUNT(*) FROM categories) as categorias,
  (SELECT COUNT(*) FROM products) as productos,
  (SELECT COUNT(*) FROM delivery_drivers) as repartidores;