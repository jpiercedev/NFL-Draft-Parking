'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.removeColumn('Reservations', 'status');
    await queryInterface.removeColumn('Reservations', 'checkInTime');
    await queryInterface.removeColumn('Reservations', 'checkOutTime');
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.addColumn('Reservations', 'status', {
      type: Sequelize.ENUM('pending', 'checked_in', 'checked_out'),
      defaultValue: 'pending'
    });
    await queryInterface.addColumn('Reservations', 'checkInTime', {
      type: Sequelize.DATE,
      allowNull: true
    });
    await queryInterface.addColumn('Reservations', 'checkOutTime', {
      type: Sequelize.DATE,
      allowNull: true
    });
  }
};
