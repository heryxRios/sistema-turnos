const express = require('express');
const router = express.Router();
const atencionController = require('./atencion.controller');

router.get('/', atencionController.obtenerTurnos);
router.post('/', atencionController.crearTurno);

module.exports = router;