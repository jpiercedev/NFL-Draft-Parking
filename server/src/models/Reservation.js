'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Reservation extends Model {
    static associate(models) {
      Reservation.hasMany(models.CheckInLog, {
        foreignKey: 'reservationId',
        as: 'checkInLogs'
      });
    }
  }

  Reservation.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    webflowOrderId: {
      type: DataTypes.STRING,
      allowNull: false
    },
    customerName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    customerEmail: {
      type: DataTypes.STRING,
      allowNull: false
    },
    vehicleMake: {
      type: DataTypes.STRING,
      allowNull: false
    },
    vehicleModel: {
      type: DataTypes.STRING,
      allowNull: false
    },
    vehicleColor: {
      type: DataTypes.STRING,
      allowNull: false
    },
    parkingLot: {
      type: DataTypes.STRING,
      allowNull: false
    },
    qrCode: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false
    },
    reservationDate: {
      type: DataTypes.DATE,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'Reservation',
  });

  return Reservation;
};
