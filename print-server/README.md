# Print Server - De la Gran Burger POS

Servidor de impresión local para impresoras térmicas USB ESC/POS (80mm).

## Requisitos

- Node.js 16+ instalado
- Impresora térmica USB 80mm conectada
- Windows (recomendado) / Linux / macOS

## Instalación

### 1. Instalar Node.js

Si no tienes Node.js instalado:
1. Descargar desde: https://nodejs.org/
2. Instalar la versión LTS (recomendada)
3. Verificar instalación abriendo CMD y ejecutar: `node --version`

### 2. Instalar dependencias del Print Server

Abrir CMD o PowerShell en la carpeta `print-server` y ejecutar:

```bash
npm install
```

### 3. Conectar impresora térmica USB

1. Conectar la impresora térmica USB al puerto USB de la PC
2. Windows detectará automáticamente la impresora
3. Verificar en "Dispositivos e impresoras" que aparece conectada

## Uso

### Iniciar el servidor de impresión

Desde la carpeta `print-server`:

```bash
npm start
```

El servidor iniciará en `http://localhost:3001` y mostrará:
- Endpoints disponibles
- Impresoras detectadas automáticamente

### Configuración en la aplicación web

1. Abrir la aplicación web en el navegador
2. Ir a **Ajustes** → **Configuración de Impresoras**
3. Seleccionar:
   - Impresora de Cocina (para comandas)
   - Impresora de Cliente (para tickets de venta)
   - Número de copias
4. Hacer clic en "Probar Impresión" para verificar

## Funcionamiento

Cuando confirmas una venta en el POS:

1. **Comanda de Cocina** (sin precios):
   - Se imprime automáticamente en la impresora de cocina
   - Muestra: Nro de pedido, items con cantidades, nota, info del cliente
   - Ideal para que cocina prepare el pedido

2. **Ticket de Cliente** (con precios):
   - Se imprime en la impresora de caja/cliente
   - Muestra: Items con precios, subtotal, descuento, total, medio de pago
   - Es el recibo para entregar al cliente

## Solución de Problemas

### Error: "No se detectan impresoras"

1. Verificar que la impresora esté conectada y encendida
2. Reiniciar el Print Server (`Ctrl+C` y volver a `npm start`)
3. En Windows: verificar en "Dispositivos e impresoras"
4. Probar desconectar y reconectar la impresora USB

### Error: "Cannot find module 'usb'"

Windows requiere compilar módulos nativos:

1. Instalar Windows Build Tools:
```bash
npm install --global windows-build-tools
```

2. Reinstalar dependencias:
```bash
npm install
```

### Error: "Access denied" o permisos

1. Ejecutar CMD/PowerShell como Administrador
2. Volver a iniciar el servidor

### La impresión no sale o sale mal

1. Verificar que el papel esté correctamente instalado
2. Confirmar que el tamaño es 80mm
3. Hacer prueba de impresión desde el botón de la impresora
4. Usar el endpoint de prueba: POST `/api/print/test`

## Iniciar automáticamente al encender Windows

### Opción 1: Acceso directo en Inicio

1. Crear archivo `start-print-server.bat`:
```batch
@echo off
cd C:\ruta\a\tu\proyecto\print-server
npm start
pause
```

2. Guardar en la carpeta del proyecto
3. Crear acceso directo y mover a: 
   `C:\Users\TuUsuario\AppData\Roaming\Microsoft\Windows\Start Menu\Programs\Startup`

### Opción 2: Servicio de Windows (avanzado)

Usar `node-windows` o `pm2-windows-service` para crear un servicio permanente.

## API Endpoints

### GET /api/printers
Lista todas las impresoras USB detectadas.

**Respuesta:**
```json
{
  "success": true,
  "printers": [
    {
      "id": 0,
      "name": "USB Printer 1",
      "vendorId": 1234,
      "productId": 5678
    }
  ]
}
```

### POST /api/print/kitchen
Imprime comanda de cocina (sin precios).

**Body:**
```json
{
  "data": {
    "orderNumber": "001",
    "date": "2024-01-15T10:30:00",
    "orderType": "delivery",
    "items": [...],
    "note": "Sin cebolla",
    "customer": {...}
  },
  "printerIndex": 0
}
```

### POST /api/print/client
Imprime ticket de cliente (con precios).

**Body:**
```json
{
  "data": {
    "orderNumber": "001",
    "date": "2024-01-15T10:30:00",
    "orderType": "delivery",
    "items": [...],
    "subtotal": 50000,
    "discountAmount": 5000,
    "total": 45000,
    "paymentMethod": "cash",
    "customer": {...}
  },
  "printerIndex": 0
}
```

### POST /api/print/both
Imprime ambos tickets (comanda + cliente).

**Body:**
```json
{
  "data": {...},
  "kitchenPrinter": 0,
  "clientPrinter": 0,
  "copies": 1
}
```

### POST /api/print/test
Imprime ticket de prueba para verificar configuración.

**Body:**
```json
{
  "printerIndex": 0
}
```

## Soporte

Para problemas o dudas, contactar al equipo de soporte de De la Gran Burger.