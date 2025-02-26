const { Reservation } = require('../models');
const QRCode = require('qrcode');
const { v4: uuidv4 } = require('uuid');

exports.handleOrderWebhook = async (req, res) => {
  console.log('Received Webflow webhook:', req.body);
  
  try {
    const { 
      orderId,
      customerName,
      customerEmail,
      vehicleMake,
      vehicleModel,
      vehicleColor,
      parkingLot,
      reservationDate
    } = req.body;

    // Validate required fields
    if (!orderId || !customerName || !customerEmail || !parkingLot || !reservationDate) {
      console.error('Missing required fields:', req.body);
      return res.status(400).json({ 
        error: 'Missing required fields',
        required: ['orderId', 'customerName', 'customerEmail', 'parkingLot', 'reservationDate']
      });
    }

    // Generate a unique QR code identifier
    const qrCode = `RES-${orderId}-${Date.now()}`;
    console.log('Generated QR code:', qrCode);

    // Create the reservation
    const reservation = await Reservation.create({
      id: uuidv4(),
      webflowOrderId: orderId,
      customerName,
      customerEmail,
      vehicleMake,
      vehicleModel,
      vehicleColor,
      parkingLot,
      reservationDate: new Date(reservationDate),
      qrCode,
      status: 'pending'
    });

    console.log('Created reservation:', reservation.id);

    // Generate QR code data URL
    const qrCodeDataUrl = await QRCode.toDataURL(qrCode);
    console.log('Generated QR code data URL');

    // For now, just log the email that would be sent
    console.log('Would send email to:', customerEmail, {
      subject: 'Parking Reservation Confirmation',
      qrCode: qrCodeDataUrl,
      reservationDetails: {
        customerName,
        reservationDate,
        parkingLot,
        vehicleInfo: `${vehicleMake} ${vehicleModel} (${vehicleColor})`
      }
    });

    res.status(201).json({
      message: 'Reservation created successfully',
      reservation: {
        id: reservation.id,
        qrCode,
        customerName,
        customerEmail,
        parkingLot,
        reservationDate,
        status: reservation.status
      },
      qrCodeDataUrl
    });
  } catch (error) {
    console.error('Error processing Webflow order:', error);
    res.status(500).json({ 
      error: 'Failed to process order',
      details: error.message
    });
  }
};
