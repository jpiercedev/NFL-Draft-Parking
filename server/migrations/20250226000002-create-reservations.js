'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Reservations', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      webflowOrderId: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      customerName: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      customerEmail: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      customerPhone: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      vehicleMake: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      vehicleModel: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      vehicleColor: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      parkingLot: {
        type: Sequelize.ENUM('Lombardi', 'Military'),
        allowNull: false,
      },
      reservationDate: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      qrCode: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM('pending', 'checked_in', 'checked_out', 'cancelled'),
        defaultValue: 'pending',
      },
      checkInTime: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      checkOutTime: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Reservations');
  },
};
