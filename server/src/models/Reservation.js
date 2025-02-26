const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Reservation = sequelize.define('Reservation', {
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
      type: DataTypes.ENUM('Lombardi', 'Military'),
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('pending', 'checked_in', 'checked_out'),
      defaultValue: 'pending'
    },
    qrCode: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false
    },
    reservationDate: {
      type: DataTypes.DATE,
      allowNull: false
    },
    checkInTime: {
      type: DataTypes.DATE
    },
    checkOutTime: {
      type: DataTypes.DATE
    }
  });

  return Reservation;
};
