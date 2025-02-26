const { Reservation } = require('../models');
const { v4: uuidv4 } = require('uuid');

const sampleReservations = [
  {
    id: uuidv4(),
    webflowOrderId: 'WF-ORDER-001',
    customerName: 'John Doe',
    customerEmail: 'john.doe@example.com',
    vehicleMake: 'Toyota',
    vehicleModel: 'Camry',
    vehicleColor: 'Silver',
    parkingLot: 'Lombardi',
    status: 'pending',
    qrCode: 'RES-001-2025',
    reservationDate: new Date('2025-02-26'),
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: uuidv4(),
    webflowOrderId: 'WF-ORDER-002',
    customerName: 'Jane Smith',
    customerEmail: 'jane.smith@example.com',
    vehicleMake: 'Honda',
    vehicleModel: 'CR-V',
    vehicleColor: 'Blue',
    parkingLot: 'Military',
    status: 'checked_in',
    qrCode: 'RES-002-2025',
    reservationDate: new Date('2025-02-26'),
    checkInTime: new Date('2025-02-26T09:00:00'),
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: uuidv4(),
    webflowOrderId: 'WF-ORDER-003',
    customerName: 'Bob Wilson',
    customerEmail: 'bob.wilson@example.com',
    vehicleMake: 'Tesla',
    vehicleModel: 'Model 3',
    vehicleColor: 'Red',
    parkingLot: 'Lombardi',
    status: 'checked_out',
    qrCode: 'RES-003-2025',
    reservationDate: new Date('2025-02-26'),
    checkInTime: new Date('2025-02-26T08:00:00'),
    checkOutTime: new Date('2025-02-26T17:00:00'),
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

async function seedReservations() {
  try {
    // Clear existing reservations
    await Reservation.destroy({ where: {} });
    
    // Insert sample reservations
    await Reservation.bulkCreate(sampleReservations);
    
    console.log('Sample reservations seeded successfully');
  } catch (error) {
    console.error('Error seeding reservations:', error);
  }
}

module.exports = seedReservations;
