import nodemailer from "nodemailer";

export const sendMail = async ({ email, subject, message }:any) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp-relay.brevo.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.BREVO_SMTP_USER,
        pass: process.env.BREVO_SMTP_PASS,
      },
    });

    const info = await transporter.sendMail({
      from: `"QuizSprint" <no-reply@brevo.com>`,
      to: email,
      subject,
      html: message,
    });

    console.log("Message ID:", info.messageId);
    return true;
  } catch (err) {
    console.error("Mail error:", err);
    return false;
  }
};
