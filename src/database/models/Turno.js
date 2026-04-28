const { DataTypes } = require('sequelize');
const { sequelize } = require('../connection');

const Turno = sequelize.define('Turno', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  numero: {
    type: DataTypes.STRING,
    allowNull: false
  },
  cliente: {
    type: DataTypes.STRING,
    allowNull: false
  },
  estado: {
    type: DataTypes.ENUM('espera', 'atendiendo', 'finalizado'),
    defaultValue: 'espera'
  },
  caja: {
    type: DataTypes.INTEGER,
    allowNull: true
  }
});

module.exports = Turno;