# 🍔 De la Gran Burger - Sistema POS

Sistema de Punto de Venta completo para hamburguesería con gestión de inventario, delivery, repartidores e impresión térmica.

## 🌟 Características Principales

### 📱 **Punto de Venta (POS)**
- ✅ Carrito de compras interactivo
- ✅ Información completa del cliente
- ✅ 3 tipos de pedido: Delivery, Para Retirar, En Local
- ✅ Asignación de repartidores
- ✅ Cálculo automático de costos de delivery
- ✅ Sistema de descuentos (porcentaje o monto fijo)
- ✅ Notas por pedido y por producto
- ✅ Confirmación de pedidos (estado PENDIENTE)
- ✅ Registro de pagos (estado COMPLETADO)
- ✅ Edición de pedidos existentes
- ✅ Vista previa de tickets

### 📋 **Historial de Ventas**
- ✅ Lista completa con búsqueda avanzada
- ✅ Filtros por estado (Todas, Pendientes, Completadas, Anuladas)
- ✅ Filtros por tipo (Delivery, Retiro, Local)
- ✅ Filtros por fecha (Hoy, Ayer, Semana, Mes)
- ✅ Visualización del repartidor asignado
- ✅ Carga de pedidos para edición
- ✅ Eliminación de pedidos
- ✅ Vista previa e impresión de tickets

### 🎯 **Gestión de Productos y Servicios**
- ✅ CRUD completo de productos
- ✅ CRUD completo de categorías
- ✅ Búsqueda de productos
- ✅ Control de stock
- ✅ Gestión de precios
- ✅ Activar/desactivar productos
- ✅ Ordenamiento de categorías
- ✅ Soporte para imágenes de productos

### 📦 **Inventario**
- ✅ Visualización de stock actual
- ✅ Estadísticas de inventario
- ✅ Alertas de stock bajo
- ✅ Productos sin stock
- ✅ Productos con stock crítico
- ✅ Historial de movimientos
- ✅ Actualización manual de stock
- ✅ Descuento automático al confirmar ventas

### 🛵 **Repartidores**
- ✅ CRUD completo de repartidores
- ✅ Gestión de nombres y teléfonos
- ✅ Activar/desactivar repartidores
- ✅ Asignación automática en pedidos delivery
- ✅ Visualización en historial de ventas
- ✅ Estadísticas de rendimiento

### 📊 **Informes y Reportes**
- ✅ Resumen de ventas del día
- ✅ Total vendido
- ✅ Cantidad de pedidos
- ✅ Ticket promedio
- ✅ Ventas por tipo (Delivery, Retiro, Local)
- ✅ Productos más vendidos (Top 10)
- ✅ Estadísticas por categoría
- ✅ Rendimiento de repartidores
- ✅ Gráficos visuales

### ⚙️ **Ajustes y Configuración**
- ✅ Configuración de impresoras (cocina y cliente)
- ✅ Formato de impresión personalizable
- ✅ Información del negocio
- ✅ Gestión de logo
- ✅ Tamaño de papel (80mm/58mm)
- ✅ Cantidad de copias
- ✅ Mensajes personalizados en tickets

### 🖨️ **Sistema de Impresión**
- ✅ Print Server local para impresoras USB 80mm
- ✅ Comandos ESC/POS
- ✅ Impresión de comanda de cocina (sin precios)
- ✅ Impresión de ticket cliente (con precios)
- ✅ Detección automática de impresoras USB
- ✅ Configuración separada cocina/cliente
- ✅ Impresión silenciosa (sin diálogo del navegador)

---

## 🚀 Instalación Rápida

### **Requisitos Previos**
- Node.js 18+ y npm
- Cuenta de Supabase (PostgreSQL)
- Impresora térmica USB 80mm (opcional)

### **Paso 1: Clonar e Instalar**
```bash
# Clonar el repositorio
git clone https://github.com/tu-usuario/delagranburguer-pos.git
cd delagranburguer-pos

# Instalar dependencias
npm install
```

### **Paso 2: Configurar Base de Datos**
```bash
# Crear cuenta en Supabase (https://supabase.com)
# Crear nuevo proyecto
# Copiar las credenciales (URL y anon key)

# Ejecutar el schema SQL
# Ve a: Supabase → SQL Editor → Pega el contenido de database/schema.sql
```

