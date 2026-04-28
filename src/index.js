const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware para entender JSON (importante para los turnos después)
app.use(express.json());

// Ruta principal
app.get('/', (req, res) => {
  res.send({
    mensaje: '¡Servidor de Sistema de Turnos funcionando!',
    estado: 'Online',
    fecha: new Date()
  });
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en el puerto ${PORT}`);
  console.log(`Presiona Ctrl + C para detenerlo`);
});