# Guía de Instalación - De la Gran Burger POS

Sistema de Punto de Venta con impresión térmica para hamburguesería.

---

## 📋 Requisitos del Sistema

### Software Necesario
- ✅ **Windows 10/11** (recomendado para impresoras USB)
- ✅ **Node.js 18+** - [Descargar aquí](https://nodejs.org/)
- ✅ **Git** (opcional) - [Descargar aquí](https://git-scm.com/)

### Hardware
- ✅ **PC/Laptop** con Windows
- ✅ **Impresora térmica USB 80mm** (recomendado: Epson TM-T20, Star TSP143, Bixolon SRP-330)
- ✅ **Conexión a Internet** (solo para instalación inicial)

### ⚠️ IMPORTANTE
Este sistema NO requiere PostgreSQL ni MySQL instalado localmente. Toda la funcionalidad de base de datos está integrada con **Supabase** (base de datos en la nube), que ya está configurada en el proyecto.

---

## 🚀 Instalación Rápida (5 Pasos)

### Paso 1: Instalar Node.js

1. Descargar el instalador LTS de Node.js desde [nodejs.org](https://nodejs.org/)
2. Ejecutar el instalador con opciones por defecto
3. Verificar instalación abriendo **CMD** (Símbolo del sistema) y ejecutando:
   ```bash
   node --version
   npm --version
   ```
   Deberías ver las versiones instaladas (ej: v18.17.0 y 9.6.7)

---

### Paso 2: Descargar el Proyecto

**Opción A: Con Git (Recomendado)**
```bash
# Abrir CMD en la carpeta donde quieras instalar (ej: C:\)
cd C:\
git clone [URL_DEL_REPOSITORIO] delagranburguer-pos
cd delagranburguer-pos
```

**Opción B: Sin Git (Descargar ZIP)**
1. Descargar el archivo ZIP del proyecto
2. Extraer en `C:\delagranburguer-pos`
3. Abrir CMD en esa carpeta:
   ```bash
   cd C:\delagranburguer-pos
   ```

---

### Paso 3: Instalar Dependencias

```bash
# En la carpeta del proyecto (C:\delagranburguer-pos)
npm install
```
⏳ *Este proceso puede tomar 2-5 minutos*

---

### Paso 4: Configurar Variables de Entorno (Opcional)

El archivo `.env.local` ya está configurado con Supabase. Si necesitas cambiar algo:

1. Abrir `.env.local` con un editor de texto (Notepad++, VSCode, etc.)
2. Verificar que contiene:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://[tu-proyecto].supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=[tu-clave-anon]
   ```

⚠️ **IMPORTANTE:** No modifiques estos valores a menos que sepas lo que estás haciendo. La base de datos Supabase ya está configurada y lista para usar.

---

### Paso 5: Iniciar la Aplicación Web

```bash
npm run dev
```

✅ **¡Listo!** La aplicación estará disponible en: **http://localhost:3000**

**Credenciales iniciales:**
- Usuario: `admin`
- Contraseña: `admin123`

⚠️ **IMPORTANTE:** Cambia la contraseña del admin desde el panel de Ajustes después del primer login.

---

## 🖨️ Configuración de Impresoras (Paso Adicional)

El sistema incluye un **Print Server** para imprimir en impresoras térmicas USB.

### Paso 1: Conectar Impresoras Térmicas

1. Conectar las impresoras térmicas USB al PC
2. Instalar los drivers del fabricante (si es necesario)
3. Verificar que Windows detecte las impresoras:
   - Ir a **Configuración** → **Dispositivos** → **Impresoras y escáneres**
   - Deben aparecer tus impresoras (ej: "Epson TM-T20II")

### Paso 2: Instalar Print Server

```bash
# Abrir una NUEVA ventana de CMD
cd C:\delagranburguer-pos\print-server
npm install
```

### Paso 3: Iniciar Print Server

**Opción A: Con PM2 (Recomendado para Producción)**

```bash
# Instalar PM2 globalmente
npm install -g pm2
npm install -g pm2-windows-startup

# Configurar PM2 para iniciar con Windows
pm2-startup install

# Iniciar el Print Server
pm2 start server.js --name "print-server"

# Guardar configuración para que inicie automáticamente con Windows
pm2 save
```

**Opción B: Manual (Para Pruebas)**

```bash
cd C:\delagranburguer-pos\print-server
npm start
```
⚠️ Con esta opción deberás abrir esta ventana cada vez que enciendas el PC.

### Paso 4: Verificar Print Server

El Print Server estará disponible en: **http://localhost:3001**

Para verificar que está corriendo:
```bash
pm2 status
```

Deberías ver:
```
┌─────┬─────────────────┬─────────┬────────┐
│ id  │ name            │ status  │ cpu    │
├─────┼─────────────────┼─────────┼────────┤
│ 0   │ print-server    │ online  │ 0%     │
└─────┴─────────────────┴─────────┴────────┘
```

---

## ⚙️ Configuración Inicial del Sistema

### 1. Configurar Impresoras en la Aplicación

1. Abrir navegador en **http://localhost:3000**
2. Iniciar sesión con `admin` / `admin123`
3. Ir a **⚙️ Ajustes** → **Impresoras**
4. Click en **"Actualizar Lista"** para detectar impresoras USB
5. Seleccionar:
   - **Impresora de Cocina** (para comandas)
   - **Impresora de Cliente** (para tickets de venta)
6. Configurar:
   - Tamaño de papel: **80mm**
   - Copias de comanda: **1** (o 2 si necesitas duplicados)
7. Click en **"Imprimir Prueba"** en cada impresora para verificar
8. Click en **"Guardar Configuración"**

### 2. Configurar Logo del Negocio (Opcional)

1. Ir a **⚙️ Ajustes** → **Logo del Negocio**
2. Click en **"Seleccionar archivo"** o arrastrar tu logo PNG
3. Vista previa del logo
4. Click en **"Guardar Logo"**

**Especificaciones del logo:**
- Formato: PNG (recomendado para transparencia)
- Tamaño máximo: 2MB
- Dimensiones recomendadas: 500px × 500px (cuadrado)

### 3. Crear Categorías de Productos

1. Ir a **📦 Productos y Servicios**
2. Agregar categorías (ejemplos):
   - Hamburguesas
   - Acompañamientos
   - Bebidas
   - Postres
   - Adicionales

### 4. Agregar Productos

1. Ir a **📦 Productos y Servicios**
2. Click en **"Nuevo Producto"**
3. Completar información:
   - **Nombre** (ej: "Chilli Triple")
   - **Precio** (ej: 27000)
   - **Categoría** (ej: "Hamburguesas")
   - **Stock inicial** (opcional)
   - **Estado**: Activo
4. Click en **"Guardar"**
5. Repetir para todos tus productos

### 5. Configurar Inventario (Opcional)

1. Ir a **📦 Inventario**
2. Ver lista de productos con stock actual
3. Ajustar stock manualmente si es necesario
4. Configurar alertas de stock mínimo

---

## 💼 Uso del Sistema

### Realizar una Venta

1. Ir a **🛒 Punto de Venta**
2. **Información del Cliente** (opcional):
   - Cliente (nombre)
   - Teléfono
   - Dirección (para delivery)
   - RUC y Razón Social (para facturas)
3. **Agregar productos** haciendo click en las tarjetas de productos
4. **Ajustar cantidades** con botones **-** / **+**
5. **Agregar descuento** si aplica (porcentaje o monto fijo)
6. **Agregar nota** del pedido (ej: "Sin cebolla", "Extra queso")
7. **Seleccionar tipo de pedido**:
   - 🛵 **Delivery**
   - 📦 **Para Retirar**
8. **Click en botón verde "Total Gs. XXX"** para procesar pago

### Procesar Pago

1. Se abre el **modal de pago**
2. **Seleccionar método(s) de pago**:
   - 💵 Efectivo
   - 💳 Tarjeta
   - 📱 QR
   - 🏦 Transferencia
3. **Ingresar monto(s)** recibidos
4. **Ver cambio** (si aplica)
5. **Agregar nota de pago** (opcional)
6. **Click en "Confirmar Pago"**

### Impresión Automática

Al confirmar el pago, se imprimirán **automáticamente**:
- ✅ **Comanda para cocina** (sin precios, formato simple)
- ✅ **Ticket para cliente** (con precios, formato completo)

**Formato de número de pedido:**
```
Hoy (20/02/2026): ##0001, ##0002, ##0003, ... ##0060
Mañana (21/02/2026): ##0001, ##0002, ... (se reinicia automáticamente)
```

### Ver Historial de Ventas

1. Ir a **📋 Ventas**
2. Ver lista de pedidos del día
3. **Filtros disponibles:**
   - Por estado (Pendiente, Pagado)
   - Por tipo (Delivery, Para Retirar)
   - Por fecha
4. **Click en pedido** para ver detalles completos
5. **Opciones:**
   - 🖨️ Reimprimir comanda
   - 🖨️ Reimprimir ticket
   - ❌ Anular (solo admin)

---

## 🔧 Solución de Problemas

### ❌ Problema: "No se pudo conectar con el servidor de impresión"

**Solución:**
1. Verificar que el Print Server esté corriendo:
   ```bash
   pm2 status
   ```
2. Si está "stopped", reiniciar:
   ```bash
   pm2 restart print-server
   ```
3. Verificar que esté escuchando en puerto 3001:
   ```bash
   netstat -an | findstr :3001
   ```
   Debería mostrar: `TCP    0.0.0.0:3001    0.0.0.0:0    LISTENING`

### ❌ Problema: "No se encontraron impresoras conectadas"

**Solución:**
1. Verificar que la impresora esté **conectada y encendida**
2. Verificar en Windows: **Configuración** → **Impresoras y escáneres**
3. Reinstalar drivers del fabricante
4. Reiniciar el Print Server:
   ```bash
   pm2 restart print-server
   ```
5. Actualizar lista de impresoras en **Ajustes** → **Impresoras** → **"Actualizar Lista"**

### ❌ Problema: La impresión sale cortada o con caracteres raros

**Solución:**
1. Verificar que el tamaño de papel esté configurado en **80mm**
2. Verificar que la impresora soporte comandos **ESC/POS**
3. Actualizar firmware de la impresora (ver manual del fabricante)
4. Probar con otra impresora térmica compatible

### ❌ Problema: La aplicación web no carga

**Solución:**
1. Verificar que el servidor esté corriendo:
   ```bash
   # En la carpeta del proyecto
   npm run dev
   ```
2. Verificar que no haya otro proceso usando el puerto 3000:
   ```bash
   netstat -ano | findstr :3000
   ```
3. Si hay conflicto de puertos, matar el proceso:
   ```bash
   taskkill /PID [PID] /F
   ```

### ❌ Problema: "Error de conexión a Supabase"

**Solución:**
1. Verificar conexión a internet
2. Verificar que las credenciales en `.env.local` sean correctas
3. Contactar soporte para verificar estado del servidor Supabase

### ❌ Problema: Los números de pedido no se reinician cada día

**Solución:**
1. Abrir DevTools (F12) → Console
2. Ejecutar:
   ```javascript
   localStorage.removeItem('dailySaleCounter');
   ```
3. Refrescar la página
4. El próximo pedido será ##0001

---

## 🚀 Configuración para Producción

### Opción 1: Servidor Local (Recomendado)

**Ideal para**: Un solo local con PC dedicado

1. Instalar el sistema en el PC del local (seguir pasos anteriores)
2. Configurar **PM2** para iniciar servicios automáticamente:
   ```bash
   # Instalar PM2
   npm install -g pm2
   npm install -g pm2-windows-startup
   
   # Configurar inicio automático
   pm2-startup install
   
   # Iniciar aplicación web
   cd C:\delagranburguer-pos
   pm2 start npm --name "pos-web" -- run dev
   
   # Iniciar Print Server
   cd print-server
   pm2 start server.js --name "print-server"
   
   # Guardar configuración
   pm2 save
   ```

3. Configurar **IP fija** en el router para el PC
4. Otros dispositivos (tablets, celulares) acceden vía IP local:
   ```
   http://192.168.X.X:3000
   ```
   (Donde X.X es la IP fija del PC)

### Opción 2: Servidor Cloud + Print Server Local

**Ideal para**: Múltiples locales o acceso remoto

1. **Desplegar aplicación web** en:
   - **Vercel** (recomendado) - [vercel.com](https://vercel.com)
   - **Netlify** - [netlify.com](https://netlify.com)
   - **Railway** - [railway.app](https://railway.app)

2. **Base de datos**: Ya está configurada con Supabase (nada que hacer)

3. **Print Server**: Mantener corriendo localmente en el PC del local
   ```bash
   pm2 start server.js --name "print-server"
   pm2 save
   pm2-startup install
   ```

4. **Configurar URL** del Print Server en la aplicación web (si es necesario)

---

## 📦 Backup y Mantenimiento

### Backup de Datos

⚠️ **Importante**: Los datos están almacenados en Supabase (base de datos en la nube).

**Para hacer backup manual:**
1. Ir al dashboard de Supabase: [supabase.com](https://supabase.com)
2. Seleccionar tu proyecto
3. Ir a **Database** → **Backups**
4. Click en **"Create backup"**
5. Descargar el archivo `.sql`

**Backup automático:**
- Supabase hace backups automáticos diarios
- Los backups se retienen por 7 días (plan gratuito)
- Puedes restaurar desde cualquier punto de backup

### Actualizar la Aplicación

```bash
cd C:\delagranburguer-pos

# Si usas Git
git pull

# Actualizar dependencias (si hay cambios)
npm install

# Reiniciar servicios
pm2 restart all
```

### Limpiar Caché del Navegador

Si experimentas problemas después de actualizar:
1. Presionar **CTRL + SHIFT + R** (hard refresh)
2. O borrar caché manualmente:
   - Chrome: Configuración → Privacidad y seguridad → Borrar datos de navegación
   - Edge: Configuración → Privacidad → Elegir qué borrar

---

## 📊 Monitoreo del Sistema

### Ver Estado de Servicios

```bash
pm2 status
```

### Ver Logs en Tiempo Real

```bash
# Ver logs de todos los servicios
pm2 logs

# Ver logs solo del Print Server
pm2 logs print-server

# Ver logs solo de la app web
pm2 logs pos-web
```

### Ver Uso de Recursos

```bash
pm2 monit
```

---

## 🛡️ Seguridad

### Cambiar Contraseña de Admin

1. Iniciar sesión como admin
2. Ir a **⚙️ Ajustes** → **Usuarios**
3. Click en el usuario admin
4. Cambiar contraseña
5. Guardar cambios

### Crear Usuarios Adicionales

1. Ir a **⚙️ Ajustes** → **Usuarios**
2. Click en **"Nuevo Usuario"**
3. Completar información:
   - Nombre
   - Usuario
   - Contraseña
   - Rol:
     - **Admin**: Acceso total
     - **Caja**: Solo POS y ventas
     - **Cocina**: Solo ver pedidos
4. Guardar

### Recomendaciones de Seguridad

✅ Cambiar contraseña de admin inmediatamente  
✅ Usar contraseñas fuertes (mínimo 8 caracteres)  
✅ No compartir credenciales entre usuarios  
✅ Revisar logs regularmente  
✅ Mantener el sistema actualizado  
✅ Hacer backups periódicos  
✅ No exponer el sistema a internet sin HTTPS  

---

## 📞 Soporte Técnico

### Canales de Soporte

- 📧 **Email**: soporte@delagranburguer.com
- 📱 **WhatsApp**: +595 XXX XXXXXX
- ☎️ **Teléfono**: +595 XXX XXXXXX
- 💬 **Chat en vivo**: [Próximamente]

### Horario de Atención

- **Lunes a Viernes**: 8:00 AM - 6:00 PM
- **Sábados**: 9:00 AM - 1:00 PM
- **Domingos y Feriados**: Cerrado

### Información a Proporcionar al Contactar Soporte

Para una atención más rápida, ten a mano:
1. Versión del sistema (ver en Ajustes)
2. Sistema operativo (Windows 10/11)
3. Descripción del problema
4. Capturas de pantalla del error
5. Logs del sistema (si aplica)

---

## 📚 Recursos Adicionales

### Documentación Técnica

- **Print Server**: Ver `print-server/README.md`
- **Base de Datos**: Ver `database/schema.sql`
- **API Endpoints**: [Próximamente]

### Tutoriales en Video

- 🎥 Instalación paso a paso: [Próximamente]
- 🎥 Configuración de impresoras: [Próximamente]
- 🎥 Uso del POS: [Próximamente]
- 🎥 Gestión de inventario: [Próximamente]

---

## 📄 Licencia y Créditos

Sistema desarrollado para **De la Gran Burger**  
© 2026 Todos los derechos reservados

**Tecnologías utilizadas:**
- ⚛️ Next.js 15 (React 18)
- 📘 TypeScript
- 🎨 Tailwind CSS
- 🗄️ Supabase (PostgreSQL en la nube)
- 🖨️ ESC/POS (protocolo de impresión térmica)
- ⚙️ Node.js
- 🔧 Express.js

**Desarrollado con** ❤️ **por el equipo de De la Gran Burger**

---

## 🎉 ¡Listo para Comenzar!

Sigue los **5 pasos de instalación rápida** y tendrás el sistema funcionando en menos de 15 minutos.

**Checklist de inicio:**
- [ ] Node.js instalado
- [ ] Proyecto descargado
- [ ] Dependencias instaladas (`npm install`)
- [ ] Aplicación web corriendo (`npm run dev`)
- [ ] Print Server instalado y corriendo
- [ ] Impresoras configuradas
- [ ] Logo personalizado (opcional)
- [ ] Categorías creadas
- [ ] Productos agregados
- [ ] Contraseña de admin cambiada

**¿Necesitas ayuda?** Contacta a soporte técnico.

**¡Bienvenido al sistema POS de De la Gran Burger!** 🍔🎉