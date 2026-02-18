# Guía de Instalación - De la Gran Burger POS

Sistema de Punto de Venta con impresión térmica para hamburguesería.

## Requisitos del Sistema

### Software Necesario
- **Windows 10/11** (recomendado)
- **Node.js 18+** - [Descargar aquí](https://nodejs.org/)
- **PostgreSQL 14+** o **MySQL 8+** - [PostgreSQL](https://www.postgresql.org/download/) | [MySQL](https://dev.mysql.com/downloads/)
- **Git** (opcional) - [Descargar aquí](https://git-scm.com/)

### Hardware
- **PC/Laptop** con Windows
- **Impresora térmica USB 80mm** (recomendado: Epson TM-T20, Star TSP143, Bixolon SRP-330)
- **Conexión a Internet** (solo para instalación inicial)

---

## Paso 1: Instalar Dependencias del Sistema

### 1.1 Instalar Node.js
1. Descargar el instalador de Node.js desde [nodejs.org](https://nodejs.org/)
2. Ejecutar el instalador con opciones por defecto
3. Verificar instalación abriendo **CMD** y ejecutando:
   ```bash
   node --version
   npm --version
   ```
   Deberías ver las versiones instaladas (ej: v18.17.0 y 9.6.7)

### 1.2 Instalar PostgreSQL (o MySQL)

**Para PostgreSQL:**
1. Descargar desde [postgresql.org](https://www.postgresql.org/download/windows/)
2. Ejecutar instalador con opciones por defecto
3. **IMPORTANTE:** Anota la contraseña del usuario `postgres`
4. Instalar pgAdmin4 (incluido en el instalador)

**Para MySQL:**
1. Descargar MySQL Installer desde [dev.mysql.com](https://dev.mysql.com/downloads/installer/)
2. Seleccionar "Server only" o "Developer Default"
3. **IMPORTANTE:** Anota la contraseña del usuario `root`

---

## Paso 2: Configurar la Base de Datos

### 2.1 Crear Base de Datos

**PostgreSQL (usando pgAdmin4):**
1. Abrir pgAdmin4
2. Conectar al servidor local (localhost)
3. Click derecho en "Databases" → "Create" → "Database"
4. Nombre: `delagranburguer_pos`
5. Click "Save"

**MySQL (usando MySQL Workbench):**
1. Abrir MySQL Workbench
2. Conectar a la instancia local
3. Ejecutar: `CREATE DATABASE delagranburguer_pos;`

### 2.2 Importar Schema

1. Abrir el archivo `database/schema.sql` (incluido en el proyecto)
2. **PostgreSQL:** 
   - En pgAdmin4, click derecho en la base de datos → "Query Tool"
   - Pegar el contenido del archivo `schema.sql`
   - Ejecutar (botón ▶️ o F5)
3. **MySQL:**
   - En MySQL Workbench, abrir una nueva query
   - Pegar el contenido del archivo `schema.sql`
   - Ejecutar (botón ⚡ o Ctrl+Shift+Enter)

---

## Paso 3: Instalar la Aplicación Web (Frontend + Backend)

### 3.1 Descargar el Proyecto
```bash
# Si tienes Git instalado:
git clone <URL_DEL_REPOSITORIO>
cd delagranburguer-pos

# O descargar el ZIP y extraer en C:\delagranburguer-pos
```

### 3.2 Instalar Dependencias
```bash
# Abrir CMD en la carpeta del proyecto
cd C:\delagranburguer-pos
npm install
```
*Esto puede tomar 2-5 minutos*

### 3.3 Configurar Variables de Entorno

1. Copiar el archivo `.env.example` a `.env.local`:
   ```bash
   copy .env.example .env.local
   ```

2. Editar `.env.local` con tu editor de texto favorito (Notepad++, VSCode, etc.):

   **Para PostgreSQL:**
   ```env
   DATABASE_URL=postgresql://postgres:TU_PASSWORD@localhost:5432/delagranburguer_pos
   ```

   **Para MySQL:**
   ```env
   DATABASE_URL=mysql://root:TU_PASSWORD@localhost:3306/delagranburguer_pos
   ```

   Reemplaza `TU_PASSWORD` con la contraseña que anotaste en el Paso 1.2

### 3.4 Iniciar la Aplicación Web
```bash
npm run dev
```

La aplicación estará disponible en: **http://localhost:3000**

**Usuario inicial:**
- Usuario: `admin`
- Contraseña: `admin123`

⚠️ **IMPORTANTE:** Cambia la contraseña del admin desde el panel de Ajustes después del primer login.

---

## Paso 4: Instalar el Print Server (Servidor de Impresión)

El Print Server es un servicio local que permite imprimir en las impresoras térmicas USB.

### 4.1 Conectar la Impresora Térmica
1. Conectar la impresora térmica USB al PC
2. Instalar los drivers del fabricante (si es necesario)
3. Verificar que Windows detecte la impresora:
   - Ir a **Configuración** → **Dispositivos** → **Impresoras y escáneres**
   - Debe aparecer tu impresora (ej: "Epson TM-T20II")

### 4.2 Instalar Dependencias del Print Server
```bash
cd print-server
npm install
```

### 4.3 Instalar el Print Server como Servicio de Windows

#### Opción A: Usar PM2 (Recomendado)
```bash
# Instalar PM2 globalmente
npm install -g pm2
npm install -g pm2-windows-startup

# Configurar PM2 para iniciar con Windows
pm2-startup install

# Iniciar el Print Server
pm2 start server.js --name "print-server"

# Guardar configuración
pm2 save
```

#### Opción B: Ejecutar Manualmente
```bash
cd print-server
npm start
```
*Nota: Con esta opción deberás abrir esta ventana cada vez que enciendas el PC*

### 4.4 Verificar que el Print Server está Corriendo
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

## Paso 5: Configurar Impresoras en la Aplicación

1. Abrir el navegador en **http://localhost:3000**
2. Iniciar sesión con `admin` / `admin123`
3. Ir a **Ajustes** → **Impresoras**
4. Click en **"Actualizar Lista"** para detectar impresoras
5. Seleccionar:
   - **Impresora de Cocina** (para comandas)
   - **Impresora de Cliente** (para tickets de venta)
6. Configurar:
   - Tamaño de papel: **80mm** (recomendado)
   - Copias de comanda: **1** (o 2 si necesitas duplicados)
7. Click en **"Imprimir Prueba"** en cada impresora para verificar
8. Click en **"Guardar Configuración"**

---

## Paso 6: Configuración Inicial del Sistema

### 6.1 Crear Categorías
1. Ir a **Productos y Servicios** → **Categorías**
2. Agregar categorías (ejemplos):
   - Hamburguesas
   - Acompañamientos
   - Bebidas
   - Postres

### 6.2 Agregar Productos
1. Ir a **Productos y Servicios** → **Productos**
2. Click en **"Nuevo Producto"**
3. Completar:
   - Nombre (ej: "Chilli Triple")
   - Precio (ej: 27000)
   - Categoría (ej: "Hamburguesas")
   - Estado: Activo
4. Guardar y repetir para todos tus productos

### 6.3 Crear Usuarios Adicionales (Opcional)
1. Ir a **Ajustes** → **Usuarios**
2. Agregar usuarios con roles:
   - **Admin**: Acceso total
   - **Caja**: Solo POS y ventas
   - **Cocina**: Solo visualizar pedidos

---

## Paso 7: Uso del Sistema

### 7.1 Realizar una Venta
1. Ir a **Punto de Venta**
2. Opcional: Llenar **Información del Cliente**
3. Click en productos para agregarlos al carrito
4. Ajustar cantidades con botones **-** / **+**
5. Agregar descuento si aplica
6. Seleccionar tipo de pedido: **Delivery** o **Para Retirar**
7. Click en **botón Total** (verde) para confirmar

### 7.2 Procesar Pago
1. Se abre el modal de pago
2. Seleccionar método(s): Efectivo, Tarjeta, QR, Transferencia
3. Ingresar monto(s)
4. Agregar nota de pago (opcional)
5. Click en **"Confirmar Pago"**

### 7.3 Impresión Automática
Al confirmar el pago, se imprimirán automáticamente:
- ✅ **Comanda para cocina** (en impresora de cocina)
- ✅ **Ticket para cliente** (en impresora de cliente)

### 7.4 Ver Historial de Ventas
1. Ir a **Ventas**
2. Filtrar por fecha
3. Ver detalles, reimprimir, anular (si tienes permiso)

---

## Solución de Problemas

### Problema: "No se pudo conectar con el servidor de impresión"
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

### Problema: "No se encontraron impresoras conectadas"
**Solución:**
1. Verificar que la impresora esté conectada y encendida
2. Verificar en Windows que aparece en "Impresoras y escáneres"
3. Reinstalar drivers del fabricante
4. Reiniciar el Print Server:
   ```bash
   pm2 restart print-server
   ```

### Problema: La impresión sale cortada o con caracteres raros
**Solución:**
1. Verificar que el tamaño de papel esté configurado en 80mm
2. Verificar que la impresora soporte comandos ESC/POS
3. Actualizar firmware de la impresora (ver manual del fabricante)

### Problema: "Error de conexión a la base de datos"
**Solución:**
1. Verificar que PostgreSQL/MySQL esté corriendo:
   - **PostgreSQL:** Buscar "Services" en Windows → PostgreSQL Database Server debe estar "Running"
   - **MySQL:** Buscar "Services" → MySQL debe estar "Running"
2. Verificar credenciales en `.env.local`
3. Verificar que la base de datos `delagranburguer_pos` exista

### Problema: La aplicación web no carga
**Solución:**
1. Verificar que el servidor esté corriendo:
   ```bash
   pm2 status
   ```
2. Ver logs para detectar errores:
   ```bash
   pm2 logs nextjs
   ```
3. Reiniciar la aplicación:
   ```bash
   pm2 restart nextjs
   ```

---

## Configuración para Producción (Deploy)

### Opción 1: Servidor Local (PC dedicado en el local)
1. Seguir pasos 1-7 en el PC del local
2. Configurar PM2 para iniciar ambos servicios con Windows:
   ```bash
   pm2 start ecosystem.config.js
   pm2 save
   pm2-startup install
   ```
3. Configurar IP fija en el router para el PC
4. Otros dispositivos (tablets, etc.) acceden vía IP local: `http://192.168.X.X:3000`

### Opción 2: Servidor Cloud + Print Server Local
1. Desplegar la aplicación web en **Vercel** o **Render**
2. Configurar base de datos en la nube (ej: Supabase, Railway)
3. Mantener el Print Server corriendo localmente en el PC del local
4. Configurar la URL del Print Server en la aplicación web

---

## Mantenimiento

### Backup de Base de Datos (Recomendado: Diario/Semanal)

**PostgreSQL:**
```bash
pg_dump -U postgres delagranburguer_pos > backup_$(date +%Y%m%d).sql
```

**MySQL:**
```bash
mysqldump -u root -p delagranburguer_pos > backup_$(date +%Y%m%d).sql
```

### Actualizar la Aplicación
```bash
cd C:\delagranburguer-pos
git pull  # Si usas Git
npm install  # Si hay nuevas dependencias
pm2 restart all
```

---

## Soporte

Para asistencia técnica o dudas:
- Email: soporte@delagranburguer.com
- Teléfono: +595 XXX XXXXXX
- WhatsApp: +595 XXX XXXXXX

---

## Licencia y Créditos

Sistema desarrollado para **De la Gran Burger**  
© 2026 Todos los derechos reservados

**Tecnologías utilizadas:**
- Next.js 15 (React 18)
- TypeScript
- Tailwind CSS
- PostgreSQL/MySQL
- Node.js
- ESC/POS (protocolo de impresión térmica)