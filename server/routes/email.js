const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const fs = require('fs').promises;
const handlebars = require('handlebars');
const dateFormat = require('handlebars-dateformat');
const path = require('path');
require('dotenv').config();
const moment = require('moment-timezone');

handlebars.registerHelper('formatDateWithTimeZone', function(date, format, timeZone) {
  return moment(date).tz(timeZone).format(format);
});
handlebars.registerHelper('dateFormat', dateFormat);

const { EMAIL_USER, EMAIL_PASS, EMAIL_RECEIVE1, EMAIL_RECEIVE2 } = process.env;

// Configure the email transporter
let transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS
  }
});

async function registerPartials() {
  const header = await fs.readFile(path.join(__dirname, '../models/templates', 'header.hbs'), 'utf8');
  const footer = await fs.readFile(path.join(__dirname, '../models/templates', 'footer.hbs'), 'utf8');
  handlebars.registerPartial('header', header);
  handlebars.registerPartial('footer', footer);
}

registerPartials().catch(err => console.error('Error registering partials:', err));

// Function to load and compile a template
async function loadTemplate(templateName, data) {
  const filePath = path.join(__dirname, '../models/templates', `${templateName}.hbs`);
  const templateContent = await fs.readFile(filePath, 'utf8');
  const template = handlebars.compile(templateContent);
  return template(data);
}

// Middleware to ensure the template exists
const ensureTemplateExists = async (req, res, next) => {
  console.log("req.body: ", req.body);
  const templateType = req.body.templateType || req.body.emailData?.templateType;
  try {
    const filePath = path.join(__dirname, '../models/templates', `${templateType}.hbs`);
    await fs.access(filePath);
    next();
  } catch (error) {
    res.status(404).json({ message: 'Template not found' });
  }
};

// Endpoint for sending emails
router.post('/send', ensureTemplateExists, async (req, res) => {
  const { recipients, subject, templateType, templateData } = req.body; // Accessing from emailData
  //console.log('Send Data:', { recipients, subject, templateType, templateData });

  let finalRecipients = recipients;
  let mailOptions = {
    from: `"Cross Creek Studio" <${EMAIL_USER}>`,
    subject: subject
  };

  try {
    const html = await loadTemplate(templateType, templateData);

    if (templateType === 'contact') {
      // For contact template, send a single email to all recipients
      finalRecipients = [EMAIL_RECEIVE1, EMAIL_RECEIVE2, EMAIL_USER].filter(Boolean);
      mailOptions = {
        ...mailOptions,
        to: finalRecipients.join(', '), // Join all recipients for a single email
        replyTo: `${templateData.name} <${templateData.email}>`,
        html: html
      };

      await transporter.sendMail(mailOptions);
    } else {
      // For all other templates, send individual emails
      const sendEmailPromises = finalRecipients.map(async (recipient) => {
        const options = {
          ...mailOptions,
          to: recipient,
          html: html
        };

        return transporter.sendMail(options);
      });

      await Promise.all(sendEmailPromises);
    }

    res.status(200).json({ message: 'Emails sent successfully' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ message: 'Failed to send emails' });
  }
});

// Endpoint for previewing emails
router.post('/preview', ensureTemplateExists, async (req, res) => {
  const { subject, templateType, templateData } = req.body.emailData; 
  //console.log('Preview Data:', { subject, templateType, templateData });

  try {
    const html = await loadTemplate(templateType, templateData);
    //console.log('Generated HTML:', html);
    res.status(200).json({ html });
  } catch (error) {
    console.error('Error generating email preview:', error);
    res.status(500).json({ message: 'Failed to generate email preview' });
  }
});

module.exports = router;