const { Sequelize } = require('sequelize');
const path = require('path');

// Configuración de SQLite
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, 'database.sqlite'), // El archivo se creará aquí
  logging: false // Para no llenar la consola de logs de SQL
});

const dbConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexión a SQLite establecida con éxito.');
    
    // Sincronizar modelos (Crea las tablas si no existen)
    await sequelize.sync({ force: false });
    console.log('✅ Base de datos sincronizada.');
  } catch (error) {
    console.error('❌ No se pudo conectar a la base de datos:', error);
  }
};

module.exports = { sequelize, dbConnection };