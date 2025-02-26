const QRCode = require('qrcode');

class QRCodeService {
  /**
   * Generate a QR code for a reservation
   * @param {string} reservationId - The unique identifier for the reservation
   * @returns {Promise<string>} The QR code data URL
   */
  static async generateQRCode(reservationId) {
    try {
      // Generate a QR code as a data URL
      const qrCodeDataUrl = await QRCode.toDataURL(reservationId);
      return qrCodeDataUrl;
    } catch (error) {
      console.error('Error generating QR code:', error);
      throw error;
    }
  }

  /**
   * Generate a QR code as a Buffer
   * @param {string} reservationId - The unique identifier for the reservation
   * @returns {Promise<Buffer>} The QR code as a buffer
   */
  static async generateQRCodeBuffer(reservationId) {
    try {
      // Generate a QR code as a buffer
      const qrCodeBuffer = await QRCode.toBuffer(reservationId);
      return qrCodeBuffer;
    } catch (error) {
      console.error('Error generating QR code buffer:', error);
      throw error;
    }
  }

  /**
   * Generate a simple string QR code
   * @param {string} reservationId - The unique identifier for the reservation
   * @returns {Promise<string>} The QR code as a string
   */
  static async generateQRCodeString(reservationId) {
    try {
      // Generate a QR code as a string
      const qrCodeString = await QRCode.toString(reservationId);
      return qrCodeString;
    } catch (error) {
      console.error('Error generating QR code string:', error);
      throw error;
    }
  }
}

module.exports = QRCodeService;
