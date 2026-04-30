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