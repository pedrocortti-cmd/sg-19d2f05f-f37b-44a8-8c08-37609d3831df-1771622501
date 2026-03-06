# Print Server - De la Gran Burger POS

Servidor de impresión local para impresoras térmicas USB 80mm con comandos ESC/POS.

## 📋 Características

- ✅ Detección automática de impresoras USB
- ✅ Impresión directa sin diálogo del navegador
- ✅ Soporte para comandos ESC/POS
- ✅ API REST simple (HTTP)
- ✅ Configuración fácil desde la aplicación web
- ✅ Logs detallados para debugging
- ✅ Compatible con Windows, macOS y Linux

---

## 🚀 Instalación

### **Paso 1: Instalar Node.js**
```bash
# Windows: Descargar de https://nodejs.org
# macOS: brew install node
# Linux: sudo apt install nodejs npm
```

### **Paso 2: Instalar Dependencias**
```bash
cd print-server
npm install
```

### **Paso 3: Conectar Impresora**
- Conecta la impresora térmica USB a tu PC
- En Windows: Instala los drivers del fabricante si es necesario
- Verifica en "Dispositivos e impresoras" que aparece

---

## ▶️ Iniciar el Servidor

### **Modo Desarrollo (con logs):**
```bash
node server.js
```

Verás algo como:
```
🖨️  Print Server iniciado en puerto 9100
📋 Impresoras USB detectadas:
  1. USB Thermal Printer (VID: 1234, PID: 5678)
```

### **Modo Producción (con PM2):**
```bash
# Instalar PM2 globalmente
npm install -g pm2

# Iniciar servidor
pm2 start server.js --name "print-server"

# Ver logs
pm2 logs print-server

# Ver estado
pm2 status

# Reiniciar
pm2 restart print-server

# Detener
pm2 stop print-server
```

---

## 🔧 Configuración en la Aplicación Web

