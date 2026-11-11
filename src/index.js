const http = require('http');
const { Server } = require('socket.io');
const { app, sequelize } = require('./app');
const { dbConnection } = require('./database/dbInit');

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    await dbConnection();

    const server = http.createServer(app);
    const io = new Server(server, {
      cors: { origin: '*' },
    });

    app.set('io', io);

    io.on('connection', (socket) => {
      console.log('📱 Cliente conectado al WebSocket');
      socket.on('disconnect', () => {
        console.log('🔌 Cliente desconectado');
      });
    });

    server.listen(PORT, () => {
      console.log(`🚀 Servidor ejecutándose en el puerto ${PORT}`);
    });
  } catch (error) {
    console.error('❌ No se pudo iniciar el servidor:', error.message);
    process.exit(1);
  }
};

startServer();

module.exports = { app, sequelize };
