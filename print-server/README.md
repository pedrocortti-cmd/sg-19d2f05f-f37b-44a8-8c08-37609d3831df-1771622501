# Print Server - De la Gran Burger POS

Servidor de impresión local para impresoras térmicas USB (80mm) usando ESC/POS.

---

## 🎯 Función

Este servidor detecta automáticamente las impresoras térmicas USB conectadas y permite imprimir:
- **Comandas de cocina** (sin precios)
- **Tickets de cliente** (con precios)

---

## 📋 Requisitos

- ✅ Node.js v18+
- ✅ Impresoras térmicas USB compatibles con ESC/POS (80mm)
- ✅ Windows 10/11
- ✅ Drivers de impresora instalados

---

## 🚀 Instalación

```bash
# En la carpeta print-server/
npm install
```

---

## ▶️ Uso

### Opción 1: Inicio Manual (Para Pruebas)

```bash
npm start
```

El servidor se iniciará en `http://localhost:3001`

### Opción 2: Con PM2 (Para Producción)

```bash
# Instalar PM2 globalmente
npm install -g pm2
npm install -g pm2-windows-startup

# Configurar inicio automático con Windows
pm2-startup install

# Iniciar Print Server
pm2 start server.js --name "print-server"

# Guardar configuración
pm2 save
```

**Verificar estado:**
```bash
pm2 status
pm2 logs print-server
```

---

## 📡 API Endpoints

### GET /api/printers
Lista todas las impresoras USB detectadas.

**Respuesta exitosa:**
```json
{
  "success": true,
  "printers": [
    {
      "id": 0,
      "name": "Epson TM-T20II",
      "vendorId": 1234,
      "productId": 5678
    },
    {
      "id": 1,
      "name": "Star TSP143",
      "vendorId": 1234,
      "productId": 5679
    }
  ]
}
```

---

### POST /api/print/kitchen
Imprime comanda de cocina (sin precios).

**Body:**
```json
{
  "data": {
    "orderNumber": "##0023",
    "date": "2026-02-20T14:30:00Z",
    "orderType": "delivery",
    "items": [
      {
        "product": { "name": "Carnívora" },
        "quantity": 1
      },
      {
        "product": { "name": "Papas Fritas" },
        "quantity": 2
      }
    ],
    "note": "Sin cebolla",
    "customer": {
      "name": "Juan Pérez",
      "phone": "0981-123456",
      "address": "Av. España 123"
    }
  },
  "printerIndex": 0
}
```

**Respuesta exitosa:**
```json
{
  "success": true,
  "message": "Comanda de cocina impresa correctamente"
}
```

---

### POST /api/print/client
Imprime ticket de cliente (con precios).

**Body:**
```json
{
  "data": {
    "orderNumber": "##0023",
    "date": "2026-02-20T14:30:00Z",
    "items": [
      {
        "product": { "name": "Carnívora", "price": 22000 },
        "quantity": 1
      },
      {
        "product": { "name": "Papas Fritas", "price": 15000 },
        "quantity": 2
      }
    ],
    "subtotal": 52000,
    "discountAmount": 2000,
    "total": 50000,
    "paymentMethod": "cash"
  },
  "printerIndex": 1
}
```

**Respuesta exitosa:**
```json
{
  "success": true,
  "message": "Ticket de cliente impreso correctamente"
}
```

---

### POST /api/print/both
Imprime ambos tickets (comanda + cliente).

**Body:**
```json
{
  "data": {
    "orderNumber": "##0023",
    "date": "2026-02-20T14:30:00Z",
    "orderType": "delivery",
    "items": [...],
    "subtotal": 52000,
    "discountAmount": 2000,
    "total": 50000,
    "paymentMethod": "cash",
    "note": "Sin cebolla",
    "customer": {
      "name": "Juan Pérez",
      "phone": "0981-123456",
      "address": "Av. España 123"
    }
  },
  "kitchenPrinter": 0,
  "clientPrinter": 1,
  "copies": 1
}
```

**Respuesta exitosa:**
```json
{
  "success": true,
  "message": "Impresión completa realizada",
  "kitchenResult": {...},
  "clientResult": {...}
}
```

---

### POST /api/print/test
Imprime ticket de prueba.

**Body:**
```json
{
  "printerIndex": 0
}
```

**Respuesta exitosa:**
```json
{
  "success": true,
  "message": "Ticket de prueba impreso correctamente"
}
```

---

## 🔧 Configuración

### Detección Automática de Impresoras

El servidor detecta automáticamente las impresoras USB al iniciar y cuando se conectan/desconectan.

**Log de inicio:**
```
[Print Server] Servidor de impresión iniciado en puerto 3001

[Impresoras USB detectadas]
1. Epson TM-T20II (VID: 1234, PID: 5678)
2. Star TSP143 (VID: 1234, PID: 5679)
```

### Configurar Impresoras en la App

Para configurar qué impresora usar para cocina/cliente:
1. Abrir **http://localhost:3000**
2. Ir a **⚙️ Ajustes** → **Impresoras**
3. Click en **"Actualizar Lista"**
4. Seleccionar:
   - **Impresora de Cocina** (index 0, 1, 2...)
   - **Impresora de Cliente** (index 0, 1, 2...)
5. Configurar:
   - Tamaño: **80mm**
   - Copias: **1** o más
