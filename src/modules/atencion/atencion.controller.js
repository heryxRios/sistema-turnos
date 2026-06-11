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

// Añade esta función en src/modules/atencion/atencion.controller.js

const reiniciarTurnos = async (req, res) => {
  try {
    // Borra todos los registros de la tabla de Turnos
    await Turno.destroy({ where: {}, truncate: true });
    
    // Notifica de inmediato a todas las pantallas conectadas (Cajas, Visor, Guardia)
    req.app.get('io').emit('nuevo-turno-generado'); 
    req.app.get('io').emit('turno-llamado', { numero: '---', ventanilla: '--' });

    res.json({ mensaje: "Sistema reiniciado con éxito. Fila en 0." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Añade esta función en src/modules/atencion/atencion.controller.js

const regresarAFila = async (req, res) => {
  try {
    const { id } = req.params;
    
    const turno = await Turno.findByPk(id);
    if (!turno) {
      return res.status(404).json({ error: "Turno no encontrado" });
    }

    // Lo regresamos a pendiente y liberamos la ventanilla
    turno.status = 'pendiente';
    turno.ventanilla = null;
    await turno.save();

    // Notificamos por sockets a todo el sistema para actualizar contadores y tablas
    const io = req.app.get('io');
    io.emit('nuevo-turno-generado'); 
    io.emit('turno-llamado', { numero: '---', ventanilla: '--' }); // Limpia el visor si era el último

    res.json({ mensaje: "Turno regresado a la fila de espera con éxito", turno });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// No olvides exportarla al final del archivo:
module.exports = {
  crearTurno,
  obtenerHistorial,
  reiniciarTurnos,
  regresarAFila // <-- Agregada
};