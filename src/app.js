const express = require('express');
const { sequelize } = require('./database/connection');

// Importar modelos para asegurar que Sequelize los registre
require('./database/models/Usuario');
require('./database/models/Turno');

const app = express();

app.use(express.json());
app.use(express.static('src/public'));

// Rutas
app.use('/api/auth', require('./modules/auth/auth.routes'));
app.use('/api/atencion', require('./modules/atencion/atencion.routes'));
app.use('/api/cajas', require('./modules/cajas/cajas.routes'));
app.use('/api/admin', require('./modules/admin/admin.routes'));

module.exports = { app, sequelize };