6. Click en **"Imprimir Prueba"**
7. Click en **"Guardar"**

---

## 🛠️ Solución de Problemas

### ❌ No se detectan impresoras

**Síntomas:**
```json
{
  "success": true,
  "printers": []
}
```

**Soluciones:**

1. **Verificar conexión USB:**
   - Desconectar y reconectar la impresora
   - Probar otro puerto USB

2. **Verificar drivers:**
   - Ir a **Configuración** → **Dispositivos** → **Impresoras y escáneres**
   - La impresora debe aparecer y estar "Lista"
   - Si no aparece, instalar drivers del fabricante

3. **Reiniciar Print Server:**
   ```bash
   pm2 restart print-server
   # o si es manual:
   # Ctrl+C y luego npm start
   ```

4. **Permisos (Windows):**
   - Ejecutar CMD/Terminal como Administrador
   - Reiniciar el Print Server

5. **Verificar VendorID y ProductID:**
   ```bash
   # Verificar en el log del servidor
   pm2 logs print-server
   ```

---

### ❌ Error de impresión

**Síntomas:**
```json
{
  "success": false,
  "message": "Error al imprimir..."
}
```

**Soluciones:**

1. **Verificar papel:**
   - Impresora tiene papel
   - Papel bien insertado
   - Sin atascos

2. **Estado de impresora:**
   - Encendida
   - Sin luces de error
   - Tapa cerrada

3. **Probar ticket de prueba:**
   ```bash
   curl -X POST http://localhost:3001/api/print/test \
     -H "Content-Type: application/json" \
     -d '{"printerIndex": 0}'
   ```

4. **Ver logs detallados:**
   ```bash
   pm2 logs print-server --lines 50
   ```

5. **Verificar compatibilidad:**
   - La impresora debe soportar ESC/POS
   - Verificar en manual del fabricante

---

### ❌ Puerto ocupado

**Síntomas:**
```
Error: listen EADDRINUSE: address already in use :::3001
```

**Solución:**

```bash
# Windows - Matar proceso en puerto 3001
netstat -ano | findstr :3001
taskkill /PID [PID_ENCONTRADO] /F

# Luego reiniciar
pm2 restart print-server
```

---

### ❌ Error de permisos USB

**Síntomas:**
```
Error: LIBUSB_ERROR_ACCESS
```

**Solución:**

1. Ejecutar terminal como **Administrador**
2. Reiniciar Print Server
3. Si persiste, reinstalar drivers de impresora

---

## 📝 Logs

El servidor muestra en consola:

```
✅ [2026-02-20 14:30:15] Impresoras detectadas
ℹ️  [2026-02-20 14:30:20] POST /api/printers
✅ [2026-02-20 14:30:25] Comanda impresa (Printer 0)
✅ [2026-02-20 14:30:26] Ticket impreso (Printer 1)
⚠️  [2026-02-20 14:30:30] Error: Impresora sin papel
```

**Ver logs con PM2:**
```bash
# Tiempo real
pm2 logs print-server

# Últimas 50 líneas
pm2 logs print-server --lines 50

# Guardar logs en archivo
pm2 logs print-server > print-server-logs.txt
```

---

## 🔐 Seguridad

### CORS

El servidor usa CORS para permitir solo peticiones del frontend local:

```javascript
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
```

### Recomendaciones

⚠️ **Importante:** Este servidor solo debe correr localmente (`localhost`). No exponerlo a internet.

✅ **Seguridad básica:**
- Firewall activo
- Solo acceso desde red local
- No compartir credenciales
- Monitorear logs regularmente

---

## 🚀 Producción

### PM2 en Producción

```bash
# Instalar
npm install -g pm2 pm2-windows-startup

# Configurar inicio con Windows
pm2-startup install

# Iniciar
pm2 start server.js --name "print-server"

# Ver estado
pm2 status

# Ver logs
pm2 logs print-server

# Reiniciar
pm2 restart print-server

# Detener
pm2 stop print-server

# Guardar configuración
pm2 save
```

### Monitoreo

```bash
# Ver recursos (CPU, RAM)
pm2 monit

# Ver lista de procesos
pm2 list

# Ver información detallada
pm2 info print-server
```

---

## 📚 Recursos

### Documentación Técnica

- **ESC/POS**: [Epson Commands](https://reference.epson-biz.com/modules/ref_escpos/index.php)
- **escpos Library**: [GitHub](https://github.com/song940/node-escpos)
- **USB Library**: [GitHub](https://github.com/node-usb/node-usb)

### Impresoras Compatibles

✅ **Epson:**
- TM-T20 / TM-T20II
- TM-T88IV / TM-T88V
- TM-U220

✅ **Star Micronics:**
- TSP143
- TSP650 / TSP654

✅ **Bixolon:**
- SRP-330
- SRP-350

✅ **Otras:**
- Cualquier impresora térmica USB con soporte ESC/POS

---

## 📞 Soporte

Para problemas específicos del Print Server:

- 📧 Email: soporte@delagranburguer.com
- 📱 WhatsApp: +595 XXX XXXXXX
- 💬 Incluir siempre:
  - Modelo de impresora
  - Sistema operativo
  - Logs del servidor
  - Capturas de pantalla del error

---

## 📄 Licencia

© 2026 De la Gran Burger. Todos los derechos reservados.

---

**Desarrollado con ❤️ para De la Gran Burger** 🍔🖨️
