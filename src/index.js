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