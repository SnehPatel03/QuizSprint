import nodemailer from "nodemailer";

export const sendMail = async ({ email, subject, message }:any) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "snehp316@gmail.com",
        pass: "aufxmugtoadqhasw", 
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    const mailOptions = {
      from: `"QuizSprint" <snehp316@gmail.com>`,
      to: email,
      subject,
      html: message,
    };

    await transporter.sendMail(mailOptions);
    console.log("✅ Email sent to:", email);
  } catch (error) {
    console.error("❌ Email sending failed:", error);
    throw error;
  }
};
