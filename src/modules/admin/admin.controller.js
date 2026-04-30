const Usuario = require('../../database/models/Usuario');

// Listar todos los usuarios (sin mostrar la contraseña)
const obtenerUsuarios = async (req, res) => {
  try {
    const usuarios = await Usuario.findAll({
      attributes: { exclude: ['password'] }
    });
    res.json(usuarios);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Crear un nuevo usuario desde el panel de admin
const crearUsuario = async (req, res) => {
  try {
    const { username, password, rol } = req.body;
    const nuevoUsuario = await Usuario.create({ username, password, rol });
    res.status(201).json({ mensaje: "Usuario creado exitosamente", id: nuevoUsuario.id });
  } catch (error) {
    res.status(400).json({ error: "Error al crear usuario o el nombre ya existe" });
  }
};

// Actualizar un usuario existente (cambiar rol o contraseña)
const actualizarUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const { rol, password } = req.body;
    const usuario = await Usuario.findByPk(id);

    if (!usuario) return res.status(404).json({ mensaje: "Usuario no encontrado" });

    if (rol) usuario.rol = rol;
    if (password) usuario.password = password; // El hook en el modelo lo encriptará

    await usuario.save();
    res.json({ mensaje: "Usuario actualizado correctamente" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Eliminar un usuario
const eliminarUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const filasBorradas = await Usuario.destroy({ where: { id } });

    if (filasBorradas === 0) return res.status(404).json({ mensaje: "Usuario no encontrado" });

    res.json({ mensaje: "Usuario eliminado del sistema" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  obtenerUsuarios,
  crearUsuario,
  actualizarUsuario,
  eliminarUsuario
};