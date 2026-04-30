const express = require('express');
const router = express.Router();
const adminController = require('./admin.controller');
const { verificarToken, esRol } = require('../../middlewares/auth.middleware');

// Todas estas rutas requieren Token y Rol de Admin
router.use(verificarToken, esRol(['admin']));

router.get('/usuarios', adminController.obtenerUsuarios);
router.post('/usuarios', adminController.crearUsuario);
router.put('/usuarios/:id', adminController.actualizarUsuario);
router.delete('/usuarios/:id', adminController.eliminarUsuario);

module.exports = router;
