-- Eliminar el constraint antiguo de payment_method
ALTER TABLE sales DROP CONSTRAINT IF EXISTS sales_payment_method_check;

-- Crear nuevo constraint que incluya "pending" y "mixed"
ALTER TABLE sales ADD CONSTRAINT sales_payment_method_check 
  CHECK (payment_method IN ('cash', 'card', 'qr', 'transfer', 'pending', 'mixed'));