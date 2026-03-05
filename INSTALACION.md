# 🍔 Manual de Instalación - De la Gran Burger POS

Sistema completo de Punto de Venta para hamburguesería con impresión térmica ESC/POS.

---

## 📋 Requisitos Previos

### Software Necesario
- **Node.js** 18.x o superior
- **PostgreSQL** 14.x o superior
- **Git**
- **PM2** (para producción): `npm install -g pm2`

### Hardware Recomendado
- **PC con Windows** (para Print Server)
- **Impresora térmica USB 80mm** (ESC/POS compatible)
- Conexión a Internet (solo para setup inicial)

---

## 🚀 Instalación del Sistema Principal

### 1. Clonar el Repositorio

```bash
git clone <URL_DEL_REPOSITORIO>
cd delagranburger-pos
```

### 2. Instalar Dependencias

```bash
npm install
```

### 3. Configurar Base de Datos

#### A) Crear la Base de Datos PostgreSQL

```bash
# Conectar a PostgreSQL
psql -U postgres

# Crear base de datos
CREATE DATABASE delagranburger_pos;

# Conectar a la nueva base de datos
\c delagranburger_pos
```

#### B) Ejecutar Script de Schema

```bash
# Desde la raíz del proyecto
psql -U postgres -d delagranburger_pos -f database/schema.sql
```

#### C) Verificar Instalación

```sql
-- Verificar tablas creadas
\dt

-- Debe mostrar:
-- categories
-- products
-- sales
-- sale_items
-- delivery_drivers
-- inventory_movements
-- users
```

### 4. Configurar Variables de Entorno

Crea un archivo `.env.local` en la raíz del proyecto:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=tu_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_supabase_anon_key

# Database Configuration (si usas conexión directa)
DATABASE_URL=postgresql://usuario:password@localhost:5432/delagranburger_pos

# App Configuration
NEXT_PUBLIC_APP_NAME="De la Gran Burger"
NEXT_PUBLIC_PRINT_SERVER_URL=http://localhost:3001
```

### 5. Datos Iniciales (Opcional)

```sql
-- Insertar categorías iniciales
INSERT INTO categories (name, icon, active, "order") VALUES
  ('Hamburguesas', '🍔', true, 1),
  ('Bebidas', '🥤', true, 2),
  ('Extras', '🍟', true, 3);

-- Insertar productos de ejemplo
INSERT INTO products (name, price, category_id, active, stock) VALUES
  ('CARNIVORA', 22000, 1, true, 50),
  ('CHESSE', 12000, 1, true, 50),
  ('CHILLI', 17000, 1, true, 50),
  ('Coca Cola 500ml', 5000, 2, true, 100);

-- Insertar repartidores
INSERT INTO delivery_drivers (name, phone, active) VALUES
  ('Ariel Roa', '0981-123456', true),
  ('Juan Miño', '0981-234567', true),
  ('Gabriel', '0981-345678', true);
```

### 6. Iniciar el Sistema

#### Desarrollo

```bash
npm run dev
```

El sistema estará disponible en: `http://localhost:3000`

#### Producción

```bash
# Build
npm run build

# Iniciar con PM2
pm2 start ecosystem.config.js

# Ver logs
pm2 logs

# Detener
pm2 stop all
```

---

## 🖨️ Instalación del Print Server (Impresión Térmica)

### 1. Requisitos

- **Windows 7/10/11**
- **Impresora térmica USB 80mm** conectada
- **Node.js** instalado

### 2. Instalación

```bash
# Navegar a la carpeta del print server
cd print-server

# Instalar dependencias
npm install
```

### 3. Verificar Impresora

```bash
# Ejecutar el servidor en modo test
node server.js
```

Deberías ver en la consola:

```
🖨️  Print Server iniciado en http://localhost:3001

📋 Impresoras USB detectadas:
  1. EPSON TM-T20 (VID: 1208, PID: 514)
  2. ...
```

### 4. Configurar en la Aplicación

