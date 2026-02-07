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

    const info = await transporter.sendMail({
      from: `"QuizSprint" <test.snehpatel.dev@gmail.com>`, 
      to: email,
      subject,
      html: message,
    });

    console.log("SMTP accepted:", info.accepted);
    console.log("SMTP rejected:", info.rejected);

    // 🔴 THIS IS THE REAL CHECK
    if (!info.accepted || info.accepted.length === 0) {
      console.error("❌ Email NOT accepted by SMTP");
      return false;
    }

    return true;
  } catch (error) {
    console.error("❌ Email sending error:", error);
    return false;
  }
};
