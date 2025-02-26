const { Op } = require('sequelize');
const { Reservation, CheckInLog } = require('../models');
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
    const reservation = await Reservation.findOne({
      where: { qrCode },
      include: [{
        model: CheckInLog,
        as: 'checkInLogs',
        order: [['timestamp', 'DESC']]
      }]
    });
    
    if (!reservation) {
      return res.status(404).json({ error: 'Reservation not found' });
    }

    const reservationWithQR = reservation.get({ plain: true });
    reservationWithQR.qrCodeDataUrl = await generateQRCodeDataURL(qrCode);

    res.json(reservationWithQR);
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
    const { parkingLot, date, search } = req.query;
    const where = {};

    if (parkingLot) where.parkingLot = parkingLot;
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
      include: [{
        model: CheckInLog,
        as: 'checkInLogs',
        order: [['timestamp', 'DESC']]
      }]
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

exports.logCheckInOut = async (req, res) => {
  try {
    const { id } = req.params;
    const { type, notes } = req.body;

    if (!['check_in', 'check_out'].includes(type)) {
      return res.status(400).json({ error: 'Invalid check-in/out type' });
    }

    const reservation = await Reservation.findByPk(id);
    if (!reservation) {
      return res.status(404).json({ error: 'Reservation not found' });
    }

    const log = await CheckInLog.create({
      reservationId: id,
      type,
      timestamp: new Date(),
      notes
    });

    // Get updated reservation with all logs
    const updatedReservation = await Reservation.findByPk(id, {
      include: [{
        model: CheckInLog,
        as: 'checkInLogs',
        order: [['timestamp', 'DESC']]
      }]
    });

    res.json(updatedReservation);
  } catch (error) {
    console.error('Error logging check-in/out:', error);
    res.status(500).json({ error: 'Failed to log check-in/out' });
  }
};

exports.getCheckInLogs = async (req, res) => {
  try {
    const { id } = req.params;
    const logs = await CheckInLog.findAll({
      where: { reservationId: id },
      order: [['timestamp', 'DESC']]
    });
    res.json(logs);
  } catch (error) {
    console.error('Error fetching check-in logs:', error);
    res.status(500).json({ error: 'Failed to fetch check-in logs' });
  }
};

exports.getStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const totalReservations = await Reservation.count();
    
    const todayCheckIns = await CheckInLog.count({
      where: {
        type: 'check_in',
        timestamp: {
          [Op.gte]: today
        }
      }
    });

    const todayCheckOuts = await CheckInLog.count({
      where: {
        type: 'check_out',
        timestamp: {
          [Op.gte]: today
        }
      }
    });

    const stats = {
      totalReservations,
      todayCheckIns,
      todayCheckOuts
    };

    res.json(stats);
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
};

exports.getRecentReservations = async (req, res) => {
  try {
    const reservations = await Reservation.findAll({
      order: [['createdAt', 'DESC']],
      limit: 5,
      include: [{
        model: CheckInLog,
        as: 'checkInLogs',
        order: [['timestamp', 'DESC']]
      }]
    });
    res.json(reservations);
  } catch (error) {
    console.error('Error fetching recent reservations:', error);
    res.status(500).json({ error: 'Failed to fetch recent reservations' });
  }
};
