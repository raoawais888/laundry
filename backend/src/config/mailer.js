const nodemailer = require("nodemailer");

let transporterPromise;

async function buildTransporter() {
  if (process.env.MAIL_HOST) {
    return nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: Number(process.env.MAIL_PORT),
      secure: process.env.MAIL_SECURE === "true",
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });
  }

  // Dev fallback: no real SMTP configured — spin up a disposable Ethereal
  // inbox so OTP emails still "send" successfully instead of failing
  // outright. The OTP can be read from the preview URL sendEmail.js logs
  // for each sent message. Has no effect once real MAIL_* values are set.
  const testAccount = await nodemailer.createTestAccount();
  console.warn(
    "\n⚠️  MAIL_HOST is not set — using a disposable Ethereal test inbox for outgoing email.\n" +
      "   Every sent email's preview link (where you can read the OTP) will be logged when it sends.\n"
  );
  return nodemailer.createTransport({
    host: testAccount.smtp.host,
    port: testAccount.smtp.port,
    secure: testAccount.smtp.secure,
    auth: { user: testAccount.user, pass: testAccount.pass },
  });
}

// Lazily built and cached — avoids an unconditional network call to
// Ethereal on every server boot when real MAIL_HOST is already configured.
function getTransporter() {
  if (!transporterPromise) {
    transporterPromise = buildTransporter();
  }
  return transporterPromise;
}

module.exports = { getTransporter };
