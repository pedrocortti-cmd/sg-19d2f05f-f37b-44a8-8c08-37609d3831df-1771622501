# 🍔 Guía de Instalación - De la Gran Burger POS

## 📋 Requisitos Previos

### Hardware Mínimo
- **PC/Laptop:** Windows 10/11
- **RAM:** 4GB mínimo (8GB recomendado)
- **Procesador:** Intel i3 o superior
- **Disco:** 10GB espacio libre
- **Red:** Conexión a Internet estable
- **Impresoras:** 2 impresoras térmicas USB 80mm (cocina + caja)

### Software Necesario
- ✅ **Node.js 18 o superior** - [Descargar aquí](https://nodejs.org/)
- ✅ **Git** (opcional, para actualizaciones) - [Descargar aquí](https://git-scm.com/)
- ✅ **Navegador:** Chrome, Edge o Firefox actualizado

---

## 🚀 OPCIÓN 1: INSTALACIÓN EN RED LOCAL (RECOMENDADO)

Esta opción te permite acceder al POS desde múltiples equipos en tu red local (caja, cocina, administración).

### Paso 1: Descargar el Proyecto

```bash
# Si tienes Git instalado:
git clone [URL_DEL_PROYECTO]
cd delagranburguer-pos

# Si NO tienes Git, descarga el ZIP y descomprímelo
```

### Paso 2: Instalar Dependencias

```bash
# Abrir PowerShell o CMD en la carpeta del proyecto
npm install
```

### Paso 3: Configurar Variables de Entorno

El archivo `.env.local` ya está configurado con Supabase. **NO es necesario modificarlo**.

### Paso 4: Iniciar el Servidor en Red Local

```bash
# Iniciar el servidor accesible desde la red local
npm run dev -- -H 0.0.0.0
```

**O si prefieres especificar el puerto:**

```bash
npm run dev -- -H 0.0.0.0 -p 3000
```

### Paso 5: Obtener la IP del Equipo Principal

**En Windows:**

```bash
# Abrir CMD o PowerShell y ejecutar:
ipconfig
```

Busca la línea **"Dirección IPv4"** de tu adaptador de red activo. Por ejemplo:
```
Dirección IPv4. . . . . . . . . . . . . : 192.168.1.100
```

### Paso 6: Acceder desde Otros Equipos

**Desde cualquier equipo en la MISMA RED:**

```
http://192.168.1.100:3000
```

Reemplaza `192.168.1.100` con la IP que obtuviste en el Paso 5.

**EJEMPLO DE CONFIGURACIÓN:**

```
📍 PC Principal (servidor): 192.168.1.100
   └─ Ejecuta: npm run dev -- -H 0.0.0.0

🖥️ Caja 1: Abre Chrome → http://192.168.1.100:3000
🖥️ Caja 2: Abre Chrome → http://192.168.1.100:3000
👨‍🍳 Cocina: Abre Chrome → http://192.168.1.100:3000
📊 Admin: Abre Chrome → http://192.168.1.100:3000
```

---

## 🌐 OPCIÓN 2: DESPLEGAR EN VERCEL (PRODUCCIÓN EN LA NUBE)

Esta opción te permite acceder desde CUALQUIER LUGAR con Internet.

### Paso 1: Crear Cuenta en Vercel

1. Ve a [vercel.com](https://vercel.com)
2. Regístrate con tu cuenta de GitHub/Google
3. Es GRATIS para proyectos pequeños

### Paso 2: Conectar el Proyecto

**Opción A: Desde la interfaz web de Vercel**

1. Click en "Add New Project"
2. Importar desde Git (GitHub)
3. Seleccionar el repositorio
4. Configurar variables de entorno (copiar de `.env.local`)
5. Deploy

**Opción B: Desde la terminal (más rápido)**

```bash
# Instalar Vercel CLI
npm install -g vercel

# Login en Vercel
vercel login

# Desplegar
vercel --prod
```

### Paso 3: Configurar Variables de Entorno en Vercel

Ve a tu proyecto en Vercel → Settings → Environment Variables y agrega:

```
NEXT_PUBLIC_SUPABASE_URL=[tu_url_de_supabase]
NEXT_PUBLIC_SUPABASE_ANON_KEY=[tu_clave_de_supabase]
```

*(Ya están configuradas automáticamente si desplegaste con Softgen)*

### Paso 4: Acceder al Sistema

Vercel te dará una URL como:

```
https://delagranburguer-pos.vercel.app
```

Ahora puedes acceder desde CUALQUIER dispositivo con Internet.

---

## 🖨️ CONFIGURACIÓN DE IMPRESORAS (PRINT SERVER)

### Requisitos de Impresoras
- ✅ 2 impresoras térmicas USB 80mm
- ✅ Driver instalado (proporcionado por el fabricante)
- ✅ Conectadas al PC principal

### Paso 1: Verificar Impresoras Instaladas

**Windows:**

1. Ve a `Configuración → Dispositivos → Impresoras y escáneres`
2. Verifica que las 2 impresoras aparezcan como instaladas
3. Anota los nombres exactos (ej: "Thermal Printer 1", "POS-80")

### Paso 2: Instalar Print Server

```bash
# Entrar a la carpeta del print server
cd print-server

# Instalar dependencias
npm install
```

### Paso 3: Configurar Print Server

Edita el archivo `print-server/server.js` y busca las líneas:

```javascript
// Configuración de impresoras (línea ~20)
const PRINTERS = {
  kitchen: "Nombre_Impresora_Cocina",  // Reemplaza con el nombre real
  client: "Nombre_Impresora_Cliente"   // Reemplaza con el nombre real
};
```

**EJEMPLO:**

```javascript
const PRINTERS = {
  kitchen: "POS-80 (Kitchen)",
  client: "POS-80 (Cashier)"
};
```

### Paso 4: Iniciar Print Server

```bash
# Opción 1: Modo desarrollo (con logs)
npm start

# Opción 2: Modo producción (con PM2 - reinicio automático)
npm install -g pm2
pm2 start server.js --name "print-server"
pm2 save
pm2 startup
```

### Paso 5: Verificar que Funciona

Abre el navegador en:

```
http://localhost:3001/printers
```

Deberías ver la lista de impresoras disponibles.

### Paso 6: Configurar en el POS

1. Ve al POS → ⚙️ **Ajustes**
2. Sección **"Configuración de Impresoras"**
3. Selecciona:
   - **Impresora Cocina:** [Nombre de tu impresora de cocina]
   - **Impresora Cliente:** [Nombre de tu impresora de caja]
4. **Guardar configuración**
5. Click en **"Probar Impresión"** para verificar

---

## 🔐 USUARIOS INICIALES

El sistema ya tiene un usuario administrador creado:

```
Email: admin@delagranburguer.com
Contraseña: admin123
```

**🚨 IMPORTANTE:** Cambia esta contraseña después del primer login.

### Crear Usuarios Adicionales

1. Login como admin
2. Ve a ⚙️ **Ajustes** → **Usuarios**
3. Click en **"Nuevo Usuario"**
4. Completa los datos:
   - Email
   - Contraseña
   - Rol (Admin / Caja / Cocina)
5. **Guardar**

### Roles y Permisos

| Rol | Permisos |
|-----|----------|
| **Admin** | Acceso total al sistema |
| **Caja** | POS + Ventas + Productos |
| **Cocina** | Solo ver pedidos activos |

---

## 🔄 INICIAR AUTOMÁTICAMENTE CON WINDOWS

### Opción 1: PM2 (Recomendado)

```bash
# Instalar PM2 globalmente
npm install -g pm2

# Iniciar el POS con PM2
pm2 start npm --name "pos-frontend" -- run dev -- -H 0.0.0.0

# Iniciar Print Server con PM2
cd print-server
pm2 start server.js --name "print-server"

# Guardar la configuración
pm2 save

# Configurar inicio automático con Windows
pm2 startup
```

### Opción 2: Servicio de Windows (Avanzado)

Usa herramientas como **NSSM** (Non-Sucking Service Manager):

```bash
# Descargar NSSM: https://nssm.cc/download

# Instalar como servicio
nssm install "De la Gran Burger POS" "C:\Program Files\nodejs\node.exe"
nssm set "De la Gran Burger POS" AppParameters "C:\path\to\project\node_modules\.bin\next dev -- -H 0.0.0.0"
nssm set "De la Gran Burger POS" AppDirectory "C:\path\to\project"
nssm start "De la Gran Burger POS"
```

---

## 🌐 CONFIGURACIÓN DE RED

### Firewall de Windows

Si no puedes acceder desde otros equipos, permite el puerto en el firewall:

```bash
# Abrir PowerShell como Administrador
netsh advfirewall firewall add rule name="Next.js Dev Server" dir=in action=allow protocol=TCP localport=3000

# Para el Print Server
netsh advfirewall firewall add rule name="Print Server" dir=in action=allow protocol=TCP localport=3001
```

### IP Estática (Recomendado)

Para evitar que la IP cambie:

**Windows:**

1. `Panel de Control → Redes e Internet → Centro de redes`
2. Click en tu conexión activa
3. `Propiedades → Protocolo de Internet versión 4 (TCP/IPv4)`
4. Selecciona **"Usar la siguiente dirección IP"**
5. Configura:
   ```
   Dirección IP: 192.168.1.100
   Máscara: 255.255.255.0
   Puerta: 192.168.1.1
   DNS: 8.8.8.8
   ```

---

## 📱 ACCESO MÓVIL/TABLET

El sistema es **100% responsive**. Puedes acceder desde:

- ✅ Tablets Android/iOS
- ✅ Smartphones
- ✅ iPad

Simplemente abre el navegador y ve a:

```
http://192.168.1.100:3000
```

---

## 🔧 TROUBLESHOOTING (Solución de Problemas)

### Problema 1: No puedo acceder desde otro equipo

**Solución:**

1. ✅ Verifica que ambos equipos estén en la misma red
2. ✅ Verifica la IP del servidor: `ipconfig`
3. ✅ Desactiva temporalmente el firewall para probar
4. ✅ Asegúrate de haber iniciado con `-H 0.0.0.0`

### Problema 2: Las impresoras no funcionan

**Solución:**

1. ✅ Verifica que el Print Server esté corriendo: `http://localhost:3001/status`
2. ✅ Verifica que las impresoras estén instaladas en Windows
3. ✅ Revisa los nombres de las impresoras en `server.js`
4. ✅ Reinicia el Print Server: `pm2 restart print-server`

### Problema 3: Error de conexión a Supabase

**Solución:**

1. ✅ Verifica que haya Internet en el equipo
2. ✅ Revisa las variables de entorno en `.env.local`
3. ✅ Reinicia el servidor: `npm run dev`

### Problema 4: El sistema se cierra al cerrar la terminal

**Solución:**

Usa PM2 en lugar de `npm run dev`:

```bash
pm2 start npm --name "pos" -- run dev -- -H 0.0.0.0
```

---

## 📊 MONITOREO DEL SISTEMA

### Ver Logs de PM2

```bash
# Ver todos los procesos
pm2 list

# Ver logs del POS
pm2 logs pos

# Ver logs del Print Server
pm2 logs print-server

# Ver monitoreo en tiempo real
pm2 monit
```

---

## 🔄 ACTUALIZAR EL SISTEMA

```bash
# Si usas Git:
git pull origin main
npm install
pm2 restart all

# Si descargaste ZIP:
# 1. Descarga la nueva versión
# 2. Reemplaza los archivos (NO borres .env.local)
# 3. npm install
# 4. pm2 restart all
```

---

## 📞 SOPORTE

Para problemas técnicos o dudas:

- 📧 Email: soporte@delagranburguer.com
- 📱 WhatsApp: +595 XXX XXX XXX
- 💬 Chat: Dentro del sistema (⚙️ Ajustes → Soporte)

---

## ✅ CHECKLIST DE INSTALACIÓN COMPLETA

```
SERVIDOR PRINCIPAL:
□ Node.js instalado
□ Proyecto descargado y descomprimido
□ npm install ejecutado
□ .env.local verificado
□ npm run dev -- -H 0.0.0.0 funcionando
□ IP del servidor anotada (192.168.1.X)
□ Firewall configurado (puerto 3000)
□ PM2 instalado y configurado (opcional)

PRINT SERVER:
□ Impresoras instaladas en Windows
□ Drivers de impresoras instalados
□ cd print-server && npm install
□ Nombres de impresoras configurados en server.js
□ Print Server iniciado (puerto 3001)
□ Prueba de impresión exitosa

EQUIPOS CLIENTES:
□ Misma red que el servidor
□ Chrome/Edge actualizado
□ URL del POS guardada en marcadores
□ Usuario y contraseña de cada operador

CONFIGURACIÓN FINAL:
□ Login como admin
□ Cambiar contraseña de admin
□ Crear usuarios adicionales (caja, cocina)
□ Configurar impresoras en Ajustes
□ Probar venta completa con impresión
□ Probar desde otro equipo
□ Agregar marcador en todos los equipos
```

---

## 🎉 ¡LISTO PARA OPERAR!

Una vez completados todos los pasos, tu sistema estará **100% operativo** y podrás:

- ✅ Tomar pedidos desde múltiples cajas
- ✅ Ver pedidos en tiempo real en cocina
- ✅ Imprimir comandas y tickets automáticamente
- ✅ Gestionar inventario y productos
- ✅ Ver reportes de ventas
- ✅ Administrar repartidores (delivery)
- ✅ Control total del negocio

---

**🍔 ¡Buen provecho y buenas ventas!** 🚀