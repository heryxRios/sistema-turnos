//
const express = require('express');
const router = express.Router();
const cajasController = require('./cajas.controller');
const { verificarToken, esRol } = require('../../middlewares/auth.middleware');

// Solo usuarios autenticados con rol 'cajero' o 'admin' pueden llamar turnos
router.post('/llamar', verificarToken, esRol(['cajero', 'admin']), cajasController.llamarSiguiente);

module.exports = router;