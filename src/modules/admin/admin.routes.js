const express = require('express');
const router = express.Router();
const adminController = require('./admin.controller');
const { verificarToken, esRol } = require('../../middlewares/auth.middleware');

// Todas estas rutas requieren Token y Rol de Admin
router.use(verificarToken, esRol(['admin']));

router.get('/usuarios', adminController.obtenerUsuarios);
router.post('/usuarios', adminController.crearUsuario);
router.put('/usuarios/:id', adminController.actualizarUsuario); // Edición general (Rol / Ventanilla)
router.put('/usuarios/:id/reset-password', adminController.resetearPassword); // Reset específico de clave
router.delete('/usuarios/:id', adminController.eliminarUsuario);
router.get('/reportes', adminController.obtenerReportes);

module.exports = router;
