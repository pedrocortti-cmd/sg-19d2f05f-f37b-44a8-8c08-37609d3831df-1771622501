# 🍔 De la Gran Burger - Sistema POS

Sistema de Punto de Venta (POS) completo para hamburguesería, con impresión térmica automática, gestión de inventario, y reportes en tiempo real.

[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Enabled-green)](https://supabase.com/)

---

## ✨ Características Principales

### 🛒 Punto de Venta Intuitivo
- ✅ Interfaz rápida y fácil de usar
- ✅ Carrito de compras dinámico
- ✅ Gestión de clientes (nombre, teléfono, dirección, RUC)
- ✅ Descuentos por monto o porcentaje
- ✅ Notas de pedido
- ✅ Tipos de pedido: Delivery / Para Retirar
- ✅ Numeración diaria que se reinicia automáticamente (##0001, ##0002...)

### 🖨️ Impresión Térmica Automática
- ✅ Impresión USB directa (80mm)
- ✅ Comandas para cocina (sin precios)
- ✅ Tickets para cliente (completos)
- ✅ Print Server local con ESC/POS
- ✅ Configuración de múltiples impresoras
- ✅ Impresión silenciosa (sin diálogo del navegador)

### 📦 Gestión de Productos
- ✅ CRUD completo de productos
- ✅ Categorías personalizables
- ✅ Gestión de precios
- ✅ Control de estado (activo/inactivo)
- ✅ Búsqueda rápida
- ✅ Filtros por categoría

### 📊 Inventario
- ✅ Control de stock en tiempo real
- ✅ Alertas de stock mínimo
- ✅ Historial de movimientos
- ✅ Ajustes manuales de inventario

### 💰 Reportes y Análisis
- ✅ Ventas diarias/mensuales/anuales
- ✅ Productos más vendidos
- ✅ Comparación de periodos
- ✅ Gráficos interactivos
- ✅ Exportación de datos

### 🚚 Gestión de Delivery
- ✅ Asignación de pedidos a conductores
- ✅ Seguimiento de entregas
- ✅ Historial por conductor
- ✅ Métricas de rendimiento

### 👥 Gestión de Usuarios
- ✅ Roles: Admin, Caja, Cocina
- ✅ Permisos personalizables
- ✅ Auditoría de acciones

### 🎨 Personalización
- ✅ Logo personalizado del negocio
- ✅ Configuración de impresoras
- ✅ Formato de tickets customizable

---

## 🚀 Instalación Rápida

### Requisitos
- Windows 10/11
- Node.js 18+
- Impresora térmica USB 80mm (opcional)

### 5 Pasos Simples

```bash
# 1. Instalar Node.js (si no lo tienes)
# Descargar de: https://nodejs.org/

# 2. Clonar el repositorio
git clone [URL_DEL_REPO] delagranburguer-pos
cd delagranburguer-pos

# 3. Instalar dependencias
npm install

# 4. Iniciar aplicación web
npm run dev

# 5. (Opcional) Iniciar Print Server para impresoras
cd print-server
npm install
npm start
```

✅ **¡Listo!** Abre tu navegador en **http://localhost:3000**

**Credenciales iniciales:**
- Usuario: `admin`
- Contraseña: `admin123`

---

## 📖 Documentación Completa

Para instrucciones detalladas de instalación, configuración y uso:

📘 **[Ver Guía de Instalación Completa](INSTALACION.md)**

Incluye:
- Instalación paso a paso
- Configuración de impresoras
- Configuración de producción
- Solución de problemas
- Backup y mantenimiento

---

## 🖼️ Capturas de Pantalla

### Punto de Venta
![POS](docs/screenshots/pos.png)
*Interfaz principal del POS con carrito y catálogo de productos*

### Gestión de Productos
![Productos](docs/screenshots/products.png)
*CRUD completo de productos con categorías*

### Reportes
![Reportes](docs/screenshots/reports.png)
*Análisis de ventas con gráficos interactivos*

### Configuración de Impresoras
![Impresoras](docs/screenshots/printers.png)
*Configuración sencilla de impresoras térmicas*

---

## 🛠️ Tecnologías

### Frontend
- **Next.js 15** - Framework React con SSR
- **React 18** - Biblioteca UI
- **TypeScript** - Tipado estático
- **Tailwind CSS** - Estilos utility-first
- **shadcn/ui** - Componentes UI

### Backend
- **Supabase** - Base de datos PostgreSQL en la nube
- **Next.js API Routes** - Endpoints REST

### Impresión
- **Print Server (Node.js + Express)** - Servidor local de impresión
- **escpos** - Librería ESC/POS para impresoras térmicas
- **usb** - Comunicación USB directa

### DevOps
- **PM2** - Process manager para producción
- **Vercel** - Deployment (opcional)

---

## 📁 Estructura del Proyecto

```
delagranburguer-pos/
├── src/
│   ├── components/          # Componentes React
│   │   ├── pos/            # Componentes del POS
│   │   └── ui/             # Componentes UI (shadcn)
│   ├── pages/              # Rutas Next.js
│   │   ├── index.tsx       # Página principal (POS)
│   │   └── api/            # API Routes
│   ├── styles/             # Estilos CSS
│   ├── types/              # Tipos TypeScript
│   ├── lib/                # Utilidades
│   ├── contexts/           # Context API
│   └── integrations/       # Integraciones (Supabase)
│       └── supabase/
├── print-server/           # Servidor de impresión
│   ├── server.js          # Express server
│   └── package.json
├── database/              # Scripts SQL
│   └── schema.sql        # Schema de base de datos
├── public/               # Archivos estáticos
├── INSTALACION.md       # Guía de instalación completa
└── README.md            # Este archivo
```

---

## 🔧 Configuración

### Variables de Entorno

Crear archivo `.env.local` con:

```env
# Supabase (ya configurado)
NEXT_PUBLIC_SUPABASE_URL=https://[proyecto].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[tu-clave]
```

### Print Server

El Print Server se ejecuta por defecto en `http://localhost:3001`

**Configurar impresoras:**
1. Conectar impresoras USB
2. Ir a Ajustes → Impresoras
3. Seleccionar impresoras de cocina y cliente
4. Probar impresión

---

## 🎯 Uso del Sistema

### Flujo de Venta

1. **Agregar productos** al carrito
2. **Ingresar datos del cliente** (opcional)
3. **Aplicar descuento** (opcional)
4. **Agregar nota** del pedido (opcional)
5. **Seleccionar tipo**: Delivery / Para Retirar
6. **Procesar pago**: Efectivo / Tarjeta / QR / Transferencia
7. **Confirmar** → Impresión automática

### Numeración de Pedidos

El sistema genera números de pedido que **se reinician automáticamente cada día**:

```
HOY (20/02/2026):     ##0001, ##0002, ##0003, ... ##0060
MAÑANA (21/02/2026):  ##0001, ##0002, ##0003, ...
```

Esto facilita:
- ✅ Control diario de pedidos
- ✅ Comunicación clara con cocina
- ✅ Números cortos y manejables

---

## 🖨️ Sistema de Impresión

### Impresoras Soportadas

✅ Epson TM-T20 / TM-T88  
✅ Star TSP143 / TSP654  
✅ Bixolon SRP-330 / SRP-350  
✅ Cualquier impresora térmica USB con ESC/POS  

### Tipos de Tickets

**1. Comanda de Cocina (sin precios)**
```
═══════════════════════════
      COMANDA COCINA
═══════════════════════════
Pedido: ##0023
Fecha: 20/02/2026 14:30
Tipo: Delivery
───────────────────────────
1x Carnívora
2x Papas Fritas
1x Coca Cola 1.5L
───────────────────────────
NOTA: Sin cebolla
───────────────────────────
Cliente: Juan Pérez
Tel: 0981-123456
Dirección: Av. España 123
═══════════════════════════
```

**2. Ticket de Cliente (con precios)**
```
═══════════════════════════
    DE LA GRAN BURGER
═══════════════════════════
Venta: ##0023
Fecha: 20/02/2026 14:30
───────────────────────────
Carnívora        Gs. 22.000
Papas Fritas x2  Gs. 30.000
Coca Cola 1.5L   Gs. 10.000
───────────────────────────
Subtotal         Gs. 62.000
Descuento        Gs. -2.000
───────────────────────────
TOTAL            Gs. 60.000
───────────────────────────
Pago: Efectivo
═══════════════════════════
   ¡Gracias por tu compra!
═══════════════════════════
```

---

## 📊 Base de Datos

### Tablas Principales

- **products** - Productos del menú
- **categories** - Categorías de productos
- **sales** - Ventas realizadas
- **sale_items** - Items de cada venta
- **users** - Usuarios del sistema
- **drivers** - Conductores de delivery
- **inventory_movements** - Movimientos de inventario

### Schema

Ver archivo completo: [`database/schema.sql`](database/schema.sql)

La base de datos está alojada en **Supabase** (PostgreSQL en la nube).

---

## 🚀 Deployment

### Opción 1: Servidor Local (Recomendado)

Ideal para un solo local:

```bash
# Instalar PM2
npm install -g pm2 pm2-windows-startup

# Configurar inicio automático
pm2-startup install

# Iniciar aplicación
pm2 start npm --name "pos-web" -- run dev
pm2 start print-server/server.js --name "print-server"

# Guardar
pm2 save
```

### Opción 2: Cloud + Print Server Local

Ideal para múltiples locales:

1. **Deploy web app** en Vercel:
   ```bash
   vercel deploy --prod
   ```

2. **Print Server** se mantiene local en cada local

---

## 🔍 Solución de Problemas

### La aplicación no inicia

```bash
# Verificar instalación de Node.js
node --version

# Reinstalar dependencias
rm -rf node_modules package-lock.json
npm install

# Verificar puerto 3000
netstat -ano | findstr :3000
```

### Impresoras no detectadas

```bash
# Verificar Print Server
pm2 status print-server

# Ver logs
pm2 logs print-server

# Reiniciar
pm2 restart print-server
```

### Error de conexión a Supabase

1. Verificar internet
2. Verificar credenciales en `.env.local`
3. Contactar soporte

Para más problemas: **[Ver Guía Completa](INSTALACION.md#solución-de-problemas)**

---

## 🤝 Contribuir

Este es un proyecto privado para **De la Gran Burger**.

Para reportar bugs o sugerir mejoras:
- 📧 Email: soporte@delagranburguer.com
- 📱 WhatsApp: +595 XXX XXXXXX

---

## 📄 Licencia

© 2026 De la Gran Burger. Todos los derechos reservados.

Este software es propiedad privada de De la Gran Burger y está protegido por leyes de derechos de autor.

---

## 👥 Equipo

Desarrollado con ❤️ por el equipo de De la Gran Burger

**Contacto:**
- 🌐 Web: [Próximamente]
- 📧 Email: soporte@delagranburguer.com
- 📱 WhatsApp: +595 XXX XXXXXX

---

## 🎉 ¡Gracias por usar nuestro sistema!

Si tienes alguna pregunta o necesitas ayuda, no dudes en contactarnos.

**¡Buen provecho!** 🍔🍟🥤