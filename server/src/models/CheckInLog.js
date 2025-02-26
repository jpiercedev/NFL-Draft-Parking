'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class CheckInLog extends Model {
    static associate(models) {
      CheckInLog.belongsTo(models.Reservation, {
        foreignKey: 'reservationId',
        as: 'reservation'
      });
    }
  }

  CheckInLog.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    reservationId: {
      type: DataTypes.UUID,
      allowNull: false
    },
    type: {
      type: DataTypes.ENUM('check_in', 'check_out'),
      allowNull: false
    },
    timestamp: {
      type: DataTypes.DATE,
      allowNull: false
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'CheckInLog',
  });

  return CheckInLog;
};
