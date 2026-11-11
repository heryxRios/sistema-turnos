const Usuario = require('../../database/models/Usuario');
const jwt = require('jsonwebtoken');

const SECRET = process.env.JWT_SECRET || 'cambiar-este-secreto-en-produccion';

const login = async (req, res) => {
  const { username, password } = req.body;

  try {
    const usuario = await Usuario.findOne({ where: { username } });

    if (!usuario || !(await usuario.validPassword(password))) {
      return res.status(401).json({ mensaje: 'Usuario o contraseña incorrectos' });
    }

    const token = jwt.sign(
      { id: usuario.id, rol: usuario.rol, username: usuario.username },
      SECRET,
      { expiresIn: '8h' }
    );

    return res.json({ mensaje: 'Bienvenido', token, rol: usuario.rol });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const registrar = async (req, res) => {
  try {
    const { username, password, rol } = req.body;

    const nuevoUsuario = await Usuario.create({
      username,
      password,
      rol: rol || 'cajero',
    });

    return res.json({ mensaje: 'Usuario creado', id: nuevoUsuario.id });
  } catch (error) {
    return res.status(400).json({ error: 'El usuario ya existe o los datos son inválidos' });
  }
};

module.exports = { login, registrar };
