const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

const sendEmail = async ({ to, bcc, subject, text, html }) => {
  try {
    if (!process.env.SMTP_USER) {
      console.log(`[Email Mock System]: An ${to} | Betreff: ${subject}`);
      return true;
    }

    await transporter.sendMail({
      from: `"HPV Trainer" <${process.env.SMTP_USER}>`,
      to,
      bcc,
      subject,
      text,
      html
    });
    return true;
  } catch (err) {
    console.error('Email Dispatch Error:', err);
    return false;
  }
};

module.exports = { sendEmail };
