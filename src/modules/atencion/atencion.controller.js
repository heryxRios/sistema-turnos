const Turno = require('../../database/models/Turno');

const crearTurno = async (req, res) => {
  try {
    const { cliente, tipo } = req.body;
    const tipoNormalizado = tipo === 'prioritario' ? 'prioritario' : 'general';

    const ultimoTurno = await Turno.findOne({
      where: { tipo: tipoNormalizado },
      order: [['createdAt', 'DESC']],
    });

    let siguienteNumero = 1;
    if (ultimoTurno && ultimoTurno.numero) {
      const match = ultimoTurno.numero.match(/(\d+)$/);
      if (match) {
        siguienteNumero = Number(match[1]) + 1;
      }
    }

    const prefijo = tipoNormalizado === 'prioritario' ? 'P' : 'G';
    const numeroFormateado = `${prefijo}-${String(siguienteNumero).padStart(2, '0')}`;

    const nuevoTurno = await Turno.create({
      numero: numeroFormateado,
      cliente: cliente || 'Anónimo',
      tipo: tipoNormalizado,
      estado: 'espera',
    });

    req.app.get('io')?.emit('nuevo-turno-generado', nuevoTurno);

    return res.status(201).json(nuevoTurno);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const obtenerHistorial = async (req, res) => {
  try {
    const historial = await Turno.findAll({
      order: [['createdAt', 'DESC']],
      limit: 10,
    });
    return res.json(historial);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const reiniciarTurnos = async (req, res) => {
  try {
    await Turno.destroy({ where: {}, truncate: true });

    req.app.get('io')?.emit('nuevo-turno-generado');
    req.app.get('io')?.emit('turno-llamado', { numero: '---', ventanilla: '--' });

    return res.json({ mensaje: 'Sistema reiniciado con éxito. Fila en 0.' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const regresarAFila = async (req, res) => {
  try {
    const { id } = req.params;

    const turno = await Turno.findByPk(id);
    if (!turno) {
      return res.status(404).json({ error: 'Turno no encontrado' });
    }

    turno.estado = 'espera';
    turno.ventanilla = null;
    await turno.save();

    const io = req.app.get('io');
    io?.emit('nuevo-turno-generado');
    io?.emit('turno-llamado', { numero: '---', ventanilla: '--' });

    return res.json({ mensaje: 'Turno regresado a la fila de espera con éxito', turno });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

module.exports = {
  crearTurno,
  obtenerHistorial,
  reiniciarTurnos,
  regresarAFila,
};
