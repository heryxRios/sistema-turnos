const express = require('express');
const router = express.Router();
const authController = require('./auth.controller');

router.post('/login', authController.login);
router.post('/registrar', authController.registrar); // Solo para pruebas iniciales

module.exports = router;