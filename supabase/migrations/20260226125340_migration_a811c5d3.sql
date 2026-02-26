-- Crear tabla de categorías
CREATE TABLE IF NOT EXISTS categories (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla de productos
CREATE TABLE IF NOT EXISTS products (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  category_id BIGINT REFERENCES categories(id) ON DELETE SET NULL,
  stock INTEGER DEFAULT 0,
  min_stock INTEGER DEFAULT 5,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla de ventas
CREATE TABLE IF NOT EXISTS sales (
  id BIGSERIAL PRIMARY KEY,
  sale_number TEXT NOT NULL UNIQUE,
  date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  customer_name TEXT,
  customer_phone TEXT,
  customer_address TEXT,
  customer_ruc TEXT,
  customer_business_name TEXT,
  exempt BOOLEAN DEFAULT false,
  order_type TEXT CHECK (order_type IN ('delivery', 'pickup', 'local')),
  subtotal DECIMAL(10,2) NOT NULL,
  discount_amount DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) NOT NULL,
  payment_method TEXT CHECK (payment_method IN ('cash', 'card', 'qr', 'transfer')),
  note TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled')),
  driver_id BIGINT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla de items de venta
CREATE TABLE IF NOT EXISTS sale_items (
  id BIGSERIAL PRIMARY KEY,
  sale_id BIGINT NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
  product_id BIGINT REFERENCES products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  product_price DECIMAL(10,2) NOT NULL,
  quantity INTEGER NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla de conductores/repartidores
CREATE TABLE IF NOT EXISTS delivery_drivers (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  vehicle TEXT,
  license_plate TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla de movimientos de inventario
CREATE TABLE IF NOT EXISTS inventory_movements (
  id BIGSERIAL PRIMARY KEY,
  product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  movement_type TEXT NOT NULL CHECK (movement_type IN ('entry', 'exit', 'adjustment')),
  quantity INTEGER NOT NULL,
  previous_stock INTEGER NOT NULL,
  new_stock INTEGER NOT NULL,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(active);
CREATE INDEX IF NOT EXISTS idx_sales_date ON sales(date);
CREATE INDEX IF NOT EXISTS idx_sales_status ON sales(status);
CREATE INDEX IF NOT EXISTS idx_sale_items_sale ON sale_items(sale_id);
CREATE INDEX IF NOT EXISTS idx_inventory_movements_product ON inventory_movements(product_id);

-- Habilitar RLS (Row Level Security) en todas las tablas
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE sale_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_movements ENABLE ROW LEVEL SECURITY;

-- Políticas RLS: Permitir acceso público (ajustar según necesidades de seguridad)
-- Para MVP, permitimos acceso completo. En producción, ajustar según roles de usuario.

-- Políticas para categories
CREATE POLICY "Anyone can view categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Anyone can insert categories" ON categories FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update categories" ON categories FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete categories" ON categories FOR DELETE USING (true);

-- Políticas para products
CREATE POLICY "Anyone can view products" ON products FOR SELECT USING (true);
CREATE POLICY "Anyone can insert products" ON products FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update products" ON products FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete products" ON products FOR DELETE USING (true);

-- Políticas para sales
CREATE POLICY "Anyone can view sales" ON sales FOR SELECT USING (true);
CREATE POLICY "Anyone can insert sales" ON sales FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update sales" ON sales FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete sales" ON sales FOR DELETE USING (true);

-- Políticas para sale_items
CREATE POLICY "Anyone can view sale_items" ON sale_items FOR SELECT USING (true);
CREATE POLICY "Anyone can insert sale_items" ON sale_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update sale_items" ON sale_items FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete sale_items" ON sale_items FOR DELETE USING (true);

-- Políticas para delivery_drivers
CREATE POLICY "Anyone can view drivers" ON delivery_drivers FOR SELECT USING (true);
CREATE POLICY "Anyone can insert drivers" ON delivery_drivers FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update drivers" ON delivery_drivers FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete drivers" ON delivery_drivers FOR DELETE USING (true);

-- Políticas para inventory_movements
CREATE POLICY "Anyone can view inventory" ON inventory_movements FOR SELECT USING (true);
CREATE POLICY "Anyone can insert inventory" ON inventory_movements FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update inventory" ON inventory_movements FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete inventory" ON inventory_movements FOR DELETE USING (true);