const nodemailer = require("nodemailer");
module.exports = async (receiver, subject, text) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      service: "gmail",
      auth: {
        user: "comfy.sloth0@gmail.com",
        pass: "ofkrmsewkqpmyaro",
      },
      tls: {
        rejectUnauthorized: false,
      },
    });
    await transporter.sendMail({
      from: '"Comfy Sloth" <comfy.sloth0@gmail.com>',
      to: receiver,
      subject: subject,
      text: text,
    });
  } catch (error) {
    throw error;
  }
};