1. Abre la aplicación web (`http://localhost:3000`)
2. Ve a **Ajustes → Configuración de Impresoras**
3. Selecciona:
   - **Impresora de Cocina:** EPSON TM-T20 (o la que tengas)
   - **Impresora de Cliente:** EPSON TM-T20 (o la que tengas)
4. Click en **"Probar Impresión"** para verificar

### 5. Iniciar Print Server en Producción

```bash
# Desde la carpeta print-server
pm2 start server.js --name "print-server"

# Ver logs
pm2 logs print-server

# Reiniciar
pm2 restart print-server
```

---

## 🔧 Configuración del Sistema

### 1. Ajustes de Negocio

**Ajustes → Logo del Negocio**
- Subir logo (PNG/JPG, máx 2MB)
- Dimensiones recomendadas: 300x100px

**Ajustes → Formato de Impresión**
- Tamaño de fuente de tickets
- Mensaje de agradecimiento
- Información del negocio (nombre, dirección, RUC, teléfono)

### 2. Gestión de Productos

**Productos y Servicios → Productos**
- Agregar nuevos productos
- Editar precios
- Gestionar stock
- Activar/Desactivar productos

**Productos y Servicios → Categorías**
- Crear categorías
- Asignar iconos
- Ordenar categorías

### 3. Repartidores

**Repartidores**
- Agregar conductores de delivery
- Asignar teléfonos de contacto
- Activar/Desactivar repartidores

---

## 📱 Uso del Sistema

### Flujo de Venta - Delivery

1. **Agregar Productos:**
   - Click en productos de la grilla
   - Ajustar cantidades con +/-

2. **Información del Cliente:**
   - Nombre: "Juan Pérez"
   - Teléfono: "0981-123456"
   - Dirección: "Av. España c/ Brasil"

3. **Tipo de Pedido:**
   - Click en **"Delivery"**

4. **Repartidor:**
   - Seleccionar repartidor del dropdown
   - Ingresar costo de delivery (ej: 5000)

5. **Confirmar:**
   - **"Confirmar Pedido"** → Guarda y envía a cocina (imprime comanda)
   - **"Recibir Pago"** → Completa venta y cobra (imprime ticket cliente)

### Flujo de Venta - Para Retirar

1. Agregar productos
2. Cliente (opcional)
3. Click en **"Para Retirar"**
4. Confirmar pedido o recibir pago

### Editar Pedido Existente

1. Ve a **"Ventas"**
2. Busca el pedido (PENDIENTE)
3. Click en **"Cargar"**
4. Edita productos/datos
5. Click en **"Guardar Cambios"**

### Anular Venta

1. Ve a **"Ventas"**
2. Busca la venta
3. Click en **"Eliminar"**
4. Confirma la acción

---

## 🖨️ Formatos de Impresión

### Comanda de Cocina (80mm)

```
================================
      COMANDA DE COCINA
================================

Pedido: #20260305-0001
Fecha: 05/03/2026 15:30
Tipo: DELIVERY

--------------------------------
PRODUCTOS:
--------------------------------
2x CARNIVORA
1x CHESSE
1x Coca Cola 500ml

--------------------------------
NOTA:
Sin cebolla en la CARNIVORA
--------------------------------

Cliente: Juan Pérez
Tel: 0981-123456
Dirección: Av. España c/ Brasil

Repartidor: Ariel Roa

================================
```

### Ticket Cliente (80mm)

```
================================
    De la Gran Burger
    
Av. Principal 123, Asunción
Tel: 021-1234567
RUC: 80012345-6
================================

Venta: #20260305-0001
Fecha: 05/03/2026 15:30
Tipo: DELIVERY

--------------------------------
PRODUCTOS:
--------------------------------
2x CARNIVORA      Gs. 44.000
1x CHESSE         Gs. 12.000
1x Coca Cola      Gs.  5.000

--------------------------------
Subtotal:         Gs. 61.000
Delivery:         Gs.  5.000
--------------------------------
TOTAL:            Gs. 66.000
--------------------------------

Pago: EFECTIVO
Recibido:         Gs. 70.000
Cambio:           Gs.  4.000

================================
¡Gracias por su compra!
================================
```

---

## 📊 Reportes e Informes

### Ventas del Día

