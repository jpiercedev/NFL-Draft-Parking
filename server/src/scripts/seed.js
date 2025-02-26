require('dotenv').config();
const seedReservations = require('../seeders/20250226_sample_reservations');

async function seedDatabase() {
  try {
    await seedReservations();
    console.log('Database seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();
