const express = require('express');
const { sequelize } = require('./database/connection');

require('./database/models/Usuario');
require('./database/models/Turno');

const app = express();

app.use(express.json());
app.use(express.static('src/public'));

app.use('/api/auth', require('./modules/auth/auth.routes'));
app.use('/api/atencion', require('./modules/atencion/atencion.routes'));
app.use('/api/cajas', require('./modules/cajas/cajas.routes'));
app.use('/api/admin', require('./modules/admin/admin.routes'));

app.use((err, req, res, next) => {
  console.error('❌ Error no controlado:', err.stack || err.message);
  res.status(500).json({
    error: 'Error interno del servidor',
    message: process.env.NODE_ENV === 'production' ? 'Ha ocurrido un error inesperado.' : err.message,
  });
});

module.exports = { app, sequelize };