### **Paso 1: Abrir Ajustes**
1. Abre la aplicación web (http://localhost:3000)
2. Click en **"Ajustes"** en el menú lateral
3. Scroll hasta **"Configuración de Impresoras"**

### **Paso 2: Seleccionar Impresoras**
1. **Print Server URL:** `http://localhost:9100` (default)
2. **Impresora de Cocina:** Selecciona del dropdown
3. **Impresora de Cliente:** Selecciona del dropdown
4. **Tamaño de Papel:** 80mm (default)
5. **Copias:** 1 (o más si necesitas)

### **Paso 3: Probar Impresión**
1. Click en **"Probar Impresión"**
2. Deberían imprimirse 2 tickets de prueba:
   - Comanda de cocina (sin precios)
   - Ticket cliente (con precios)

---

## 🖨️ Uso del Sistema de Impresión

### **Impresión Automática al Confirmar Pedido:**

Cuando confirmas un pedido en el POS:
1. Se imprime automáticamente la **comanda de cocina**
2. Se imprime automáticamente el **ticket cliente** (si está marcado)

### **Impresión Manual:**

1. En "Ventas", busca un pedido
2. Click en **"Vista Previa"**
3. Click en **"Imprimir"** en el modal

---

## 📡 API del Print Server

El servidor expone endpoints HTTP simples:

### **GET /printers**
Lista todas las impresoras USB detectadas.

**Respuesta:**
```json
{
  "success": true,
  "printers": [
    {
      "deviceName": "USB Thermal Printer",
      "vendorId": 1234,
      "productId": 5678
    }
  ]
}
```

### **POST /print**
Envía un trabajo de impresión.

**Cuerpo (JSON):**
```json
{
  "printerId": "1234:5678",
  "content": "Texto a imprimir...",
  "type": "kitchen" | "client"
}
```

**Respuesta:**
```json
{
  "success": true,
  "message": "Impresión enviada correctamente"
}
```

---

## 🐛 Solución de Problemas

### **Error: "No se detectan impresoras"**

**Causa:** La impresora no está conectada o no tiene drivers instalados.

**Solución:**
1. Verifica la conexión USB
2. En Windows: Panel de Control → Dispositivos e Impresoras
3. Instala drivers del fabricante
4. Reinicia el print-server: `pm2 restart print-server`

---

### **Error: "LIBUSB_ERROR_ACCESS"**

**Causa:** Falta de permisos en Linux/macOS.

**Solución Linux:**
```bash
# Agregar tu usuario al grupo dialout
sudo usermod -a -G dialout $USER

# Logout y login para aplicar cambios

# O ejecutar el servidor con sudo (no recomendado)
sudo node server.js
```

**Solución macOS:**
```bash
# Instalar libusb con Homebrew
brew install libusb

# Reiniciar el servidor
```

---

### **Error: "LIBUSB_ERROR_NOT_SUPPORTED"**

**Causa:** La impresora no soporta comandos ESC/POS directos por USB.

**Solución:**
1. Verifica el modelo de tu impresora
2. Consulta el manual para confirmar soporte ESC/POS
3. Intenta usar el driver genérico de Windows
4. Como alternativa, usa impresión por red (LAN/WiFi)

---

### **La impresión no sale correctamente**

**Causa:** Comandos ESC/POS incorrectos o configuración de papel.

**Solución:**
1. Verifica el tamaño de papel en Ajustes (debe ser 80mm)
2. Revisa los logs del print-server: `pm2 logs print-server`
3. Prueba con la impresión de prueba
4. Consulta el manual de tu impresora para comandos específicos

---

### **El servidor se detiene solo**

**Causa:** Error no manejado o falta de PM2.

**Solución:**
```bash
# Usar PM2 para mantener el servidor corriendo
pm2 start server.js --name "print-server"

# Ver logs de errores
pm2 logs print-server --err

# Configurar reinicio automático
pm2 startup
pm2 save
```

---

## 📊 Comandos ESC/POS Soportados

El servidor usa comandos ESC/POS estándar:

- **Texto:** Normal, negritas, subrayado
- **Tamaños:** Normal, doble alto, doble ancho
- **Alineación:** Izquierda, centro, derecha
- **Corte:** Corte parcial, corte total
- **Códigos de barras:** EAN13, CODE39, CODE128
- **QR Codes:** Versión 1-40

---

## 🔒 Seguridad

### **Recomendaciones:**
1. El print-server solo debe correr en la red local
2. NO expongas el puerto 9100 a internet
3. Usa un firewall para bloquear acceso externo
4. En producción, agrega autenticación básica (usuario/contraseña)

### **Agregar Autenticación (Opcional):**
```javascript
// En server.js, agrega antes de los endpoints:
const basicAuth = (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth || auth !== 'Basic ' + Buffer.from('usuario:contraseña').toString('base64')) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  next();
};

app.use(basicAuth);
```

---

## 📝 Logs y Debugging

### **Ver logs en tiempo real:**
```bash
# Con PM2
pm2 logs print-server --lines 100

# Sin PM2 (se muestran automáticamente)
node server.js
```

### **Nivel de detalle:**
Los logs incluyen:
- ✅ Impresoras detectadas al iniciar
- ✅ Solicitudes de impresión recibidas
- ✅ Errores de impresión
- ✅ Comandos ESC/POS enviados (en modo debug)

---

## 🔄 Actualizar el Print Server

```bash
# Detener servidor
pm2 stop print-server

# Actualizar dependencias
cd print-server
npm install

# Reiniciar servidor
pm2 restart print-server
```

---

## 🎨 Personalizar Tickets

Los formatos de impresión se configuran desde:
**Ajustes → Configuración de Formato de Impresión**

Puedes personalizar:
- Tamaño de fuente (título, productos, totales)
- Mostrar/ocultar precios en comanda
- Cantidad de copias
- Mensaje de agradecimiento
- Información del negocio (nombre, dirección, RUC)

---

## 📦 Dependencias

```json
{
  "express": "^4.18.2",
  "cors": "^2.8.5",
  "escpos": "^3.0.0-alpha.6",
  "escpos-usb": "^3.0.0-alpha.4",
  "usb": "^2.11.0"
}
```

---

## 🌐 Arquitectura

```
┌─────────────────────┐
│  Aplicación Web     │
│  (Next.js)          │
│  localhost:3000     │
└──────────┬──────────┘
           │ HTTP POST /print
           ▼
┌─────────────────────┐
│  Print Server       │
│  (Express)          │
│  localhost:9100     │
└──────────┬──────────┘
           │ USB
           ▼
┌─────────────────────┐
│  Impresora Térmica  │
│  80mm USB           │
│  ESC/POS            │
└─────────────────────┘
```

---

## 📞 Soporte

Si tienes problemas con el print-server:

1. Revisa esta documentación completa
2. Verifica los logs: `pm2 logs print-server`
3. Consulta el manual de tu impresora
4. Contacta a soporte: soporte@delagranburguer.com

---

## 📄 Licencia

© 2026 De la Gran Burger. Todos los derechos reservados.

---

**¡Listo para imprimir!** 🖨️✨
