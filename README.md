# 🍔 De la Gran Burger - Sistema POS

Sistema de Punto de Venta completo para hamburguesería, con gestión de pedidos, inventario, delivery y reportes.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Status](https://img.shields.io/badge/status-production-success.svg)

---

## 🚀 Características Principales

### 💳 Punto de Venta (POS)
- ✅ Interfaz intuitiva tipo grilla con productos
- ✅ Filtros por categoría
- ✅ Búsqueda rápida de productos
- ✅ Carrito en tiempo real
- ✅ Gestión de cliente (nombre, teléfono, dirección)
- ✅ Descuentos y notas por pedido
- ✅ Tipos de pedido: Delivery / Para Retirar / En Local

### 📦 Gestión de Productos
- ✅ CRUD completo de productos
- ✅ Categorización por tipos
- ✅ Control de productos activos/inactivos
- ✅ Precios flexibles

### 🗂️ Categorías
- ✅ Hamburguesas
- ✅ Lomitos
- ✅ Bebidas
- ✅ Personalizable (agregar más categorías)

### 📊 Ventas e Historial
- ✅ Historial completo de ventas
- ✅ Filtros por fecha
- ✅ Estados: Pendiente / Completado / Cancelado
- ✅ Detalle completo de cada venta
- ✅ Gestión de pedidos pendientes
- ✅ Cobro diferido (crear pedido → cobrar después)

### 📦 Inventario
- ✅ Control de stock en tiempo real
- ✅ Alertas de stock bajo
- ✅ Historial de movimientos
- ✅ Entrada y salida de productos

### 🚚 Delivery
- ✅ Gestión de conductores/repartidores
- ✅ Asignación de pedidos
- ✅ Control de entregas
- ✅ Costos de envío configurables

### 🖨️ Impresión de Tickets
- ✅ **Comanda de cocina** (sin precios, con nota destacada)
- ✅ **Ticket de cliente** (con precios, detalle completo)
- ✅ Impresión automática al confirmar pedido
- ✅ Impresión en impresoras térmicas USB 80mm
- ✅ Print Server local (ESC/POS)

### 💰 Medios de Pago
- ✅ Efectivo
- ✅ Tarjeta
- ✅ QR / Transferencia
- ✅ Pago mixto
- ✅ Pago pendiente (cobrar después)

### 👥 Usuarios y Permisos
- ✅ Roles: Admin / Caja / Cocina
- ✅ Control de acceso por rol
- ✅ Sistema de autenticación seguro

### 📈 Reportes
- ✅ Ventas por período
- ✅ Productos más vendidos
- ✅ Ingresos por categoría
- ✅ Estadísticas de repartidores
- ✅ Reportes de inventario

---

## 🛠️ Stack Tecnológico

### Frontend
- **Framework:** Next.js 15 (Pages Router)
- **UI:** React 18 + TypeScript
- **Styling:** Tailwind CSS + Shadcn/UI
- **State:** React Hooks + Context API
- **Icons:** Lucide React

### Backend
- **Database:** Supabase (PostgreSQL)
- **Auth:** Supabase Auth
- **Real-time:** Supabase Realtime
- **Storage:** Supabase Storage (imágenes de productos)

### Impresión
- **Print Server:** Node.js + Express
- **Driver:** escpos (ESC/POS commands)
- **USB:** node-usb

---

## 📋 Requisitos del Sistema

### Hardware
- PC/Laptop Windows 10/11
- 4GB RAM mínimo (8GB recomendado)
- Procesador Intel i3 o superior
- 10GB espacio en disco
- 2 impresoras térmicas USB 80mm

### Software
- Node.js 18 o superior
- Navegador Chrome/Edge/Firefox actualizado
- Drivers de impresoras térmicas

---

## 🚀 Instalación Rápida

### 1. Clonar el Proyecto

```bash
git clone [URL_DEL_PROYECTO]
cd delagranburguer-pos
```

### 2. Instalar Dependencias

```bash
npm install
```

### 3. Configurar Variables de Entorno

El archivo `.env.local` ya está configurado con Supabase.

### 4. Iniciar el Servidor

**Para desarrollo:**

```bash
npm run dev
```

**Para red local (acceso desde otros equipos):**

```bash
npm run dev -- -H 0.0.0.0
```

**Para producción:**

```bash
npm run build
npm start
```

### 5. Acceder al Sistema

- **Local:** http://localhost:3000
- **Red Local:** http://[IP_DEL_SERVIDOR]:3000

---

## 🖨️ Configuración de Impresoras

### 1. Instalar Print Server

```bash
cd print-server
npm install
```

### 2. Configurar Nombres de Impresoras

Edita `print-server/server.js`:

```javascript
const PRINTERS = {
  kitchen: "Nombre_Impresora_Cocina",
  client: "Nombre_Impresora_Cliente"
};
```

### 3. Iniciar Print Server

```bash
npm start
```

### 4. Configurar en el POS

1. Ve a ⚙️ Ajustes → Configuración de Impresoras
2. Selecciona las impresoras de cocina y cliente
3. Guarda y prueba la impresión

---

## 📖 Guía de Uso

### Login Inicial

```
Email: admin@delagranburguer.com
Contraseña: admin123
```

**⚠️ Cambia esta contraseña después del primer login**

### Crear una Venta

1. ✅ Ir a **🛒 Punto de Venta**
2. ✅ Buscar o filtrar productos por categoría
3. ✅ Click en producto → se agrega al carrito
4. ✅ Ajustar cantidades con +/-
5. ✅ Completar datos del cliente (opcional)
6. ✅ Seleccionar tipo: Delivery / Para Retirar / En Local
7. ✅ **Opción A:** Click "Confirmar Pedido" (sin cobrar)
8. ✅ **Opción B:** Click "Recibir Pago" (cobrar y completar)

### Cobrar Pedido Pendiente

1. ✅ Ir a **📋 Ventas**
2. ✅ Click en pedido pendiente
3. ✅ Se carga en el carrito
4. ✅ Click "Recibir Pago"
5. ✅ Seleccionar medio de pago
6. ✅ Confirmar → Imprime tickets

### Gestionar Productos

1. ✅ Ir a **📦 Productos y Servicios**
2. ✅ Click "Nuevo Producto"
3. ✅ Completar datos (nombre, categoría, precio)
4. ✅ Guardar
5. ✅ El producto aparece en el POS

### Ver Reportes

1. ✅ Ir a **📊 Informes**
2. ✅ Seleccionar período (hoy, semana, mes)
3. ✅ Ver estadísticas:
   - Total de ventas
   - Productos más vendidos
   - Ingresos por categoría
   - Performance de repartidores

---

## 🌐 Despliegue en Producción

### Opción 1: Red Local (Recomendado para locales físicos)

```bash
# Instalar PM2
npm install -g pm2

# Iniciar con PM2
pm2 start npm --name "pos" -- run dev -- -H 0.0.0.0
pm2 save
pm2 startup
```

### Opción 2: Vercel (Acceso desde Internet)

```bash
# Instalar Vercel CLI
npm install -g vercel

# Login
vercel login

# Desplegar
vercel --prod
```

---

## 📁 Estructura del Proyecto

```
delagranburguer-pos/
├── src/
│   ├── components/
│   │   ├── pos/              # Componentes del POS
│   │   │   ├── ProductsManager.tsx
│   │   │   ├── SalesHistory.tsx
│   │   │   ├── PaymentModal.tsx
│   │   │   ├── Inventory.tsx
│   │   │   ├── Reports.tsx
│   │   │   └── DeliveryDrivers.tsx
│   │   ├── ui/               # Componentes Shadcn/UI
│   │   └── SEO.tsx
│   ├── pages/
│   │   ├── index.tsx         # POS principal
│   │   ├── _app.tsx
│   │   └── api/
│   ├── services/             # Servicios de API
│   │   ├── authService.ts
│   │   ├── productService.ts
│   │   ├── categoryService.ts
│   │   ├── saleService.ts
│   │   ├── inventoryService.ts
│   │   └── driverService.ts
│   ├── types/                # Tipos TypeScript
│   │   └── pos.ts
│   ├── integrations/
│   │   └── supabase/         # Configuración Supabase
│   ├── styles/               # Estilos CSS
│   └── lib/                  # Utilidades
│       ├── utils.ts
│       └── printService.ts
├── print-server/             # Servidor de impresión
│   ├── server.js
│   ├── package.json
│   └── README.md
├── database/
│   └── schema.sql            # Schema de BD
├── public/                   # Archivos públicos
├── .env.local                # Variables de entorno
├── INSTALACION.md            # Guía completa de instalación
└── README.md                 # Este archivo
```

---

## 🔐 Seguridad

- ✅ Autenticación con Supabase Auth
- ✅ Row Level Security (RLS) en base de datos
- ✅ Variables de entorno para credenciales
- ✅ Sesiones seguras con JWT
- ✅ Control de acceso por roles

---

## 🐛 Troubleshooting

### No puedo acceder desde otro equipo

```bash
# Verificar firewall
netsh advfirewall firewall add rule name="Next.js" dir=in action=allow protocol=TCP localport=3000
```

### Las impresoras no funcionan

1. ✅ Verificar que estén instaladas en Windows
2. ✅ Revisar nombres en `print-server/server.js`
3. ✅ Reiniciar Print Server: `pm2 restart print-server`

### Error de conexión a Supabase

1. ✅ Verificar Internet
2. ✅ Revisar `.env.local`
3. ✅ Reiniciar servidor

---

## 📞 Soporte

- 📧 Email: soporte@delagranburguer.com
- 📱 WhatsApp: +595 XXX XXX XXX
- 💬 Chat en el sistema (⚙️ Ajustes → Soporte)

---

## 📄 Licencia

MIT License - Ver archivo LICENSE para más detalles

---

## 🎉 Créditos

Desarrollado con ❤️ por el equipo de De la Gran Burger

Powered by:
- [Next.js](https://nextjs.org/)
- [Supabase](https://supabase.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Shadcn/UI](https://ui.shadcn.com/)

---

**🍔 ¡Buen provecho y buenas ventas!** 🚀