**Informes → Resumen del Día**
- Total vendido
- Cantidad de pedidos
- Ticket promedio
- Ventas por tipo (delivery/retiro/local)

### Productos Más Vendidos

**Informes → Productos**
- Top 10 productos
- Cantidad vendida
- Ingresos por producto

### Rendimiento de Repartidores

**Informes → Repartidores**
- Entregas realizadas
- Ingresos por repartidor

---

## 🔒 Usuarios y Permisos

### Roles Disponibles

#### Admin
- Acceso completo a todas las funciones
- Gestión de productos, categorías, repartidores
- Reportes completos
- Configuración del sistema

#### Cajero
- Punto de Venta
- Ver ventas
- Gestión básica de pedidos

#### Cocina (Futuro)
- Solo ver pedidos
- Marcar como preparados

### Crear Usuarios (SQL)

```sql
INSERT INTO users (username, password_hash, role, name, active) VALUES
  ('admin', 'hash_password', 'admin', 'Administrador', true),
  ('caja1', 'hash_password', 'cashier', 'Cajero 1', true);
```

---

## 🛠️ Solución de Problemas

### La aplicación no carga

```bash
# Verificar que el servidor está corriendo
pm2 status

# Ver logs de errores
pm2 logs

# Reiniciar
pm2 restart all
```

### Impresora no imprime

1. Verificar que el Print Server está corriendo:
   ```bash
   pm2 status print-server
   ```

2. Verificar que la impresora está conectada:
   ```bash
   # En Windows
   wmic printer get name
   ```

3. Probar impresión desde Ajustes → Configuración de Impresoras

### Error de conexión a base de datos

1. Verificar que PostgreSQL está corriendo
2. Verificar credenciales en `.env.local`
3. Verificar que la base de datos existe:
   ```bash
   psql -U postgres -l
   ```

### Los repartidores no aparecen en el historial

1. Verificar que la venta tiene `driver_id` asignado:
   ```sql
   SELECT id, sale_number, driver_id, delivery_driver_name FROM sales WHERE order_type = 'delivery' ORDER BY id DESC LIMIT 5;
   ```

2. Si `driver_id` es NULL, crear la venta de nuevo con repartidor seleccionado

---

## 📞 Soporte

Para problemas técnicos o dudas:
- Email: soporte@delagranburger.com
- Teléfono: 021-1234567
- WhatsApp: +595 981-123456

---

## 📝 Notas Importantes

1. **Backup Regular:** Hacer backup de la base de datos diariamente
   ```bash
   pg_dump -U postgres delagranburger_pos > backup_$(date +%Y%m%d).sql
   ```

2. **Actualizar Precios:** Los cambios en productos/precios se aplican inmediatamente

3. **Inventario:** El stock se descuenta automáticamente al completar una venta

4. **Pedidos Pendientes:** Los pedidos confirmados pero no pagados quedan como PENDIENTES

5. **Impresión:** Si una impresión falla, puedes reimprimir desde el historial de ventas

---

## 🔄 Actualización del Sistema

```bash
# Detener el sistema
pm2 stop all

# Obtener últimos cambios
git pull origin main

# Instalar nuevas dependencias
npm install

# Rebuild
npm run build

# Aplicar migraciones de BD (si hay)
psql -U postgres -d delagranburger_pos -f database/migrations/nueva_migracion.sql

# Reiniciar
pm2 restart all
```

---

## ✅ Checklist de Instalación

- [ ] Node.js instalado
- [ ] PostgreSQL instalado
- [ ] Base de datos creada
- [ ] Schema aplicado
- [ ] Datos iniciales insertados
- [ ] `.env.local` configurado
- [ ] Aplicación web iniciada (`npm run dev`)
- [ ] Print Server instalado
- [ ] Impresora térmica conectada y configurada
- [ ] Prueba de impresión exitosa
- [ ] Productos cargados
- [ ] Categorías creadas
- [ ] Repartidores agregados
- [ ] Primera venta de prueba completada

---

**¡Sistema listo para usar!** 🎉🍔

---

## 📄 Licencia

© 2026 De la Gran Burger. Todos los derechos reservados.