const express = require('express');
const router = express.Router();
const reservationController = require('../controllers/reservationController');
const auth = require('../middleware/auth');

// Apply auth middleware to all routes
router.use(auth);

// Get all reservations with optional filters
router.get('/', reservationController.getAllReservations);

// Get reservation by QR code
router.get('/qr/:qrCode', reservationController.getReservationByQR);

// Check in a reservation
router.post('/:id/check-in', reservationController.checkIn);

// Check out a reservation
router.post('/:id/check-out', reservationController.checkOut);

module.exports = router;
