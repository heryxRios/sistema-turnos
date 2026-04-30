const jwt = require('jsonwebtoken');
const SECRET = 'MiClaveSecretaSuperSegura2026'; // En producción esto va en un archivo .env

const verificarToken = (req, res, next) => {
  const token = req.headers['authorization'];
  if (!token) return res.status(403).json({ mensaje: "No se proporcionó un token" });

  try {
    const decoded = jwt.verify(token.split(" ")[1], SECRET);
    req.usuario = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ mensaje: "Token inválido o expirado" });
  }
};

const esRol = (rolesPermitidos) => {
  return (req, res, next) => {
    if (!rolesPermitidos.includes(req.usuario.rol)) {
      return res.status(403).json({ mensaje: "No tienes permiso para realizar esta acción" });
    }
    next();
  };
};

module.exports = { verificarToken, esRol };