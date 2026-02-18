# Manual de Instalación - De la Gran Burger POS

Este documento contiene las instrucciones paso a paso para instalar y configurar el sistema POS.

## Requisitos Previos

### Software Requerido
- **Node.js** v18 o superior ([descargar](https://nodejs.org/))
- **PostgreSQL** v14 o superior ([descargar](https://www.postgresql.org/download/))
- **Git** ([descargar](https://git-scm.com/))

### Hardware Requerido
- PC con Windows 10/11
- Impresoras térmicas USB (80mm) - 2 unidades:
  - Una para cocina (comandas)
  - Una para cliente (tickets)
- Conexión a internet (solo para instalación inicial)

## Paso 1: Clonar el Proyecto

```bash
git clone [URL_DEL_REPOSITORIO]
cd delagranburguer-pos
```

## Paso 2: Configurar la Base de Datos

### 2.1 Crear Base de Datos

Abre pgAdmin o psql y ejecuta:

```sql
CREATE DATABASE delagranburguer_pos;
```

### 2.2 Crear Usuario

```sql
CREATE USER pos_user WITH PASSWORD 'tu_password_seguro';
GRANT ALL PRIVILEGES ON DATABASE delagranburguer_pos TO pos_user;
```

### 2.3 Importar Schema

```bash
psql -U pos_user -d delagranburguer_pos -f database/schema.sql
```

## Paso 3: Configurar Variables de Entorno

Crea un archivo `.env.local` en la raíz del proyecto:

```env
# Base de Datos
DATABASE_URL=postgresql://pos_user:tu_password_seguro@localhost:5432/delagranburguer_pos

# Configuración de la Aplicación
NEXT_PUBLIC_APP_NAME=De la Gran Burger
NEXT_PUBLIC_API_URL=http://localhost:3000/api

# Print Server
NEXT_PUBLIC_PRINT_SERVER_URL=http://localhost:3001
```

## Paso 4: Instalar Dependencias

### 4.1 Aplicación Principal

```bash
npm install
```

### 4.2 Print Server

```bash
cd print-server
npm install
cd ..
```

## Paso 5: Configurar Impresoras USB

### 5.1 Conectar Impresoras

1. Conecta ambas impresoras térmicas USB a la PC
2. Espera a que Windows instale los drivers automáticamente
3. Verifica en "Dispositivos e impresoras" que las impresoras aparezcan

### 5.2 Instalar Driver USB (si es necesario)

Si las impresoras no se detectan automáticamente:

1. Descarga el driver del fabricante de tu impresora térmica
2. Instala el driver siguiendo las instrucciones del fabricante
3. Reinicia la PC

## Paso 6: Iniciar el Sistema

### 6.1 Iniciar Print Server

Abre una terminal y ejecuta:

```bash
cd print-server
npm start
```

Deberías ver algo como:

```
🖨️  Print Server corriendo en http://localhost:3001
════════════════════════════════════════════════
🔍 Impresoras detectadas: 2
   1. USB Printer 1 (VID: 1234, PID: 5678)
   2. USB Printer 2 (VID: 1234, PID: 5679)
```

⚠️ **Importante**: Mantén esta terminal abierta mientras uses el sistema.

### 6.2 Iniciar Aplicación Web

Abre otra terminal y ejecuta:

```bash
npm run dev
```

Deberías ver:

```
ready - started server on 0.0.0.0:3000, url: http://localhost:3000
```

## Paso 7: Configurar Impresoras en el Sistema

1. Abre el navegador en `http://localhost:3000`
2. Ve a **Ajustes** en el menú lateral
3. Deberías ver las impresoras detectadas
4. Selecciona:
   - **Impresora de Cocina**: La impresora que estará en la cocina
   - **Impresora de Cliente**: La impresora que estará en caja
5. Configura el número de **Copias de Comanda** (normalmente 1 o 2)
6. Haz clic en **"Probar"** para cada impresora y verifica que impriman correctamente
7. Haz clic en **"Guardar Configuración"**

## Paso 8: Crear Usuario Admin Inicial

Por defecto, el sistema se puede usar sin login. Para agregar seguridad:

1. Edita el archivo `database/schema.sql` y busca la sección de usuarios
2. Crea tu usuario admin con:

```sql
INSERT INTO users (username, password_hash, role, full_name, active)
VALUES (
  'admin',
  -- Genera el hash de tu password con bcrypt
  '$2b$10$tu_hash_aqui',
  'admin',
  'Administrador',
  true
);
```

## Paso 9: Verificar Funcionalidad

### 9.1 Test de Impresión

1. Ve a **Punto de Venta**
2. Agrega algunos productos al carrito
3. Llena información del cliente (opcional)
4. Haz clic en **"Confirmar Venta"**
5. Verifica que se impriman:
   - ✅ Comanda en la impresora de cocina (sin precios)
   - ✅ Ticket en la impresora de cliente (con precios)

### 9.2 Test de Productos

1. Ve a **Productos y Servicios**
2. Crea un nuevo producto
3. Edita un producto existente
4. Desactiva/activa productos
5. Verifica que los cambios se reflejen en el POS

### 9.3 Test de Ventas

1. Ve a **Ventas**
2. Verifica que aparezcan las ventas realizadas
3. Usa los filtros por fecha
4. Abre el detalle de una venta
5. (Opcional) Prueba anular una venta

## Configuración para Producción

### Opción 1: Instalación Local Permanente

Para usar el sistema de forma permanente en la PC del local:

1. Crea scripts de inicio automático:

**Crear `start-print-server.bat`:**
```batch
@echo off
cd print-server
start /min cmd /k npm start
```

**Crear `start-pos-app.bat`:**
```batch
@echo off
start /min cmd /k npm run dev
```

2. Coloca estos scripts en la carpeta de inicio de Windows:
   - Presiona `Win + R`
   - Escribe `shell:startup`
   - Copia los archivos `.bat` ahí

3. Las aplicaciones se iniciarán automáticamente al encender la PC

### Opción 2: Usar PM2 (Recomendado para Estabilidad)

```bash
# Instalar PM2 globalmente
npm install -g pm2

# Iniciar servicios
pm2 start npm --name "pos-app" -- run dev
pm2 start npm --name "print-server" --cwd print-server -- start

# Guardar configuración
pm2 save

# Configurar inicio automático
pm2 startup
```

## Solución de Problemas

### Problema: Impresoras no se detectan

**Solución:**
1. Verifica que las impresoras estén conectadas y encendidas
2. Reinicia el Print Server
3. Verifica los drivers en "Dispositivos e impresoras"
4. Prueba con otro puerto USB

### Problema: Error al imprimir

**Solución:**
1. Verifica que el Print Server esté corriendo (`http://localhost:3001`)
2. Revisa la terminal del Print Server para ver errores
3. Verifica que las impresoras tengan papel
4. Prueba imprimir desde "Ajustes" > "Probar"

### Problema: Base de datos no conecta

**Solución:**
1. Verifica que PostgreSQL esté corriendo
2. Revisa las credenciales en `.env.local`
3. Verifica que el firewall permita conexiones al puerto 5432

### Problema: La app no inicia

**Solución:**
1. Verifica que Node.js esté instalado: `node --version`
2. Elimina `node_modules` y reinstala: `rm -rf node_modules && npm install`
3. Verifica que el puerto 3000 no esté ocupado

## Mantenimiento

### Backup de Base de Datos

Ejecuta regularmente:

```bash
pg_dump -U pos_user delagranburguer_pos > backup_$(date +%Y%m%d).sql
```

### Actualización del Sistema

```bash
git pull origin main
npm install
cd print-server && npm install && cd ..
npm run dev
```

## Soporte

Para problemas o dudas:

- Email: soporte@delagranburguer.com
- WhatsApp: [NÚMERO]
- Horario: Lunes a Viernes 9:00 - 18:00

## Información Adicional

### Atajos de Teclado (Futuros)

- `F1` - Enfoque en buscador de productos
- `F2` - Limpiar carrito
- `F12` - Confirmar venta
- `Esc` - Cancelar acción actual

### Mejores Prácticas

1. **Cierre de caja diario**: Exporta el reporte de ventas al final del día
2. **Backup**: Realiza backup de la base de datos semanalmente
3. **Actualizaciones**: Actualiza el sistema mensualmente
4. **Mantenimiento de impresoras**: Limpia los cabezales cada semana
5. **Stock de papel**: Mantén rollos de papel térmico de repuesto

---

**Sistema POS - De la Gran Burger**  
Versión 1.0.0  
© 2026 De la Gran Burger