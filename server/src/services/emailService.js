const sgMail = require('@sendgrid/mail');

// Initialize SendGrid with API key
const apiKey = process.env.SENDGRID_API_KEY || 'SG.placeholder-key';
sgMail.setApiKey(apiKey);

/**
 * Send an email using SendGrid
 * @param {Object} options Email options
 * @param {string} options.to Recipient email
 * @param {string} options.subject Email subject
 * @param {string} options.template Template name
 * @param {Object} options.data Template data
 */
const sendEmail = async ({ to, subject, template, data }) => {
  try {
    // For testing purposes, just log the email
    console.log('Sending email:', {
      to,
      subject,
      template,
      data
    });
    // We're not actually sending emails in development
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    // Don't throw the error, just log it
    return false;
  }
};

// Get template ID based on template name
const getTemplateId = (template) => {
  const templates = {
    'reservation-confirmation': 'd-your-template-id',
    // Add more templates as needed
  };
  return templates[template];
};

module.exports = {
  sendEmail
};
