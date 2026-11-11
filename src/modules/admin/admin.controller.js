const Usuario = require('../../database/models/Usuario');
const Turno = require('../../database/models/Turno');

const obtenerUsuarios = async (req, res) => {
  try {
    const usuarios = await Usuario.findAll({
      attributes: { exclude: ['password'] },
    });
    return res.json(usuarios);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const crearUsuario = async (req, res) => {
  try {
    const { username, password, rol, ventanillaDefault } = req.body;

    const rolFormateado = rol ? rol.toLowerCase().trim() : 'cajero';
    const rolesPermitidos = ['admin', 'cajero', 'seguridad', 'atencion'];

    if (!rolesPermitidos.includes(rolFormateado)) {
      return res.status(400).json({ error: `El rol '${rolFormateado}' no es válido.` });
    }

    const nuevoUsuario = await Usuario.create({
      username,
      password,
      rol: rolFormateado,
      ventanillaDefault: rolFormateado === 'cajero' && ventanillaDefault ? parseInt(ventanillaDefault, 10) : null,
    });

    return res.status(201).json({
      mensaje: 'Usuario creado exitosamente',
      usuario: { id: nuevoUsuario.id, username: nuevoUsuario.username, rol: nuevoUsuario.rol },
    });
  } catch (error) {
    return res.status(400).json({ error: 'Error al crear usuario o el nombre de usuario ya existe' });
  }
};

const resetearPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { nuevaPassword } = req.body;

    if (!nuevaPassword || nuevaPassword.trim().length < 4) {
      return res.status(400).json({ error: 'La contraseña debe tener al menos 4 caracteres.' });
    }

    const usuario = await Usuario.findByPk(id);
    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    usuario.password = nuevaPassword;
    await usuario.save();

    return res.json({ mensaje: `Contraseña de '${usuario.username}' restablecida correctamente.` });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const eliminarUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const filasBorradas = await Usuario.destroy({ where: { id } });

    if (filasBorradas === 0) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }

    return res.json({ mensaje: 'Usuario eliminado del sistema' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const actualizarUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const { rol, password, ventanillaDefault } = req.body;
    const usuario = await Usuario.findByPk(id);

    if (!usuario) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }

    if (rol) {
      const rolFormateado = rol.toLowerCase().trim();
      const rolesPermitidos = ['admin', 'cajero', 'seguridad', 'atencion'];
      if (rolesPermitidos.includes(rolFormateado)) {
        usuario.rol = rolFormateado;
      }
    }

    if (password) usuario.password = password;

    if (usuario.rol === 'cajero') {
      if (ventanillaDefault !== undefined) {
        usuario.ventanillaDefault = ventanillaDefault ? parseInt(ventanillaDefault, 10) : null;
      }
    } else {
      usuario.ventanillaDefault = null;
    }

    await usuario.save();
    return res.json({ mensaje: 'Usuario actualizado correctamente' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const obtenerReportes = async (req, res) => {
  try {
    const totalUsuarios = await Usuario.count();
    const totalTurnos = await Turno.count();
    const turnosAtendiendo = await Turno.count({ where: { estado: 'atendiendo' } });
    const turnosEspera = await Turno.count({ where: { estado: 'espera' } });
    const turnosFinalizados = await Turno.count({ where: { estado: 'finalizado' } });
    const turnosGeneral = await Turno.count({ where: { tipo: 'general' } });
    const turnosPrioritario = await Turno.count({ where: { tipo: 'prioritario' } });

    return res.json({
      totalUsuarios,
      totalTurnos,
      turnosAtendiendo,
      turnosEspera,
      turnosFinalizados,
      turnosGeneral,
      turnosPrioritario,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

module.exports = {
  obtenerUsuarios,
  crearUsuario,
  resetearPassword,
  eliminarUsuario,
  actualizarUsuario,
  obtenerReportes,
};
