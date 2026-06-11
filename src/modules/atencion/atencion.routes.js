const express = require('express');
const router = express.Router();
// Importamos el controlador que ya definiste
const atencionController = require('./atencion.controller');

// Cambiamos 'obtenerTurnos' por 'obtenerHistorial' para que coincida con tu exportación
router.get('/', atencionController.obtenerHistorial); 
router.post('/', atencionController.crearTurno);
// NUEVA RUTA PARA EL REINICIO
router.post('/reiniciar', atencionController.reiniciarTurnos);

// En src/modules/atencion/atencion.routes.js
router.post('/:id/regresar', atencionController.regresarAFila);

module.exports = router;

/**
const express = require('express');
const router = express.Router();
const atencionController = require('./atencion.controller');

router.get('/', atencionController.obtenerTurnos);
router.post('/', atencionController.crearTurno);

module.exports = router;
**/