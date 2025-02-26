'use strict';
const bcrypt = require('bcryptjs');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const password = await bcrypt.hash('admin123', 10);
    await queryInterface.bulkInsert('Users', [{
      id: '550e8400-e29b-41d4-a716-446655440000',
      email: 'admin@example.com',
      password: password,
      name: 'Admin User',
      role: 'admin',
      createdAt: new Date(),
      updatedAt: new Date()
    }]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Users', null, {});
  }
};
