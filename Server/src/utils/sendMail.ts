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
      secure: false,
      auth: {
        user: process.env.BREVO_SMTP_USER!,
        pass: process.env.BREVO_SMTP_PASS!,
      },
    });

    await transporter.verify();
    console.log("✅ Brevo SMTP connected");

    const info = await transporter.sendMail({
      from: `"QuizSprint" <test.snehpatel.dev@gmail.com>`, // VERIFIED SENDER
      to: email,
      subject,
      html: message,
    });

    console.log("✅ Email queued. Message ID:", info.messageId);
    return true;
  } catch (error) {
    console.error("❌ Email failed:", error);
    return false;
  }
};
