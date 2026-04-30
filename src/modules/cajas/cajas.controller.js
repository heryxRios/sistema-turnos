const Turno = require('../../database/models/Turno');

const llamarSiguiente = async (req, res) => {
  try {
    const { ventanilla, tipoFila } = req.body; // tipoFila: 'general', 'prioritario' o 'cualquiera'

    let query = { estado: 'espera' };
    if (tipoFila !== 'cualquiera') query.tipo = tipoFila;

    const proximoTurno = await Turno.findOne({
      where: query,
      order: [
        ['tipo', 'DESC'], // Prioriza 'prioritario' si tipoFila es 'cualquiera'
        ['createdAt', 'ASC']
      ]
    });

    if (!proximoTurno) return res.status(404).json({ mensaje: "No hay turnos en espera" });

    // Actualizar turno
    proximoTurno.estado = 'atendiendo';
    proximoTurno.ventanilla = ventanilla;
    await proximoTurno.save();

    // EMITIR EVENTO WEBSOCKET: Esto es lo que la pantalla de la sala escuchará
    req.app.get('io').emit('turno-llamado', {
      numero: proximoTurno.numero,
      ventanilla: ventanilla
    });

    res.json({ mensaje: "Llamando turno", turno: proximoTurno });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { llamarSiguiente };