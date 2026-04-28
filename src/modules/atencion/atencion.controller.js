const Turno = require('../../database/models/Turno');

// Obtener todos los turnos que están en espera o siendo atendidos
const obtenerTurnos = async (req, res) => {
  try {
    const turnos = await Turno.findAll({
      order: [['createdAt', 'ASC']] // Los más antiguos primero
    });
    res.json(turnos);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener turnos', detalle: error.message });
  }
};

// Crear un nuevo turno (ejemplo: cuando un cliente llega y saca un ticket)
const crearTurno = async (req, res) => {
  try {
    const { cliente } = req.body;
    
    // Lógica simple para generar un número de turno: T-01, T-02...
    const cuentaTurnos = await Turno.count();
    const nuevoNumero = `T-${(cuentaTurnos + 1).toString().padStart(2, '0')}`;

    const nuevoTurno = await Turno.create({
      numero: nuevoNumero,
      cliente: cliente || 'Anónimo',
      estado: 'espera'
    });

    res.status(201).json({
      mensaje: "Turno generado con éxito",
      turno: nuevoTurno
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al crear turno', detalle: error.message });
  }
};

module.exports = { obtenerTurnos, crearTurno };