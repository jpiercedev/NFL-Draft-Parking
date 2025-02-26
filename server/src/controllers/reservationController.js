const { Op } = require('sequelize');
const { Reservation } = require('../models');
const { sendEmail } = require('../services/emailService');
const QRCode = require('qrcode');

// Helper function to generate QR code data URL
const generateQRCodeDataURL = async (qrCode) => {
  try {
    return await QRCode.toDataURL(qrCode);
  } catch (error) {
    console.error('Error generating QR code:', error);
    return null;
  }
};

exports.getReservations = async (req, res) => {
  try {
    const { parkingLot, status, date, search } = req.query;
    const where = {};

    if (parkingLot) where.parkingLot = parkingLot;
    if (status) where.status = status;
    if (date) where.reservationDate = date;
    if (search) {
      where[Op.or] = [
        { customerName: { [Op.iLike]: `%${search}%` } },
        { customerEmail: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const reservations = await Reservation.findAll({
      where,
      order: [['reservationDate', 'DESC']],
    });

    res.json(reservations);
  } catch (error) {
    console.error('Error fetching reservations:', error);
    res.status(500).json({ error: 'Failed to fetch reservations' });
  }
};

exports.getReservationByQR = async (req, res) => {
  try {
    const { qrCode } = req.params;
    const reservation = await Reservation.findOne({ where: { qrCode } });
    
    if (!reservation) {
      return res.status(404).json({ error: 'Reservation not found' });
    }

    res.json(reservation);
  } catch (error) {
    console.error('Error fetching reservation:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.checkIn = async (req, res) => {
  try {
    const { id } = req.params;
    const reservation = await Reservation.findByPk(id);
    
    if (!reservation) {
      return res.status(404).json({ error: 'Reservation not found' });
    }

    if (reservation.status !== 'pending') {
      return res.status(400).json({ error: 'Reservation is not in pending status' });
    }

    await reservation.update({
      status: 'checked_in',
      checkInTime: new Date()
    });

    res.json(reservation);
  } catch (error) {
    console.error('Error checking in reservation:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.checkOut = async (req, res) => {
  try {
    const { id } = req.params;
    const reservation = await Reservation.findByPk(id);
    
    if (!reservation) {
      return res.status(404).json({ error: 'Reservation not found' });
    }

    if (reservation.status !== 'checked_in') {
      return res.status(400).json({ error: 'Reservation is not checked in' });
    }

    await reservation.update({
      status: 'checked_out',
      checkOutTime: new Date()
    });

    res.json(reservation);
  } catch (error) {
    console.error('Error checking out reservation:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getAllReservations = async (req, res) => {
  try {
    const { parkingLot, status, date, search } = req.query;
    const where = {};

    if (parkingLot) where.parkingLot = parkingLot;
    if (status) where.status = status;
    if (date) where.reservationDate = date;
    if (search) {
      where[Op.or] = [
        { customerName: { [Op.iLike]: `%${search}%` } },
        { customerEmail: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const reservations = await Reservation.findAll({
      where,
      order: [['reservationDate', 'DESC']],
    });

    // Generate QR code data URLs for each reservation
    const reservationsWithQR = await Promise.all(
      reservations.map(async (reservation) => {
        const plainReservation = reservation.get({ plain: true });
        plainReservation.qrCodeDataUrl = await generateQRCodeDataURL(plainReservation.qrCode);
        return plainReservation;
      })
    );

    res.json(reservationsWithQR);
  } catch (error) {
    console.error('Error fetching reservations:', error);
    res.status(500).json({ error: 'Failed to fetch reservations' });
  }
};

exports.getStats = async (req, res) => {
  try {
    const [totalReservations, checkedIn, checkedOut, pending] = await Promise.all([
      Reservation.count(),
      Reservation.count({ where: { status: 'checked_in' } }),
      Reservation.count({ where: { status: 'checked_out' } }),
      Reservation.count({ where: { status: 'pending' } })
    ]);

    const lombardiStats = await Reservation.count({
      where: {
        parkingLot: 'Lombardi',
        status: 'checked_in'
      }
    });

    const militaryStats = await Reservation.count({
      where: {
        parkingLot: 'Military',
        status: 'checked_in'
      }
    });

    res.json({
      totalReservations,
      checkedIn,
      checkedOut,
      pending,
      lotStats: {
        Lombardi: {
          total: 100, // Replace with actual capacity
          occupied: lombardiStats
        },
        Military: {
          total: 150, // Replace with actual capacity
          occupied: militaryStats
        }
      }
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
};

exports.getRecentReservations = async (req, res) => {
  try {
    const reservations = await Reservation.findAll({
      order: [['createdAt', 'DESC']],
      limit: 10
    });

    res.json(reservations);
  } catch (error) {
    console.error('Error fetching recent reservations:', error);
    res.status(500).json({ error: 'Failed to fetch recent reservations' });
  }
};
