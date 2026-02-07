import nodemailer from "nodemailer";

export const sendMail = async ({ email, subject, message }: any) => {
  
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465, // ✅ CHANGE
      secure: true, // ✅ REQUIRED for 465
      auth: {
        user: "snehp316@gmail.com",
        pass: "aufxmugtoadqhasw",
      },
    });

    await transporter.sendMail({
      from: `"QuizSprint" <snehp316@gmail.com>`,
      to: email,
      subject,
      html: message,
    });

    console.log("✅ Email sent");
    return true;
  } catch (error) {
    console.error("❌ Email failed:", error);
    return false;
  }
};
