const Usuario = require('../../database/models/Usuario');
const jwt = require('jsonwebtoken');
const SECRET = 'MiClaveSecretaSuperSegura2026';

const login = async (req, res) => {
  const { username, password } = req.body;
  try {
    const usuario = await Usuario.findOne({ where: { username } });
    if (!usuario || !(await usuario.validPassword(password))) {
      return res.status(401).json({ mensaje: "Usuario o contraseña incorrectos" });
    }

    const token = jwt.sign(
      { id: usuario.id, rol: usuario.rol, username: usuario.username },
      SECRET,
      { expiresIn: '8h' }
    );

    res.json({ mensaje: "Bienvenido", token, rol: usuario.rol });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const registrar = async (req, res) => {
  try {
    const nuevoUsuario = await Usuario.create(req.body);
    res.json({ mensaje: "Usuario creado", id: nuevoUsuario.id });
  } catch (error) {
    res.status(400).json({ error: "El usuario ya existe" });
  }
};

module.exports = { login, registrar };