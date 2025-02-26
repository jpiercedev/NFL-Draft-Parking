const { Sequelize } = require('sequelize');
const defineReservation = require('./Reservation');

// Initialize Sequelize with database configuration
const sequelize = new Sequelize(process.env.DATABASE_URL || 'postgres://localhost:5432/parking_app', {
  dialect: 'postgres',
  logging: console.log
});

// Initialize models
const Reservation = defineReservation(sequelize);

// Define associations here if needed
// Example: Reservation.belongsTo(User);

const models = {
  Reservation
};

// Export the sequelize instance and models
module.exports = {
  sequelize,
  ...models
};
