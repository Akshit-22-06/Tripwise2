const nodemailer = require('nodemailer');
const PDFDocument = require('pdfkit');
require('dotenv').config();

const createTransporter = () => {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !port || !user || !pass) {
    throw new Error('SMTP mail parameters are missing in environmental configurations.');
  }

  return nodemailer.createTransport({
    host,
    port: parseInt(port),
    auth: { user, pass },
  });
};

const sendEmail = async ({ email, subject, message, html, attachments = [] }) => {
  try {
    const transporter = createTransporter();
    const mailOptions = {
      from: process.env.SMTP_FROM || '"TripWise Travel" <noreply@tripwise.com>',
      to: email,
      subject,
      text: message,
      html,
      attachments,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Email dispatched successfully to: ${email}`);
    return true;
  } catch (err) {
    console.error('SMTP Mail Dispatch error:', err.message);
    throw new Error(`Email transmission failed: ${err.message}`);
  }
};

const generateInvoiceBuffer = (booking) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument();
      let buffers = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfData = Buffer.concat(buffers);
        resolve(pdfData);
      });

      doc.fontSize(22).fillColor('#0ea5e9').text('TRIPWISE BOOKING INVOICE', { align: 'center' });
      doc.moveDown();
      doc.fontSize(10).fillColor('#475569');
      doc.text(`Invoice Ref ID: ${booking._id || booking.id}`);
      doc.text(`Issued Date: ${new Date().toLocaleDateString()}`);
      doc.text(`Booking Category: ${booking.bookingType}`);
      doc.text(`Status: CONFIRMED`);
      doc.moveDown();

      doc.fontSize(12).fillColor('#1e293b').text('Transaction Details:', { underline: true });
      doc.text(`Base Fare / Costs: ${booking.totalCost} INR`);
      doc.moveDown();

      doc.fontSize(10).fillColor('#64748b').text('Thank you for booking with TripWise. Have a safe and pleasant journey!', { align: 'center' });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
};

const sendBookingInvoice = async (email, booking) => {
  try {
    const pdfBuffer = await generateInvoiceBuffer(booking);
    
    await sendEmail({
      email,
      subject: `TripWise Booking Invoice Confirmation [ID: ${booking._id || booking.id}]`,
      message: `Your booking for ${booking.bookingType} has been confirmed. The digital invoice is attached to this email.`,
      html: `
        <div style="font-family: sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #0ea5e9;">Your TripWise Booking is Confirmed!</h2>
          <p>Thank you for choosing TripWise. Your payment of <strong>${booking.totalCost} INR</strong> has been successfully processed.</p>
          <p>We have attached the official PDF invoice receipt to this email.</p>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="font-size: 11px; color: #999;">This is an automated transaction receipt. Please do not reply directly to this mail.</p>
        </div>
      `,
      attachments: [
        {
          filename: `invoice_${booking._id || booking.id}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf',
        },
      ],
    });
  } catch (err) {
    console.error('Invoice transmission failed:', err.message);
    throw err;
  }
};

module.exports = {
  sendEmail,
  sendBookingInvoice,
};
