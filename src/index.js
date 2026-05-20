const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { sequelize } = require('./database/connection');

// IMPORTACIÓN EN ORNEN DE LOS MODELOS (Evita errores de Sequelize)
const Usuario = require('./database/models/Usuario');
const Turno = require('./database/models/Turno');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }
});

const PORT = process.env.PORT || 3000;

// Middleware para entender JSON y servir el Frontend (vistas HTML)
app.use(express.json());
app.use(express.static('src/public'));

// Compartir la instancia de Socket.io con nuestros controladores de la API
app.set('io', io);

// FUNCIÓN DE INICIALIZACIÓN DE LA BASE DE DATOS
const inicializarDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexión a SQLite establecida con éxito.');

    // Sincroniza las tablas de forma segura sin borrar datos existentes
    await sequelize.sync({ force: false });

    // Semilla: Crear un administrador inicial si el sistema está completamente vacío
    const usuariosExistentes = await Usuario.count();
    if (usuariosExistentes === 0) {
      await Usuario.create({
        username: 'admin',
        password: 'admin123',
        rol: 'admin'
      });
      console.log('👤 [SEED] Superusuario creado con éxito -> (admin / admin123)');
    }
    console.log('✅ Tablas y relaciones listas en SQLite.');
  } catch (error) {
    console.error('❌ Error crítico al inicializar la base de datos:', error.message);
  }
};

// Arrancar la conexión a la base de datos
inicializarDB();

// ENRUTAMIENTO DE LA API (Asegúrate de tener creados estos archivos de rutas)
app.use('/api/auth', require('./modules/auth/auth.routes'));
app.use('/api/atencion', require('./modules/atencion/atencion.routes'));
app.use('/api/cajas', require('./modules/cajas/cajas.routes'));
app.use('/api/admin', require('./modules/admin/admin.routes'));

// Escuchador global de conexiones WebSocket en tiempo real
io.on('connection', (socket) => {
  console.log('📱 Un dispositivo (Caja, Tótem o Visor) se ha conectado al WebSocket');
  
  socket.on('disconnect', () => {
    console.log('🔌 Un dispositivo se ha desconectado del WebSocket');
  });
});

// Lanzar el servidor integrado
server.listen(PORT, () => {
  console.log(`🚀 Servidor en ejecución.`);
  console.log(`🌍 Accede localmente en: http://localhost:${PORT}/login.html`);
});


/**
const express = require('express');
const http = require('http'); // Requerido para Socket.io
const { Server } = require('socket.io');
const { dbConnection } = require('./database/connection');


const app = express();
const server = http.createServer(app); // Creamos el servidor HTTP
const io = new Server(server, {
  cors: { origin: "*" } // Permitir conexiones desde cualquier origen
});

const PORT = process.env.PORT || 3000;

// Rutas de Reportes (Solo Admin)
const { obtenerEstadisticas } = require('./modules/admin/reports.controller');
const { verificarToken, esRol } = require('./middlewares/auth.middleware');

app.get('/api/admin/reportes', verificarToken, esRol(['admin']), obtenerEstadisticas);

// Rutas de Seguridad (Guardia y Admin)
const { monitorearFila } = require('./modules/auth/seguridad.controller');
app.get('/api/seguridad/monitoreo', verificarToken, esRol(['seguridad', 'admin']), monitorearFila);

app.use(express.static('src/public'));
app.use(express.json());

// Inyectamos 'io' en las rutas para poder emitir eventos desde los controladores
app.set('io', io);

// Conectar DB
dbConnection();

// Rutas
app.use('/api/atencion', require('./modules/atencion/atencion.routes'));
app.use('/api/cajas', require('./modules/cajas/cajas.routes'));

//ruta de seguridad a los módulos
app.use('/api/auth', require('./modules/auth/auth.routes'));

// ... otros imports
app.use('/api/admin', require('./modules/admin/admin.routes'));

io.on('connection', (socket) => {
  console.log('📱 Cliente conectado al WebSocket');
});

server.listen(PORT, () => {
  console.log(`🚀 Servidor con WebSockets en puerto ${PORT}`);
});

**/

/**
const express = require('express');
const { dbConnection } = require('./database/connection'); // <-- Nueva línea
require('./database/models/Turno'); // <-- Importar el modelo para que se cree la tabla

const app = express();
const PORT = process.env.PORT || 3000;

// Conectar a la base de datos
dbConnection(); // <-- Nueva línea

// Importar rutas de módulos
const atencionRoutes = require('./modules/atencion/atencion.routes');

// Middlewares
app.use(express.json());

// Uso de rutas (Endpoints)
app.use('/api/atencion', atencionRoutes);

app.get('/', (req, res) => {
  res.send('Sistema de Turnos API - Online');
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
});

**/


/**
 * configuracion inicial el servidor al iniciar la app
 * const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware para entender JSON (importante para los turnos después)
app.use(express.json());

// Ruta principal
app.get('/', (req, res) => {
  res.send({
    mensaje: '¡Servidor de Sistema de Turnos funcionando!',
    estado: 'Online',
    fecha: new Date()
  });
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en el puerto ${PORT}`);
  console.log(`Presiona Ctrl + C para detenerlo`);
});**/