const express = require('express');
const router = express.Router();
const reservationController = require('../controllers/reservationController');
const auth = require('../middleware/auth');

// Apply auth middleware to all routes
router.use(auth);

// Get all reservations with optional filters
router.get('/', reservationController.getAllReservations);

// Get dashboard stats
router.get('/stats', reservationController.getStats);

// Get recent reservations
router.get('/recent', reservationController.getRecentReservations);

// Get reservation by QR code
router.get('/qr/:qrCode', reservationController.getReservationByQR);

// Log check-in or check-out
router.post('/:id/log', reservationController.logCheckInOut);

// Get check-in logs for a reservation
router.get('/:id/logs', reservationController.getCheckInLogs);

// Update a reservation
router.put('/:id', auth, reservationController.updateReservation);

module.exports = router;
