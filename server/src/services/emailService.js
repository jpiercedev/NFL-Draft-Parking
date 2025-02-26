const sgMail = require('@sendgrid/mail');

// Initialize SendGrid with API key
sgMail.setApiKey(process.env.SENDGRID_API_KEY || 'your-sendgrid-api-key');

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

    // In production, uncomment this to actually send emails
    /*
    const msg = {
      to,
      from: process.env.SENDGRID_FROM_EMAIL || 'your-verified-sender@example.com',
      subject,
      templateId: getTemplateId(template),
      dynamicTemplateData: data
    };
    await sgMail.send(msg);
    */
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
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