### **Paso 3: Configurar Variables de Entorno**
```bash
# Renombrar .env.example a .env.local
cp .env.example .env.local

# Editar .env.local con tus credenciales de Supabase
NEXT_PUBLIC_SUPABASE_URL=tu_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_supabase_anon_key
```

### **Paso 4: Iniciar Aplicación**
```bash
# Desarrollo
npm run dev

# O con PM2 (recomendado para producción)
npm install -g pm2
pm2 start ecosystem.config.js
```

La aplicación estará disponible en: `http://localhost:3000`

---

## 🖨️ Configurar Print Server (Opcional)

### **Paso 1: Instalar Dependencias**
```bash
cd print-server
npm install
```

### **Paso 2: Iniciar Servidor de Impresión**
```bash
# Modo desarrollo (con logs)
node server.js

# O con PM2 (recomendado)
pm2 start server.js --name "print-server"
```

### **Paso 3: Configurar en la Aplicación**
1. Abre la aplicación web
2. Ve a **Ajustes** → **Configuración de Impresoras**
3. Selecciona la impresora de cocina
4. Selecciona la impresora de cliente
5. Click en **"Probar Impresión"** para verificar

---

## 📚 Uso del Sistema

### **Crear un Pedido**

1. **Agregar Productos:**
   - Click en productos de la grilla
   - Ajusta cantidades con botones +/-
   - Agrega notas individuales si es necesario

2. **Información del Cliente:**
   - Nombre (requerido para delivery)
   - Teléfono (opcional)
   - Dirección (requerido para delivery)
   - RUC y Razón Social (opcional, para facturas)

3. **Tipo de Pedido:**
   - **Delivery:** Requiere repartidor y costo de delivery
   - **Para Retirar:** Cliente recoge en local
   - **En Local:** Consumo en el restaurante

4. **Confirmar:**
   - **"Confirmar Pedido"** → Guarda como PENDIENTE (para cocina)
   - **"Recibir Pago"** → Registra pago y cambia a COMPLETADO

### **Editar un Pedido**

1. Ve a **"Ventas"**
2. Busca el pedido (pendientes o completados)
3. Click en **"Cargar"**
4. Modifica lo necesario
5. Click en **"Guardar Cambios"**

### **Gestionar Productos**

1. Ve a **"Productos y Servicios"**
2. **Agregar Producto:**
   - Click en **"+ Nuevo Producto"**
   - Completa: Nombre, Precio, Categoría, Stock
   - Click en **"Guardar"**

3. **Editar/Eliminar:**
   - Click en el ícono de editar/eliminar en cada producto

### **Ver Reportes**

1. Ve a **"Informes"**
2. Selecciona el rango de fechas
3. Visualiza:
   - Ventas totales
   - Productos más vendidos
   - Rendimiento de repartidores
   - Estadísticas por categoría

---

## 🗄️ Estructura de la Base de Datos

### **Tablas Principales**
- `categories` - Categorías de productos
- `products` - Productos y servicios
- `delivery_drivers` - Repartidores
- `sales` - Ventas/pedidos
- `sale_items` - Items de cada venta
- `inventory_movements` - Movimientos de stock

### **Políticas RLS (Row Level Security)**
El sistema usa políticas públicas para lectura de datos.
En producción, deberías agregar autenticación de usuarios.

---

## 🛠️ Tecnologías Utilizadas

### **Frontend**
- **Next.js 15** (Page Router)
- **React 18**
- **TypeScript**
- **Tailwind CSS v3**
- **Shadcn/UI** (componentes)
- **Lucide Icons**

### **Backend**
- **Supabase** (PostgreSQL + Auth + Storage)
- **Next.js API Routes**

### **Impresión**
- **Express.js** (Print Server)
- **node-escpos** (comandos ESC/POS)
- **usb** (comunicación USB)

---

## 📁 Estructura del Proyecto

