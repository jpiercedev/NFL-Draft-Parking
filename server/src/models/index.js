const { Sequelize } = require('sequelize');
const defineReservation = require('./Reservation');
const defineCheckInLog = require('./CheckInLog');

// Initialize Sequelize with database configuration
const sequelize = new Sequelize(process.env.DATABASE_URL || 'postgres://localhost:5432/parking_app', {
  dialect: 'postgres',
  logging: console.log
});

// Initialize models
const Reservation = defineReservation(sequelize);
const CheckInLog = defineCheckInLog(sequelize);

// Define associations
Reservation.hasMany(CheckInLog, {
  foreignKey: 'reservationId',
  as: 'checkInLogs'
});

CheckInLog.belongsTo(Reservation, {
  foreignKey: 'reservationId',
  as: 'reservation'
});

const models = {
  Reservation,
  CheckInLog
};

// Export the sequelize instance and models
module.exports = {
  sequelize,
  ...models
};
