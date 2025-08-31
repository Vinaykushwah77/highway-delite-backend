const nodemailer = require("nodemailer");

const sendOtp = async (to, otp) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASS,
      },
    });

    const info = await transporter.sendMail({
      from: `"Notes App" <${process.env.EMAIL}>`,
      to,
      subject: "Your OTP Code",
      text: `Your OTP is ${otp}. It expires in 10 minutes.`,
    });

    console.log("OTP sent successfully:", info.messageId);
    return info;
  } catch (error) {
    console.error("Error while sending OTP:", error.message);
    throw error;
  }
};

module.exports = sendOtp;
