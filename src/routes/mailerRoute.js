import { sendEmail, sendEmailInvocie } from "../helpers/mailer.js";
import express from "express";

const mailRoute = express.Router();

mailRoute.post("/send-email", (req, res) => {
  const { email, subject, htmlContent } = req.body;
  sendEmail(email, subject, htmlContent, (error, info) => {
    if (error) {
      return res
        .status(500)
        .json({ success: false, message: "Error al enviar el correo", error });
    }
    res
      .status(200)
      .json({ success: true, message: "Correo enviado exitosamente", info });
  });
});

mailRoute.post("/send-mail-invoice", (req, res) => {
  const { email, subject, htmlContent, attachments } = req.body;
  const emailAttachments = attachments.map((attachment) => ({
    filename: attachment.filename,
    content: Buffer.from(attachment.content, "base64"),
    encoding: "base64",
  }));

  sendEmailInvocie(
    email,
    subject,
    htmlContent,
    emailAttachments,
    (error, info) => {
      if (error) {
        console.error("Error al enviar el correo:", error);
        return res
          .status(500)
          .json({
            success: false,
            message: "Error al enviar el correo",
            error: error.message,
          });
      }
      res
        .status(200)
        .json({ success: true, message: "Correo enviado exitosamente", info });
    }
  );
});

export default mailRoute;
