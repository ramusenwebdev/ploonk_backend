const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  secure: false, 
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});


exports.sendOtpEmail = async (to, subject, otp) => {
  const htmlBody = `
    <div style="font-family: Arial, sans-serif; text-align: center; padding: 20px;">
      <h2>${subject}</h2>
      <p>Gunakan kode di bawah ini untuk melanjutkan. Kode ini hanya berlaku selama 10 menit.</p>
      <div style="font-size: 24px; font-weight: bold; letter-spacing: 5px; margin: 20px; padding: 10px; background-color: #f0f0f0; border-radius: 5px;">
        ${otp}
      </div>
      <p>Jika Anda tidak meminta kode ini, silakan abaikan email ini.</p>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: `"Flong App" <${process.env.EMAIL_USER}>`,
      to: to,
      subject: subject,
      html: htmlBody,
    });
    console.log(`Email OTP terkirim ke: ${to}`);
  } catch (error) {
    throw new Error(`Gagal mengirim email ke ${to}:`, error);
    console.error(`Gagal mengirim email ke ${to}:`, error);
  }
};