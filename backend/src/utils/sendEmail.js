const nodemailer = require("nodemailer");
const { getTransporter } = require("../config/mailer");

const sendEmail = async ({ to, subject, html }) => {
  const transporter = await getTransporter();
  const info = await transporter.sendMail({
    from: process.env.MAIL_FROM || '"Lume Laundry" <no-reply@lumelaundry.local>',
    to,
    subject,
    html,
  });

  const previewUrl = nodemailer.getTestMessageUrl(info);
  if (previewUrl) {
    console.log(`📧 Email preview (Ethereal test inbox, not a real send): ${previewUrl}`);
  }
};

module.exports = sendEmail;
