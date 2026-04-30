const Turno = require('../../database/models/Turno');

const crearTurno = async (req, res) => {
  try {
    const { cliente, tipo } = req.body; // tipo: 'general' o 'prioritario'
    const prefijo = tipo === 'prioritario' ? 'P' : 'G';

    // Buscar el último número generado para ese tipo hoy
    const ultimoTurno = await Turno.findOne({
      where: { tipo },
      order: [['createdAt', 'DESC']]
    });

    let siguienteNumero = 1;
    if (ultimoTurno) {
      // Extraer número del string (ej: G-05 -> 5)
      siguienteNumero = parseInt(ultimoTurno.numero.split('-')[1]) + 1;
    }

    const numeroFormateado = `${prefijo}-${siguienteNumero.toString().padStart(2, '0')}`;

    const nuevoTurno = await Turno.create({
      numero: numeroFormateado,
      cliente,
      tipo
    });

    // Notificar por WebSocket que hay un nuevo turno en espera
    req.app.get('io').emit('nuevo-turno-generado', nuevoTurno);

    res.status(201).json(nuevoTurno);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const obtenerHistorial = async (req, res) => {
  const historial = await Turno.findAll({ order: [['createdAt', 'DESC']], limit: 10 });
  res.json(historial);
};

module.exports = { crearTurno, obtenerHistorial };