# Print Server - De la Gran Burger POS

Servidor de impresión local para impresoras térmicas USB (80mm) usando ESC/POS.

## 🎯 Función

Este servidor detecta automáticamente las impresoras térmicas USB conectadas y permite imprimir:
- **Comandas de cocina** (sin precios)
- **Tickets de cliente** (con precios)

## 📋 Requisitos

- Node.js v18+
- Impresoras térmicas USB compatibles con ESC/POS
- Windows 10/11

## 🚀 Instalación

```bash
npm install
```

## ▶️ Uso

```bash
npm start
```

El servidor se iniciará en `http://localhost:3001` y detectará automáticamente las impresoras USB.

## 📡 Endpoints API

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
    "orderNumber": "123456",
    "date": "2026-02-18T12:00:00Z",
    "orderType": "delivery",
    "items": [{"product": {"name": "Carnívora"}, "quantity": 2}],
    "note": "Sin cebolla",
    "customer": {"name": "Juan", "phone": "0981123456"}
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
    "orderNumber": "123456",
    "date": "2026-02-18T12:00:00Z",
    "items": [{"product": {"name": "Carnívora", "price": 22000}, "quantity": 2}],
    "subtotal": 44000,
    "discountAmount": 0,
    "total": 44000,
    "paymentMethod": "cash"
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
  "clientPrinter": 1,
  "copies": 2
}
```

### POST /api/print/test
Imprime ticket de prueba.

**Body:**
```json
{
  "printerIndex": 0
}
```

## 🔧 Configuración

El servidor detecta automáticamente las impresoras al iniciar. No requiere configuración adicional.

Para configurar qué impresora usar para cocina/cliente, hazlo desde la aplicación web en **Ajustes**.

## 🛠️ Solución de Problemas

### No se detectan impresoras

1. **Verifica la conexión USB**: Desconecta y vuelve a conectar
2. **Reinicia el servidor**: `Ctrl+C` y `npm start`
3. **Drivers**: Asegúrate de que Windows reconozca las impresoras
4. **Permisos**: Ejecuta la terminal como Administrador si es necesario

### Error de impresión

1. **Papel**: Verifica que la impresora tenga papel
2. **Estado**: Revisa que no haya atascos
3. **Logs**: Mira la consola del servidor para mensajes de error
4. **Prueba**: Usa el endpoint `/api/print/test` primero

### Puerto ocupado

Si el puerto 3001 está ocupado:

```bash
# Windows - Matar proceso en puerto 3001
netstat -ano | findstr :3001
taskkill /PID [PID] /F
```

## 📝 Logs

El servidor muestra en consola:
- ✅ Impresoras detectadas al iniciar
- 📋 Requests recibidos
- ⚠️ Errores de impresión
- 🔄 Estado de cada operación

## 🔐 Seguridad

⚠️ **Importante**: Este servidor solo debe correr localmente (`localhost`). No exponerlo a internet.

El servidor usa CORS para permitir solo peticiones del frontend local.

## 🚀 Producción

Para usar en producción (local), configura PM2:

```bash
npm install -g pm2
pm2 start npm --name "print-server" -- start
pm2 save
pm2 startup
```

## 📚 Recursos

- [escpos Documentation](https://github.com/song940/node-escpos)
- [ESC/POS Commands](https://reference.epson-biz.com/modules/ref_escpos/index.php)

## 📞 Soporte

Para problemas específicos del Print Server, contactar al equipo técnico.