```
delagranburguer-pos/
├── src/
│   ├── components/          # Componentes React
│   │   ├── pos/            # Componentes del POS
│   │   │   ├── DeliveryDrivers.tsx
│   │   │   ├── Inventory.tsx
│   │   │   ├── LogoSettings.tsx
│   │   │   ├── PaymentModal.tsx
│   │   │   ├── PrinterSettings.tsx
│   │   │   ├── PrintFormatSettings.tsx
│   │   │   ├── ProductsManager.tsx
│   │   │   ├── Reports.tsx
│   │   │   ├── SalePreviewModal.tsx
│   │   │   └── SalesHistory.tsx
│   │   ├── ui/             # Componentes Shadcn/UI
│   │   ├── SEO.tsx
│   │   └── ThemeSwitch.tsx
│   ├── contexts/           # Context API
│   ├── hooks/              # Custom hooks
│   ├── integrations/       # Integraciones externas
│   │   └── supabase/       # Cliente Supabase
│   ├── lib/                # Utilidades
│   │   ├── utils.ts
│   │   └── printService.ts
│   ├── pages/              # Páginas Next.js
│   │   ├── api/            # API routes
│   │   ├── _app.tsx
│   │   ├── _document.tsx
│   │   └── index.tsx       # POS principal
│   ├── services/           # Servicios backend
│   │   ├── categoryService.ts
│   │   ├── driverService.ts
│   │   ├── inventoryService.ts
│   │   ├── productService.ts
│   │   └── saleService.ts
│   ├── styles/             # Estilos CSS
│   │   ├── globals.css
│   │   ├── pos.css
│   │   ├── drivers.css
│   │   ├── inventory.css
│   │   ├── reports.css
│   │   ├── logo-settings.css
│   │   └── preview-modal.css
│   └── types/              # Tipos TypeScript
│       └── pos.ts
├── print-server/           # Servidor de impresión
│   ├── server.js
│   ├── package.json
│   └── README.md
├── database/               # Scripts SQL
│   └── schema.sql
├── public/                 # Archivos estáticos
├── .env.local             # Variables de entorno
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.mjs
└── README.md              # Este archivo
```

---

## 🐛 Solución de Problemas

### **Error: "Error al cargar datos"**
- Verifica la conexión a Supabase en `.env.local`
- Confirma que ejecutaste el schema SQL completo
- Revisa las políticas RLS en Supabase

### **Los productos no aparecen**
- Verifica que tengas productos activos en la BD
- Ejecuta: `SELECT * FROM products WHERE active = true;`
- Revisa la consola del navegador (F12) para errores

### **Impresora no detectada**
- Verifica que el print-server esté corriendo
- Confirma la conexión USB de la impresora
- Revisa los logs del print-server
- En Windows: Instala drivers del fabricante

### **Error al confirmar pedido**
- Abre la consola (F12) y revisa el error exacto
- Verifica que las tablas `sales` y `sale_items` existan
- Confirma las políticas RLS en Supabase

---

## 📖 Documentación Adicional

### **Manuales:**
- **INSTALACION.md** - Guía detallada de instalación
- **print-server/README.md** - Configuración de impresoras

### **Base de Datos:**
- **database/schema.sql** - Schema completo con comentarios

### **Tipos TypeScript:**
- **src/types/pos.ts** - Definiciones de tipos

---

## 🤝 Contribuir

¿Encontraste un bug? ¿Tienes una idea para mejorar el sistema?

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

---

## 📝 Roadmap

### **v1.1 (En desarrollo)**
- [ ] Autenticación de usuarios (Admin, Caja, Cocina)
- [ ] Módulo de gastos
- [ ] Reportes avanzados con gráficos
- [ ] Exportación a Excel/PDF
- [ ] Backup automático de base de datos

### **v1.2 (Futuro)**
- [ ] App móvil para repartidores
- [ ] Notificaciones push
- [ ] Integración con WhatsApp
- [ ] Panel de cocina en tiempo real
- [ ] Multi-tienda

---

## 📄 Licencia

© 2026 De la Gran Burger. Todos los derechos reservados.

Este software es propietario y confidencial. Prohibida su distribución sin autorización.

---

## 📞 Soporte

**Email:** soporte@delagranburguer.com  
**WhatsApp:** +595 981-999888  
**Horario:** Lunes a Viernes, 8:00 AM - 6:00 PM

---

## 🎉 ¡Gracias por usar De la Gran Burger POS!

Si el sistema te resulta útil, no olvides darle una ⭐ en GitHub.

**¡Buenas ventas!** 🍔🚀