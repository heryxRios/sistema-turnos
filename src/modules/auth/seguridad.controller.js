const Turno = require('../../database/models/Turno');

const monitorearFila = async (req, res) => {
  try {
    const enEspera = await Turno.findAll({
      where: { estado: 'espera' },
      order: [['tipo', 'DESC'], ['createdAt', 'ASC']]
    });
    res.json(enEspera);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { monitorearFila };