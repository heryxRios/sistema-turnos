const Turno = require('../../database/models/Turno');
const { Op } = require('sequelize');

const obtenerEstadisticas = async (req, res) => {
  try {
    // 1. Total de turnos hoy
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const totalHoy = await Turno.count({ where: { createdAt: { [Op.gte]: hoy } } });

    // 2. Turnos por estado
    const porEstado = await Turno.findAll({
      attributes: ['estado', [Turno.sequelize.fn('COUNT', 'id'), 'total']],
      group: ['estado']
    });

    // 3. Eficiencia por ventanilla (Cuantos atendió cada una)
    const porVentanilla = await Turno.findAll({
      attributes: ['ventanilla', [Turno.sequelize.fn('COUNT', 'id'), 'total']],
      where: { estado: 'finalizado' },
      group: ['ventanilla']
    });

    res.json({ totalHoy, porEstado, porVentanilla });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { obtenerEstadisticas };