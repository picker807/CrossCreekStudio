// server/routes/email.js
const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
require('dotenv').config();

const { EMAIL_USER, EMAIL_PASS } = process.env;

// Configure your email transporter
let transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS
  }
});

router.post('/confirm', async (req, res) => {
  const { user, eventName, eventDate } = req.body;
  try {
    await transporter.sendMail({
      from: `"Cross Creek Creates" <${EMAIL_USER}>`,
      to: `${user.firstName} ${user.lastName} <${user.email}>`,
      subject: `You are registered for ${eventName}`,
      text: `${user.firstName},\n\nThank you for registering for ${eventName} on ${eventDate}. We look forward to seeing you!`,
      html: `<p>${user.firstName},</p>
             <p>Thank you for registering for <strong>${eventName}</strong> on ${eventDate}.<br>We look forward to seeing you!</p>
             <br><p>An email receipt should go here</p>
             <p> and we really should include more event data<p>`
    });

    res.status(200).json({ message: 'Confirmation email sent successfully' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ message: 'Failed to send confirmation email' });
  }
});

module.exports = router;