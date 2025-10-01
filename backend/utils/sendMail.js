const nodemailer = require('nodemailer');

const sendMail = async (options) => {
  // defensive defaults so you don't fall back to localhost accidentally
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = Number(process.env.SMTP_PORT) || 465;
  const secure = port === 465; // true for 465 (SSL), false for 587 (TLS)

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user: process.env.SMTP_MAIL,
      pass: process.env.SMTP_PASSWORD,
    },
    tls: {
      // dev only — remove or set true in production
      rejectUnauthorized: false,
    },
  });

  // verify connection once (helps surface wrong creds / host issues)
  try {
    await transporter.verify();
    // console.log('SMTP verified');
  } catch (err) {
    // throw a clearer error so caller can handle it
    throw new Error('SMTP connection/verification failed: ' + err.message);
  }

  const mailOptions = {
    from: process.env.SMTP_MAIL,
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = sendMail;
