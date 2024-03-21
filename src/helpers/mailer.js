import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    type: "OAuth2",
    user: process.env.EMAIL_USER,
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    refreshToken: process.env.REFRESH_TOKEN,
    accessToken: process.env.ACCESS_TOKEN,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

const sendEmail = (email, subject, htmlContent, callback) => {
  const mailOptions = {
    from: "prowessagricola@gmail.com",
    to: email,
    subject: subject,
    html: htmlContent,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Error al enviar email:", error);
      return callback(error, null);
    }
    callback(null, info);
  });
};

const sendEmailInvocie = (
  email,
  subject,
  htmlContent,
  attachments,
  callback
) => {
  const mailOptions = {
    from: "prowessagricola@gmail.com",
    to: email,
    subject: subject,
    html: htmlContent,
    attachments,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Error al enviar email:", error);
      return callback(error, null);
    }
    callback(null, info);
  });
};

export { sendEmail, sendEmailInvocie };
