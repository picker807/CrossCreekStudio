// server/routes/email.js
const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const fs = require('fs').promises;
const handlebars = require('handlebars');
const path = require('path');
require('dotenv').config();

const { EMAIL_USER, EMAIL_PASS, EMAIL_RECEIVE1, EMAIL_RECEIVE2 } = process.env;

// Configure the email transporter
let transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS
  }
});

// Load and compile the email template
let emailTemplate;
fs.readFile(path.join(__dirname, '../models/emailTemplateReminder.html'), 'utf8')
  .then(template => {
    emailTemplate = handlebars.compile(template);
    console.log('Email template loaded and compiled successfully');
  })
  .catch(err => console.error('Error loading email template:', err));

  const ensureTemplateLoaded = (req, res, next) => {
    if (!emailTemplate) {
      return res.status(500).json({ message: 'Email template not loaded' });
    }
    next();
  };

router.post('/preview', ensureTemplateLoaded, async (req, res) => {
  const { subject, message, eventDetails } = req.body;
  console.log('Preview Data:', { subject, message, eventDetails });
  try {
    const html = emailTemplate({
      subject,
      message,
      eventDetails,
      logoUrl: 'https://example.com/logo.png' // Replace with your actual logo URL
    });
    console.log('Generated HTML:', html);
    res.status(200).json({ html });
  } catch (error) {
    console.error('Error generating email preview:', error);
    res.status(500).json({ message: 'Failed to generate email preview' });
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

router.post('/send', ensureTemplateLoaded, async (req, res) => {
  const { users, subject, message, eventDetails } = req.body;
  console.log('Send Data:', { users, subject, message, eventDetails });

  try {
    const sendEmailPromises = users.map(async (user) => {
      const personalizedMessage = `Dear ${user.firstName},\n\n${message}`;

      const html = emailTemplate({
        subject,
        message: personalizedMessage,
        eventDetails,
        logoUrl: 'https://example.com/logo.png' // Replace with your actual logo URL
      });

      const mailOptions = {
        from: `"Cross Creek Creates" <${EMAIL_USER}>`,
        to: user.email,
        subject: subject,
        html: html
      };

      return transporter.sendMail(mailOptions);
    });

    await Promise.all(sendEmailPromises);
    res.status(200).json({ message: 'Emails sent successfully' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ message: 'Failed to send emails' });
  }
});

router.post('/contact', async (req, res) => {
  const { name, email, phone, subject, message, contactMethod } = req.body;
  try {
    await transporter.sendMail({
      from: `"Contact at Cross Creek Studio" <${EMAIL_USER}>`,
      to: `${EMAIL_USER}, ${EMAIL_RECEIVE1}, ${EMAIL_RECEIVE2} `,
      replyTo: `${name} <${email}>`,
      subject: `Contact message from ${name} --- ${subject}`,
      text: `Name: ${name} \n
            Preferred Contact Method: ${contactMethod} \n
            email: ${email} \n
            phone: ${phone} \n
            subject: ${subject} \n
            message: ${message}`,
      html:  `<p>Name: ${name}</p>
              <p>Preferred Contact Method: ${contactMethod}</p>
              <p>email: ${email}</p>
              <p>phone: ${phone}</p>
              <p>subject: ${subject}</p>
              <p>message: ${message}</p>`
    });

    res.status(200).json({ message: 'Contact email sent successfully' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ message: 'Failed to send contact email' });
  }
});

module.exports = router;