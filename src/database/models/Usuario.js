
const { DataTypes } = require('sequelize');
const { sequelize } = require('../connection');
const bcrypt = require('bcryptjs');

const Usuario = sequelize.define('Usuario', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  username: { 
    type: DataTypes.STRING, 
    unique: true, 
    allowNull: false 
  },
  password: { 
    type: DataTypes.STRING, 
    allowNull: false 
  },
  rol: { 
    type: DataTypes.ENUM('admin', 'cajero', 'seguridad', 'atencion'), 
    defaultValue: 'cajero' 
  },
  ventanillaDefault: {
    type: DataTypes.INTEGER,
    allowNull: true
  }
}, {
  hooks: {
    beforeCreate: async (user) => {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(user.password, salt);
    },
    beforeUpdate: async (user) => {
      if (user.changed('password')) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      }
    }
  }
});

// Método para verificar contraseñas en el login
Usuario.prototype.validPassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

module.exports = Usuario;
/**
const { DataTypes } = require('sequelize');
const { sequelize } = require('../connection');
const bcrypt = require('bcryptjs');

const Usuario = sequelize.define('Usuario', {
  username: { type: DataTypes.STRING, unique: true, allowNull: false },
  password: { type: DataTypes.STRING, allowNull: false },
  // Añade esto a los campos del modelo Usuario
  ventanillaDefault: { type: DataTypes.INTEGER, allowNull: true},
  rol: { 
    type: DataTypes.ENUM('admin', 'cajero', 'seguridad', 'atencion'), 
    defaultValue: 'cajero' 
  }
}, {
  hooks: {
    beforeCreate: async (user) => {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(user.password, salt);
    }
  }
});

// Método para comparar contraseñas
Usuario.prototype.validPassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

module.exports = Usuario;
**/