const { sequelize } = require('./connection');
const Usuario = require('./models/Usuario');

const dbConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexión a SQLite realizada correctamente.');

    await sequelize.sync({ force: false });

    const totalUsuarios = await Usuario.count();
    if (totalUsuarios === 0) {
      await Usuario.create({
        username: 'admin',
        password: 'admin123',
        rol: 'admin',
      });
      console.log('👤 Usuario administrador creado: admin / admin123');
    }

    console.log('✅ Base de datos sincronizada.');
  } catch (error) {
    console.error('❌ Error al conectar la base de datos:', error.message);
    throw error;
  }
};

module.exports = { dbConnection };
