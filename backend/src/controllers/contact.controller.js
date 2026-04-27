import nodemailer from 'nodemailer';
import { env } from '../config/env.js';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const escapeHtml = (value = '') => String(value)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;');

const buildFieldErrors = ({ name = '', email = '', message = '' }) => {
  const errors = {};

  if (!String(name).trim()) {
    errors.name = 'Please enter your name';
  }

  if (!String(email).trim()) {
    errors.email = 'Please enter your email';
  } else if (!emailRegex.test(String(email).trim())) {
    errors.email = 'Enter a valid email address';
  }

  if (!String(message).trim()) {
    errors.message = 'Message cannot be empty';
  }

  return errors;
};

const requireMailConfig = () => {
  if (!env.SMTP_HOST || !env.SMTP_PORT || !env.SMTP_USER || !env.SMTP_PASS || !env.SUPPORT_EMAIL) {
    throw new Error('Mail service is not configured');
  }
};

const createTransporter = () => nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  secure: env.SMTP_SECURE,
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
  },
});

export const submitContactForm = async (req, res) => {
  const payload = {
    name: String(req.body?.name || '').trim(),
    email: String(req.body?.email || '').trim(),
    message: String(req.body?.message || '').trim(),
  };

  const fieldErrors = buildFieldErrors(payload);
  if (Object.keys(fieldErrors).length) {
    res.status(400).json({
      success: false,
      message: 'Please correct the highlighted fields.',
      errors: fieldErrors,
    });
    return;
  }

  try {
    requireMailConfig();
    const transporter = createTransporter();
    const fromAddress = env.SMTP_FROM_EMAIL || env.SMTP_USER;
    const fromName = env.SMTP_FROM_NAME || 'Purandar Prime Propertys';
    const safeName = escapeHtml(payload.name);
    const safeEmail = escapeHtml(payload.email);
    const safeMessage = escapeHtml(payload.message);

    await transporter.sendMail({
      from: `"${fromName}" <${fromAddress}>`,
      to: env.SUPPORT_EMAIL,
      replyTo: payload.email,
      subject: `New contact form message from ${payload.name}`,
      text: [
        'A new contact form submission was received.',
        '',
        `Name: ${payload.name}`,
        `Email: ${payload.email}`,
        '',
        'Message:',
        payload.message,
      ].join('\n'),
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1f2937;">
          <h2 style="margin-bottom: 12px;">New contact form message</h2>
          <p><strong>Name:</strong> ${safeName}</p>
          <p><strong>Email:</strong> ${safeEmail}</p>
          <p><strong>Message:</strong></p>
          <p style="white-space: pre-wrap;">${safeMessage}</p>
        </div>
      `,
    });

    if (env.CONTACT_AUTO_RESPONSE_ENABLED) {
      await transporter.sendMail({
        from: `"${fromName}" <${fromAddress}>`,
        to: payload.email,
        subject: 'We received your message',
        text: 'Thank you for contacting Purandar Prime Propertys. We will respond within 24 hours.',
        html: `
          <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1f2937;">
            <p>Thank you for contacting Purandar Prime Propertys. We will respond within 24 hours.</p>
          </div>
        `,
      });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Contact form submission failed:', error);
    res.status(500).json({
      success: false,
      message: 'Something went wrong. Please try again or contact support.',
    });
  }
};
