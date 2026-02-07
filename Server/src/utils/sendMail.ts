import nodemailer from "nodemailer";

export const sendMail = async ({
  email,
  subject,
  message,
}: {
  email: string;
  subject: string;
  message: string;
}) => {
  try {

    const transporter = nodemailer.createTransport({
      host: "smtp-relay.brevo.com",
      port: 587,
      secure: false, // TLS
      auth: {
        user: process.env.BREVO_SMTP_USER,
        pass: process.env.BREVO_SMTP_PASS,
      },
    });

    await transporter.verify();
    console.log("✅ Brevo SMTP connected");

    await transporter.sendMail({
      from: `"QuizSprint" <test.snehpatel.dev@gmail.com>`,
      to: email,
      subject,
      html: message,
    });

    console.log("✅ Email sent to:", email);
    return true;
  } catch (error) {
    console.error("❌ Brevo email failed:", error);
    return false;
  }
};
