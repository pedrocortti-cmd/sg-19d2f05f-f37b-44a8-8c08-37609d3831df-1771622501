# De la Gran Burger - Sistema POS

Sistema de Punto de Venta completo para hamburguesería con impresión térmica automática.

## 🚀 Características Principales

### Punto de Venta (POS)
- ✅ Interfaz intuitiva con 3 paneles (menú, cliente/carrito, productos)
- ✅ Carrito de compras con control de cantidades
- ✅ Gestión de información del cliente (nombre, teléfono, dirección, RUC)
- ✅ Tipos de pedido: Delivery / Para Retirar
- ✅ Sistema de descuentos (porcentaje)
- ✅ Notas en pedidos
- ✅ Búsqueda y filtrado por categorías

### Gestión de Productos
- ✅ CRUD completo de productos (nombre, precio, categoría)
- ✅ CRUD de categorías
- ✅ Activar/Desactivar productos
- ✅ Organización por categorías

### Sistema de Impresión Térmica USB (80mm)
- ✅ **Print Server local** con detección automática de impresoras USB
- ✅ **Comanda de cocina** (sin precios, enfocada en preparación)
- ✅ **Ticket de cliente** (con precios y totales)
- ✅ Impresión automática al confirmar venta
- ✅ Configuración de impresoras independientes (cocina/cliente)
- ✅ Control de copias de comandas
- ✅ Comandos ESC/POS para impresoras térmicas

### Historial de Ventas
- ✅ Listado completo de ventas
- ✅ Filtros por fecha
- ✅ Detalle de cada venta
- ✅ Anulación de ventas

### Configuración
- ✅ Configuración de impresoras térmicas
- ✅ Detección automática de impresoras USB
- ✅ Prueba de impresión
- ✅ Guardado de preferencias

## 📋 Requisitos

### Software
- Node.js v18 o superior
- PostgreSQL v14 o superior (opcional, usa localStorage por ahora)
- Windows 10/11

### Hardware
- PC con Windows
- 2 Impresoras térmicas USB (80mm):
  - Una para cocina (comandas)
  - Una para cliente (tickets)

## 🔧 Instalación

### 1. Clonar el proyecto

```bash
git clone [URL_DEL_REPOSITORIO]
cd delagranburguer-pos
```

### 2. Instalar dependencias

**Aplicación principal:**
```bash
npm install
```

**Print Server:**
```bash
cd print-server
npm install
cd ..
```

### 3. Configurar variables de entorno

Crea un archivo `.env.local` en la raíz:

```env
NEXT_PUBLIC_APP_NAME=De la Gran Burger
NEXT_PUBLIC_PRINT_SERVER_URL=http://localhost:3001
```

### 4. Conectar impresoras USB

1. Conecta ambas impresoras térmicas USB a la PC
2. Espera a que Windows instale los drivers
3. Verifica en "Dispositivos e impresoras"

### 5. Iniciar el sistema

**Terminal 1 - Print Server:**
```bash
cd print-server
npm start
```

Deberías ver:
```
🖨️  Print Server corriendo en http://localhost:3001
🔍 Impresoras detectadas: 2
```

**Terminal 2 - Aplicación Web:**
```bash
npm run dev
```

Abre tu navegador en: `http://localhost:3000`

### 6. Configurar impresoras

1. Ve a **Ajustes** en el menú lateral
2. Verifica que las impresoras se detecten
3. Selecciona:
   - **Impresora de Cocina** (comandas)
   - **Impresora de Cliente** (tickets)
4. Configura las **Copias de Comanda**
5. Haz clic en **"Probar"** para verificar
6. **Guarda la configuración**

## 📖 Uso del Sistema

### Realizar una Venta

1. **Seleccionar productos**: Haz clic en los productos de la grilla
2. **Ajustar cantidades**: Usa los botones +/- en el carrito
3. **Información del cliente** (opcional):
   - Nombre, teléfono, dirección
   - RUC y razón social para facturas
4. **Tipo de pedido**: Delivery o Para Retirar
5. **Agregar descuento** (opcional)
6. **Nota del pedido** (opcional)
7. **Confirmar Venta**: Se imprimen automáticamente:
   - ✅ Comanda en cocina (sin precios)
   - ✅ Ticket para cliente (con precios)

### Gestionar Productos

1. Ve a **Productos y Servicios**
2. **Agregar producto**: Botón "Agregar Producto"
3. **Editar**: Click en el icono de lápiz
4. **Activar/Desactivar**: Toggle en cada producto
5. **Categorías**: Gestiona las categorías de productos

### Ver Historial de Ventas

1. Ve a **Ventas**
2. Filtra por fecha
3. Abre el detalle de cualquier venta
4. Puedes anular ventas si es necesario

## 🖨️ Sistema de Impresión

### Comanda de Cocina (80mm)
- Título destacado "COMANDA COCINA"
- Número de pedido
- Fecha y hora
- Tipo de pedido (DELIVERY/PARA RETIRAR)
- Lista de productos con cantidades
- **Sin precios** (enfocado en preparación)
- Nota del pedido (muy visible)
- Datos del cliente si es delivery

### Ticket de Cliente (80mm)
- Nombre del negocio
- Número de venta
- Fecha y hora
- Items con precios
- Subtotal, descuento, total
- Método de pago
- Datos del cliente
- Mensaje de agradecimiento

## 🛠️ Solución de Problemas

### Impresoras no se detectan
1. Verifica que estén conectadas y encendidas
2. Reinicia el Print Server
3. Verifica drivers en "Dispositivos e impresoras"
4. Prueba otro puerto USB

### Error al imprimir
1. Verifica que el Print Server esté corriendo
2. Revisa la consola del Print Server para errores
3. Verifica que las impresoras tengan papel
4. Prueba desde "Ajustes" > "Probar"

### La app no inicia
1. Verifica Node.js: `node --version`
2. Reinstala dependencias: `rm -rf node_modules && npm install`
3. Verifica que el puerto 3000 no esté ocupado

## 📂 Estructura del Proyecto

```
delagranburguer-pos/
├── src/
│   ├── components/
│   │   └── pos/
│   │       ├── ProductsManager.tsx
│   │       ├── SalesHistory.tsx
│   │       └── PrinterSettings.tsx
│   ├── pages/
│   │   └── index.tsx
│   ├── styles/
│   │   └── pos.css
│   └── types/
│       └── pos.ts
├── print-server/
│   ├── server.js
│   ├── package.json
│   └── README.md
├── database/
│   └── schema.sql
└── INSTALACION.md
```

## 🔐 Próximas Funcionalidades

- [ ] Sistema de usuarios y permisos
- [ ] Backend con PostgreSQL
- [ ] Módulo de inventario
- [ ] Módulo de gastos
- [ ] Reportes e informes
- [ ] Integración con medios de pago (QR, tarjetas)
- [ ] App móvil para cocina

## 📞 Soporte

Para problemas o consultas:
- Email: soporte@delagranburguer.com
- WhatsApp: [NÚMERO]

## 📄 Licencia

© 2026 De la Gran Burger. Todos los derechos reservados.