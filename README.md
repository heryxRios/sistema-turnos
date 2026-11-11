# Sistema de Turnos

Sistema de gestión de turnos para usuarios en sala de espera. Incluye panel de administración, atención por cajas y generación de turnos desde diferentes pantallas.

## Tecnologías
- Node.js
- Express
- Sequelize
- SQLite
- Socket.IO
- JWT
- Jest + Supertest

## Objetivo
Este proyecto permite:
- Generar turnos generales y prioritarios.
- Llamar al siguiente turno desde una caja.
- Registrar usuarios con roles de administrador, cajero, seguridad y atención.
- Realizar autenticación con JWT.
- Mostrar reportes básicos de la jornada.
- Emitir eventos en tiempo real mediante sockets.

## Estructura del proyecto
- `src/index.js` - Inicio del servidor y WebSockets
- `src/app.js` - Configuración base de Express
- `src/database/connection.js` - Conexión a SQLite
- `src/database/dbInit.js` - Inicialización de la base de datos
- `src/database/models/Usuario.js` - Modelo de usuarios
- `src/database/models/Turno.js` - Modelo de turnos
- `src/modules/auth/*` - Login y rutas de autenticación
- `src/modules/atencion/*` - Generación y reinicio de turnos
- `src/modules/cajas/*` - Llamado del siguiente turno
- `src/modules/admin/*` - Usuarios y reportes
- `src/middlewares/auth.middleware.js` - Validación de JWT y roles

## Instalación
1. Clona el repositorio.
2. Instala dependencias:
   ```bash
   npm install
   ```
3. Crea un archivo `.env` con la siguiente estructura:
   ```env
   PORT=3000
   JWT_SECRET=mi_clave_secreta
   NODE_ENV=development
   ```
4. Inicia el servidor:
   ```bash
   npm start
   ```

## Scripts disponibles
```bash
npm start
npm run dev
npm test
npm run lint
```

## Correcciones aplicadas

### 1) Corregido problema de autenticación JWT
Se movió la clave JWT a variables de entorno y se validó correctamente el encabezado `Authorization: Bearer <token>`.

Archivo corregido:
- `src/middlewares/auth.middleware.js`
- `src/modules/auth/auth.controller.js`

### 2) Corregido cálculo de reportes de administración
El sistema contaba el estado como `atendido`, pero el modelo usa `finalizado`.

Se corrigió a:
- `turnosFinalizados`
- `turnosAtendiendo`
- `turnosEspera`

Archivo corregido:
- `src/modules/admin/admin.controller.js`

### 3) Corregido estado de turno al regresar a la fila
Se estaba usando `turno.status`, pero el modelo usa `turno.estado`.

Se dejó como:
```js
turno.estado = 'espera';
turno.ventanilla = null;
```

Archivo corregido:
- `src/modules/atencion/atencion.controller.js`

### 4) Validación del tipo de turno
Se normalizó el valor recibido para evitar estados inconsistentes. Ahora solo acepta `general` o `prioritario`.

Archivo corregido:
- `src/modules/atencion/atencion.controller.js`

### 5) Inicialización segura de la base de datos
Se eliminó la lógica de arranque paralela insegura y se espera a que la base de datos termine de sincronizarse antes de arrancar el servidor.

Archivos corregidos:
- `src/index.js`
- `src/database/dbInit.js`
- `src/database/connection.js`

### 6) Manejo de errores globales
Se agregó un middleware de errores global para capturar fallos inesperados y responder con una respuesta HTTP controlada.

Archivo corregido:
- `src/app.js`

## Endpoints principales

### Auth
- `POST /api/auth/login`
- `POST /api/auth/registrar`

### Turnos
- `GET /api/atencion/`
- `POST /api/atencion/`
- `POST /api/atencion/reiniciar`
- `POST /api/atencion/:id/regresar`

### Cajas
- `POST /api/cajas/llamar`

### Admin
- `GET /api/admin/usuarios`
- `POST /api/admin/usuarios`
- `PUT /api/admin/usuarios/:id`
- `PUT /api/admin/usuarios/:id/reset-password`
- `DELETE /api/admin/usuarios/:id`
- `GET /api/admin/reportes`

## Usuario administrador por defecto
Cuando la base de datos se inicializa por primera vez, se crea el usuario:
- usuario: `admin`
- contraseña: `admin123`

## Recomendaciones adicionales
- Usar un archivo `.env` real para secretos.
- No dejar claves hardcodeadas en producción.
- Agregar validaciones más estrictas para entrada de usuarios.
- Considerar migraciones profesionales con Sequelize CLI para versiones futuras.

## Validación con pruebas
El proyecto incluye pruebas con Jest y Supertest.

Ejecuta:
```bash
npm test
```

## Notas finales
El proyecto ya quedó reestructurado para que su flujo principal sea consistente: autenticación, turnos, cajas y reportes. La lógica de estados y la inicialización de la base de datos fueron los puntos más críticos a corregir.
