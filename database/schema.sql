-- Schema para De la Gran Burger POS
-- PostgreSQL / MySQL compatible

-- Tabla de usuarios
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(100) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'cashier', -- admin, cashier, kitchen
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de categorías
CREATE TABLE categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  active BOOLEAN DEFAULT true,
  order_index INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de productos
CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  category_id INT REFERENCES categories(id),
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de ventas
CREATE TABLE sales (
  id SERIAL PRIMARY KEY,
  order_number VARCHAR(50) UNIQUE NOT NULL,
  date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  subtotal DECIMAL(10, 2) NOT NULL,
  discount DECIMAL(10, 2) DEFAULT 0,
  total DECIMAL(10, 2) NOT NULL,
  order_type VARCHAR(20) NOT NULL, -- delivery, pickup, local
  payment_method VARCHAR(20) DEFAULT 'cash', -- cash, qr, card, transfer
  customer_name VARCHAR(100),
  customer_phone VARCHAR(50),
  customer_address TEXT,
  customer_ruc VARCHAR(50),
  customer_business_name VARCHAR(150),
  customer_is_exempt BOOLEAN DEFAULT false,
  note TEXT,
  status VARCHAR(20) DEFAULT 'completed', -- pending, completed, cancelled
  created_by INT REFERENCES users(id),
  cancelled_by INT REFERENCES users(id),
  cancel_reason TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de items de venta
CREATE TABLE sale_items (
  id SERIAL PRIMARY KEY,
  sale_id INT REFERENCES sales(id) ON DELETE CASCADE,
  product_id INT REFERENCES products(id),
  product_name VARCHAR(150) NOT NULL,
  product_price DECIMAL(10, 2) NOT NULL,
  quantity INT NOT NULL,
  subtotal DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de inventario (opcional para MVP)
CREATE TABLE inventory (
  id SERIAL PRIMARY KEY,
  product_id INT REFERENCES products(id) ON DELETE CASCADE,
  stock INT DEFAULT 0,
  min_stock INT DEFAULT 0,
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de gastos
CREATE TABLE expenses (
  id SERIAL PRIMARY KEY,
  date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  concept VARCHAR(200) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  category VARCHAR(100),
  description TEXT,
  created_by INT REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de configuración de impresoras
CREATE TABLE printer_config (
  id SERIAL PRIMARY KEY,
  kitchen_printer VARCHAR(255),
  client_printer VARCHAR(255),
  paper_size VARCHAR(10) DEFAULT '80mm',
  copies INT DEFAULT 1,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Datos iniciales

-- Usuario admin por defecto (password: admin123)
INSERT INTO users (username, password, name, role) VALUES 
('admin', '$2b$10$YourHashedPasswordHere', 'Administrador', 'admin');

-- Categorías iniciales
INSERT INTO categories (name, order_index) VALUES 
('Hamburguesas', 1),
('Acompañamientos', 2),
('Bebidas', 3);

-- Productos iniciales
INSERT INTO products (name, price, category_id) VALUES 
('Carnívora', 22000, 1),
('Chesse', 12000, 1),
('Chilli', 17000, 1),
('Chilli Doble', 22000, 1),
('Chilli Triple', 27000, 1),
('Clasica', 15000, 1),
('Doble', 20000, 1),
('Doble Chesse', 18000, 1),
('Triple', 25000, 1),
('Papas Fritas', 8000, 2),
('Nuggets', 10000, 2),
('Coca Cola', 5000, 3),
('Agua', 3000, 3);

-- Configuración de impresoras por defecto
INSERT INTO printer_config (kitchen_printer, client_printer, paper_size, copies) VALUES 
('', '', '80mm', 1);

-- Índices para mejorar rendimiento
CREATE INDEX idx_sales_date ON sales(date);
CREATE INDEX idx_sales_order_number ON sales(order_number);
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_active ON products(active);
CREATE INDEX idx_sale_items_sale ON sale_items(sale_id);