const { sequelize } = require('./connection');
const Usuario = require('./models/Usuario');
const Turno = require('./models/Turno');

const dbConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexión a SQLite establecida con éxito.');
    
    // Sincronizar modelos
    await sequelize.sync({ force: false });

    // Crear superusuario inicial
    const count = await Usuario.count();
    if (count === 0) {
      await Usuario.create({
        username: 'admin',
        password: 'admin123',
        rol: 'admin'
      });
      console.log('👤 Superusuario creado (admin/admin123)');
    }
    console.log('✅ Base de datos sincronizada.');
  } catch (error) {
    console.error('❌ Error al conectar DB:', error);
  }
};

module.exports = { dbConnection };