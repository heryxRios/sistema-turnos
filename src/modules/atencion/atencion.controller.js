// Lógica para manejar los turnos en atención
const obtenerTurnos = (req, res) => {
  res.json({ mensaje: "Lista de turnos para atención" });
};

const crearTurno = (req, res) => {
  res.json({ mensaje: "Nuevo turno generado con éxito" });
};

module.exports = { obtenerTurnos, crearTurno };